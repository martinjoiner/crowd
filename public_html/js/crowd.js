
var portWidthAtLastSet = 0;
var portHeightAtLastSet = 0;

viewportWidth = 800;
viewportHeight = 600;

var pixelwidth = 20;
var pixelcount = 0;
var required = 0;



/**
 * Debug and development function for creating a marker
 *
 * @param {integer} x
 * @param {integer} y
 *
 */
function dropMarker(x,y,textContent){

	var div, text;
	div = document.createElement('div');
	text = document.createTextNode(textContent);

	div.style.width = "20px";
	div.style.height = "10px";
	div.style.cssFloat = "left";
	div.style.color = "#000000";
	div.style.backgroundColor = "#FFFF00";
	div.style.border = "1px solid #888888";
	div.style.position = "absolute";
	div.style.fontFamily = "arial";
	div.style.fontSize = "9px";
	div.style.borderRadius = "2px";
	
	div.appendChild(text);
	
	div.style.left = x+"px";
	div.style.top = y+"px";
	
	var wrapperdiv = document.getElementById('crowd');
	if(wrapperdiv != null){
		wrapperdiv.appendChild(div);
	}
}





/* ------------------------------------------------------- Class Definitions ------------------------------------------------------------- */
/* --------------------------------------------------------------------------------------------------------------------------------------- */


/**
 * Crowd class: A crowd has many humans
 */
function Crowd( elemCrowdId ){
	this.humans = [];
	this.elemCrowd = document.getElementById( elemCrowdId );
}


/**
 * Method on Crowd Class
 */
Crowd.prototype.addHuman = function(x, y){
	this.humans.push( new Human( this.elemCrowd, x, y ) );
};


/**
 * Method on Crowd Class
 *
 * @return {integer} Number of humans in the crowd
 */
Crowd.prototype.countHumans = function(){
	return this.humans.length;
};


/**
 * Method on Crowd class: Like the auto-increment function on databases this returns the next available ID 
 * Note: HTML IDs must not begin with a number so the letter 'h' is prepended
 *
 * @return {integer} 
 */
Crowd.prototype.assignMeAnID = function(){
	var newID = this.countHumans() + 1;
	return 'h' + String(newID);
};


/**
 * Method on Crowd class: Searches crowd for human with matching ID
 *
 * @param {string} searchID 
 *
 * @return {Human} object of class Human
 */
Crowd.prototype.getHumanById = function( searchID ){
	for( var i = 0, iLimit = this.humans.length; i < iLimit; i++ ){
		if( this.humans[i].id === searchID ){
			return this.humans[i];
		}
	}
}





/**	
 * DestinationMarker (for debugging, visualises where a human is heading towards)
 *
 * @param {object} parentObj
 */
function DestinationMarker(parentObj){

	var div, text;
	div = document.createElement('div');
	text = document.createTextNode(parentObj.id);
	
	div.style.width = "10px";
	div.style.height = "10px";
	div.style.cssFloat = "left";
	div.style.color = "#FFFFFF";
	div.style.backgroundColor = parentObj.style.backgroundColor;
	div.style.border = "1px solid #888888";
	div.style.position = "absolute";
	div.style.fontFamily = "arial";
	div.style.fontSize = "10px";
	div.style.borderRadius = "5px";
	div.id = parentObj.id+"marker";
	
	div.appendChild(text);
	
	div.style.left = parentObj.destination.x + "px";
	div.style.top = parentObj.destination.y + "px";
	
	
	var wrapperdiv = document.getElementById('crowd');
	if(wrapperdiv != null)
		wrapperdiv.appendChild(div);
	
}





/**
 * Human class
 *
 * @param {object} The HTML element this human must append their marker to 
 * @param {integer} x the initial horizontal position 
 * @param {integer} y the initial vertical position 
 */
