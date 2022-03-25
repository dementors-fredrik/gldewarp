import React, {MutableRefObject, RefObject, useEffect, useRef, useState} from 'react';

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

function attachController(viewer: any, outputCanvas: React.MutableRefObject<HTMLCanvasElement>) {
    var controller = axisdewarp.controller(viewer) as any;
    let trackMovement = false;
    outputCanvas.current.onmousedown = (ev) => {
        trackMovement = true;
    }
    outputCanvas.current.onmouseup = (ev) => {
        trackMovement = false;
    }
    outputCanvas.current.onmousemove = (ev) => {
        if (trackMovement) {
            controller.moveHandler({
                pageX: (ev.offsetX - (outputCanvas.current.width / 2)),
                pageY: ev.offsetY - (outputCanvas.current.height / 2)
            });
        }
    }
    outputCanvas.current.onwheel = (ev) => {
        controller.wheelHandler(ev);
        ev.preventDefault();
    }
}

export const DewarpVideo = ({ src, lensProfile, size, ptzParams}: DewarpProps) => {
    const outputCanvas = useRef<HTMLCanvasElement>(null) as MutableRefObject<HTMLCanvasElement>;
    const [viewer, setViewer] = useState<any>(null);

    useEffect(() => {
        if (src.current && outputCanvas.current) {
          setViewer(axisdewarp.viewer(src.current, {
              streamSize:[src.current.videoWidth, src.current.videoHeight],
              size:[size.width, size.height],
              lensProfile: [0, lensProfile.x, lensProfile.y, lensProfile.z]
              },
              outputCanvas.current) as any);
        }
    }, [src, outputCanvas, lensProfile, size.width, size.height, ptzParams.x, ptzParams.y, ptzParams.fov]);

    useEffect(() => {
        if(viewer) {
            attachController(viewer, outputCanvas);
            viewer.mode = axisdewarp.modes.CEILING;
            viewer.start();
            (window as any).vv = viewer;
        }
    },[viewer]);

    useEffect(() => {
        if(viewer) {
            viewer.setPtz([ptzParams.x, ptzParams.y, ptzParams.fov]);
        }
    }, [viewer, ptzParams]);

    return <canvas ref={outputCanvas} width={1024} height={1024}/>;
}