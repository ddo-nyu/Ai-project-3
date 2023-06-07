// Global variables
let video;
let poseNet;
let poses = [];
let classifier;
let label = '';

// Teachable Machine model URL
const TM_MODEL_URL = 'https://teachablemachine.withgoogle.com/models/FMr9AWNvx/';

function preload() {
    // Load the Teachable Machine model
    classifier = ml5.imageClassifier(TM_MODEL_URL + 'model.json');
}

function setup() {
    // Create canvas
    createCanvas(640, 480);

    // Create video capture
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();

    // Create a new poseNet method
    poseNet = ml5.poseNet(video, modelReady);
    poseNet.on('pose', gotPoses);


}

function modelReady() {
    console.log('posenet loaded');

}

function gotPoses(results) {
    poses = results;
    classifyPose();
}

function classifyPose() {
    if (poses.length > 0) {
        // Get the current pose keypoints
        const keypoints = poses[0].pose.keypoints;

        // Create an input image from the video
        const inputImage = video.get();

        // Classify the input image using the Teachable Machine model
        classifier.classify(inputImage, gotResults);
    }
}

function gotResults(error, results) {
    if (error) {
        console.error(error);
        return;
    }

    // Get the predicted label from Teachable Machine
    label = results[0].label;
    // console.log('label: ' + label);

    // Continue classifying poses
    classifyPose();
}

function draw() {
    // Draw video feed
    image(video, 0, 0, width, height);

    // Draw keypoints
    if (poses.length > 0) {
        const keypoints = poses[0].pose.keypoints;
        for (let i = 0; i < keypoints.length; i++) {
            const keypoint = keypoints[i];
            if (keypoint.score > 0.2) {
                fill(255, 0, 0);
                noStroke();
                ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
            }
        }
    }

    // Draw label
    fill(255);
    textSize(32);
    textAlign(CENTER);
    text(label, width / 2, height - 20);


}