function Human( elemCrowd, x, y ){

	// Get an ID from the crowd
	this.id = crowd.assignMeAnID(); 
	
	// History is an array of the last 8 locations
	this.history = [];
	this.historyPointer = 0;
	
	// Personality Traits, some humans are bit fatter, some move a litle faster
	this.radius = random(15, 85);
	this.speed = random(8, 13); 

	// Boolean 
	this.isWalking = false;
	
	// p is the DOM element that represents it
	this.p = document.createElement('div');
	this.p.id = this.id;
	this.p.parent = this;
	this.p.setAttribute("class", "human");
	this.p.style.width = String(this.radius*2) + "px";
	this.p.style.height = String(this.radius*2) + "px";
	this.p.style.cursor = '-webkit-grab';
	this.p.style.backgroundColor = randomHex();
	this.p.style.background = randomLinearGradStyle();

	// Attach the marker to the crowd element in the DOM
	elemCrowd.appendChild(this.p);
	
	if( typeof x === 'undefined' ){
		// Plonk it in a random place
		x = random(this.radius, viewportWidth - this.radius);
	} 
	
	if( typeof y === 'undefined' ){
		// Plonk it in a random place
		y = random(this.radius, viewportHeight - this.radius); 
	} 
		
	this.x = x;
	this.y = y;

	// Destination is the point the Human is moving towards
	this.destination = new Point(x, y);

	// Boolean to define if it is following the mouse cursor (being dragged)
	this.isTrackingMouse = false;

	this.p.addEventListener("mousemove", function(e){ 
		this.parent.trackMouse();
	}, true);

	this.p.addEventListener("mousedown", function(e){ 
	 	this.parent.isTrackingMouse = true; 		// Referenced in the if statement of the mousemove listener
	 	this.style.cursor = '-webkit-grabbing';
	 	this.style.zIndex = 1000;		
	 }, false);

	this.p.addEventListener("mouseup", function(e){ 
   		this.parent.isTrackingMouse = false; 		// Referenced in the if statement of the mousemove listener
   		this.style.cursor = '-webkit-grab';
   		this.style.zIndex = null;
	}, false);
	
	// When clicked, instruct the crowd to birth another human in my location
	this.p.addEventListener('dblclick', function(){ 
		crowd.addHuman(this.parent.x,this.parent.y);
	}, false);
	
}



/**
 * Method on Human class: 
 *
 */
Human.prototype.updateMarkerPosition = function(){

	this.p.style.transform = 'translate(' + String(this.x - this.radius) + 'px,' + String(this.y - this.radius) + 'px)';
}



/**
 * Method on Human class: 
 *
 */
Human.prototype.trackMouse = function(){  

	if(this.isTrackingMouse){

		this.x = this.destination.x = Math.round(tempX);
		this.y = this.destination.y = Math.round(tempY);

		this.updateMarkerPosition();
	}
}



// Should we make the element marker separate to the human object?
HumanMarker = function(){

}



/**
 * Method on Human class
 */
Human.prototype.recordHistory = function(){
	this.history[this.historyPointer] = String(this.x) + "," + String(this.y); // x,y values stored as string
	this.historyPointer++;
	if(this.historyPointer > 8){
		this.historyPointer = 0;
	}
}



/**
 * Method on Human class: Every object has a destination position and an actual position
 * this function moves the object toward it's destination one little increment at a time
 */
Human.prototype.progressToDestination = function(){

	var xDifference = this.destination.x - this.x;
	var fractionOfXDiff = Math.round(xDifference / this.speed);
	
	var yDifference = this.destination.y - this.y;
	var fractionOfYDiff = Math.round(yDifference / this.speed);
	
	this.x = this.x + fractionOfXDiff;
	this.y = this.y + fractionOfYDiff;
	
	this.updateMarkerPosition();
	
	if( this.x == this.destination.x && this.y == this.destination.y ){
		this.isWalking = false;
	} else {
		this.isWalking = true;
	}

	this.recordHistory();
}




/**
 * Method on Human class: Seek a better position to stand
 *
 */
Human.prototype.shuffle = function(){

	if( this.isTrackingMouse ){
		return;
	}

	// Ask how close my nearest neighbour is and at what angle they are
	var nNeighbour = assessPosition(this.id, new Point( this.x, this.y) );
	
	// Is there a place within a few steps in the opposite direction that is at least 10% less claustrophibic?
	this.destination = surveyPaths(this.id, this.destination.x, this.destination.y, nNeighbour.distance);

	/*
	this.p.innerHTML = "ID: " + this.id + 
		"<br>Nearest ID: " + nNeighbour.id + 
		"<br>Distance: " + nNeighbour.distance + 
		"<br>Current: {" + this.x + "," + this.y + "}" +
		"<br>Destination: {" + this.destination.x + "," + this.destination.y + "}" +
		"<br>Speed: " + this.speed;
	*/
} 



