// our video capture object
var capture;
var counter = 1800;

// List and variables of the animal heads
var animals = [];
var a1, a2, a3, a4;
var randomAnimal;
var targetAnimal;

// Variables for sounds
var countdown;
var win;
var lose;

// 
var faces = [];

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
	// size our canvas
	createCanvas(320, 240);

	// create a video capture object
	capture = createCapture(VIDEO);
	// Keep the resolution low!
	capture.size(320, 240);

	// prevent the capture from being displayed (we will
	// choose to display it using the image() function in
	// our draw loop
	capture.hide();

	// tell the face tracker to start looking at our capture
	// object to find a face in the incoming video stream
	startTrackerFromProcessing(capture);
	animals.push(a1);
	animals.push(a2);
	animals.push(a3);
	animals.push(a4);
}

function getRandom(){
	return animals[random(4)];
}

if mouseClicked(){
	for(var i = 0; i < faces.length; i++){
		if(dist(mouseX, mouseY, faces[i].xPos, faces[i].yPos) < 5){
			face.animal = getRandom();
		}
	}
}

function draw() {
	background(255);
	imageMode(CORNER);
	image(capture, 0, 0, 320, 240);

	counter-=1; // Decrease counter by 60 per frame --> -1 second
	fill(255);
	text(counter, 10, 10);
	
	image(targetAnimal);

	// get face array
	var faceArray = getFaceArray();

	// do we see a face?
	if (faceArray != false)
	{
		// Diameter of the face between forehead and chin
		var d = dist(faceArray[33][0], faceArray[33][1], faceArray[7][0], faceArray[7][1]);

		// Draw the animal with origin being the tip of the nose
		image(displayedAnimal, faceArray[37][0], faceArray[37][1], d*2, d*2);
	}
}
