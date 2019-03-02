var colours;
var testAlgo = false;// true;
width = 640; 
height = 480;
inputWidth = width;
inputHeight = height;
$(function() {
	//$("#mainNav").hide()
	
	
 	if(testAlgo == true){
 		initThree();
 		testAlgoFromFiles();
 		
 	}else{
 	 	$('#helpModal').modal('show');
	 	$('#startSetup').click(function(){
	 		toggleFullScreen()
	 		$('#startSetup').unbind()
	 		$('.modal-body').html("ENSURE YOU ARE IN FULL SCREEN!")
	 		$('#startSetup').click(function(){
	 			startSetup();
	 			$('#helpModal').modal('hide');
	 		});
	 	})
	 	
		webCamSetup();
	}
	
	
	var text = new renderControls();
  	var gui = new dat.GUI();
  	gui.domElement.id = 'gui';
  	var f1 = gui.addFolder('Light Mapper');

  	c1 = f1.add(text, 'noiseThreshold');
  	c2 = f1.add(text, 'zscale');
  	c3 = f1.add(text, 'zskew');
  	c4 = f1.add(text, 'renderDetail');
  	f1.add(text, 'update');
  	c1.onFinishChange(function(value) {
  		noiseThreshold =  value;
  	});
	c2.onFinishChange(function(value) {
  		zscale =  value;
  	});
	c3.onFinishChange(function(value) {
  		zskew =  value;
  	});
	c4.onFinishChange(function(value) {
  		renderDetail =  value;
  		
	});
});


var renderControls = function() {
  //this.message = 'dat.gui';
  this.noiseThreshold = noiseThreshold ;
  this.zscale = zscale;
  this.zskew = zskew; 
  this.renderDetail = renderDetail ;
  this.update = function() { 
   		processMaps(vImage1, vImage2, vImage3)
  };

};









// mozfullscreenerror event handler
function errorHandler() {
   alert('mozfullscreenerror');
}
document.documentElement.addEventListener('mozfullscreenerror', errorHandler, false);

// toggle full screen
function toggleFullScreen() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
  }
}

// keydown event handler
document.addEventListener('keydown', function(e) {
  if (e.keyCode == 13 || e.keyCode == 70) { // F or Enter key
    toggleFullScreen();
  }
}, false);



	
ww=0; 
wh = 0;
function startSetup(){
	$("#gui").hide()
	$("#mainNav").hide()
	ww = $( window ).width()/100;
	wh = $( window ).height()/100;
	cssString = "repeating-linear-gradient( 0deg, black, black " + (wh*1) + "px, white " + (wh*2) + "px, white " + (wh*3) + "px, black " + (wh*4) + "px, black " + (wh*5) + "px"
	//$("#depthMap").css('background-image', cssString);
	//cssString = "repeating-linear-gradient( 90deg, black, black " + (ww*1) + "px, white " + (ww*2) + "px, white " + (ww*3) + "px, black " + (ww*4) + "px, black " + (ww*5) + "px"
	$("#depthMap").css('background-image', cssString);
	setTimeout(snapImage, 1000);
	setTimeout(vline2, 2000);
	
}
function vline2(){
	
	$("#depthMap").css('background-position-y', (wh*2)+"px");
	setTimeout(snapImage, 1000);
	setTimeout(vline3, 2000);
}

function vline3(){
	$("#depthMap").css('background-position-y', (wh*4)+"px");
	setTimeout(snapImage, 1000);
		setTimeout(hline1, 2000);
}

function hline1(){
	
	$("#depthMap").css('background-position-y', (wh*6)+"px");
	
	setTimeout(snapImage, 1000);
	setTimeout(hline2, 2000);
}

function hline2(){
	$("#depthMap").css('background-position-y', (wh*8)+"px");
	//$("#depthMap").css('background-position-y', (wh*2)+"px");
	setTimeout(snapImage, 1000);
	setTimeout(hline3, 2000);
}

function hline3(){
	// grab image
	$("#depthMap").css('background-position-y', (wh*12)+"px");
	//$("#depthMap").css('background-position-y', (ww*4)+"px");
	setTimeout(snapImage, 1000);
	setTimeout(processMapsFromVideo, 2000);
}



/* UTILS */


function sendMaps(){
	//$('#helpModal .modal-body').html("sending Maps")
	sent = 0
	data = {}
	for (i=0;i<mapCanvas.length;i++){
		ur = window.location.href.split("/").reverse()
		url = "/" + ur[2] + "/" + ur[1] + "/dataurltofile";
		
		data["img"+i] = mapCanvas[i].toDataURL()
	}
	console.log(data)
	$.post( url, data ).done(function( data ) {
		//alert(data);
		//console.log(data)
	});
}

