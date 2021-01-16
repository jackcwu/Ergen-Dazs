import React, { useState } from 'react';
import ReactSwipe from 'react-swipe';

const Carousel = () => {
  const [feetInput, setFeetInput] = useState(2);
  const [inchesInput, setInchesInput] = useState(0);
  let reactSwipeEl;

  const handleFeetInputChange = (e) => {
    setFeetInput(e.target.value);
  };

  const handleInchesInputChange = (e) => {
    setInchesInput(e.target.value);
  };

  return (
    <>
      <ReactSwipe
        className='carousel'
        swipeOptions={{ continuous: false }}
        ref={(el) => (reactSwipeEl = el)}
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
          <h1>You are __ ft. __ in. away</h1>
          <h1>Your level is __</h1>
          <button onClick={() => reactSwipeEl.next()}>Done</button>
        </div>

        {/* <button>1</button>
        <button>2</button> */}
      </ReactSwipe>
      <div>
        <button onClick={() => reactSwipeEl.next()}>Next</button>
        <button onClick={() => reactSwipeEl.prev()}>Previous</button>
      </div>
    </>
  );
};

export default Carousel;