/**
 * A point is simply x,y coordinates wrapped up with a couple of methods added
 *
 * @param {integer} x coordinate
 * @param {integer} y coordinate
 */
Point = function( x ,y ){
	this.x = x;
	this.y = y;
}


/**
 * Method on Point class: Wrapper for the distance() function
 *
 * @param {object} otherPoint An instance of Point class
 */
Point.prototype.distanceTo = function( otherPoint ){
	return distance( this, otherPoint );
}


/**
 * Method on Point class: Wrapper for the angle() function
 *
 * @param {object} otherPoint An instance of Point class
 */
Point.prototype.angleTo = function( otherPoint ){
	return angle( this, otherPoint );
}


// End of Class definitions





/* ----------------------------------------------------- Helper Functions ----------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------------------------------------------------------------- */



/**
 * Returns random number between 2 limits
 *
 * @param {number} min
 * @param {number} max
 * @param {number} interval - Optional interval defaults to 1
 *
 * @return {number}
 */
function random( min, max, interval ){
    if( typeof(interval) === 'undefined' ){
    	interval = 1;
    }
    var r = Math.floor(Math.random()*(max-min+interval)/interval);
    return r * interval + min;
}



/**
 * Debug and development function 
 * Finds and visualises the most isolated region of the viewport (ie. the prime location) 
 *
 */
function indicatePrimeLocation(){

	var pointer = document.getElementById('primepointer');
	var bestScore = 0;
	var bestX = 10;
	var bestY = 10;
	var assess;
	var neighbourId;

	// Iterate over the whole viewport in 10 pixel leaps, looking for the most isolated location
	for(var i = 0; i < viewportWidth-30; i=i+10)
	{
		for(var n = 0; n < viewportHeight-30; n=n+10)
		{
			assess = assessPosition('NANA', new Point( i,n ) );
			if(bestScore < assess.distance)
			{
				bestScore = assess.distance;
				neighbourId = assess.id;
				bestX = i;
				bestY = n;
			}
		}
	}
	
	pointer.style.left = bestX+"px";
	pointer.style.top = bestY+"px";
	pointer.innerHTML = bestScore+"("+neighbourId+")";
}



/**
 * Returns the magnitude of a number
 *
 * @param {integer} xNum
 *
 * @return {integer}
 */
function magnitude(xNum){
	if(xNum < 0){
		return 0 - xNum;
	} else {
		return xNum;
	}
}



/**
 * Calculated the distance between 2 points
 *
 * @param {object} point1 An instance of Point class
 * @param {object} point2 An instance of Point class
 *
 * @return {integer} 
 */
function distance( point1, point2 ){
	var xDifference = point1.x - point2.x;
	var yDifference = point1.y - point2.y;
	var hyp = Math.sqrt( Math.pow(xDifference, 2) + Math.pow(yDifference, 2) );
	return Math.round(hyp);
}



/**
 * Returns the angle of direction that xy2 is to xy1
 *
 * @param {object} point1 An instance of Point class
 * @param {object} point2 An instance of Point class
 *
 * @return {integer} Number of degrees of angle
 */
function angle( point1, point2 ){
	var xDifference = point1.x - point2.x;
	var yDifference = point1.y - point2.y;
	
	var r = Math.atan2(xDifference,yDifference)
	var d = r * 180 / Math.PI
	
	return d;
}



/**
 * Asseses a point on the floor to finds the nearest neighbour in the crowd
 * 
 * @param {string} ID of human to ignore 
 * @param {object} point An instance of Point class
 *
 * @return {object} Containing 'id', 'distance', 'angle'
 */
function assessPosition( humanIDToIgnore, point ){

	// Find my nearest neighbour and report id, distance and angle
	var nearest = 100000, // Start with a very high number by default and beat it
		nDistance,
		nAngle,
		nearestHumanId,
		otherHuman;
	
	// Iterate over Humans in Crowd
	for( var i = 0; i < crowd.countHumans(); i++ ){

		otherHuman = crowd.humans[i];

		// As long as the human is not myself
		if( otherHuman.id != humanIDToIgnore ){

			nDistance = point.distanceTo( otherHuman.destination );
			
			// Subtract their radius from the distance
			nDistance = nDistance - otherHuman.radius;
			
			if(nearest > nDistance){
				nearest = nDistance;
				nAngle = point.angleTo( otherHuman.destination );
				nearestHumanId = otherHuman.id;
			}
		}
	}
	
	return { id: nearestHumanId, distance: nearest, angle: nAngle };	
}


