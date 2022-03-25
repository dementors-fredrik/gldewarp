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
        <div className="App" style={{ display: 'flex', width: '100%'}}>
            <div style={{width: "50%"}}>
            {isLoaded && <>
                <div style={{ display: 'inline'}}>
                    <DewarpVideo src={srcVideo} lensProfile={{ x: 113.889694, y: -60.882477, z: 751.488831 }} size={{ width: 2992, height: 2992 }} ptzParams={{ x: 4.109286700809463, y: -0.9885839816668688, fov: 0.8351400470792861 }} />
                    <DewarpVideo src={srcVideo} lensProfile={{ x: 113.889694, y: -60.882477, z: 751.488831 }} size={{ width: 2992, height: 2992 }} ptzParams={{ x: 3.0893633177948168, y: -0.5402625725217155, fov: 0.39648062841137827 }} />
                </div>
            </>}
            </div>
            <div style={{width: "50%"}}>
                <video ref={srcVideo} src={video} loop muted={true} autoPlay={true} onLoadedMetadata={onLoaded} style={{position: 'fixed',
                    width: "calc(100% - 1024px)", left: '1024px', top: 0}}/>
            </div>
            </div>
            </>
    );
}
export default App;
