import React, { useState, useEffect, useRef } from 'react';
import ReactSwipe from 'react-swipe';
import './App.css';

// tensorflow face detection model
import * as tf from '@tensorflow/tfjs';
import { setWasmPath } from '@tensorflow/tfjs-backend-wasm';
import * as blazeface from '@tensorflow-models/blazeface';
import Webcam from 'react-webcam';

import { makePredictions, updateCanvas } from './utils';

import Carousel from './components/carousel';
import DistancePane from './components/DistancePane';
import CalibrationPane from './components/CalibrationPane';
import DetectionPane from './components/DetectionPane';
import firebase from './firebase';

const App = (props) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [loadingModel, setLoadingModel] = useState(true);
  const [showCalibrationPane, setShowCalibrationPane] = useState(false);
  const [showDetectionPane, setShowDetectionPane] = useState(false);
  const [showDistancePane, setShowDistancePane] = useState(false);
  const [showCarousel, setShowCarousel] = useState(true);
  const [calibrated, setCalibrated] = useState(false);
  const [topLeft, setTopLeft] = useState(0);

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
    //console.log(firebase.auth().currentUser.email);
    var currUser = firebase.auth().currentUser.email;
    if (currUser === null) {
      console.log("GUEST");
      return false;
    }

    console.log(currUser);
    const doc =  ref.doc(currUser);

    doc.get()
      .then((docSnapshot) => {
        if (docSnapshot.exists) {
          doc.onSnapshot((doc) => {
        // do stuff with the data
        return true;
      });
    } else {
      return false;
    }
});
    



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
        if (!showCarousel) setTopLeft(Math.round(predictions[0].topLeft[0]));
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
  }, [showCarousel]);

  const handleCalibrate = async () => {
    const model = await setupModel();

    if (model) {
      const predictions = await makePredictions(model, webcamRef, canvasRef);
      console.log(predictions);
    }

    // setCalibrated(true);
  };

  return (
    <div className='App'>
      {loadingModel ? (
        <div>Loading Model...</div>
      ) : (
        <div className='container'>
          <button onClick={() => checkUserPresent()}>press</button>
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
                calibrationCapture={handleCalibrate}
                addFirebaseUser={addUser}
                toggleCarousel={setShowCarousel}
              />
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  {' '}
                  <div style={{ position: 'absolute' }}>
                    <input
                      type='checkbox'
                      name='show-bounding-box'
                      checked={true}
                    ></input>
                    <label htmlFor='show-bounding-box'>Show Box</label>
                    <input
                      type='checkbox'
                      name='take-photo'
                      checked={true}
                    ></input>
                    <label htmlFor='take-photo'>Take Photo</label>
                  </div>
                  <div>
                    <h1>You are ft. {topLeft} in. away</h1>
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