/**
 * Takes xy coordinates, increments and returns
 */
function xyStep( x, y, xIncAmount, yIncAmount ){
	var newX = x + xIncAmount;
	var newY = y + yIncAmount;
	return { x : newX, y : newY };	
}



/**
 * Explore the potential wins of moving in a direction. Would you find a less claustrophic position.
 *
 * @param ignoreObjId ID of object to ignore
 * @param {integer} x coordinate
 * @param {integer} y coordinate
 * @param {integer} distanceToBeat
 *
 * @return {object} Instance of Point representing the best position to move into
 */
function surveyPaths( ignoreObjId, x, y, distanceToBeat ){

	var improving;
	var bestX = x; // By default the best position to be in is the one you are in (only move if it can be imrpoved upon)
	var bestY = y;
	var currentScore;

	// Array of the possible directions of travel to be assessed
	var directions = [ { 
							name: 'South',
							xStep: 0,
							yStep: 2,
							distance: 0,
							point: new Point()
						},{ 
							name: 'North',
							xStep: 0,
							yStep: -2,
							distance: 0,
							point: new Point()
						},{ 
							name: 'East',
							xStep: 2,
							yStep: 0,
							distance: 0,
							point: new Point()
						},{ 
							name: 'West',
							xStep: -2,
							yStep:  0,
							distance: 0,
							point: new Point()
						},{ 
							name: 'South-East',
							xStep: 2,
							yStep: 2,
							distance: 0,
							point: new Point()
						},{ 
							name: 'South-West',
							xStep: -2,
							yStep:  2,
							distance: 0,
							point: new Point()
						},{ 
							name: 'North-West',
							xStep:  2,
							yStep: -2,
							distance: 0,
							point: new Point()
						},{ 
							name: 'North-East',
							xStep: -2,
							yStep: -2,
							distance: 0,
							point: new Point()
						}
					 ]; 
	
	var testingX;
	var testingY;
	var xIncAmount;
	var yIncAmount;
	
	var ignoreObj = crowd.getHumanById( ignoreObjId );

	var toleranceMargin = 75; // Default average radius
	if( ignoreObj ){
		toleranceMargin = ignoreObj.radius + 10;
	}
	
	// Iterate through the possible directions
	for(var i = 0, iLimit = directions.length; i < iLimit; i++){

		xIncAmount = directions[i].xStep; 
		yIncAmount = directions[i].yStep; 
		
		testingX = x;
	 	testingY = y;
		
		improving = true;
		
		directions[i].distance = distanceToBeat; 
		
		while( improving ){

			nextStep = xyStep( testingX, testingY, xIncAmount, yIncAmount );

			nearestNeighbour = assessPosition(ignoreObjId, new Point( nextStep.x, nextStep.y) ); // Evaluate this position, ignoring myself as an object

			// If this position is now outside boundaries, consider is no longer an improvement
			if(nextStep.x < toleranceMargin || nextStep.x > viewportWidth-toleranceMargin || nextStep.y < toleranceMargin || nextStep.y > viewportHeight-toleranceMargin ){
				improving = false;
			}

			if( directions[i].distance < nearestNeighbour.distance ){ // We are looking for the largest distance
			
				// This is a better position to be in, so update our direction
				directions[i].distance = nearestNeighbour.distance;
				directions[i].point.x = nextStep.x; 
				directions[i].point.y = nextStep.y; 

				//console.log( "Better position found (" + nearestNeighbour.distance + ") at  " + String(nextStep.x) + "," + String(nextStep.y) );

			} else {
				improving = false;
			}

			testingX = nextStep.x;
			testingY = nextStep.y;
		}
	}
	
	currentScore = distanceToBeat;

	// Iterate over the directions again to work out which gives the biggest win
	for( i = 0; i < iLimit; i++ ){

		// The *1.04 is to stop the objects vibrating between 2 very close positions with no significant advantage to either position
		if( (currentScore * 1.04) < directions[i].distance ){ 
			currentScore = directions[i].distance;
			bestX = directions[i].point.x;
			bestY = directions[i].point.y;
		}
	}
	
	if(bestX < toleranceMargin)
		bestX = toleranceMargin;
	if(bestX > viewportWidth-toleranceMargin)
		bestX = viewportWidth-toleranceMargin;
	if(bestY < toleranceMargin)
		bestY = toleranceMargin;
	if(bestY > viewportHeight-toleranceMargin)
		bestY = viewportHeight-toleranceMargin;

	return new Point( bestX, bestY );
}



