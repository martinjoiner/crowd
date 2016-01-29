
var portWidthAtLastSet = 0;
var portHeightAtLastSet = 0;

var viewportWidth = 800;
var viewportheight = 600;

var pixelwidth = 20;
var pixelcount = 0;
var required = 0;

/**
 * Global property to store the array of window.humans
 *
 * @type {array}
 */
window.humans = new Array();



/**
 * Like the auto-increment function on databases this returns the next available ID 
 * (Note: HTML IDs must not begin with a number)
 *
 * @return {integer} 
 */
function assignMeAnID(){
	var humanCount = window.humans.length++;
	var divName = 'd' + String(humanCount)
	window.humans[humanCount] = divName;
	return divName;	
}




/**	
 * Destination Marker class
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
	
	div.style.left = parentObj.destinationX+"px";
	div.style.top = parentObj.destinationY+"px";
	
	/*
	var wrapperdiv = document.getElementById('wrapper');
	if(wrapperdiv != null)
		wrapperdiv.appendChild(div);
	*/	
}




function dropMarker(x,y,textContent)
{
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
	
	var wrapperdiv = document.getElementById('wrapper');
	if(wrapperdiv != null)
		wrapperdiv.appendChild(div);
}



/**
 * Human class
 *
 * @param {integer} x the initial horizontal position 
 * @param {integer} y the initial vertical position 
 */
function Human(x,y){

	this.name = '';
	
	var p, text;
	p = document.createElement('div');
	text = document.createTextNode("");
	
	// Personality Traits
	p.radius = Math.round((Math.random()*70)+15); // Whole number between 15 and 85
	p.speed = Math.round((Math.random()*5)+8); // Whole number between 8 and 13
	
	p.style.width = String(p.radius*2)+"px";
	p.style.height = String(p.radius*2)+"px";
	p.style.backgroundColor = randomHex();
	p.style.background = "-webkit-linear-gradient(top, "+randomHex()+", "+randomHex()+")";
	
	if(x)
		p.destinationX = x;
	else
		p.destinationX = Math.floor((Math.random()*viewportWidth-100)+100);
	
	if(y)
		p.destinationY = y;
	else
		p.destinationY = Math.floor((Math.random()*viewportheight-100)+100);
	
	p.x = p.destinationX;
	p.y = p.destinationY;
	
	p.history = new Array;
	p.historyPointer = 0;
	p.vibrationCount = 0;
	
	p.id = assignMeAnID(); // Add me to the array of divs
	p.setAttribute("class", "human");
	p.appendChild(text); // A text node on the div mainly for debugging purposes 
	
	p.walking = false;
	
	var wrapperdiv = document.getElementById('wrapper');
	if(wrapperdiv != null)
		wrapperdiv.appendChild(p)

	p.tracking = false;
	p.addEventListener("mousemove", trackMouse, true);
	p.addEventListener("mousedown", function(e){ 
											 	p.tracking = true; 			// Referenced in the if statement of the mousemove listener
											 	console.log("Tracking "+this.id); 		
											 	wrapperdiv.appendChild(p);  // Makes it pop to the foreground effectively
											 }, false);
	p.addEventListener("mouseup", function(e){ 
										   		p.tracking = false; 		// Referenced in the if statement of the mousemove listener
												console.log("Not Tracking");		// Debug alert
											}, false);
	
	p.addEventListener('dblclick', function(){ 
												new Human(this.x,this.y);

											}, false);
	
	new DestinationMarker(p);
	
	p.setPosition = function(){
		//alert(this.id +" is setting it's own position");
		this.style.left = String(this.x - this.radius) + "px";
		this.style.top = String(this.y - this.radius) + "px";
		return true;
	}
	
	p.setPosition();
}




/**
 *
 */
function recordHistory(sender){
	sender.history[sender.historyPointer] = String(sender.x) + "," + String(sender.y); // x,y values stored as string
	sender.historyPointer++;
	if(sender.historyPointer > 8){
		sender.historyPointer = 0;
	}
}



/**
 *
 */
