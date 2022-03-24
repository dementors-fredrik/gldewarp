import React, {MutableRefObject, RefObject, useEffect, useRef} from 'react';
import axisdewarp from "../axisdewarp";

type DewarpProps = {
    src: RefObject<HTMLImageElement>
}

export const Dewarp = ({ src }: DewarpProps) => {
    const outputCanvas = useRef<HTMLCanvasElement>(null) as MutableRefObject<HTMLCanvasElement>;

    useEffect(() => {
        if(src.current && outputCanvas.current) {
            const viewer = axisdewarp.viewer(src.current, {
                streamSize:[src.current.width*4,src.current.height*4],
                size:[512,512],
                lensProfile: [-1.970703, 29.148499, 210.73218]
                },
                outputCanvas.current);

            var controller = axisdewarp.controller(viewer);
            outputCanvas.current.onmousemove = (ev) => {
                (controller as any).moveHandler({pageX: (ev.offsetX-256), pageY: ev.offsetY-256});
            }
            // Set ceiling orientation mode of the viewer
            viewer.mode = axisdewarp.modes.CEILING;
            (viewer as any).start();

        }
    }, [src,outputCanvas]);

    return <canvas ref={outputCanvas} width={512} height={512}/>;
}