/**
 * Helper function to determine if a variable is an integer
 *
 * @return {boolean}
 */
function isInt(n){
   return n % 1 === 0;
}





/**
 *
 */
function testForChange(){

	if (typeof window.innerWidth != 'undefined'){
		viewportWidth = window.innerWidth,
		viewportHeight = window.innerHeight
	}
	
	// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
	
	else if (typeof document.documentElement != 'undefined'
	 && typeof document.documentElement.clientWidth !=
	 'undefined' && document.documentElement.clientWidth != 0)
	{
	   viewportWidth = document.documentElement.clientWidth,
	   viewportHeight = document.documentElement.clientHeight
	}
	 
	// older versions of IE
	else
	{
		viewportWidth = document.getElementsByTagName('body')[0].clientWidth,
		viewportHeight = document.getElementsByTagName('body')[0].clientHeight
	}
	
	//alert('Your viewport width is '+viewportWidth+' x '+viewportHeight);
	
	if( viewportWidth != portWidthAtLastSet || viewportHeight != portHeightAtLastSet ){
		setViewportSize();
		controlPixels(); 
	}
}




/**
 * Calculates how many 'pixels' (background circles) are required to cover the viewport
 *
 * @return {integer} total number of circles needed to cover the background when wrapped
 */
function requiredPixels(){
	var horizcount = Math.floor(viewportWidth / pixelwidth);
	var vertcount = Math.floor(viewportHeight / pixelwidth);
	return horizcount * vertcount;
}



/**
 * Updates the width of the wrapper element
 */
function setViewportSize(){
	document.getElementById('wrapper').style.width = viewportWidth+"px";
	document.getElementById('wrapper').style.height = viewportHeight+"px";
	
	portWidthAtLastSet = viewportWidth;
	portHeightAtLastSet = viewportHeight;
}



/**
 * Tick count that is used to delay certain tasks for occasional execution
 */
ticks = 0;



/**
 * Self-calling function that simulates game time
 */
function ticker(){
	var randomnumber = Math.floor(Math.random()*pixelcount);
	
	if(ticks++ > 10){
		testForChange();
		ticks = 0;
	}
	
	var divToBeChanged = document.getElementById('div'+randomnumber);
	if( divToBeChanged != null ){
		divToBeChanged.style.backgroundColor = randomHex();
	}
	
	for(var i = 0; i < crowd.countHumans(); i++){
		crowd.humans[i].progressToDestination();
		crowd.humans[i].shuffle();
	}

	t = setTimeout("ticker();", 40); // Should be 40 for normal running
}



/**
 * Uses the current cursor position to generate a semi-random / weighted-random color hex
 *
 * @return {string} color hex code
 */
function randomHex(){

	// Generate a random number between 0 - 6
	var num = Math.floor(Math.random()*7); 

	var hinum = num+1;
	if(hinum == 16)
		hinum = 15;

	num = Math.round((num/100) * yperc);
	hinum = Math.round((hinum/100) * xperc);
	
	var r = hinum.toString(16);
	var gb = num.toString(16);
	
	if(colorOrder == 0)
		var colorhex = '#'+gb+gb+'00'+r+r;
	else if(colorOrder == 1)
		var colorhex = '#'+r+r+'00'+gb+gb;
	else if(colorOrder == 2)
		var colorhex = '#'+gb+gb+r+r+'00';
	else if(colorOrder == 3)
		var colorhex = '#'+r+r+gb+gb+'00';
	else if(colorOrder == 4)
		var colorhex = '#00'+r+r+gb+gb;
	else if(colorOrder == 5)
		var colorhex = '#00'+gb+gb+r+r;

	return colorhex;
}



/**
 * Produced a linear gradient definition with the darker shade at the bottom
 *
 * @return {string}
 */
