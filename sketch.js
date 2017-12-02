var world;

// Timer variable, the user has 30 seconds (1800 frames) to play
var timer = 1800;

// List and variables of the animal heads
var animals = [];
var a1, a2, a3, a4;
var randomAnimal;

// Variables for sounds
var countdown;
var win;
var lose;

// 
var faces = [];
var currentFaces;

// Depending on how many faces are detected, create Face objects and add them to faces[]
function Face(){
  this.index;
  this.animal = animals[random(4)];
  this.xPos;
  this.yPos;
}

function preload(){
  a1 = loadImage("");
  a2 = loadImage("");
  a3 = loadImage("");
  a4 = loadImage("");
  win = loadSound();
  lose = loadSound();
  countdown = loadSound();
}

function setup() {
  world = new World('front', 640, 480); // 'front' or 'user' - sets camera preference

  noFill();
  stroke(255);
  strokeWeight(1);
  animals.push(a1);
  animals.push(a2);
  animals.push(a3);
  animals.push(a4);

  currentFaces = world.getRawFacePositions();
  for (var i = 0; i < currentFacePositions.length; i++) {
    faces.push(new Face());
  }
}

function getRandom(){
  return animals[random(4)];
}

var targetAnimal = getRandom();

if mouseClicked(){
  for(var i = 0; i < faces.length; i++){
    if(dist(mouseX, mouseY, faces[i].xPos, faces[i].yPos) < 5){
      face.animal = getRandom();
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

function draw() {
  world.clearDrawingCanvas();
  stroke(0,255,0);
  fill(25, 16, 8, 10); // Color filter over the world
  rect(0,0,width,height); 
  
  stroke(0);
  text(world.video.style.height, 25, 25);

  // Only change timer every second (every 60 frames)
  var nextTimer = timer--;
  if(nextTimer%60 == 0){
    timer == nextTimer;
  }

  fill(255);
  text(timer/60, 10, 10);
  
  // Display the target animal
  image(targetAnimal, 10, height-10, 30, 30);
  
  for (var i = 0; i < currentFaces.length; i++) {
    image(faces[i].animal, currentFaces[i].x, currentFaces[i].y, currentFaces[i].width, currentFaces[i].height);
  }

  if(timer > 0 && checkForWin() == true){
      win.play();
      // write separate function for image slicing and do it here
  } else if (timer == 0){
    lose.play();
  }

  if(timer == 10){
    countdown.play();
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
    _this.rawFacePositions = [];
  });
  
  this.FaceRecord = function(x,y,w,h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.age = 0;
    this.cache = [];

    this.resetAge = function() {
      this.age = 0;
    }

    this.getDist = function(e) {
      return dist(this.x, this.y, e.x, e.y);
    }

    this.refreshPosition = function(e) {
      this.cache.push([e.x, e.y, e.width, e.height]);
      if (this.cache.length > 5) {
        this.cache.splice(0,1);
      }
      var xAvg = 0;
      var yAvg = 0;
      var wAvg = 0;
      var hAvg = 0;
      for (var i = 0; i < this.cache.length; i++) {
        xAvg += this.cache[i][0];
        yAvg += this.cache[i][1];
        wAvg += this.cache[i][2];
        hAvg += this.cache[i][3];
      }
      this.x = xAvg/this.cache.length;
      this.y = yAvg/this.cache.length;
      this.width = wAvg/this.cache.length;
      this.height = hAvg/this.cache.length;
      this.age = 0;
    }

    this.ageUp = function() {
      this.age++;
      if (this.age > 10) {
        return true;
      }
      return false;
    }
  }

  // public methods for getting face positions
  this.getFacePositions = function() {
    var returnArray = [];
    for (var i = 0; i < this.facePositions.length; i++) {
      returnArray.push( this.facePositions[i] );
    }
    return returnArray;
  }
  this.getRawFacePositions = function() {
    var returnArray = [];
    for (var i = 0; i < this.rawFacePositions.length; i++) {
      returnArray.push( this.rawFacePositions[i] );
    }
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