function progressToDestination(senderId){
	var sender = document.getElementById(senderId);
	// Every object has a destination position and an actual position
	// this function moves the object toward it's destination one little increment at a time
	var xDifference = sender.destinationX - sender.x;
	var fractionOfXDiff = Math.round(xDifference/sender.speed);
	
	var yDifference = sender.destinationY - sender.y;
	var fractionOfYDiff = Math.round(yDifference/sender.speed);
	
	sender.x = sender.x + fractionOfXDiff;
	sender.y = sender.y + fractionOfYDiff;
	
	sender.setPosition();
	
	/*
	var marker = document.getElementById(senderId+"marker");
	marker.style.left = sender.destinationX + "px";
	marker.style.top = sender.destinationY + "px";
	*/
	
	if(sender.x == sender.destinationX && sender.y == sender.destinationY)
		sender.walking = false;
	else
	{
		sender.walking = true;
		//setTimeout("progressToDestination('"+senderId+"')",40);
	}
	recordHistory(sender);
}

var moverNominated = false;
var nominatedMoverId; // a Global variable to say who is moving to the best place

function indicatePrimeLocation(sender)
{
	var pointer = document.getElementById('primepointer');
	var bestScore = 0;
	var bestX = 10;
	var bestY = 10;
	var assess;
	var neighbourId;

	for(var i = 0; i < viewportWidth-30; i=i+10)
	{
		for(var n = 0; n < viewportheight-30; n=n+10)
		{
			assess = nearestNeighbour('NANA',i,n);
			if(bestScore < assess.distance)
			{
				bestScore = assess.distance;
				neighbourId = assess.id;
				bestX = i;
				bestY = n;
			}
		}
	}
	
	/*
	bestX = 200;
	bestY = 400;
	*/
	
	pointer.style.left = bestX+"px";
	pointer.style.top = bestY+"px";
	pointer.innerHTML = bestScore+"("+neighbourId+")";
}

function trackMouse(){  
	//console.log(this.id);
	if(this.tracking)
	{
		this.x = Math.round(tempX);
		this.y = Math.round(tempY);
		
		this.destinationX = this.x;
		this.destinationY = this.y;
		
		sender.setPosition();
	}
}




/**
 * Returns the magnitude of a number
 *
 * @param {integer} xNum
 */
function magnitude(xNum){
	if(xNum < 0){
		return 0 - xNum;
	} else {
		return xNum;
	}
}




function distance(x1,y1,x2,y2){
	var xDifference = x1 - x2;
	var yDifference = y1 - y2;
	var hyp = Math.sqrt((xDifference*xDifference) + (yDifference*yDifference));
	return Math.round(hyp);
}

function angle(x1,y1,x2,y2)
{
	var xDifference = x1 - x2;
	var yDifference = y1 - y2;
	
	var r = Math.atan2(xDifference,yDifference)
	var d = r * 180 / Math.PI
	
	return d;
}

function nearestNeighbour(ignoreObjId,x,y)
{
	// Find my nearest neighbour and report id, distance and angle
	var nearest = 10000; // Start with a very high number by default and beat it
	var nDistance;
	var nAngle;
	var nearestObjId;
	var otherObj;
	
	for(var i = 0; i < window.humans.length; i++)
	{
		otherObj = document.getElementById(window.humans[i]);
		if(otherObj.id != ignoreObjId)
		{
			nDistance = distance(x,y,otherObj.destinationX,otherObj.destinationY);
			
			// Subtract their radius from the distance
			nDistance = nDistance - otherObj.radius;
			
			if(nearest > nDistance)
			{
				nearest = nDistance;
				nAngle = angle(x,y,otherObj.destinationX,otherObj.destinationY);
				nearestObjId = otherObj.id;
			}
		}
	}
	
	return {id : nearestObjId, distance : nearest, angle: nAngle};	
}

function xyStep(x,y,xIncAmount,yIncAmount)
{
	var newX = x + xIncAmount;
	var newY = y + yIncAmount;
	return { x : newX, y : newY };	
}