function randomLinearGradStyle(){

	var hexA = randomHex(),
		hexB = randomHex();

	if( shadeFromHex(hexA) > shadeFromHex(hexB) ){
		return "linear-gradient(to bottom, " + hexA + ", " + hexB + ")";
	} else {
		return "linear-gradient(to bottom, " + hexB + ", " + hexA + ")";
	}
	
}



/**
 * Turns a hex color code into a shade value (aka lightness level)
 *
 * @return {integer} Value between 0 - 256 representing shade
 */
function shadeFromHex( hexColorCode ){

	total = parseInt( hexColorCode.substring(1,3), 16 ) +
			parseInt( hexColorCode.substring(3,5), 16 ) +
			parseInt( hexColorCode.substring(5,7), 16 );

	return total / 3;
}



/**
 * Controls the population of sequins (fka pixels) by populating or culling
 *
 */
function controlPixels(){
	required = requiredPixels();
	
	if(pixelcount < required)
		populateSequins();
	if(pixelcount > required)
		cullSequins();
}



/**
 * Produces the required number of sequins
 */
function populateSequins(){
	var elemCurtain = document.getElementById('curtain');

	for( var i = pixelcount; i < required; i++ ){
		// Shape Cell
		var newdiv = document.createElement('div');
	
		newdiv.setAttribute('class', 'pixel');  // Mozilla version
		newdiv.setAttribute('className', 'pixel'); // IE version
		newdiv.id = 'div'+i;
		elemCurtain.appendChild(newdiv);
	}
	
	pixelcount = required;
}



/**
 * Removes the excess sequins (fka pixels), limiting it to a number 
 *
 */
function cullSequins(){

	var wrapper = document.getElementById('curtain');
	
	for(var i=required; i < pixelcount; i++){
		var doomedDiv = document.getElementById('div'+i);
		wrapper.removeChild(doomedDiv);
	}
	
	pixelcount = required;

}



// Detect if the browser is IE or not.
// If it is not IE, we assume that the browser is NS.
var IE = document.all?true:false

// If NS -- that is, !IE -- then set up for mouse capture
if (!IE) document.captureEvents(Event.MOUSEMOVE)

// Set-up to use getMouseXY function onMouseMove
document.onmousemove = getMouseXY;

// Temporary variables to hold mouse x-y pos.s
var tempX = 0 // X is left-right
var tempY = 0 // Y is up-down
var xperc = 50;
var yperc = 50;

// Main function to retrieve mouse x-y pos.s
function getMouseXY(e){
	
	if (IE)
	{ // grab the x-y pos.s if browser is IE
    	tempX = event.clientX + document.body.scrollLeft
    	tempY = event.clientY + document.body.scrollTop
  	}
	else
	{  // grab the x-y pos.s if browser is NS
    	tempX = e.pageX
    	tempY = e.pageY
  	}  
	
	// catch possible negative values in NS4
	if (tempX < 0){tempX = 0}
	if (tempY < 0){tempY = 0} 
	  
	// Calculate percentage
	xperc = Math.round((tempX / viewportWidth)*100);
	yperc = Math.round((tempY / viewportHeight)*100);
	
	// Flip percentage so toward centre is more intense
	if(xperc > 50)
		xperc = 50 - (xperc - 50);
	xperc = xperc * 2;
	
	if(yperc > 50)
		yperc = 50 - (yperc - 50);
	yperc = yperc * 2;
	
	if(xperc > 100)
		xperc = 100;
	if(yperc > 100)
		yperc = 100;

	return true;
}




/**
 * Determins which of 6 different arrangements are used to generate colors
 * Basically restricts random colors to be within a shade range
 *
 * @type {integer}
 */
var colorOrder = 0;




/**
 * Increments the colorOrder with every click, keeping it within range of 0 - 5
 */
document.addEventListener('click', function(){

	colorOrder++;
	if(colorOrder > 5){ 
		colorOrder = 0 
	}

});





/** 
 * Init
 */
(function(){

	crowd = new Crowd('crowd');

	testForChange(); // Set size of window
	controlPixels(); // Populate the empty window
	ticker();	 // Start the ticker
	
	// Populate the stage with 16 Humans
	for(i = 0; i < 16; i++){
		crowd.addHuman();
	}

})();
