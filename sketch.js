let handpose;
let video;
let hands = [];

let audioStarted = false;
let audioPlaying = false;
let actionTaken = false;
let currentVol = 1;
let ispaused = false;

let album1;
let album2;
let album3;
let album4;



let img1, img2, img3, img4, img5;
let index = false, middle = false, ring = false, pinky = false, thumb = false;
let song1, song2, song3, song4;

let isLoading = false;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Create webcam video
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  songIndex = 3;
}

// Array matching your 4 loaded songs
const songTitles = [
  "Mimi's Delivery Service",
  "Tell Me You Know",
  "Coffee",
  "Second-Rate Town"
];

function drawUI(currentSongTitle, albumArtArray) {
  push();

  // 1. Flat Bluish-Gray Background
  background(45, 52, 64);

  // 2. Top Bar - 5 Circular Gesture Placeholders
  const totalCircles = 5;
  // Cap circle diameter relative to canvas width, maxing out at 60px
  const circleDiameter = min(width * 0.1, 60);
  const spacing = width / (totalCircles + 1);
  const topY = min(height * 0.1, 50);

  const overlayImages = [img5, img1, img2, img3, img4];
  const gestureLabels = ["pause", "vol up", "vol down", "prev", "next"];

  // Standard uniform border for all circles
  stroke(76, 86, 106);
  strokeWeight(2);

  for (let i = 0; i < totalCircles; i++) {
    let xPos = spacing * (i + 1);

    fill(59, 66, 82);
    circle(xPos, topY, circleDiameter);

    if (overlayImages[i]) {
      imageMode(CENTER);
      image(overlayImages[i], xPos, topY, circleDiameter - 6, circleDiameter - 6);
      imageMode(CORNER);
    }

    // Gesture Label directly under the circle
    noStroke();
    fill(216, 222, 233); // Soft white/gray text
    textAlign(CENTER, TOP);
    textSize(11);
    textStyle(NORMAL);
    text(gestureLabels[i], xPos, topY + circleDiameter / 2 + 5);
  }

  // 3. Lower Third - Player Card (Text Info)
  // Cap card width to max out at 500px on ultra-wide screens
  const cardWidth = min(width - 80, 500);
  const cardHeight = 80;
  const cardX = (width - cardWidth) / 2; // Keep card centered on any screen size
  const cardY = height - cardHeight - 25;
  const cardCenterX = width / 2;

  // Outer Card Box
  noStroke();
  fill(30, 34, 42, 220); // Semi-transparent dark slate
  rect(cardX, cardY, cardWidth, cardHeight, 12);

  // Dynamic Centered Song Title
  fill(236, 239, 244);
  textAlign(CENTER, CENTER);
  textSize(20);
  textStyle(BOLD);
  text(currentSongTitle, cardCenterX, cardY + 28);

  // Static Centered Artist Name
  fill(143, 188, 187);
  textSize(14);
  textStyle(NORMAL);
  text("Good Kid", cardCenterX, cardY + 54);

  // 4. Centered Album Artwork (Capped for large screens)
  // Calculate available vertical space between top circles/labels and bottom card
  const labelOffsetY = 20; // Accounts for text height below circles
  const availableHeight = cardY - (topY + circleDiameter / 2 + labelOffsetY) - 20;
  
  // Scale based on card width, but cap size based on max height constraints (max 280px)
  let albumSize = cardWidth - 40;
  albumSize = min(albumSize, availableHeight, 280); 

  const albumX = (width - albumSize) / 2; // Centered horizontally
  const albumY = cardY - albumSize - 15;  // Positioned cleanly above info bar

  // Background frame / placeholder box
  fill(30, 34, 42, 180);
  rect(albumX - 4, albumY - 4, albumSize + 8, albumSize + 8, 14);

  fill(59, 66, 82);
  rect(albumX, albumY, albumSize, albumSize, 10);

  // Render current song album artwork
  let currentAlbumArt = albumArtArray ? albumArtArray[songIndex] : null;
  if (currentAlbumArt) {
    image(currentAlbumArt, albumX, albumY, albumSize, albumSize);
  }

  pop();
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

  // 3. Main sketch execution.
  let currentTitle = songTitles[songIndex] || "Unknown Song";
  
  // Render UI
  drawUI(currentTitle, albumCovers);
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
    img1 = await loadImagePromise("hand1.png");
    img2 = await loadImagePromise("hand2.png");
    img3 = await loadImagePromise("hand3.png");
    img4 = await loadImagePromise("hand4.png");
    img5 = await loadImagePromise("hand5.png");

    album1 = await loadImagePromise("ALBUM1.jpg");
    album2 = await loadImagePromise("ALBUM2.jpg");
    album3 = await loadImagePromise("ALBUM3.jpg");
    album4 = await loadImagePromise("ALBUM4.jpg");
    albumCovers = [album2, album4, album3, album1];

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
      songs[0].start();
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