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

  const addUser = (dist, face) => {
    var currUser = firebase.auth().currentUser.email;

    // add user to database
    const db = firebase.firestore();
    db.collection('users')
      .doc(currUser)
      .set({
        distance: parseInt(dist, 10),
        face_width: face,
      });
    //console.log('Added document with ID: ', db.id);
  };

  const checkUserPresent = () => {
    //console.log(firebase.auth().currentUser.email);
    var currUser = firebase.auth().currentUser.email;
    console.log('CURRENT USER IS: ', currUser);
    if (currUser === null) {
      console.log('GUEST');
      return false;
    }

    //console.log("CURRENT USER IS: ", currUser);
    const doc = ref.doc(currUser);

    doc.get().then((docSnapshot) => {
      if (docSnapshot.exists) {
        doc.onSnapshot((doc) => {
          // do stuff with the data
          console.log('YESS');
          //setShowCarousel(false);
          return true;
        });
      } else {
        console.log('NOOO');
        return false;
      }
    });
  };

  const skipCalibrate = async () => {
    console.log('SKIPCALIBRATE START');

    var currUser = firebase.auth().currentUser.email;
    console.log('CURRENT USER IS: ', currUser);
    if (currUser === null) {
      console.log('GUEST');
      return false;
    }

    //console.log("CURRENT USER IS: ", currUser);
    const doc = ref.doc(currUser);

    const docSnapshot = await doc.get();
    if (docSnapshot.exists) {
      // do stuff with the data
      console.log('YESS');
      await retrieveDBmeasurements();
      setShowCarousel(false);
      return true;
    } else {
      console.log('NOOO');
      return false;
    }

    // if (checkUserPresent()) {
    //   console.log("branch 1")
    //   setShowCarousel(false);
    // } else {
    //   console.log("branch 2")
    //   console.log("user not present")
    // }
  };

  const retrieveDBmeasurements = async () => {
    // get the calibration data since it's already in the database
    var currUser = firebase.auth().currentUser.email;
    var docRef = ref.doc(currUser);

    try {
      const doc = await docRef.get();
      if (doc.exists) {
        console.log('Document data:', doc.data());
        console.log('DIST', doc.data().distance);
        setCalibrationData({
          distance: 10,
          faceWidth: 300,
        });
      } else {
        // doc.data() will be undefined in this case
        console.log('No such document!');
      }
    } catch (error) {
      console.log('Error getting document:', error);
    }
    //console.log("calibrateDB ISSSS", calibrateDB.data)
    //setCalibrationData(calibrateDB.distance, calibrateDB.face_width);
    //console.log("FOUND OLD CALIBRATION IT IS:", calibrateDB.distance, calibrateDB.face_width)
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

    skipCalibrate();
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

        var currUser = firebase.auth().currentUser.email;
        console.log('CURRENT USER IS: ', currUser);
        if (currUser !== null) {
          addUser(calibrationDataTemp.distance, calibrationDataTemp.faceWidth); // update calibration data in DB
        }

        setCalibrationData(calibrationDataTemp);
      } else {
        console.log('No valid prediction made');
      }
    }
  };

  return (
    <div className="App">
      {loadingModel ? (
        <div>Loading Model...</div>
      ) : (
        <div className="container">
          {/* <button onClick={() => {skipCalibrate()}}>press</button> */}
          {showDistancePane && <DistancePane></DistancePane>}

          <div className="webcam-container">
            <Webcam ref={webcamRef} className="webcam" />
            <canvas ref={canvasRef} className="canvas"></canvas>
          </div>

          {showCalibrationPane && <CalibrationPane></CalibrationPane>}

          {showDetectionPane && <DetectionPane></DetectionPane>}

          <div className="carousel-container">
            {showCarousel ? (
              <Carousel
                toggleCalibrationPane={setShowCalibrationPane}
                toggleDetectionPane={setShowDetectionPane}
                toggleCarousel={setShowCarousel}
                calibrationCapture={handleCalibrate}
                addFirebaseUser={addUser}
              />
            ) : (
              <div className="detection-footer-container">
                <div className="checkmark-container">
                  <span>
                    <input
                      type="checkbox"
                      name="show-bounding-box"
                      checked={showBoundingBox}
                      onClick={() => setShowBoundingBox(!showBoundingBox)}
                    ></input>
                    <label htmlFor="show-bounding-box">Show Box</label>
                  </span>
                  <span>
                    <input
                      type="checkbox"
                      name="take-photo"
                      checked={true}
                    ></input>
                    <label htmlFor="take-photo">Take Photo</label>
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
