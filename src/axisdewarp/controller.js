import * as V from './vector';

const [MAX_ZOOM, MIN_ZOOM] = V.degToRad([60, 2])
const ZOOM_STEP = (MAX_ZOOM - MIN_ZOOM) / 20.0;
const INTERVAL = 1000 / 60;
const SPEED = 1.0;

/*
 * Given a viewer object attach mouse drag/scroll handlers to its canvas that
 * control its PTZ parameters.
 */
export default function(viewer, options = {}) {
  const controller = {
    origin: [0, 0],
    current: [0, 0],
    delta: [0, 0, 0],
    zoomTarget: viewer.getPtz[2],
    lastUpdate: Date.now(),
  };

  // Load options
  const maxZoom = options.maxZoom || MAX_ZOOM;
  const minZoom = options.minZoom || MIN_ZOOM;
  const zoomStep = options.minZoom || ZOOM_STEP;
  const interval = options.interval || INTERVAL;
  const speed = options.speed || SPEED;

  // Control event handlers
  controller.moveHandler = function(e) {
    const dim = Math.min(
      viewer.canvas.offsetWidth,
      viewer.canvas.offsetHeight,
    );
    controller.current = [e.pageX, -e.pageY];
    controller.delta = V.div(
      V.sub(controller.current, controller.origin),
      dim
    );
  };
  controller.downHandler = function(e) {
    if (e.button === 0) {
      controller.origin = V.copy(controller.current);
      controller.delta = [0, 0, 0];
    }
  };
  controller.upHandler = function(e) {
    if (e.button === 0) {
      controller.delta = [0, 0, 0];
    }
  };
  controller.wheelHandler = function(e) {
    const ptz = viewer.getPtz()
    if (e.deltaY < 0) {
      controller.zoomTarget = Math.max(minZoom, ptz[2] - zoomStep);
    } else if (e.deltaY > 0) {
      controller.zoomTarget = Math.min(maxZoom, ptz[2] + zoomStep);
    }
  };

  // Timer update to refresh delta
  function update() {
    const currentTime = Date.now();
    const timeDelta = (currentTime - controller.lastUpdate) / 1000;

    const ptz = viewer.getPtz()
    const zdelta = controller.delta[2]
    const z = ptz[2];
    const target = controller.zoomTarget;

    if (zdelta) {
      const zoom = zdelta * timeDelta * zoomStep;
      [ptz[2]] = V.clamp(target + zoom, minZoom, maxZoom);
      controller.zoomTarget = ptz[2];
    } else if (z < target) {
      ptz[2] = Math.min(target, z + zoomStep / 6);
    } else if (z > target) {
      ptz[2] = Math.max(target, z - zoomStep / 6);
    }

    if (controller.delta[0] || controller.delta[1]) {
      const zoomScale = z / (Math.PI / 6);
      const delta = V.mul(
        controller.delta,
        timeDelta * 2 * Math.PI * speed * zoomScale,
      );
      [ptz[0], ptz[1]] = V.add([ptz[0], ptz[1]], delta);
    }

    if (z != target || zdelta || controller.delta[0] || controller.delta[1]) {
      viewer.setPtz(ptz);
    }
    controller.lastUpdate = currentTime;
  }

  // Attach recurrent timer update
  const updaterID = setInterval(update, interval);

  /*
   * Detach the controller from the viewer, removing all event listener and
   * cancelling the update interval.
   */
  controller.destroy = function() {
    clearInterval(updaterID);
  };

  return controller;
}
