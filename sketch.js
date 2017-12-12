var world;

// store counter numbers
var counter = 8;
var counterInSeconds = 30;

// List and variables of the animal heads
var animals = [];
var fallingAnimals = [];
var a1, a2, a3, a4;
var randomAnimal, targetAnimal;

// Variables for sounds
var countdown;
var win;
var lose;

// face arrays
var faces = [];
var currentFaces = [];

// game controls
var soundOn;
var countdownOn;
var gameOn;

// an array to hold our noise walkers
var walkerArray;

// Depending on how many faces are detected, create Face objects and add them to faces[]
function Face(x, y){
  this.index;
  this.animal = random(animals);
  this.xPos = x;
  this.yPos = y;
}

function preload(){
  a1 = loadImage("images/elephant.png");
  a2 = loadImage("images/fox.png");
  a3 = loadImage("images/gorilla.png");
  a4 = loadImage("images/raccoon.png");
  win = loadSound("sounds/win.mp3");
  lose = loadSound("sounds/lose.mp3");
  countdown = loadSound("sounds/countdown.ogg");
  song = loadSound("sounds/song.mp3");
}

function setup() {
  world = new World('front', 640, 480); // 'front' or 'user' - sets camera preference
  createCanvas(655, 495);
  song.play();

  textFont("Comic Sans MS");
  noFill();
  stroke(255);
  strokeWeight(1);

  soundOn = false;
  gameOn = true;
  countdownOn = false;

  // randomize perlin noise landscape
  noiseDetail(24);

  // create our walker array
  walkerArray = [];

  // loop 100 times
  for (var i = 0; i < 100; i++) {
    // create a NoiseWalker
    var tempWalker = new NoiseWalker( random(width), random(height) );
    // put the walker into the array
    walkerArray.push( tempWalker );
  }

  animals.push(a1);
  animals.push(a2);
  animals.push(a3);
  animals.push(a4);
  targetAnimal = getRandom();

  // create our falling animal objects
  for (var i = 0; i < 20; i++) {
    fallingAnimals.push( new Animal(random(animals), random(50, 100)));
  }
}

function getRandom(){
  return random(animals);
}

function mouseClicked(){
  imageMode(CENTER);
  for(var i = 0; i < faces.length; i++){
    if (checkCollision(faces[i].xPos, faces[i].yPos, faces[i].width, faces[i].height, mouseX, mouseY, mouseX.width, mouseY.height) ) {
      faces[i].animal = getRandom();
    }
  }
}


function checkForWin(){
  for(var i = 0; i < faces.length; i++){
    if(faces[i].animal != targetAnimal){
      return false;
    }
  }
  return true;
}

// countdown function
function decreaseTime() {
  counter -- ;
  if (counter == 0) {
    counterInSeconds -= 1;
    counter = 5;
  }
}


function draw() {
  world.clearDrawingCanvas();

  // only track faces if the game is "on"
  if (gameOn == true) {
    noStroke();
    fill(0, 0, 255, 70); // Color filter over the world
    rect(10,10,width, height);

    // visit each walker
    for (var i = 0; i < walkerArray.length; i++) {
      // ask the walker to move and display
      walkerArray[i].move();
      walkerArray[i].display();
    }

    currentFaces = world.getRawFacePositions();
    while (faces.length < currentFaces.length){
    	for (var i = 0; i < currentFaces.length; i++) {
      faces.push(new Face(currentFaces[i].x, currentFaces[i].y));
    	}
    }

    // display animal face on every person's face
    imageMode(CORNER);
    for (var i = 0; i < currentFaces.length; i++) {
      image(faces[i].animal, currentFaces[i].x, currentFaces[i].y, currentFaces[i].width + 50, currentFaces[i].height + 50);
    }

    decreaseTime();
  }

  // show timer
  fill(255);
  textSize(40);
  if (counterInSeconds >= 0){
    text(counterInSeconds, 30, 60);
  } else {
    text("0", 30, 60);
  }

  // Display the target animal
  imageMode(CENTER);
  image(targetAnimal, 50, height-40, 50, 50);


  // did the user win?
  if (counterInSeconds < 29 && checkForWin() == true) {
    fill(0);
    textSize(75);
    text("YOU WIN!", width/4.5, height/1.8);

    // draw our falling animals
    for (var i = 0; i < fallingAnimals.length; i++) {
      fallingAnimals[i].drawAndMove();
    }

    if (soundOn == false) {
      soundOn = true;
      gameOn = false;
      win.play();
      song.stop();
    }
  }

  // did the user lose?
  else if (counterInSeconds <= 0){
    fill(255, 0, 0, 95); // Color filter over the world
    rect(10, 10, width, height);
    fill(0);
    textSize(75);
    text("YOU LOSE.", width/4.5, height/1.8);

    if (soundOn == false) {
      song.stop();
      soundOn = true;
      gameOn = false;
      lose.play();
    }
  }

  // start countdown
  if (counterInSeconds == 10 && countdownOn == false){
    countdownOn = true;
    countdown.play();
  }

}