function matrix( rows, cols, defaultValue){
	var arr = [];
	for(var i=0; i < rows; i++){
		arr.push([]);
		arr[i].push( new Array(cols));
		for(var j=0; j < cols; j++){
			arr[i][j] = defaultValue;
		}
	}
	return arr;
}


function webCamSetup(){
	    var video = document.getElementById('video');
	    var mediaConfig =  { video: true };
        var errBack = function(e) {
        	console.log('An error has occurred!', e)
        };
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(mediaConfig).then(function(stream) {
				video.srcObject = stream;
                video.play();
                localStream = stream
            });
        }
        else if(navigator.getUserMedia) { // Standard
			navigator.getUserMedia(mediaConfig, function(stream) {
				video.src = stream;
				video.play();
				localStream = stream
			}, errBack);
		} else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
			navigator.webkitGetUserMedia(mediaConfig, function(stream){
				video.src = window.webkitURL.createObjectURL(stream);
				video.play();
				localStream = stream
			}, errBack);
		} else if(navigator.mozGetUserMedia) { // Mozilla-prefixed
			navigator.mozGetUserMedia(mediaConfig, function(stream){
				video.src = window.URL.createObjectURL(stream);
				video.play();
				localStream = stream
			}, errBack);
		}
}

mapCanvas = []
mapContext = []
function snapImage() {
	l = mapCanvas.length
	mapCanvas[l] = document.createElement('canvas');
	mapCanvas[l].width = width;
	mapCanvas[l].height = height;
 	mapContext[l] = mapCanvas[l].getContext('2d');
	mapContext[l].drawImage(video, 0, 0, width, height);
};

/**
 *  LIGHT MAPPING
 */


noiseThreshold = 0.2;
zscale = 130;
zskew = 24; 
renderDetail = 2;


var vImage1, vImage2, vImage3, hImage1, hImage2, hImage3
load = 0

function testLoadCountThenProcessMaps(){
	load++;
	if(load == 3){
		vImage1 = mapContext[0].getImageData(0, 0, width, height);
		vImage2 = mapContext[1].getImageData(0, 0, width, height);
		vImage3 = mapContext[2].getImageData(0, 0, width, height);
		processMaps(vImage1, vImage2, vImage3)
	}
}

var loadImage = function (url, ctx) {
  var img = new Image();
  img.src = url
  img.onload = function () { 
    ctx.drawImage(img, 0, 0);
    testLoadCountThenProcessMaps();
  }
}

function testAlgoFromFiles(){
	 
	 mapCanvas[0] = document.createElement('canvas');
	 mapCanvas[0].width = width;
	 mapCanvas[0].height = height;
     mapContext[0] = mapCanvas[0].getContext('2d');
     loadImage("/assets/1/img/phase1.jpg", mapContext[0])
     
     mapCanvas[1] = document.createElement('canvas');
	 mapCanvas[1].width = width;
	 mapCanvas[1].height = height;
     mapContext[1] = mapCanvas[1].getContext('2d');
     loadImage("/assets/1/img/phase2.jpg", mapContext[1])
     
     mapCanvas[2] = document.createElement('canvas');
	 mapCanvas[2].width = width;
	 mapCanvas[2].height = height;
     mapContext[2] = mapCanvas[2].getContext('2d');
     loadImage("/assets/1/img/phase3.jpg", mapContext[2])
          
}

function processMapsFromVideo(){
	/* GUI STUFF */
	initThree();
	$("#mainNav").show()
	
	localStream.getVideoTracks()[0].stop();
	
	$("#depthMap").hide();
	
	$("#startSetup").unbind();
	$('#startSetup').click(function(){
	 		//processMaps();
 	});
 	$('#startSetup').hide();
	 	
	$('#helpModal .modal-body').html("Processing Maps.")
	$('#helpModal').modal('show');
	vImage1 = mapContext[0].getImageData(0, 0, width, height);
	vImage2 = mapContext[1].getImageData(0, 0, width, height);
	vImage3 = mapContext[2].getImageData(0, 0, width, height);
	sendMaps() // saves maps to disk
	processMaps(vImage1, vImage2, vImage3)
	$("#gui").show()
}

function processMaps(img1, img2, img3){
	/* *** */
	inputWidth = width;
	inputHeight = height;
	console.log(inputHeight)
	phase = matrix(inputHeight,inputWidth,0);
	mask = matrix(inputHeight,inputWidth,0)
	process = matrix(inputHeight,inputWidth,0);
	colors = matrix(inputHeight,inputWidth,0);

	//console.log(phase, mask, process, colors);
	
	phaseWrap(img1, img2, img3);
	

	// kill the scene
	
	
	
	$('#helpModal').modal('hide');
}




var toProcess = []
var process;

