import React, { useState, useEffect, useRef } from 'react';
import ReactSwipe from 'react-swipe';
import './App.css';

// tensorflow face detection model
import * as tf from '@tensorflow/tfjs';
import { setWasmPath } from '@tensorflow/tfjs-backend-wasm';
import * as blazeface from '@tensorflow-models/blazeface';
import Webcam from 'react-webcam';

import { makePredictions, updateCanvas } from './utils';

import Carousel from './components/Carousel';
import DistancePane from './components/DistancePane';
import CalibrationPane from './components/CalibrationPane';
import DetectionPane from './components/DetectionPane';
import firebase from './firebase';

const App = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [showCalibrationPane, setShowCalibrationPane] = useState(false);
  const [showDetectionPane, setShowDetectionPane] = useState(false);
  const [showDistancePane, setShowDistancePane] = useState(false);
  const [showCarousel, setShowCarousel] = useState(true);
  const [calibrationData, setCalibrationData] = useState({
    distance: 0,
    faceWidth: 0,
  });
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [distance, setDistance] = useState(0);

  const ref = firebase.firestore().collection('users');
  // console.log(ref);

  useEffect(() => {
    console.log('render');
  });

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
      if (predictions !== 'WEBCAM NOT READY' && predictions[0]) {
        if (showBoundingBox) updateCanvas(canvasRef, predictions);

        // Calculate distance from screen
        if (!showCarousel) {
          const prediction = predictions[0];
          const leftEar = prediction.landmarks[5];
          const rightEar = prediction.landmarks[4];
          const faceWidth = Math.abs(leftEar[0] - rightEar[0]);

          const currentDistance = Math.round(
            (calibrationData.faceWidth / faceWidth) * calibrationData.distance
          );
          // console.log('caulcated facewidth:', faceWidth, currentDistance);
          setDistance(currentDistance);
        }
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
  }, [showCarousel, showBoundingBox]);

  const handleCalibrate = async (feetInput, inchesInput) => {
    const model = await setupModel();

    if (model) {
      const predictions = await makePredictions(model, webcamRef, canvasRef);
      console.log(predictions);
      if (predictions && predictions[0]) {
        const prediction = predictions[0];
        const leftEar = prediction.landmarks[5];
        const rightEar = prediction.landmarks[4];
        console.log(prediction);
        const calibrationDataTemp = {
          distance: feetInput * 12 + inchesInput,
          faceWidth: Math.abs(leftEar[0] - rightEar[0]),
        };
        console.log('calibrationData', calibrationDataTemp);
        setCalibrationData(calibrationDataTemp);
      } else {
        console.log('No valid prediction made');
      }
    }
  };

  return (
    <div className='App'>
      {loadingModel ? (
        <div>Loading Model...</div>
      ) : (
        <div className='container'>
          {showDistancePane && <DistancePane></DistancePane>}

          <div className='webcam-container'>
            <Webcam ref={webcamRef} className='webcam' />
            <canvas ref={canvasRef} className='canvas'></canvas>
          </div>

          {showCalibrationPane && <CalibrationPane></CalibrationPane>}

          {showDetectionPane && <DetectionPane></DetectionPane>}

          <div className='carousel-container'>
            {showCarousel ? (
              <Carousel
                toggleCalibrationPane={setShowCalibrationPane}
                toggleDetectionPane={setShowDetectionPane}
                toggleCarousel={setShowCarousel}
                calibrationCapture={handleCalibrate}
                addFirebaseUser={addUser}
              />
            ) : (
              <div className='detection-footer-container'>
                <div className='checkmark-container'>
                  <span>
                    <input
                      type='checkbox'
                      name='show-bounding-box'
                      checked={showBoundingBox}
                      onClick={() => setShowBoundingBox(!showBoundingBox)}
                    ></input>
                    <label htmlFor='show-bounding-box'>Show Box</label>
                  </span>
                  <span>
                    <input
                      type='checkbox'
                      name='take-photo'
                      checked={true}
                    ></input>
                    <label htmlFor='take-photo'>Take Photo</label>
                  </span>
                </div>
                <div>
                  <div>
                    <h1>
                      You are ft. {Math.floor(distance / 12)} in.{' '}
                      {distance % 12} away
                    </h1>
                    <h1>Your level is __</h1>
                    <button>Done</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
