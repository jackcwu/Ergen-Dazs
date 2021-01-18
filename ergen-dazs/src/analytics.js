import React from 'react';

function Analytics({ screenshot }) {
  console.log(screenshot, 'img');
  return (
    <div>
      <h1>I am ergonomic af</h1>
      <img src={screenshot} alt='screenshot'></img>
    </div>
  );
}

export default Analytics;
