import React, {MutableRefObject, RefObject, useEffect, useRef, useState} from 'react';
import axisdewarp from "../axisdewarp";

type DewarpProps = {
    src: RefObject<HTMLImageElement>
}

export const Dewarp = ({src}: DewarpProps) => {
    const outputCanvas = useRef<HTMLCanvasElement>(null) as MutableRefObject<HTMLCanvasElement>;
    const [renderSize, setRenderSize] = useState({w: 2048, h: 2048});

    useEffect(() => {
        if (src.current && outputCanvas.current) {
            let lensProfile = [-1.97, 29.14, 210.73];
            let centerX = src.current.width/2;
            let centerY = src.current.height/2;

            setRenderSize({w: src.current.width, h: src.current.height});

            const viewer = axisdewarp.viewer(src.current, {
                    streamSize: [src.current.width, src.current.height],
                    size: [src.current.width, src.current.height],
                    lensProfile: lensProfile
                },
                outputCanvas.current) as any;

            var controller = axisdewarp.controller(viewer);

            let trackMovement = false;

            outputCanvas.current.onmousedown = () => {
                trackMovement = true;
            }

            outputCanvas.current.onmouseup = () => {
                trackMovement = false;
            }

            outputCanvas.current.onmousemove = (ev) => {
                if (trackMovement) {
                    (controller as any).moveHandler({pageX: (ev.offsetX - centerX), pageY: ev.offsetY - centerY});
                }
            }
            outputCanvas.current.onwheel = (ev) => {
                (controller as any).wheelHandler(ev);
                ev.preventDefault();
            }
            // Set ceiling orientation mode of the viewer
            viewer.mode = axisdewarp.modes.CEILING;
            viewer.setPtz([0.5970523677181481, -0.7443783212771279, 0.6760241969391372]);
            viewer.start();

            (window as any).vv = viewer;
        }
    }, [src, outputCanvas]);


    return <div>
        <canvas ref={outputCanvas} width={renderSize.w} height={renderSize.h}/>
    </div>;
}