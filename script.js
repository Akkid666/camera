const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');
const switchBtn = document.getElementById('switchBtn');

// Default to front camera ("user"), switch to "environment" for back
let currentFacingMode = 'user';
let currentStream = null;

// Initialize MediaPipe Pose
const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

pose.onResults(onResults);

// Render skeleton and bounding box
function onResults(results) {
  // Adjust canvas resolution to match video feed
  canvasElement.width = videoElement.videoWidth || window.innerWidth;
  canvasElement.height = videoElement.videoHeight || window.innerHeight;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // Draw original video frame
  canvasCtx.drawImage(
    results.image, 0, 0, canvasElement.width, canvasElement.height
  );

  if (results.poseLandmarks) {
    // 1. Draw Skeleton Lines and Keypoints
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
      color: '#00FF00',
      lineWidth: 4
    });
    drawLandmarks(canvasCtx, results.poseLandmarks, {
      color: '#FF0000',
      lineWidth: 2,
      radius: 4
    });

    // 2. Calculate Bounding Box around the human body
    let xMin = canvasElement.width;
    let yMin = canvasElement.height;
    let xMax = 0;
    let yMax = 0;

    results.poseLandmarks.forEach((landmark) => {
      if (landmark.visibility > 0.3) {
        const x = landmark.x * canvasElement.width;
        const y = landmark.y * canvasElement.height;
        if (x < xMin) xMin = x;
        if (x > xMax) xMax = x;
        if (y < yMin) yMin = y;
        if (y > yMax) yMax = y;
      }
    });

    // Draw Bounding Box with padding
    const padding = 20;
    const boxWidth = (xMax - xMin) + (padding * 2);
    const boxHeight = (yMax - yMin) + (padding * 2);
    const boxX = Math.max(0, xMin - padding);
    const boxY = Math.max(0, yMin - padding);

    canvasCtx.strokeStyle = '#00E5FF';
    canvasCtx.lineWidth = 3;
    canvasCtx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // Label on the box
    canvasCtx.fillStyle = '#00E5FF';
    canvasCtx.font = '16px sans-serif';
    canvasCtx.fillText('Person', boxX + 5, boxY > 20 ? boxY - 8 : boxY + 20);
  }
  canvasCtx.restore();
}

// Start video stream with chosen camera direction
async function startCamera(facingMode) {
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop());
  }

  const constraints = {
    video: {
      facingMode: facingMode,
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: false
  };

  try {
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = currentStream;
    await videoElement.play();
    processVideo();
  } catch (err) {
    alert('Camera error: ' + err.message);
  }
}

// Loop video frames into MediaPipe Pose
async function processVideo() {
  if (!videoElement.paused && !videoElement.ended) {
    await pose.send({ image: videoElement });
    requestAnimationFrame(processVideo);
  }
}

// Switch Camera Handler
switchBtn.addEventListener('click', () => {
  currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
  startCamera(currentFacingMode);
});

// Start with default front camera
startCamera(currentFacingMode);
