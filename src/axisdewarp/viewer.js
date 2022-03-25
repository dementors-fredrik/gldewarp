import Regl from 'regl';

import * as mappingShader from './mapping-shader';
import * as modes from './modes';
import * as shader from './shader';
import * as V from './vector';

const PI = Math.PI
const QUADRANT = PI / 2;

/*
 * Given a set of PTZ parameters and the current mode, clamp the P and T to
 * stay within the camera view
 */
const clampPtz = function (mode, ptz) {
  let [p, t, z] = ptz;
  switch (mode) {
    case modes.CEILING:
      [p] = V.mod(p, 2 * Math.PI);
      [t] = V.clamp(t, -Math.PI / 2, 0);
      break;
    case modes.DESK:
      [p] = V.mod(p, 2 * Math.PI);
      [t] = V.clamp(t, 0, Math.PI / 2);
      break;
    case modes.WALL:
      [p] = V.clamp(p, -Math.PI / 2, Math.PI / 2);
      [t] = V.clamp(t, -Math.PI / 2, Math.PI / 2);
      break;
  }
  return [p, t, z];
}


/*
 * Given a camera orientation mode and a ptz vector,
 * return the rotateData that is used by the shader.
 */
function getRotateData(mode, ptz) {
  const [pan, tilt] = ptz;
  switch (mode) {
    case modes.CEILING:
      return [0, -(tilt + QUADRANT), pan + QUADRANT];
    case modes.DESK:
      return [0, -(tilt - QUADRANT), -pan - QUADRANT];
    case modes.WALL:
      return [-tilt, pan, 0];
  }
}

/*
 * Given an orientation mode, return the lambda offset (vertical axis
 * orientation) around which pan/tilt revolves in the shader.
 */
function getLambdaOffset(mode) {
  switch (mode) {
    case modes.CEILING:
    case modes.DESK:
      return PI / 2;
    case modes.WALL:
      return PI;
  }
}

/*
 * Extend an array of cubic polynomial coefficients to an array of quatric
 * polynomial coefficients.
 *
 * For input [i1, i2, i3] return [0, i1, i2, i3]
 * For input [i1, i2, i3, i4] return [i1, i2, i3, i4]
 *
 * The output corresponds to [a, b, c, d] for f(x) = ax⁴+bx³+cx²+dx
 * For cubic polynomial input, the a coefficient is 0.
 */
function extendLensProfile(lensProfile) {
  if (lensProfile.length === 3) {
    return [0, ...lensProfile]
  } else {
    return lensProfile
  }
}

/*
 * Given a source picture (canvas, video, img...) element, a canvas and
 * camera parameters, return an object for rendering the dewarped canvas
 * source picture with dewarping applied.
 */
export default function(src, params, canvas) {
  const viewer = {
    canvas,
    ptz: V.degToRad([0, 0, 30]),
    running: false,
    mode: modes.CEILING,
  };

  const regl = Regl({ canvas, extensions: ['OES_texture_float', 'oes_texture_float_linear'] });
  const texture = regl.texture({ shape: params.streamSize, min: "linear", mag: "linear"  });

  const mapTexture = regl.texture({ shape: [256, 256, 4], type: 'float', min: "linear", mag: "linear", color: [0, 0, 0, 1] });


  const fbo = regl.framebuffer({
    color: mapTexture,
    depth: false,
    stencil: false,
  })

  const drawMap = regl({
    ...mappingShader,
    attributes: { position: [1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1] },
    count: 6,
    framebuffer: fbo,
    uniforms: {
      size: regl.prop("size"),
      tangentOfFieldOfView: regl.prop("tangentOfFOV"),
      lambdaOffset: regl.prop("lambdaOffset"),
      rotateData: regl.prop("rotateData"),
      LensProfile: regl.prop("lensProfile"),
      width: regl.context("viewportWidth"),
      height: regl.context("viewportHeight"),
    },
    depth: { enable: false },

  });

  const draw = regl({
    ...shader,
    attributes: {
      position: [0, 0,
        1, 1,
        0, 1,
        0, 0,
        1, 0,
        1, 1]
    },
    count: 6,
    uniforms: {
      size: regl.prop("size"),
      width: regl.context("viewportWidth"),
      height: regl.context("viewportHeight"),
      texture: regl.prop("texture"),
      mapTexture: regl.prop("mapTexture")
    },
    depth: { enable: false },
  });

  viewer.updateMap = function () {
    const tangentOfFOV = Math.tan(viewer.ptz[2]);

    drawMap({
      size: params.size,
      tangentOfFOV,
      lambdaOffset: getLambdaOffset(viewer.mode),
      rotateData: getRotateData(viewer.mode, viewer.ptz),
      lensProfile: extendLensProfile(params.lensProfile),
    });
  }
  /*
   * Render a single frame to the output canvas, copying the source element
   * to the texture.
   */
  viewer.render = function() {
    const subimg = texture.subimage(src);
    regl.clear({color: [0, 0, 0, 1]});
    draw({
      size: params.size,
      texture: subimg,
      mapTexture: mapTexture
    });
  };

  /*
   * Start a render loop that re-renders the output canvas on every animation
   * frame.
   */
  viewer.start = function() {
    // Only start once, in case the render loop is already running
    if (viewer.running) return;
    viewer.running = true;

    regl.frame(viewer.render);
  };

  /*
   * Set the default position of the view for the current orientation mode.
   */
  viewer.gotoDefault = function() {
    switch (viewer.mode) {
      case modes.CEILING:
        viewer.ptz = V.degToRad([0, -30, 30]);
        break;
      case modes.DESK:
        viewer.ptz = V.degToRad([0, 30, 30]);
        break;
      case modes.WALL:
        viewer.ptz = V.degToRad([0, 0, 30]);
        break;
    }
  };

  viewer.setPtz = function (ptz) {
    viewer.ptz = clampPtz(viewer.mode, ptz);
    viewer.updateMap();
  }

  viewer.getPtz = function () {
    return V.copy(viewer.ptz)
  }

  /*
   * Destroy the Regl context with associated textures.
   */
  viewer.destroy = function() {
    regl.destroy();
    viewer.running = false;
  };

  return viewer;
}
