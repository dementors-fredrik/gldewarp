export const frag = `
precision mediump float;

uniform sampler2D texture;
uniform sampler2D mapTexture;

varying vec2 uv;

void main(void)
{
  vec2 texturePos = texture2D(mapTexture, uv).rg;

  gl_FragColor = vec4(texture2D(texture, texturePos).rgb, 1.0);

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
