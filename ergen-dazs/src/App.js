import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// tensorflow face detection model
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import Webcam from 'react-webcam';

import { drawBoundingBox, makePredictions, updateCanvas } from './utils';

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
    console.log('Added document with ID: ');
  };

  const checkUserPresent = () => {
    var currUser = firebase.auth().currentUser.email;
    console.log('CURRENT USER IS: ', currUser);
    if (currUser === null) {
      console.log('GUEST');
      return false;
    }

    console.log(currUser);
    const doc = ref.doc(currUser);

    doc.get().then((docSnapshot) => {
      if (docSnapshot.exists) {
        doc.onSnapshot((doc) => {
          // do stuff with the data
          console.log('YESS');
          setShowCarousel(false);
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

    var currUser = firebase.auth().currentUser;
    var currUserEmail = currUser !== null ? currUser.email : null;
    console.log('CURRENT USER IS: ', currUser);
    if (currUser === null || currUserEmail === null) {
      console.log('GUEST');
      return false;
    }

    //console.log("CURRENT USER IS: ", currUser);
    const doc = ref.doc(currUserEmail);

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
          distance: doc.data().distance,
          faceWidth: doc.data().face_width,
        });
      } else {
        // doc.data() will be undefined in this case
        console.log('No such document!');
      }
    } catch (error) {
      console.log('Error getting document:', error);
    }
  };

  const setupModel = async () => {
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
          setDistance(currentDistance);
        }
      }
    };

    const timerId = setInterval(continuousPredictionOnWebcam, 100);
    return timerId;
  };

  useEffect(() => {
    console.log('mount');
    // checkUserPresent();
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
          distance: parseInt(feetInput * 12, 10) + parseInt(inchesInput, 10),
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

  const sendScreenshot = () => {
    let imgbase64 = webcamRef.current.getScreenshot();
    props.onDoneWithMain(imgbase64);
  };

  return (
    <div className="App">
      {loadingModel ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            fontSize: '5rem',
            color: '#45d4d2',
            fontStyle: 'italic',
            fontWeight: 'bold',
          }}
        >
          Loading Model...
        </div>
      ) : (
        <div className="container">
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
                newSessionToggle={props.sessionToggle}
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
                      You are {Math.floor(distance / 12)} ft. {distance % 12}{' '}
                      in. away
                    </h1>
                    <h1>
                      Your level is{' '}
                      <span style={{ color: '#38A94C' }}>great!</span>
                    </h1>
                    <button onClick={() => sendScreenshot()}>Done</button>
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
