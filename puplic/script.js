const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');
const switchBtn = document.getElementById('switchBtn');
const viewBtn = document.getElementById('viewBtn');
const closeDrawer = document.getElementById('closeDrawer');
const drawer = document.getElementById('drawer');
const peopleList = document.getElementById('peopleList');
const countSpan = document.getElementById('count');

let currentFacingMode = 'user';
let currentStream = null;
let lastServerCheck = 0;

let currentPersonState = {
  status: 'Scanning...',
  id: '',
  color: '#00E5FF'
};

const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

pose.onResults(onResults);

async function checkServerIdentity(landmarks) {
  const now = Date.now();
  if (now - lastServerCheck < 1200) return;
  lastServerCheck = now;

  const keyPoints = [0, 2, 5, 7, 8, 11, 12];
  const featureVector = [];
  
  keyPoints.forEach(idx => {
    if (landmarks[idx]) {
      featureVector.push(landmarks[idx].x, landmarks[idx].y, landmarks[idx].z);
    }
  });

  try {
    const response = await fetch('/api/identify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: featureVector })
    });

    const data = await response.json();

    if (data.status === 'REGISTERED') {
      currentPersonState = {
        status: 'REGISTERED HUMAN DETECTED',
        id: data.person_id,
        color: '#00FF66'
      };
    } else if (data.status === 'NEWLY_REGISTERED') {
      currentPersonState = {
        status: 'UNREGISTERED HUMAN DETECTED → REGISTERED NEW ID',
        id: data.person_id,
        color: '#FFB300'
      };
      fetchRegisteredPeople();
    }
  } catch (err) {
    console.warn('Backend server error:', err);
  }
}

function onResults(results) {
  canvasElement.width = videoElement.videoWidth || window.innerWidth;
  canvasElement.height = videoElement.videoHeight || window.innerHeight;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.poseLandmarks) {
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 3 });
    drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2, radius: 4 });

    let xMin = canvasElement.width, yMin = canvasElement.height, xMax = 0, yMax = 0;
    results.poseLandmarks.forEach((pt) => {
      if (pt.visibility > 0.3) {
        const x = pt.x * canvasElement.width;
        const y = pt.y * canvasElement.height;
        if (x < xMin) xMin = x;
        if (x > xMax) xMax = x;
        if (y < yMin) yMin = y;
        if (y > yMax) yMax = y;
      }
    });

    const padding = 20;
    const boxX = Math.max(0, xMin - padding);
    const boxY = Math.max(0, yMin - padding);
    const boxWidth = (xMax - xMin) + (padding * 2);
    const boxHeight = (yMax - yMin) + (padding * 2);

    canvasCtx.strokeStyle = currentPersonState.color;
    canvasCtx.lineWidth = 3;
    canvasCtx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    canvasCtx.fillStyle = currentPersonState.color;
    canvasCtx.font = 'bold 16px sans-serif';
    const label = currentPersonState.id 
      ? `[${currentPersonState.status}] - ID: ${currentPersonState.id}`
      : `[${currentPersonState.status}]`;
      
    canvasCtx.fillText(label, boxX, boxY > 25 ? boxY - 10 : boxY + 25);

    checkServerIdentity(results.poseLandmarks);
  } else {
    currentPersonState = { status: 'Scanning...', id: '', color: '#00E5FF' };
  }

  canvasCtx.restore();
}

async function fetchRegisteredPeople() {
  try {
    const res = await fetch('/api/people');
    const data = await res.json();
    countSpan.textContent = data.count;

    if (data.people.length === 0) {
      peopleList.innerHTML = '<p style="color: #888;">No humans registered yet.</p>';
      return;
    }

    peopleList.innerHTML = data.people.map(p => `
      <div class="person-card">
        <div class="person-id">${p.id}</div>
        <div style="font-size: 12px; color: #aaa;">Status: Active</div>
      </div>
    `).join('');
  } catch (err) {
    peopleList.innerHTML = '<p style="color: #ff5555;">Failed to load server data.</p>';
  }
}

async function startCamera(facingMode) {
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop());
  }

  try {
    currentStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facingMode }
    });
    videoElement.srcObject = currentStream;
    await videoElement.play();
    processVideo();
  } catch (err) {
    alert('Camera error: ' + err.message);
  }
}

async function processVideo() {
  if (!videoElement.paused && !videoElement.ended) {
    await pose.send({ image: videoElement });
    requestAnimationFrame(processVideo);
  }
}

switchBtn.addEventListener('click', () => {
  currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
  startCamera(currentFacingMode);
});

viewBtn.addEventListener('click', () => {
  fetchRegisteredPeople();
  drawer.classList.add('open');
});

closeDrawer.addEventListener('click', () => {
  drawer.classList.remove('open');
});

startCamera(currentFacingMode);
fetchRegisteredPeople();
