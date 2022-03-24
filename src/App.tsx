import React, {MutableRefObject, useRef} from 'react';
import './App.css';
import {Dewarp} from "./dewarp/Dewarp";
import img from './assets/img1.jpg';

function App() {
    const srcImg = useRef<HTMLImageElement>() as MutableRefObject<HTMLImageElement>;
    return (
        <div className="App">
            <Dewarp src={srcImg}/>
            <img ref={srcImg} src={img} style={{display: 'none'}}/>
        </div>
    );
}

export default App;
