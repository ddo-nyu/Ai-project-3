console.log("ml5 version:", ml5.version);

// Model URL
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/SL6z1sNqp/';

let cam;
let classifier;
let label = "";
let confidence = "";

function preload() {
    classifier = ml5.imageClassifier(imageModelURL + 'model.json', modelReady);
}

function setup() {
    createCanvas(640, 480);

    cam = createCapture(VIDEO);
    cam.hide();

    classifyVideo();
}

function draw() {
    background(0);
    image(cam, 0, 0);

    let emoji = '';


    if (label === 'bear' && confidence > 0.9) {
        emoji = '🐻';
    } else if (label === 'cat' && confidence > 0.9) {
        emoji = '🐱';
    }


    // Draw the label
    fill(0, 255, 0);
    // text(label, 10, 20);
    // text(confidence, 10, 40);
    textSize(100);
    text(emoji, width / 2 - 50, 100);
}

// Get a prediction for the current video frame
function classifyVideo() {
    classifier.classify(cam, gotResult);
}

// When we get a result
function gotResult(error, results) {
    // If there is an error
    if (error) {
        console.error(error);
        return;
    }
    // The results are in an array ordered by confidence.
    // console.log(results[0]);
    label = results[0].label;
    confidence = results[0].confidence;

    // console.log(results);

    // Classifiy again!
    classifyVideo();
}

function modelReady() {
    console.log("Model Loaded!");
}