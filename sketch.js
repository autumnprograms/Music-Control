let handPose;
let video;
let hands = [];

function preload()
{
	cinema = loadImage("absolute crushed.jpg");
}

async function setup() {
  createCanvas(640, 480);
  
  // Load the handPose model asynchronously
  handPose = await ml5.handPose();
  
  // Create the webcam video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  // start detecting hands from the webcam video
  handPose.detectStart(video, gotHands);
}

function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height);

  // Draw all the tracked hand points
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];
      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, 10);
    }
  }
}

// Callback function for when handPose outputs data
function gotHands(results) {
  // save the output to the hands variable
  hands = results;
  
  if (hands.length > 0) {
	  let finger_one = hands[0].index_finger_mcp.y - hands[0].index_finger_tip.y;
		
	  // Check if either wrist x position <= 400
	  if (finger_one < hands[0].index_finger_mcp.y + 100 && finger_one > hands[0].index_finger_mcp.y - 100) {
			image(cinema, 0, 0,windowWidth,windowHeight);
		}
  }
}
