const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const fpsText = document.getElementById("fps");
const objectText = document.getElementById("objects");
const loading = document.getElementById("loading");

let model;
let lastTime = performance.now();

async function startCamera(){

const stream = await navigator.mediaDevices.getUserMedia({

video:{
facingMode:"environment"
},

audio:false

});

video.srcObject = stream;

return new Promise(resolve=>{

video.onloadedmetadata=()=>{

video.play();

resolve();

};

});

}

function estimateDistance(pixelHeight){

const focal = 900;

const realHeight = 0.20;

return ((realHeight*focal)/pixelHeight).toFixed(2);

}

async function detect(){

const predictions = await model.detect(video);

ctx.clearRect(0,0,canvas.width,canvas.height);

objectText.innerHTML="Objects: "+predictions.length;

predictions.forEach(pred=>{

const x=pred.bbox[0];
const y=pred.bbox[1];
const w=pred.bbox[2];
const h=pred.bbox[3];

ctx.strokeStyle="lime";
ctx.lineWidth=3;

ctx.strokeRect(x,y,w,h);

ctx.fillStyle="lime";

ctx.font="18px Arial";

let label=pred.class;

if(pred.class==="person"){

label+=" | Height ≈ 1.7m";

}

label+=" | "+estimateDistance(h)+"m";

ctx.fillText(label,x,y-5);

});

const now=performance.now();

const fps=(1000/(now-lastTime)).toFixed(0);

lastTime=now;

fpsText.innerHTML="FPS: "+fps;

requestAnimationFrame(detect);

}

async function init(){

await startCamera();

canvas.width=video.videoWidth;
canvas.height=video.videoHeight;

model=await cocoSsd.load();

loading.style.display="none";

detect();

}

init();
