let handpose;
let video;
let hands = [];

let audioStarted = false;
let audioPlaying = false;
let actionTaken = false;
let currentVol = 1;
let ispaused = false;


let img1, img2, img3, img4, img5;
let index = false, middle = false, ring = false, pinky = false, thumb = false;
let song1, song2, song3, song4;

let isLoading = false;

function setup() {
  createCanvas(640, 480);

  // Create webcam video
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  songIndex = 3;
}

function draw() {
  // 1. Prompt user to interact if audio hasn't started yet
  if (!audioStarted) {
    background(30);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Click anywhere on the screen\nto enable Audio & Start", width / 2, height / 2);
    return;
  }

  // 2. Display a loading message while assets & ml5 load
  if (isLoading) {
    background(30);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("Loading model & assets...", width / 2, height / 2);
    return;
  }

  // 3. Main sketch execution
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

    if (!audioPlaying) {
      songs[songIndex].start();
      audioPlaying = true;
    }

  }

  if (img1 && index) {
    image(img1, 0, 0, width, height);
  } else if (img2 && middle) {
    image(img2, 0, 0, width, height);
  } else if (img3 && ring) {
    image(img3, 0, 0, width, height);
  } else if (img4 && pinky) {
    image(img4, 0, 0, width, height);
  } else if (img5 && thumb) {
    image(img5, 0, 0, width, height);
  }
}

// User interaction handler to unblock browser audio restrictions
function mousePressed() {
  if (!audioStarted) {
    // Unlock Web Audio context
    userStartAudio();
    audioStarted = true;
    isLoading = true;

    // Load assets and ml5 after interaction
    startApp();
  }
}

async function startApp() {
  try {
    const model = await ml5.handPose();
    handPose = model;
    handPose.detectStart(video, gotHands);

    // Load Images
    img1 = await loadImagePromise("RobloxScreenShot20260921_220422807.png");
    img2 = await loadImagePromise("ac.jpg");
    img3 = await loadImagePromise("Riley Kernaghan - Seasonal.jpg");
    img4 = await loadImagePromise("IMG_1252.JPG");
    img5 = await loadImagePromise("Screenshot 2026-09-23 191323.png");

    // Load Audio
    song1 = await loadSound("mimis-delivery-service.wav");
    song2 = await loadSound("tell-me-you-know.wav");
    song3 = await loadSound("coffee.wav");
    song4 = await loadSound("second-rate-town.wav");
    songs = [song1, song2, song3, song4];

    console.log("All assets & model loaded successfully!");
    isLoading = false;
  } catch (err) {
    console.error("Failed to load assets or model:", err);
  }
}

// Helper wrapper functions to use async/await with p5 loaders
function loadImagePromise(path) {
  return new Promise((resolve, reject) => {
    loadImage(path, resolve, reject);
  });
}

function loadSoundPromise(path) {
  return new Promise((resolve, reject) => {
    loadSound(path, resolve, reject);
  });
}

function gotHands(results) {
  hands = results;

  if (hands.length > 0) {
    let hand = hands[0];

    if (hand.keypoints && hand.keypoints.length >= 21) {
      // 1. Index Finger
      let indexMcpY = hand.keypoints[5].y;
      let indexTipY = hand.keypoints[8].y;
      index = indexTipY < indexMcpY + 200 && indexTipY > indexMcpY - 25;

      // 2. Middle Finger
      let middleMcpY = hand.keypoints[9].y;
      let middleTipY = hand.keypoints[12].y;
      middle = middleTipY < middleMcpY + 200 && middleTipY > middleMcpY - 25;

      // 3. Ring Finger
      let ringMcpY = hand.keypoints[13].y;
      let ringTipY = hand.keypoints[16].y;
      ring = ringTipY < ringMcpY + 200 && ringTipY > ringMcpY - 25;

      // 4. Pinky Finger
      let pinkyMcpY = hand.keypoints[17].y;
      let pinkyTipY = hand.keypoints[20].y;
      pinky = pinkyTipY < pinkyMcpY + 200 && pinkyTipY > pinkyMcpY - 25;

      // 5. Thumb
      let thumbMcpx = hand.keypoints[2].x;
      let thumbTipx = hand.keypoints[4].x;
      thumb = thumbTipx < thumbMcpx + 200 && thumbTipx > thumbMcpx - 25;
    }
  } else {
    index = false;
    middle = false;
    ring = false;
    pinky = false;
    thumb = false;
    actionTaken = false;
  }
  DoGestures()
}

function DoGestures() {

  // Check if ALL gesture fingers are released/lowered
  if (!thumb && !index && !middle && !ring && !pinky) {
    actionTaken = false; // Unlocks actionTaken while hand is still on screen!
    return;
  }

  if (thumb)
  {
    playToggle()
  }

  if (index)
  {
    next()
  }

  if (middle)
  {
    previous()
  }

  if (ring)
  {
    volUp()
  }
  if (pinky)
  {
    volDown()
  }
}


function playToggle() {
  if (!actionTaken && songs[songIndex].isPlaying()) {
    ispaused = true;
    songs[songIndex].pause();
    console.log("song paused");
    actionTaken = true;
  }
  else if (!actionTaken && !songs[songIndex].isPlaying()) {
    ispaused = false;
    songs[songIndex].play();
    console.log("song playing");
    actionTaken = true;
    ispaused = false;
  }
}

function next() {
  if (!actionTaken && songIndex != 3) {
    
    songs[songIndex].stop();
    songIndex = songIndex + 1;
    songs[songIndex].start();
    console.log("next song:", songIndex);
    actionTaken = true;

  }
    else if (!actionTaken && songIndex == 3) {
      songs[songIndex].stop();
      songIndex = 0;
      songs[songIndex].start();
      console.log("next song:", songIndex);
      actionTaken = true;
  }
}
function previous() {
  if (!actionTaken && songIndex != 0) {
    
    songs[songIndex].stop();
    songIndex = songIndex - 1;
    songs[songIndex].start();
    console.log("next song:", songIndex);
    actionTaken = true;

  }
    else if (!actionTaken && songIndex == 0) {
      songs[songIndex].stop();
      songIndex = 3;
      songs[songIndex].start();
      console.log("next song:", songIndex);
      actionTaken = true;
  }
}
function volUp() {
if (!actionTaken && songs[songIndex].isPlaying() && currentVol < 1) {
    currentVol = currentVol + 0.1;
    console.log("Volume Up");
    songs[songIndex].amp(currentVol);
    actionTaken = true;
  }
}
function volDown() {
  if (!actionTaken && songs[songIndex].isPlaying() && currentVol > 0) {
    currentVol = currentVol - 0.1;
    console.log("Volume Up");
    songs[songIndex].amp(currentVol);
    actionTaken = true;
  }
}