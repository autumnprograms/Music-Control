p5.disableFriendlyErrors = true;

let handpose;
let video;
let hands = [];

let img1;
let img2;
let img3;
let img4;
let img5;

let index = false;
let middle = false;
let ring = false;
let pinky = false;
let thumb = false;

let song1;
let song2;
let song3;
let song4;





async function setup() {
  createCanvas(640, 480);
  
  // Create webcam video
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Load handPose asynchronously
  ml5.handPose().then((model) => {
    handPose = model;
    handPose.detectStart(video, gotHands);

    loadImage(
      "RobloxScreenShot20260921_220422807.png",
      (loadedImg) => {
        img1 = loadedImg; // Assign image to global variable HERE
      })

    loadImage(
      "ac.jpg",
      (loadedImg) => {
        img2 = loadedImg; // Assign image to global variable HERE
      })
      loadImage(
      "Riley Kernaghan - Seasonal.jpg",
      (loadedImg) => {
        img3 = loadedImg; // Assign image to global variable HERE
      })
      loadImage(
      "IMG_1252.JPG",
      (loadedImg) => {
        img4 = loadedImg; // Assign image to global variable HERE
      })
      loadImage(
        "Screenshot 2026-09-23 191323.png",
        (loadedImg) => {
          img5 = loadedImg;
        })

      song1 = loadSound('music/mimis-delivery-service.wav')
      song2 = loadSound('music/tell-me-you-know.wav')
      song3 = loadSound('music/coffee.wav')
      song4 = loadSound('music/second-rate-town.wav')
    });
  }

function draw() {
  // Draw webcam video
  image(video, 0, 0, width, height);

  // Draw tracked keypoints
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];
      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, 10);
    }
  }
  if (img1 && index) {
    image(img1, 0, 0, width, height);
  }
  else if (img2 && middle) {
    image(img2, 0, 0, width, height);
  }
  else if (img3 && ring) {
    image(img3, 0, 0, width, height);
  }
  else if (img4 && pinky) {
    image(img4, 0, 0, width, height);
  }
  else if (img5 && thumb) {
    image(img5, 0, 0, width, height);
  }
}

function gotHands(results) {
  hands = results;

  if (hands.length > 0) {
    let hand = hands[0];

    // Ensure keypoints array is fully loaded
    if (hand.keypoints && hand.keypoints.length >= 21) {
      
      // 1. Index Finger (MCP: 5, Tip: 8)
      let indexMcpY = hand.keypoints[5].y;
      let indexTipY = hand.keypoints[8].y;
      index = (indexTipY < indexMcpY + 200 && indexTipY > indexMcpY - 25);

      // 2. Middle Finger (MCP: 9, Tip: 12)
      let middleMcpY = hand.keypoints[9].y;
      let middleTipY = hand.keypoints[12].y;
      middle = (middleTipY < middleMcpY + 200 && middleTipY > middleMcpY - 25);

      // 3. Ring Finger (MCP: 13, Tip: 16)
      let ringMcpY = hand.keypoints[13].y;
      let ringTipY = hand.keypoints[16].y;
      ring = (ringTipY < ringMcpY + 200 && ringTipY > ringMcpY - 25);

      // 4. Pinky Finger (MCP: 17, Tip: 20)
      let pinkyMcpY = hand.keypoints[17].y;
      let pinkyTipY = hand.keypoints[20].y;
      pinky = (pinkyTipY < pinkyMcpY + 200 && pinkyTipY > pinkyMcpY - 25);
      
      // 4. Pinky Finger (MCP: 17, Tip: 20)
      let thumbMcpx = hand.keypoints[2].x;
      let thumbTipx = hand.keypoints[4].x;
      thumb = (thumbTipx < thumbMcpx + 200 && thumbTipx > thumbMcpx - 25);

      // Optional console logs
      if (index) console.log("TRIGGERED INDEX!");
      if (middle) console.log("TRIGGERED MIDDLE!");
      if (ring) console.log("TRIGGERED RING!");
      if (pinky) console.log("TRIGGERED PINKY!");
      if (thumb) console.log("TRIGGERED THUMB!");
    }
  } else {
    // Reset flags if no hands are detected
    index = false;
    middle = false;
    ring = false;
    pinky = false;
    thumb = false;
  }
}