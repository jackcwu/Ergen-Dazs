// Draw bounding box around face
export const drawBoundingBox = (predictions, ctx) => {
  if (predictions.length > 0) {
    for (let i = 0; i < predictions.length; i++) {
      const start = predictions[i].topLeft;
      const end = predictions[i].bottomRight;
      const size = [end[0] - start[0], end[1] - start[1]];

      // Render a rectangle over each detected face.
      ctx.strokeStyle = 'green';
      ctx.strokeRect(start[0], start[1], size[0], size[1]);

      // ctx.fillStyle = 'rgba(255, 0, 0, 0)';
      // ctx.fillRect(start[0], start[1], size[0], size[1]);
    }
    /*
    `predictions` is an array of objects describing each detected face, for example:

    [
      {
        topLeft: [232.28, 145.26],
        bottomRight: [449.75, 308.36],
        probability: [0.998],
        landmarks: [
          [295.13, 177.64], // right eye
          [382.32, 175.56], // left eye
          [341.18, 205.03], // nose
          [345.12, 250.61], // mouth
          [252.76, 211.37], // right ear
          [431.20, 204.93] // left ear
        ]
      }
    ]
    */
  }
};
