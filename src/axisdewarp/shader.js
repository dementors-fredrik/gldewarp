export const frag = `
precision mediump float;

uniform sampler2D texture;
uniform sampler2D mapTexture;

varying vec2 uv;

vec4 getInterpolatedTexel(sampler2D tex, vec2 p, float resolution) {
    vec2 uv = p;
    uv = uv * resolution + 0.5;
    vec2 iuv = floor( uv ); 
    vec2 fuv = fract( uv );
    uv = iuv + fuv*fuv*(3.0-2.0*fuv); 
    uv = (uv - 0.5)/resolution;
    return vec4(texture2D( tex, uv ).rgb,1.0);
}


void main(void)
{  
    vec2 texturePos = getInterpolatedTexel(mapTexture,uv, 1024.0).rg;
    gl_FragColor = getInterpolatedTexel(texture, texturePos, 1024.0);
}`;

export const vert = `
precision mediump float;
attribute vec2 position;
varying vec2 uv;

uniform float width;
uniform float height;
uniform vec2 size;

void main(void)
{
  vec2 rscale = vec2(size.x / size.y, size.y / size.x);
  vec2 aspectScale = vec2(0.0);
  float check = float(height * rscale.x < width);

  aspectScale += check * vec2(height * rscale.x, height);
  aspectScale += (1.0 - check) * vec2(width, width * rscale.y);
  aspectScale /= vec2(width, height);

  vec2 scaled = position * aspectScale;

  scaled += (1.0 - aspectScale) / 2.0;

  uv = position;

  gl_Position = vec4(1.0 - 2.0 * vec2(1.0 - scaled.x, 1.0 - scaled.y), 0, 1);
}`
