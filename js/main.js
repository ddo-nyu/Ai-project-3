const COLORS = [
    [20, 54, 66],
    [15, 139, 141],
    [236, 154, 41],
    [168, 32, 26]
];

const MOODS_COLORS = {
    sad: [
        [0, 0, 0],
        [255, 255, 255],
        [255, 0, 0],
    ],
    happy: [
        [20, 54, 66],
        [15, 139, 141],
        [236, 154, 41],
    ],
    relaxed: [
        [20, 54, 66],
        [15, 139, 141],
        [236, 154, 41],
    ],
    angry: [
        [0, 0, 0],
        [255, 255, 255],
        [255, 0, 0],
    ]
}
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/t_Lzzsox3/';

let canvas;
let ctx;
let pose;
let classifier;
let backgroundColor = COLORS[0];

let noseParticle;
let rightWristParticle;
let leftWristParticle;

let video;

const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;

let emotionLabel;
let emotionConfidence;
let prevEmotionLabel;

let isTransitioning = false;

function preload() {
    // Load the Teachable Machine model
    classifier = ml5.imageClassifier(imageModelURL + 'model.json', () => {
        console.log('Classifier Loaded!');
    });
}

function setup() {
    // frameRate(2);

    // set up canvas
    canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx = canvas.drawingContext;
    background(backgroundColor);

    // setup video
    video = createCapture(VIDEO, camReady);
    video.size(CANVAS_WIDTH, CANVAS_HEIGHT);
    // cam.hide();

    // set up color particles
    noseParticle = new Particle(ctx, 100, 100, CANVAS_WIDTH, COLORS[1]);
    rightWristParticle = new Particle(ctx, 100, 100, CANVAS_WIDTH, COLORS[2]);
    leftWristParticle = new Particle(ctx, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH, COLORS[3]);

    classifyVideo();
}

function draw() {
    console.log(emotionLabel);

    background(backgroundColor);
    leftWristParticle.render();
    rightWristParticle.render();

    // draw video in the top left corner
    image(video, 0, 0, 200, 150);
}

function transitionColors() {
    if (isTransitioning) {
        return;
    }

    isTransitioning = true;

    const mood = emotionLabel;
    const moodColors = MOODS_COLORS[mood];

    const color1 = moodColors[0];
    const color2 = moodColors[1];
    const color3 = moodColors[2];

    const color1Diff = color1.map((c, i) => c - backgroundColor[i]);
    const color2Diff = color2.map((c, i) => c - rightWristParticle.color[i]);
    const color3Diff = color3.map((c, i) => c - leftWristParticle.color[i]);

    const color1DiffStep = color1Diff.map(c => c / 100);
    const color2DiffStep = color2Diff.map(c => c / 100);
    const color3DiffStep = color3Diff.map(c => c / 100);

    let i = 0;
    const interval = setInterval(() => {
        backgroundColor = backgroundColor.map((c, i) => c + color1DiffStep[i]);
        rightWristParticle.updateColor(rightWristParticle.color.map((c, i) => c + color2DiffStep[i]));
        leftWristParticle.updateColor(leftWristParticle.color.map((c, i) => c + color3DiffStep[i]));

        i++;
        if (i === 100) {
            clearInterval(interval);
            isTransitioning = false;
        }
    }, 10);
}

function camReady() {
    console.log("Webcam Ready!");
    // loadPoseDetectionModel();
}

function classifyVideo() {
    classifier.classify(video, gotResult);
}

function gotResult(error, results) {
    // If there is an error
    if (error) {
        console.error(error);
        return;
    }
    // The results are in an array ordered by confidence.

    emotionLabel = results[0].label;
    emotionConfidence = results[0].confidence;

    if (prevEmotionLabel !== emotionLabel) {
        transitionColors();
        prevEmotionLabel = emotionLabel;
    }

    // Classifiy again!
    classifyVideo();
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

    updateColor(color) {
        this.color = color;
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
