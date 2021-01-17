import React from 'react';

function Analytics({ screenshot }) {
  console.log(screenshot, 'img');
  return (
    <div>
      sup lmfao
      <img src={screenshot} alt='screenshot'></img>
    </div>
  );
}

export default Analytics;
