export const makePredictions = async (model, webcamRef, canvasRef) => {
  // check if webcam is ready and has enough data (HAVE_ENOUGH_DATA === 4)
  if (
    typeof webcamRef.current !== 'undefined' &&
    webcamRef.current !== null &&
    webcamRef.current.video.readyState === 4
  ) {
    // Get Video Properties
    const video = webcamRef.current.video;
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    // Set video width
    webcamRef.current.video.width = videoWidth;
    webcamRef.current.video.height = videoHeight;

    // Set canvas width
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    // Make detections
    const returnTensors = false;
    const flipHorizontal = true;
    const predictions = await model.estimateFaces(
      video,
      returnTensors,
      flipHorizontal
    );

    return predictions;
  } else {
    return 'WEBCAM NOT READY';
  }
};

export const updateCanvas = (canvasRef, predictions) => {
  // Get canvas context
  const ctx = canvasRef.current.getContext('2d');
  requestAnimationFrame(() => drawBoundingBox(predictions, ctx));
};

// Draw bounding box around face
export const drawBoundingBox = (predictions, ctx) => {
  if (predictions.length > 0) {
    for (let i = 0; i < predictions.length; i++) {
      const start = predictions[i].topLeft;
      const end = predictions[i].bottomRight;
      const size = [end[0] - start[0], end[1] - start[1]];

      // Render a rectangle over each detected face.
      ctx.strokeStyle = '#38A94C';
      ctx.strokeRect(start[0], start[1], size[0], size[1]);

      // ctx.fillStyle = 'rgba(255, 0, 0, 0)';
      // ctx.fillRect(start[0], start[1], size[0], size[1]);

      const landmarks = predictions[i].landmarks;

      ctx.fillStyle = '#38A94C';
      for (let j = 0; j < landmarks.length; j++) {
        const x = landmarks[j][0];
        const y = landmarks[j][1];
        // ctx.fillRect(x, y, 5, 5);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
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
