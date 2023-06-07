const COLORS = [
  [20, 54, 66],
  [15, 139, 141],
  [236, 154, 41],
  [168, 32, 26]
];

let canvas;
let ctx;
let pose;

let rightHandRecentPos = [];
let leftHandRecentPos = [];

let backgroundColor = COLORS[0];

let noseParticle;
let rightWristParticle;
let leftWristParticle;

let myRHand;
let myLHand;

let video;
let poseNet;
let myPose;

const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;

function setup() {
  canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx = canvas.drawingContext;
  // background(backgroundColor);

  video = createCapture(VIDEO, camReady);
  video.size(CANVAS_WIDTH, CANVAS_HEIGHT);
  // cam.hide();

  // noseParticle = new Particle(ctx, 100, 100, CANVAS_WIDTH, COLORS[1]);
  // rightWristParticle = new Particle(ctx, 100, 100, CANVAS_WIDTH, COLORS[2]);
  // leftWristParticle = new Particle(ctx, 100, 100, CANVAS_WIDTH, COLORS[3]);

  // Posenet option to make posenet mirror user
  const options = {
    flipHorizontal: false,
  }

  // Create poseNet to run on webcam and call 'modelReady' when model loaded
  poseNet = ml5.poseNet(video, options, modelReady);

  // Everytime we get a pose from posenet, call "getPose"
  // and pass in the results
  poseNet.on('pose', (results) => getPose(results));
}

function draw() {
  // clear();
  // background(backgroundColor);

  image(video, 0, 0);
  // draw an image from url
  // image(img, 0, 0, width, height);

  if (myPose) {
    myRHand = getHand(myPose, 'rightWrist');
    myRHand = mapHand(myRHand.x, myRHand.y, rightHandRecentPos);

    fill(COLORS[2]);
    circle(myRHand.x, myRHand.y, 50);

    // myLHand = getHand(myPose, 'leftWrist');
    // myLHand = mapHand(myLHand.x, myLHand.y, leftHandRecentPos);


  }

}

function camReady() {
  console.log("Webcam Ready!");
  // loadPoseDetectionModel();
}

// When posenet model is ready, let us know!
function modelReady() {
  console.log('Model Loaded');
}

// Function to get and send pose from posenet
function getPose(poses) {
  // We're using single detection so we'll only have one pose
  // which will be at [0] in the array
  myPose = poses[0];
}

// Function to get hand out of the pose
function getHand(pose, name) {
  // Return the wrist
  return pose.pose[name];
}

function mapHand(x, y, handArr) {
  let tempHand = {};
  tempHand.x = map(x, 0, CANVAS_WIDTH, 0, CANVAS_WIDTH);
  tempHand.y = map(y, 0, CANVAS_HEIGHT, 0, CANVAS_WIDTH);

  tempHand = average(tempHand, handArr);

  return tempHand;
}

function average(pos, handArr) {
  const numXs = 25;
  // the first time this runs we add the current x to the array n number of times
  if (handArr.length < 1) {
    console.log('this should only run once');
    for (let i = 0; i < numXs; i++) {
      handArr.push(pos);
    }
    // if the number of frames to average is increased, add more to the array
  } else if (handArr.length < numXs) {
    console.log('adding more xs');
    const moreXs = numXs - handArr.length;
    for (let i = 0; i < moreXs; i++) {
      handArr.push(pos);
    }
    // otherwise update only the most recent number
  } else {
    handArr.shift(); // removes first item from array
    handArr.push(pos); // adds new x to end of array
  }

  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < handArr.length; i++) {
    sumX += handArr[i].x;
    sumY += handArr[i].y;
  }

  // return the average x value
  return {
    x: sumX / handArr.length,
    y: sumY / handArr.length
  }
}


class Particle {
  constructor(ctx, x, y, r, color) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.radius = r;
    this.color = color;
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
  }

  render() {
    this.ctx.beginPath();
    const g = this.ctx.createRadialGradient(this.x, this.y, this.radius * 0.01, this.x, this.y, this.radius);
    g.addColorStop(0, `rgba(${this.color.join(',')}, 0.7)`);
    g.addColorStop(1, `rgba(${this.color.join(',')}, 0)`);
    this.ctx.fillStyle = g;
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    this.ctx.fill();
  }
}
