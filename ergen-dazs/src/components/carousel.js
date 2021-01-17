import React, { useState } from 'react';
import ReactSwipe from 'react-swipe';

const Carousel = (props) => {
  const [feetInput, setFeetInput] = useState(2);
  const [inchesInput, setInchesInput] = useState(0);
  const [reactSwipeEl, setReactSwipeEl] = useState(null);
  const [currentPos, setCurrentPos] = useState(0);

  const handleFeetInputChange = (e) => {
    setFeetInput(e.target.value);
  };

  const handleInchesInputChange = (e) => {
    setInchesInput(e.target.value);
  };

  const slideCallback = () => {
    if (reactSwipeEl !== null) {
      // console.log(reactSwipeEl.getPos());
      const pos = reactSwipeEl.getPos();
      setCurrentPos(pos);
      if (pos === 2) {
        props.toggleCalibrationPane();
      }
      if (pos === 3) {
        props.toggleCalibrationPane();
        props.toggleDetectionPane();
      }
    }
  };

  return (
    <>
      <ReactSwipe
        className='carousel'
        swipeOptions={{
          continuous: false,
          transitionEnd: slideCallback,
          startSlide: currentPos,
        }}
        ref={(el) => setReactSwipeEl(el)}
      >
        <div style={{ textAlign: 'center' }}>
          <h1>Let's Get Started</h1>
          <button onClick={() => reactSwipeEl.next()}>Start</button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1>Look into the Camera</h1>
          <button onClick={() => reactSwipeEl.next()}>Next</button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1>
            Answer me: I am <input type='text'></input> ft.{' '}
            <input type='text'></input> in. away
          </h1>
          <button onClick={() => reactSwipeEl.next()}>
            Take Calibration Photo
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div style={{ position: 'absolute' }}>
              <input
                type='checkbox'
                name='show-bounding-box'
                checked='true'
              ></input>
              <label htmlFor='show-bounding-box'>Show Box</label>
              <input type='checkbox' name='take-photo' checked='true'></input>
              <label htmlFor='take-photo'>Take Photo</label>
            </div>
            <div>
              <h1>You are __ ft. __ in. away</h1>
              <h1>Your level is __</h1>
              <button onClick={() => reactSwipeEl.next()}>Done</button>
            </div>
          </div>
        </div>
      </ReactSwipe>
      <div>
        <button onClick={() => reactSwipeEl.prev()}>Previous</button>
        <button onClick={() => reactSwipeEl.next()}>Next</button>
      </div>
    </>
  );
};

export default Carousel;