function phaseUnwrap(){
	console.log('function phaseUnwrap')
	startX = inputWidth / 2;
    startY = inputHeight / 2;
    //toProcess = new SinglyList();
    toProcess.push([startX, startY]);
 	//process[startX][startY] = false
 	//process = matrix(inputHeight,inputWidth, 0)  
 	
 	
 	while (toProcess.length != 0) {
 		xy = toProcess.shift();
 		x = xy[0]
 		y = xy[1]
 		r = phase[y][x];
 		if (y > 0){
			z = phaseUnwrapper(r, x, y-1);
		}
		if (y < inputHeight-1){
			z = phaseUnwrapper(r, x, y+1);
		}
		if (x > 0){
			z = phaseUnwrapper(r, x-1, y);
		}
		if (x < inputWidth-1){
			z = phaseUnwrapper(r, x+1, y);
		}
 	}
 	drawScene()
}


function phaseUnwrapper(basePhase, x, y) {
	if(process[y][x]) {
		diff = phase[y][x] - (basePhase - parseInt(basePhase));
	    if (diff > .5){
	      diff--;
	    }
	    if (diff < -.5){
	      diff++;
	    }
		phase[y][x] = basePhase + diff;
		process[y][x] = false;
		toProcess.push([x, y]);
	}
	return true;
}

function getPixelColor(pixel, imgA, imgB, imgC){
	//console.log(pix)
	pixel = pixel * 4 -4
	
	pix = imgA.data;
	r1 = pix[pixel]
	g1 = pix[pixel + 1]
	b1 = pix[pixel + 2]
	
	pix = imgB.data;
	r2 = pix[pixel]
	g2 = pix[pixel + 1]
	b2 = pix[pixel + 2]
	
	pix = imgC.data;
	r3 = pix[pixel]
	g3 = pix[pixel + 1]
	b4 = pix[pixel + 2]
	
	r = getTexture(r1, r2, r3);
	g = getTexture(g1, g2, g3);
	b = getTexture(b1, b2, b3);

	col = [r, g, b]
	return(col)
	
}

function getTexture(i1, i2, i3) {
  return (i1 + i2 + i3 + Math.sqrt(3 * Math.sq(i1 - i3) + Math.sq(2 * i2 - i1 - i3))) / 3;
}

function getPixelPhase(pixel, imgd){
	pix = imgd.data;
	//console.log(pix)
	pixel = pixel * 4 -4
	r = pix[pixel]
	g = pix[pixel + 1]
	b = pix[pixel + 2]
	a = 255;
	//console.log(r, g, b ,a)
	//colours.colorMode(PConstants.RGB, 255)
	//c = colours.color(r, g, b, a)
	_phase = ((r+g+b) /(255*3))
	
	return _phase
}

function getPixel(pixel, imgd){
	pix = imgd.data;
	//console.log(pix)
	pixel = pixel * 4 - 4
	r = pix[pixel]
	g = pix[pixel + 1]
	b = pix[pixel + 2]
	a = 255;
	colours.colorMode(PConstants.RGB, 255)
	c = colours.color(r, g, b, a)
	return c
}
	
function phaseWrap(img1, img2, img3){
	sqrt3 = Math.sqrt(3);
	for (y = 0; y < inputHeight; y++) {
		for (x = 0; x < inputWidth; x++) {     
  			i = x + y * inputWidth;  
  			
  			phase1 = getPixelPhase(i, img1);
 		 	phase2 = getPixelPhase(i, img2);
  			phase3 = getPixelPhase(i, img3);
  			
  			/*
  			color1 = getPixel(i, img1);
  			color2 = getPixel(i, img2);
  			color3 = getPixel(i, img3);
  			
  			phase1 = (color1 & 255) / 255;
		    phase2 = (color2 & 255) / 255;
		   	phase3 = (color3 & 255) / 255;
		   	*/
		   	//console.log(color1, phase1)
		   	
		   	phaseSum = phase1 + phase2 + phase3;
  			phaseRange = Math.max(phase1, phase2, phase3) - Math.min(phase1, phase2, phase3);
  			gamma = phaseRange / phaseSum;
  			//console.log(gamma)
  			//console.log(gamma + "=" + phaseRange +"/"+ phaseSum)
  			mask[y][x] = gamma < noiseThreshold;
  			//console.log(mask[y][x], (!mask[y][x]))
  			process[y][x] = true;//mask[y][x];
  			
  			phase[y][x] = Math.atan2(sqrt3 * (phase1 - phase3), 2 * phase2 - phase1 - phase3) / 6.283185307179586476925286766559;
  			//colors[y][x] = getPixelColor(img1, img2, img3) // colours.blendColor(colours.blendColor(color1, color2, colours.LIGHTEST), color3, colours.LIGHTEST);

  		}
  	}
  	phaseUnwrap();
}

	
	
/** THREE JS */	
	