function surveyPath(ignoreObjId,x,y,nAngle,distanceToBeat)
{
	// Keep taking virtual steps in various directions, evaluating that position until a position with a better store than yours is found

	var improving;
	var bestX = x; // By default the best position to be in is the one you are in (only move if it can be imrpoved upon
	var bestY = y;
	var currentScore;
	var scores = [[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3],[1,2,3]]; // Array to store the scores as each direction of travel is assessed
	
	var testingX;
	var testingY;
	var xIncAmount;
	var yIncAmount;
	
	var toleranceMargin = 75; // Default average radius
	
	var ignoreObj = document.getElementById(ignoreObjId);
	if(ignoreObj)
		toleranceMargin = ignoreObj.radius + 10;
	
	for(var i = 0; i < 7; i++) // Run through 4 times
	{
		switch(i)
		{
			case 0: xIncAmount = 0; yIncAmount = 2; break;
			case 1: xIncAmount = 0; yIncAmount = -2; break;
			case 2: xIncAmount = 2; yIncAmount = 0; break;
			case 3: xIncAmount = -2; yIncAmount = 0; break;	
			case 4: xIncAmount = 2; yIncAmount = 2; break;
			case 5: xIncAmount = -2; yIncAmount = 2; break;	
			case 6: xIncAmount = 2; yIncAmount = -2; break;
			case 7: xIncAmount = -2; yIncAmount = -2; break;	
		}
		
		testingX = x;
	 	testingY = y;
		
		improving = true;
		
		scores[i][0] = distanceToBeat; // Position 0 is distance to beat
		
		while(improving)
		{
			//nextStep = step(bestX,bestY,nAngle);
			nextStep = xyStep(testingX,testingY,xIncAmount,yIncAmount);
			evalNeighbour = nearestNeighbour(ignoreObjId,nextStep.x,nextStep.y); // Evaluate this position, ignoring myself as an object
			if(nextStep.x < toleranceMargin || nextStep.x > viewportWidth-toleranceMargin || nextStep.y < toleranceMargin || nextStep.y > viewportheight-toleranceMargin)
				improving = false;
			if(scores[i][0] < evalNeighbour.distance) // We are looking for the largest distance
			{
				// This is a better position to be in
				scores[i][0] = evalNeighbour.distance;
				scores[i][1] = nextStep.x; // Position 1 is best X value
				scores[i][2] = nextStep.y; // Position 2 is best Y value
				//alert("Better position found ("+evalNeighbour.distance+") at  "+String(nextStep.x)+","+String(nextStep.y));
			}
			else
			{
				improving = false;
			}
			testingX = nextStep.x;
			testingY = nextStep.y;
		}
	}
	
	currentScore = distanceToBeat;
	for(var i = 0; i < 7; i++) // Run through 4 times
	{
		if((currentScore*1.1) < scores[i][0]) // The *1.1 is to stop the objects vibrating between 2 very close positions with no significant advantage to either position
		{
			currentScore = scores[i][0];
			bestX = scores[i][1];
			bestY = scores[i][2];
		}
	}
	
	if(bestX < toleranceMargin)
		bestX = toleranceMargin;
	if(bestX > viewportWidth-toleranceMargin)
		bestX = viewportWidth-toleranceMargin;
	if(bestY < toleranceMargin)
		bestY = toleranceMargin;
	if(bestY > viewportheight-toleranceMargin)
		bestY = viewportheight-toleranceMargin;

	return { x : bestX, y : bestY };
}



/**
 * Helper function to determine if a variable is an integer
 *
 * @return {boolean}
 */
function isInt(n){
   return n % 1 === 0;
}

function shuffle(myObj)
{
	// Ask how close my nearest neighbour is and at what angle they are
	var nNeighbour = nearestNeighbour(myObj.id,myObj.x,myObj.y);
	
	// Is there a place within a few steps in the opposite direction that is at least 10% less claustrophibic?
	var betterPosition = surveyPath(myObj.id,myObj.destinationX,myObj.destinationY,nNeighbour.angle,nNeighbour.distance);
	
	if(!myObj.tracking)
	{
		myObj.destinationX = betterPosition.x;
		myObj.destinationY = betterPosition.y;
	}
	
	//myObj.innerHTML = "I am: "+myObj.id+"<br><br>Nearest ID: "+nNeighbour.id+"<br>Distance: "+nNeighbour.distance+"<br>Need to move x:"+String(betterPosition.x)+" y:"+String(betterPosition.y)+"<br>Speed:"+String(myObj.speed);
} 



document.addEventListener("mousemove", showCoords, false);

function showCoords(){
	//console.log(tempX+", "+tempY); 
	var wrapperdiv = document.getElementById('wrapper');
	//console.log(window.humans.length);
}





/**
 *
 */
