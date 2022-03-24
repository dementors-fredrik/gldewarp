import React, {MutableRefObject, useRef, useState} from 'react';
import './App.css';
import {Dewarp} from "./dewarp/Dewarp";
import img from './assets/img1.jpg';

function App() {
    const srcImg = useRef<HTMLImageElement>() as MutableRefObject<HTMLImageElement>;
    const [imageLoaded, setImageLoaded] = useState(false);
    return (
        <div className="App">
            { imageLoaded && <Dewarp src={srcImg}/> }
            <img ref={srcImg} src={img} style={{display: 'none'}} onLoad={(ev) => setImageLoaded(true) }/>
        </div>
    );
}

export default App;
