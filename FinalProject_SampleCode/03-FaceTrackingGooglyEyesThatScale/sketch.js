// our video capture object
var capture;

// artwork for our googley eye
var eyeImage;

function preload() {
	// load in our googly eye graphic
	eyeImage = loadImage("googly_eye.png");
}

function setup() {
	// size our canvas
	createCanvas(320, 240);

	// create a video capture object
	capture = createCapture(VIDEO);
	capture.size(320, 240);

	// prevent the capture from being displayed (we will
	// choose to display it using the image() function in
	// our draw loop
	capture.hide();
  
	// tell the face tracker to start looking at our capture 
	// object to find a face in the incoming video stream
	startTrackerFromProcessing(capture);
}

function draw() {
	background(255);
	imageMode(CORNER);
	image(capture, 0, 0, 320, 240);
	
	// get face array
	var faceArray = getFaceArray();
	
	// do we see a face?
	if (faceArray != false)
	{
		// now draw it! the vertices in the face array describe features
		// of the face.  A full map of these vertices can be found here:
		// https://github.com/auduno/clmtrackr
		
		// each element of the faceArray contains two sub-elements - the x
		// position and the y position

		// compute the distance between the edges of an eye
		var eyeSize = dist(faceArray[23][0], faceArray[23][1], faceArray[25][0], faceArray[25][1]) * 2; 		
		
		// draw pupils using our newly computed eye size
		imageMode(CENTER);
		image(eyeImage, faceArray[27][0], faceArray[27][1], eyeSize, eyeSize);
		image(eyeImage, faceArray[32][0], faceArray[32][1], eyeSize, eyeSize);
	}
}