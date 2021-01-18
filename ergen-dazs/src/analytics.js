import React from 'react';
import icons from './icons.png';

function Analytics({ screenshot }) {
  console.log(screenshot, 'img');
  return (
    <div className='Analytics'>
      <div className='analytics-container'>
        <div className='analytics-left'>
          <h1>Analytics</h1>
          <p>
            <b>Based on our algorithm:</b> <br />- Your ergonomics are{' '}
            <span style={{ color: '#38A94C' }}>great!</span> <br />
          </p>
          <p>
            <b>Bonus:</b> <br /> Based on your expression, you are in a{' '}
            <span style={{ color: 'red' }}>eh</span> mood
          </p>
        </div>
        <div className='analytics-right'>
          <div className='analytics-post'>
            <h2>I am ergonomic af 🔥 🖥 🌵 </h2>
            <img src={screenshot} alt='screenshot'></img>
          </div>
          <div className='analytics-share'>
            <h1>
              Share <img src={icons}></img>
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