var container, stats;
var camera, scene, renderer, controls;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var cube
function initThree() {
	
/* 	container = document.getElementById( 'three' ); 
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.z = 250;
	// scene
	scene = new THREE.Scene();
	var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
	scene.add( ambientLight );
	var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
	camera.add( pointLight );
	scene.add( camera );
	
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
	
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	//
	window.addEventListener( 'resize', onWindowResize, false );
	
	drawScene()
	*/
	
	container = document.getElementById( 'three' ); 
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 200000 );
	controls = new THREE.OrbitControls( camera );
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );


	camera.position.z = 240;
	controls.update();

	//drawScene()

	animate();
}

animate = function () {
		requestAnimationFrame( animate );
		controls.update();
		renderer.render( scene, camera );
	};
	
function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
function onDocumentMouseMove( event ) {
	//mouseX = ( event.clientX - windowHalfX ) / 2;
	//mouseY = ( event.clientY - windowHalfY ) / 2;
}

function removeEntity(object) {
    var selectedObject = scene.getObjectByName(object.name);
    scene.remove( selectedObject );
    animate();
}

var objs = new Array();	

function drawScene(){	
	//translate(-width / 2, -height / 2);
	while(scene.children.length > 0){ 
    		scene.remove(scene.children[0]); 
	}
	
	var pointsGeometry = new THREE.Geometry();
	//pointsGeometry.translate(width / 2, height / 2);
	
	for (y = 0; y < inputHeight; y += renderDetail) {
		planephase = 0.5 - (y - (inputHeight / 2)) / zskew;
		for (x = 0; x < inputWidth; x += renderDetail){
			if (!mask[y][x]) {
				//geometry = new THREE.SphereGeometry( 24, 16, 16 ) ;
				//material = new THREE.MeshLambertMaterial( { color:0x00CCFF } ) ;
				//mesh = new THREE.Mesh( geometry, material ) ;
	            //mesh.position.set( x, y, (phase[y][x] - planephase) * zscale);
				//scene.add( mesh ) ;
				
			    var star = new THREE.Vector3();
			    star.set(y,x,(phase[y][x] - planephase) * zscale);
			 	
			    pointsGeometry.vertices.push(star);
			    //console.log(colors[y][x])
			    //colooor = new THREE.Color( colors[y][x][0], colors[y][x][1], colors[y][x][2] );
			    /* points = new THREE.Points(
				        pointsGeometry, 
				        new THREE.PointsMaterial({
				            color: colooor
				        })
				    )
				
				scene.add(objs[ol]);*/
			}
		}
	}
	colooor = 0x00afaf
	points = new THREE.Points(
	        pointsGeometry, 
	        new THREE.PointsMaterial({
	            color: colooor
	        })
	    )
	
	scene.add(points);
}
	

	
	
	
	
	
	
	
	
	

/* DATA UTILS */


function Node(data) {
    this.data = data;
    this.next = null;
}
 
function SinglyList() {
    this._length = 0;
    this.head = null;
}
 
SinglyList.prototype.add = function(value) {
    var node = new Node(value),
        currentNode = this.head;
 
    // 1st use-case: an empty list
    if (!currentNode) {
        this.head = node;
        this._length++;
 
        return node;
    }
 
    // 2nd use-case: a non-empty list
    while (currentNode.next) {
        currentNode = currentNode.next;
    }
 
    currentNode.next = node;
 
    this._length++;
     
    return node;
};
 
SinglyList.prototype.searchNodeAt = function(position) {
    var currentNode = this.head,
        length = this._length,
        count = 1,
        message = {failure: 'Failure: non-existent node in this list.'};
 
    // 1st use-case: an invalid position
    if (length === 0 || position < 1 || position > length) {
        throw new Error(message.failure);
    }
 
    // 2nd use-case: a valid position
    while (count < position) {
        currentNode = currentNode.next;
        count++;
    }
 
    return currentNode;
};
 
SinglyList.prototype.isEmpty = function() 
{ 
    return this._length == 0; 
} 
 
SinglyList.prototype.remove = function(position) {
    var currentNode = this.head,
        length = this._length,
        count = 0,
        message = {failure: 'Failure: non-existent node in this list.'},
        beforeNodeToDelete = null,
        nodeToDelete = null,
        deletedNode = null;
 
    // 1st use-case: an invalid position
    if (position < 0 || position > length) {
        throw new Error(message.failure);
    }
 
    // 2nd use-case: the first node is removed
    if (position === 1) {
        this.head = currentNode.next;
        deletedNode = currentNode;
        currentNode = null;
        this._length--;
         
        return deletedNode;
    }
 
    // 3rd use-case: any other node is removed
    while (count < position) {
        beforeNodeToDelete = currentNode;
        nodeToDelete = currentNode.next;
        count++;
    }
 
    beforeNodeToDelete.next = nodeToDelete.next;
    deletedNode = nodeToDelete;
    nodeToDelete = null;
    this._length--;
 
    return deletedNode;
};
	
undef = undefined
