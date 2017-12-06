var world;

// store counter numbers
var counter = 8;
var counterInSeconds = 30;

// List and variables of the animal heads
var animals = [];
var a1, a2, a3, a4;
var randomAnimal, targetAnimal;

// wanderer array
var theWanderers = [];

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
  a1 = loadImage("images/elephant.png");
  a2 = loadImage("images/fox.png");
  a3 = loadImage("images/gorilla.png");
  a4 = loadImage("images/raccoon.png");
  //win = loadSound();
  //lose = loadSound();
  //countdown = loadSound("sounds/countdown.ogg");
}

function setup() {
  world = new World('front', 640, 480); // 'front' or 'user' - sets camera preference

  // randomize perlin noise landscape
  noiseDetail(24);

  // slice up our image into a series of smaller strips
  // we will send those strips into a bunch of 'Wanderer' objects
  // and have them move around the world randomly
  for (var i = 0; i < animals.length ; i++) {
    for (var x = 0; x < a1.width; x += 10) {
      for (var y = 0; y < a1.height; y += 10) {
        // cut out a strip
        var strip = new p5.Image(10, 10);
        strip.copy("a" + i, x, y, 10, 10, 0, 0, 10, 10);

        // construct a new wanderer
        var tempWanderer = new Wanderer(x, y, strip);

        // add the wanderer to our array
        theWanderers.push(tempWanderer);
      }
    }
  }
  noFill();
  stroke(255);
  strokeWeight(1);
  animals.push(a1);
  animals.push(a2);
  animals.push(a3);
  animals.push(a4);
  targetAnimal = getRandom();
  currentFaces = world.getRawFacePositions();
  for (var i = 0; i < currentFaces.length; i++) {
    faces.push(new Face());
  }
}

function getRandom(){
  return random(animals);
}


function mouseClicked(){
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
  noStroke();
  fill(25, 16, 8, 10); // Color filter over the world
  rect(0,0,width,height);

  stroke(0);


  fill(255);
  text(counterInSeconds, 10, 10);

  // Display the target animal
  imageMode(CENTER);
  image(targetAnimal, 40, height-20, 40, 40);

  for (var i = 0; i < currentFaces.length; i++) {
    image(faces[i].animal, currentFaces[i].x, currentFaces[i].y, currentFaces[i].width, currentFaces[i].height);
  }

  countdown();


  if(counterInSeconds > 0 && checkForWin() == true){
      //win.play();
      // write separate function for image slicing and do it here
      // move the origin point of the screen so we can center everything
      push();
      translate(150, 100);

      // display all wanderers
      for (var i = 0; i < theWanderers.length; i++) {
        theWanderers[i].displayAndMove();
      }

      // restore the origin point
      pop();

  } else if (counterInSeconds  == 0){
    //lose.play();
  }

  if(counterInSeconds == 10){
    //countdown.play();
  }

  console.log(currentFaces);
}

// countdown function
function countdown() {
  counter -- ;
  if (counter == 0) {
    counterInSeconds -= 1;
    counter = 8;
  }
}

function Wanderer(x, y, myImage) {
  // store our initial position
  this.x = x;
  this.y = y;

  // also store our "desired" position
  this.desiredX = x;
  this.desiredY = y;

  // store our image
  this.myImage = myImage;

  // perlin noise offset
  this.xOffset = random(1000);
  this.yOffset = random(2000, 3000);

  // display and move function
  this.displayAndMove = function() {
    // if the mouse is not pressed we should wander using perlin noise
    if (!mouseIsPressed) {
      this.x += map(noise(this.xOffset), 0, 1, -1, 1);
      this.y += map(noise(this.yOffset), 0, 1, -1, 1);
      this.xOffset += 0.01;
      this.yOffset += 0.01;
    }
    // if the mouse isn't pressed we should try and move back to our desired spot
    else {
      // compute x & y distance
      var xDist = this.desiredX - this.x;
      var yDist = this.desiredY - this.y;

      // move a little bit
      this.x += xDist * 0.05;
      this.y += yDist * 0.05;
    }

    // display ourselves
    image(this.myImage, this.x, this.y);
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
