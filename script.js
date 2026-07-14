// Start video stream with chosen camera direction
async function startCamera(facingMode) {
  // 1. Stop all current video tracks cleanly
  if (currentStream) {
    currentStream.getTracks().forEach((track) => {
      track.stop();
    });
    videoElement.srcObject = null;
  }

  // 2. Mobile-friendly constraints (avoid strict resolution constraints)
  const constraints = {
    video: {
      facingMode: { exact: facingMode === 'environment' ? 'environment' : 'user' }
    },
    audio: false
  };

  try {
    // 3. Fall back gracefully if exact facingMode fails
    try {
      currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (e) {
      // General fall-back without strict 'exact' constraint
      currentStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
        audio: false
      });
    }

    videoElement.srcObject = currentStream;
    await videoElement.play();
    processVideo();
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('Camera request aborted. Retrying...');
    } else {
      alert('Camera error: ' + err.name + ' - ' + err.message);
    }
  }
}
