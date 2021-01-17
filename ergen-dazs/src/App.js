import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// tensorflow face detection model
import * as tf from '@tensorflow/tfjs';
import { setWasmPath } from '@tensorflow/tfjs-backend-wasm';
import * as blazeface from '@tensorflow-models/blazeface';
import Webcam from 'react-webcam';

import { makePredictions, updateCanvas } from './utils';

import Carousel from './components/carousel';
import CalibrationPane from './components/CalibrationPane';
import DetectionPane from './components/DetectionPane';
import firebase from './firebase';

const App = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [showCalibrationPane, setShowCalibrationPane] = useState(false);
  const [showDetectionPane, setShowDetectionPane] = useState(false);
  const [calibrated, setCalibrated] = useState(false);

  const ref = firebase.firestore().collection('users');
  console.log(ref);

  const addUser = () => {
    // add user to database
    // const db = firebase.firestore();
    // db.collection("users").add({
    //   email: "bruh",
    //   face_pixel_length: 20,
    //   screen_dist: 23
    //  });
    //  console.log('Added document with ID: ', db.id);
  };

  const checkUserPresent = () => {
    console.log('TODO');
  };

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
    const continuousPredictionOnWebcam = async () => {
      const predictions = await makePredictions(model, webcamRef, canvasRef);
      if (predictions !== 'WEBCAM NOT READY') {
        updateCanvas(canvasRef, predictions);
      }
    };

    const timerId = setInterval(continuousPredictionOnWebcam, 100);
    return timerId;
  };

  useEffect(() => {
    console.log('mount');
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
      const predictions = await makePredictions(model, webcamRef, canvasRef);
      console.log(predictions);
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
              calibrationCapture={handleCalibrate}
              addFirebaseUser={addUser}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
