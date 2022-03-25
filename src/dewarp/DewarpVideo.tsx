import React, { MutableRefObject, RefObject, useEffect, useRef } from 'react';

import axisdewarp from '../axisdewarp';

type DewarpProps = {
  src: RefObject<HTMLVideoElement>
  lensProfile: {
    x: number,
    y: number,
    z: number,
  },
  size: {
    width: number,
    height: number,
  },
  ptzParams: {
    x: number,
    y: number,
    fov: number,
  }
}

export const DewarpVideo = ({ src, lensProfile, size, ptzParams}: DewarpProps) => {
    const outputCanvas = useRef<HTMLCanvasElement>(null) as MutableRefObject<HTMLCanvasElement>;

    useEffect(() => {
        if (src.current && outputCanvas.current) {
          const viewer = axisdewarp.viewer(src.current, {
              streamSize:[src.current.videoWidth, src.current.videoHeight],
              size:[size.width, size.height],
              lensProfile: [0, lensProfile.x, lensProfile.y, lensProfile.z]
              },
              outputCanvas.current);
          var controller = axisdewarp.controller(viewer);
          outputCanvas.current.onmousemove = (ev) => {
              (controller as any).moveHandler({pageX: (ev.offsetX-512), pageY: ev.offsetY-512});
          }
          outputCanvas.current.onwheel = (ev) => {
              (controller as any).wheelHandler(ev);
              ev.preventDefault();
          }
          (viewer as any).setPtz([ptzParams.x, ptzParams.y, ptzParams.fov]);
          // Set ceiling orientation mode of the viewer
          viewer.mode = axisdewarp.modes.CEILING;
          (viewer as any).start();

        }
    }, [src,outputCanvas, lensProfile]);

    return <canvas ref={outputCanvas} width={1024} height={1024}/>;
}