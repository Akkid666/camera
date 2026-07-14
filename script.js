// ======================================================
// AI Camera
// script.js
// PART 1
// ======================================================

// Elements
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const loading = document.getElementById("loading");
const counter = document.getElementById("counter");

// AI model
let model = null;

// Camera size
let cameraWidth = 0;
let cameraHeight = 0;

// Colors
const BOX_COLOR = "#00ff00";
const TEXT_COLOR = "#00ff00";

//------------------------------------------------------
// Start Camera
//------------------------------------------------------

async function startCamera() {

    const stream = await navigator.mediaDevices.getUserMedia({

        video: {

            facingMode: {
                ideal: "environment"
            }

        },

        audio: false

    });

    video.srcObject = stream;

    return new Promise(resolve => {

        video.onloadedmetadata = () => {

            video.play();

            cameraWidth = video.videoWidth;
            cameraHeight = video.videoHeight;

            canvas.width = cameraWidth;
            canvas.height = cameraHeight;

            resolve();

        };

    });

}

//------------------------------------------------------
// Load AI
//------------------------------------------------------

async function loadAI() {

    loading.innerHTML = "Loading AI...";

    model = await cocoSsd.load();

    loading.style.display = "none";

}

//------------------------------------------------------
// Draw Detection
//------------------------------------------------------

function drawPrediction(prediction) {

    const x = prediction.bbox[0];
    const y = prediction.bbox[1];
    const w = prediction.bbox[2];
    const h = prediction.bbox[3];

    ctx.strokeStyle = BOX_COLOR;
    ctx.lineWidth = 3;

    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = TEXT_COLOR;

    ctx.font = "20px Arial";

    const confidence =
        Math.round(prediction.score * 100);

    ctx.fillText(

        prediction.class +
        " (" +
        confidence +
        "%)",

        x,

        y - 8

    );

}

//======================================================
// PART 2
// Paste directly under PART 1
//======================================================

//------------------------------------------------------
// Detect Objects
//------------------------------------------------------

async function detectObjects() {

    if (!model) {
        requestAnimationFrame(detectObjects);
        return;
    }

    const predictions = await model.detect(video);

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    counter.innerHTML =
        "Objects: " + predictions.length;

    for (const prediction of predictions) {

        drawPrediction(prediction);

    }

    requestAnimationFrame(
        detectObjects
    );

}

//------------------------------------------------------
// Resize Canvas
//------------------------------------------------------

function resizeCanvas() {

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

}

window.addEventListener(

    "resize",

    resizeCanvas

);

//------------------------------------------------------
// Handle Camera Errors
//------------------------------------------------------

function showError(message) {

    loading.style.display = "block";

    loading.innerHTML = message;

    loading.style.color = "red";

}

//------------------------------------------------------
// Initialize Everything
//------------------------------------------------------

async function init() {

    try {

        await startCamera();

        resizeCanvas();

        await loadAI();

        detectObjects();

    }

    catch (error) {

        console.error(error);

        showError(

            "Unable to access the camera."

        );

    }

}

init();