function testForChange()
{
	if (typeof window.innerWidth != 'undefined'){
		viewportWidth = window.innerWidth,
		viewportheight = window.innerHeight
	}
	
	// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
	
	else if (typeof document.documentElement != 'undefined'
	 && typeof document.documentElement.clientWidth !=
	 'undefined' && document.documentElement.clientWidth != 0)
	{
	   viewportWidth = document.documentElement.clientWidth,
	   viewportheight = document.documentElement.clientHeight
	}
	 
	// older versions of IE
	else
	{
		viewportWidth = document.getElementsByTagName('body')[0].clientWidth,
		viewportheight = document.getElementsByTagName('body')[0].clientHeight
	}
	
	//alert('Your viewport width is '+viewportWidth+' x '+viewportheight);
	
	if(viewportWidth!=portWidthAtLastSet || viewportheight!=portHeightAtLastSet)
	{
		setsize();
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
	var vertcount = Math.floor(viewportheight / pixelwidth);
	return horizcount * vertcount;
}

function setsize()
{
	document.getElementById('wrapper').style.width = viewportWidth+"px";
	document.getElementById('wrapper').style.height = viewportheight+"px";
	
	portWidthAtLastSet = viewportWidth;
	portHeightAtLastSet = viewportheight;
}

var ticks = 0;

function colourTicker()
{
	var randomnumber = Math.floor(Math.random()*pixelcount);
	
	if(ticks++ > 10)
	{
		testForChange();
		ticks = 0;
	}
	
	var divToBeChanged = document.getElementById('div'+randomnumber);
	if(divToBeChanged != null)
		divToBeChanged.style.backgroundColor = randomHex();
	
	var wrapperdiv = document.getElementById('wrapper');
	for(var i = 0; i < window.humans.length; i++)
	{
		progressToDestination(window.humans[i]);
		shuffle(document.getElementById(window.humans[i]));
	}

	t = setTimeout("colourTicker();",40); // Should be 40 for normal running
}




/**
 * Uses the current cursor position to generate a semi-random / weighted-random colour hex
 *
 * @return {string} colour hex code
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
	
	if(colourOrder == 0)
		var colourhex = '#'+gb+gb+'00'+r+r;
	else if(colourOrder == 1)
		var colourhex = '#'+r+r+'00'+gb+gb;
	else if(colourOrder == 2)
		var colourhex = '#'+gb+gb+r+r+'00';
	else if(colourOrder == 3)
		var colourhex = '#'+r+r+gb+gb+'00';
	else if(colourOrder == 4)
		var colourhex = '#00'+r+r+gb+gb;
	else if(colourOrder == 5)
		var colourhex = '#00'+gb+gb+r+r;

	return colourhex;
}




function controlPixels(){
	required = requiredPixels();
	
	if(pixelcount < required)
		populate();
	if(pixelcount > required)
		cull();
}

function populate()
{
	var wrapper = document.getElementById('wrapper');

	var i = 0;
	for(i=pixelcount; i < required; i++){
		// Shape Cell
		var newdiv = document.createElement('div');
	
		newdiv.setAttribute('class', 'pixel');  // Mozilla version
		newdiv.setAttribute('className', 'pixel'); // IE version
		newdiv.id = 'div'+i;
		wrapper.appendChild(newdiv);
	}
	
	pixelcount = required;
	//console.log("Populated to "+pixelcount);
}


function cull(){

	var i = 0;
	var wrapper = document.getElementById('wrapper');
	
	for(i=required; i < pixelcount; i++){
		var doomedDiv = document.getElementById('div'+i);
		wrapper.removeChild(doomedDiv);
	}
	
	pixelcount = required;

	//console.log("Culled to " + pixelcount);
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
function getMouseXY(e)
{
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
	yperc = Math.round((tempY / viewportheight)*100);
	
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
	  
	// show the position values in the form named Show
	// in the text fields named MouseX and MouseY
	//document.Show.MouseX.value = xperc+"%";
	//document.Show.MouseY.value = yperc+"%";

	return true;
}




/**
 * Determins which of 6 different arrangements are used to generate colours
 * Basically restricts random colours to be within a shade range
 *
 * @type {integer}
 */
var colourOrder = 0;




/**
 * Increments the colourOrder with every click, keeping it within range of 0 - 5
 */
document.addEventListener('click', function(){

	colourOrder++;
	if(colourOrder > 5){ 
		colourOrder = 0 
	}

});




/** 
 * Init
 */
(function(){

	testForChange(); // Set size of window
	controlPixels(); // Populate the empty window
	colourTicker();	 // Start the colour changing
	
	// Populate the stage with 16 Humans
	for(i = 0; i < 16; i++){
		new Human();
	}

})();
