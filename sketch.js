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

//
var faces = [];
var currentFaces = [];

var soundOn;
var countdownOn;
var gameOn;

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
}

function setup() {
  world = new World('front', 640, 480); // 'front' or 'user' - sets camera preference

  noFill();
  stroke(255);
  strokeWeight(1);

  soundOn = false;
  gameOn = true;
  countdownOn = false;

  // randomize perlin noise landscape
  noiseDetail(24);

  animals.push(a1);
  animals.push(a2);
  animals.push(a3);
  animals.push(a4);
  targetAnimal = getRandom();

  // create our falling animal objects
  for (var i = 0; i < 25; i++) {
    fallingAnimals.push( new Animal(random(animals), random(20, 80)));
  }
}

function getRandom(){
  return random(animals);
}

function mouseClicked(){
  for(var i = 0; i < faces.length; i++){
    if(dist(mouseX, mouseY, faces[i].xPos, faces[i].yPos) < 60){
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
    counter = 8;
  }
}

function draw() {
  world.clearDrawingCanvas();

  // only track faces if the game is "on"
  if (gameOn == true) {
    noStroke();
    fill(25, 16, 8, 10); // Color filter over the world
    rect(0,0,width,height);

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
  if (counterInSeconds >= 0){
    text(counterInSeconds, 30, 30);
  } else {
    text("0", 30, 30);
  }

  // Display the target animal
  imageMode(CENTER);
  image(targetAnimal, 40, height-20, 40, 40);


  // did the user win?
  if (counterInSeconds == 0 && checkForWin() == true) {

    // draw our falling animals
    for (var i = 0; i < fallingAnimals.length; i++) {
      fallingAnimals[i].drawAndMove();
    }

    if (soundOn == false) {
      soundOn = true;
      gameOn = false;
      win.play();
    }
  }

  // did the user lose?
  else if (counterInSeconds == 0 && soundOn == false){
    soundOn = true;
    lose.play();
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



// hacked together code to make this work with p5 below - no need to change this
// unless you want to dig deeper into the system and make it behave differently
function World(facingMode, w, h) {
  this.w = w;
  this.h = h;

  // create video
  this.video = document.createElement('video');
  this.video.style.width = w+'px';
  this.video.style.height = h+'px';
  this.video.style.border = '5px solid red';
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