// falling animal object
function Animal(randomAnimal, size) {
  // pick a random spot to fall from
  this.x = random(width);
  this.y = random(-350, 0);

  // perlin noise offest
  this.noiseOffset = random(1000);

  // draw and move
  this.drawAndMove = function() {
    this.y += 10;
    this.x += map(noise(this.noiseOffset), 0, 1, -1, 1);
    this.noiseOffset += 0.01;

    imageMode(CENTER);
    image(randomAnimal, this.x, this.y, size, size);
  }
}

// our NoiseWalker class
function NoiseWalker(x, y) {
  // store our position
  this.x = x;
  this.y = y;

  // create a "noise offset" to keep track of our position in Perlin Noise space
  this.xNoiseOffset = random(0,1000);
  this.yNoiseOffset = random(1000,2000);

  // display mechanics
  this.display = function() {
    fill(255, 255, 255, 50);
    ellipse(this.x, this.y, 15, 15);
  }

  // movement mechanics
  this.move = function() {
    // compute how much we should move
    var xMovement = map( noise(this.xNoiseOffset), 0, 1, -1, 1 );
    var yMovement = map( noise(this.yNoiseOffset), 0, 1, -1, 1 );

    // update our position
    this.x += xMovement;
    this.y += yMovement;

    // update our noise offset values
    this.xNoiseOffset += 0.01;
    this.yNoiseOffset += 0.01;
  }
}



// hacked together code to make this work with p5 below - no need to change this
// unless you want to dig deeper into the system and make it behave differently
function World(facingMode, w, h) {
  this.w = w;
  this.h = h;

  // create video
  this.video = document.createElement('video');
  this.video.style.width = w+'px';
  this.video.style.height = h+'px';
  this.video.style.border = '5px solid black';
  this.video.setAttribute('id', 'video');
  this.video.setAttribute('autoplay', '');
  this.video.setAttribute('muted', '');
  this.video.setAttribute('playsinline', '');
  this.video.setAttribute('position', 'absolute');
  this.video.setAttribute('top', '0px');
  this.video.setAttribute('left', '0px');
  this.facingMode = facingMode;
  var constraints = {
    audio: false,
    video: {
     facingMode: this.facingMode
    }
  }
  _this = this;
  navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
    _this.video.srcObject = stream;
  });
  document.body.appendChild(this.video);

  // set up face tracker
  this.tracker = new tracking.ObjectTracker('face');
  this.tracker.setInitialScale(4);
  this.tracker.setStepSize(2);
  this.tracker.setEdgesDensity(0.1);
  tracking.track('#video', this.tracker, { camera: false });

  // set up face position array
  this.facePositions = [];
  this.rawFacePositions = [];

  this.tracker.on('track', function(event) {
    _this.rawFacePositions = event.data;
  });

  this.getRawFacePositions = function() {
    var returnArray = [];
    for (var i = 0; i < this.rawFacePositions.length; i++) {
      returnArray.push( this.rawFacePositions[i] );
    }
    console.log(returnArray);
    return returnArray;
  }

  // create p5 canvas
  this.canvas = createCanvas(w, h);
  this.canvas.style('position', 'absolute');
  this.canvas.style('top', '0px');
  this.canvas.style('left', '0px');
  this.canvas.style('z-index', '101');
  this.canvasFactor = 1.0;
  this.canvasWidth = 800;
  this.canvasHeight = 600;
  this.canvas.style('margin-left', '0px');
  this.canvas.style('margin-top', '0px');
  this.canvasMarginLeft = 0;
  this.canvasMarginTop = 0;

  this.clearDrawingCanvas = function() {
    this.canvas.drawingContext.clearRect(0,0,800,600);
  }
}

// generic function to compute whether two rectangles interset with one another
function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
  // rectangle 1 is to the left of rectangle #2
  if (x1+w1 < x2) {
    console.log("LEFT");
    return false;
  }
  // rectangle 1 is to the right of rectangle #2
  if (x1 > x2+w2) {
    console.log("RIGHT");
    return false;
  }
  // rectangle 1 is above rectangle #2
  if (y1+h1 < y2) {
    console.log("ABOVE");
    return false;
  }
  // rectangle 1 is below rectangle #2
  if (y1 > y2+h2) {
    console.log("BELOW");
    return false;
  }

  // if we got here we failed all of the tests above - the rectangles
  // must be intersecting
  return true;
}
