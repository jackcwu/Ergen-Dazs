import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// tensorflow face detection model
import * as tf from '@tensorflow/tfjs';
import { setWasmPath } from '@tensorflow/tfjs-backend-wasm';
import * as blazeface from '@tensorflow-models/blazeface';
import Webcam from 'react-webcam';
import { drawBoundingBox } from './utils';

import Carousel from './components/Carousel';
import CalibrationPane from './components/CalibrationPane';
import DetectionPane from './components/DetectionPane';

const App = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [showCalibrationPane, setShowCalibrationPane] = useState(false);
  const [showDetectionPane, setShowDetectionPane] = useState(false);
  const [calibrated, setCalibrated] = useState(false);

  const setupModel = async () => {
    setWasmPath(
      'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@latest/dist/tfjs-backend-wasm.wasm'
    );
    await tf.setBackend('wasm');
    const model = await blazeface.load();
    setLoadingModel(false);
    return model;
  };

  const runFacedetect = (model) => {
    const timerId = setInterval(() => {
      detect(model);
    }, 100);
    return timerId;
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

      // Get canvas context
      const ctx = canvasRef.current.getContext('2d');
      requestAnimationFrame(() => drawBoundingBox(predictions, ctx));
    }
  };

  useEffect(() => {
    console.log('mounted');
    var timerId;
    const setup = async () => {
      const myModel = await setupModel();
      timerId = runFacedetect(myModel);
    };

    setup();

    return () => clearInterval(timerId);
  }, []);

  const handleCalibrate = async () => {
    const model = await setupModel();

    if (model) {
      const predictions = await model.estimateFaces(
        webcamRef.current.video,
        false,
        true
      );
      console.log('predictions: ', predictions);
    }

    setCalibrated(true);
  };

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

          <button onClick={handleCalibrate}>c'mon</button>

          {showCalibrationPane && <CalibrationPane></CalibrationPane>}

          {showDetectionPane && <DetectionPane></DetectionPane>}

          <div className='carousel-container'>
            <Carousel
              toggleCalibrationPane={() => {
                setShowCalibrationPane(!showCalibrationPane);
              }}
              toggleDetectionPane={() => {
                setShowDetectionPane(!showDetectionPane);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
