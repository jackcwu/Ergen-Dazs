import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// tensorflow face detection model
import * as tf from '@tensorflow/tfjs';
import { setWasmPath } from '@tensorflow/tfjs-backend-wasm';
import * as blazeface from '@tensorflow-models/blazeface';
import Webcam from 'react-webcam';
import { drawBoundingBox } from './utils';

import Carousel from './components/Carousel';

const App = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [loadingModel, setLoadingModel] = useState(true);

  // console.log(tf.backend());

  const runFacedetect = async () => {
    setWasmPath(
      'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@latest/dist/tfjs-backend-wasm.wasm'
    );
    await tf.setBackend('wasm');
    const model = await blazeface.load();
    setLoadingModel(false);

    const timerId = setInterval(() => {
      detect(model);
    }, 100);
    return timerId;
    // detect(model);
  };

  const detect = async (model) => {
    // check if webcam is ready and has enough data (HAVE_ENOUGH_DATA === 4)
    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make detections
      const returnTensors = false;
      const flipHorizontal = true;
      const predictions = await model.estimateFaces(
        video,
        returnTensors,
        flipHorizontal
      );
      // console.log(predictions);

      // Get canvas context
      const ctx = canvasRef.current.getContext('2d');
      requestAnimationFrame(() => drawBoundingBox(predictions, ctx));
    }
  };

  useEffect(() => {
    const timerId = runFacedetect();

    return () => clearInterval(timerId);
  }, []);

  return (
    <div className='App'>
      {loadingModel ? (
        <div>Loading Model...</div>
      ) : (
        <div className='container'>
          <div className='webcam-container'>
            <Webcam ref={webcamRef} className='webcam' />
            <canvas ref={canvasRef} className='canvas'></canvas>
          </div>

          <div className='carousel-container'>
            <Carousel />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;