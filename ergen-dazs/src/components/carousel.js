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

  const slideCallback = async () => {
    if (reactSwipeEl !== null) {
      const pos = reactSwipeEl.getPos();
      console.log(pos);
      setCurrentPos(pos);
      if (pos === 2) {
        props.toggleCalibrationPane(true);
      } else if (pos === 3) {
        props.toggleCalibrationPane(false);
        props.toggleDetectionPane(true);
        await props.calibrationCapture(feetInput, inchesInput);
        props.toggleCarousel(false);
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
            Answer me: I am{' '}
            <input
              type='text'
              onInput={(e) => handleFeetInputChange(e)}
            ></input>{' '}
            ft.{' '}
            <input
              type='text'
              onInput={(e) => handleInchesInputChange(e)}
            ></input>{' '}
            in. away
          </h1>
          <button
            onClick={() => {
              reactSwipeEl.next();
            }}
          >
            Take Calibration Photo
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1></h1>
        </div>
      </ReactSwipe>
    </>
  );
};

export default Carousel;
