import './App.css';

import React, { MutableRefObject, useCallback, useRef, useState } from 'react';

import { DewarpVideo } from './dewarp/DewarpVideo';

const video = require('./assets/video.mp4');
function App() {
    const srcVideo = useRef<HTMLVideoElement>() as MutableRefObject<HTMLVideoElement>;
    const [isLoaded, setIsLoaded] = useState(false);
    const onLoaded = useCallback(() => {
        setIsLoaded(true);
    }, [])

    return (
        <>
        <div style={{position: 'absolute', left: '50%', top: '50vh', zIndex: 10000}}>
            <button onClick={() => srcVideo.current.play()}>Play</button>
        </div>
        <div className="App" style={{ display: 'flex' }}>
            <div style={{width: "50%"}}>
            {isLoaded ? <>
                <DewarpVideo src={srcVideo} lensProfile={{ x: 113.889694, y: -60.882477, z: 751.488831 }} size={{ width: 2992, height: 2992 }} ptzParams={{ x: 0, y: 0, fov: 0 }} />
            </>
                    : undefined}
            </div>
            <div style={{width: "50%"}}>
                <video ref={srcVideo} src={video} loop onLoadedMetadata={onLoaded} style={{width: "100%"}}/>
            </div>
            </div>
            </>
    );
}
export default App;
