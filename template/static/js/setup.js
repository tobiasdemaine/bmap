var colours;
$(function() {
 	$('#helpModal').modal('show');
 	$('#startSetup').click(function(){
 		startSetup();
 		$('#helpModal').modal('hide');
 	})
 	colours  = new ColorTools()
 	webCamSetup()
 	
});
	
ww=0; 
wh = 0;
function startSetup(){
	$("#mainNav").hide()
	ww = $( window ).width()/300;
	cssString = "repeating-linear-gradient( 90deg, black, black " + (ww*1) + "px, white " + (ww*2) + "px, white " + (ww*3) + "px, black " + (ww*4) + "px, black " + (ww*5) + "px"
	$("#depthMap").css('background-image', cssString);
	setTimeout(snapImage, 100);
	setTimeout(vline2, 1000);
	
}
function vline2(){
	
	$("#depthMap").css('background-position-x', (ww*2)+"px");
	setTimeout(snapImage, 100);
	setTimeout(vline3, 1000);
}

function vline3(){
	$("#depthMap").css('background-position-x', (ww*4)+"px");
	setTimeout(snapImage, 100);
		setTimeout(hline1, 1000);
}

function hline1(){
	wh = $( window ).height()/200;
	cssString = "repeating-linear-gradient( 0deg, black, black " + (wh*1) + "px, white " + (wh*2) + "px, white " + (wh*3) + "px, black " + (wh*4) + "px, black " + (wh*5) + "px"
	$("#depthMap").css('background-image', cssString);

	
	setTimeout(snapImage, 100);
	setTimeout(hline2, 1000);
}

function hline2(){
	
	$("#depthMap").css('background-position-y', (wh*2)+"px");
	setTimeout(snapImage, 100);
	setTimeout(hline3, 1000);
}

function hline3(){
	// grab image

	$("#depthMap").css('background-position-y', (ww*4)+"px");
	setTimeout(snapImage, 100);
	setTimeout(processMaps, 2000);
}



/* UTILS */


function sendMaps(){
	/*$('#helpModal .modal-body').html("sending Maps")
	console.log(images.length)
	sent = 0
	data = {}
	for (i=0;i<images.length;i++){
		console.log(images[i])
		ur = window.location.href.split("/").reverse()
		url = "/" + ur[2] + "/" + ur[1] + "/dataurltofile";
		console.log(url)
		data["img"+i] = images[i].src
	}
	
	$.post( url, data ).done(function( data ) {
		alert(data);
		console.log(data)
	});*/
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
	mapCanvas[l].width = 640;
	mapCanvas[l].height = 480;
 	mapContext[l] = mapCanvas[l].getContext('2d');
	mapContext[l].drawImage(video, 0, 0, 640, 480);
};

/**
 *  LIGHT MAPPING
 */


noiseThreshold = 0.1;
zscale = 130;
zskew = 24; 
renderDetail = 2;


var vImage1, vImage2, vImage3, hImage1, hImage2, hImage3
function processMaps(){
	/* GUI STUFF */
	//$("#mainNav").show()
	localStream.getVideoTracks()[0].stop();
	$("#depthMap").hide();
	
	$("#startSetup").unbind();
	$('#startSetup').click(function(){
	 		//processMaps();
 	});
 	$('#startSetup').hide();
	 	
	$('#helpModal .modal-body').html("Processing Maps.")
	$('#helpModal').modal('show');
	
	/* *** */
	left=0; 
	top=0; 
	width=640; 
	height= 480;
	
	vImage1 = mapContext[0].getImageData(left, 0, width, height);
	vImage2 = mapContext[1].getImageData(left, 0, width, height);
	vImage3 = mapContext[2].getImageData(left, 0, width, height);
	hImage1 = mapContext[3].getImageData(left, 0, width, height);
	hImage2 = mapContext[4].getImageData(left, 0, width, height);
	hImage3 = mapContext[5].getImageData(left, 0, width, height);
	
	inputWidth = width;
	inputHeight = height;
	console.log(inputHeight)
	
	phase = matrix(inputHeight,inputWidth,0);
	mask = matrix(inputHeight,inputWidth,0)
	process = matrix(inputHeight,inputWidth,0);
	colors = matrix(inputHeight,inputWidth,0);

	//console.log(phase, mask, process, colors);
	
	phaseWrap(vImage1, vImage2, vImage3);
	phaseUnwrap();

	// kill the scene

	initThree();
	//drawscene()
	$('#helpModal').modal('hide');
}




var toProcess

function phaseUnwrap(){
	startX = inputWidth / 2;
    startY = inputHeight / 2;
    toProcess = new SinglyList();
    toProcess.add([startX, startY]);
 	process = matrix(inputHeight,inputWidth, false)  
 	while (!toProcess.isEmpty()) {
 		xy = toProcess.remove(1);
 		console.log(xy.data[1])
 		x = xy.data[0]
 		y = xy.data[1]
 		r = phase[y][x];
 		if (y > 0){
			phaseUnwrapper(r, x, y-1);
		}
		if (y < inputHeight-1){
			phaseUnwrapper(r, x, y+1);
		}
		if (x > 0){
			phaseUnwrapper(r, x-1, y);
		}
		if (x < inputWidth-1){
			phaseUnwrapper(r, x+1, y);
		}
 	}
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
		toProcess.add({x, y});
	}
}

function getPixel(pixel, imgd){
	pix = imgd.data;
	r = pix[pixel]
	g = pix[pixel + 1]
	b = pix[pixel + 2]
	a = 255;
	colours.colorMode(PConstants.RGB, 255)
	c = colours.color(r, g, b, a)
	return 
}
	
function phaseWrap(img1, img2, img3){
	sqrt3 = Math.sqrt(3);
	for (y = 0; y < inputHeight; y++) {
		for (x = 0; x < inputWidth; x++) {     
  			i = x + y * inputWidth;  
  			color1 = getPixel(i, img1);
 		 	color2 = getPixel(i, img2);
  			color3 = getPixel(i, img3);
  			
  			phase1 = (color1 & 255) / 255;
		    phase2 = (color2 & 255) / 255;
		   	phase3 = (color3 & 255) / 255;
		   	
		   	phaseSum = phase1 + phase2 + phase3;
  			phaseRange = Math.max(phase1, phase2, phase3) - Math.min(phase1, phase2, phase3);
  			gamma = phaseRange / phaseSum;
  			mask[y][x] = gamma < noiseThreshold;
  			process[y][x] = !mask[y][x];
  			phase[y][x] = Math.atan2(sqrt3 * (phase1 - phase3), 2 * phase2 - phase1 - phase3) / 6.283185307179586476925286766559;
  			colors[y][x] = colours.blendColor(colours.blendColor(color1, color2, colours.LIGHTEST), color3, colours.LIGHTEST);

  		}
  	}
}

	
	
/** THREE JS */	
	
var container, stats;
var camera, scene, renderer;
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
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );


	camera.position.z = 480;

	drawScene()

	animate();
}

animate = function () {
		requestAnimationFrame( animate );

		//cube.rotation.x += 0.01;
		//cube.rotation.y += 0.01;

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


	
function drawScene(){	
	//translate(-width / 2, -height / 2);
	for (y = 0; y < inputHeight; y += renderDetail) {
		planephase = 0.5 - (y - (inputHeight / 2)) / zskew;
		for (x = 0; x < inputWidth; x += renderDetail){
			if (!mask[y][x]) {
				//geometry = new THREE.SphereGeometry( 24, 16, 16 ) ;
				//material = new THREE.MeshLambertMaterial( { color:0x00CCFF } ) ;
				//mesh = new THREE.Mesh( geometry, material ) ;
	            //mesh.position.set( x, y, (phase[y][x] - planephase) * zscale);
				//scene.add( mesh ) ;
				var pointsGeometry = new THREE.Geometry();
			    var star = new THREE.Vector3();
			    star.set(
			        THREE.Math.randFloatSpread(x),
			        THREE.Math.randFloatSpread(y),
			        THREE.Math.randFloatSpread((phase[y][x] - planephase) * zscale));
			 
			    pointsGeometry.vertices.push(star);
				scene.add(
				    new THREE.Points(
				        pointsGeometry, 
				        new THREE.PointsMaterial({
				            color: 0x00afaf
				        })
				    )
				);
			}
		}
	}
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

/* stolen out of processing.js */
ColorTools = function() {
	var p = this;
	////////////////////////////////////////////////////////////////////////////
    // Color functions
    ////////////////////////////////////////////////////////////////////////////

    // helper functions for internal blending modes
    p.mix = function(a, b, f) {
      return a + (((b - a) * f) >> 8);
    };

    p.peg = function(n) {
      return (n < 0) ? 0 : ((n > 255) ? 255 : n);
    };

    // blending modes
    /**
    * These are internal blending modes used for BlendColor()
    *
    * @param {Color} c1       First Color to blend
    * @param {Color} c2       Second Color to blend
    *
    * @returns {Color}        The blended Color
    *
    * @see BlendColor
    * @see Blend
    */
    p.modes = (function() {
      var ALPHA_MASK = PConstants.ALPHA_MASK,
        RED_MASK = PConstants.RED_MASK,
        GREEN_MASK = PConstants.GREEN_MASK,
        BLUE_MASK = PConstants.BLUE_MASK,
        min = Math.min,
        max = Math.max;

      function applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb) {
        var a = min(((c1 & 0xff000000) >>> 24) + f, 0xff) << 24;

        var r = (ar + (((cr - ar) * f) >> 8));
        r = ((r < 0) ? 0 : ((r > 255) ? 255 : r)) << 16;

        var g = (ag + (((cg - ag) * f) >> 8));
        g = ((g < 0) ? 0 : ((g > 255) ? 255 : g)) << 8;

        var b = ab + (((cb - ab) * f) >> 8);
        b = (b < 0) ? 0 : ((b > 255) ? 255 : b);

        return (a | r | g | b);
      }

      return {
        replace: function(c1, c2) {
          return c2;
        },
        blend: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK),
            ag = (c1 & GREEN_MASK),
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK),
            bg = (c2 & GREEN_MASK),
            bb = (c2 & BLUE_MASK);

          return (min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                  (ar + (((br - ar) * f) >> 8)) & RED_MASK |
                  (ag + (((bg - ag) * f) >> 8)) & GREEN_MASK |
                  (ab + (((bb - ab) * f) >> 8)) & BLUE_MASK);
        },
        add: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24;
          return (min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                  min(((c1 & RED_MASK) + ((c2 & RED_MASK) >> 8) * f), RED_MASK) & RED_MASK |
                  min(((c1 & GREEN_MASK) + ((c2 & GREEN_MASK) >> 8) * f), GREEN_MASK) & GREEN_MASK |
                  min((c1 & BLUE_MASK) + (((c2 & BLUE_MASK) * f) >> 8), BLUE_MASK));
        },
        subtract: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24;
          return (min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                  max(((c1 & RED_MASK) - ((c2 & RED_MASK) >> 8) * f), GREEN_MASK) & RED_MASK |
                  max(((c1 & GREEN_MASK) - ((c2 & GREEN_MASK) >> 8) * f), BLUE_MASK) & GREEN_MASK |
                  max((c1 & BLUE_MASK) - (((c2 & BLUE_MASK) * f) >> 8), 0));
        },
        lightest: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24;
          return (min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                  max(c1 & RED_MASK, ((c2 & RED_MASK) >> 8) * f) & RED_MASK |
                  max(c1 & GREEN_MASK, ((c2 & GREEN_MASK) >> 8) * f) & GREEN_MASK |
                  max(c1 & BLUE_MASK, ((c2 & BLUE_MASK) * f) >> 8));
        },
        darkest: function(c1, c2) {
          var f = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK),
            ag = (c1 & GREEN_MASK),
            ab = (c1 & BLUE_MASK),
            br = min(c1 & RED_MASK, ((c2 & RED_MASK) >> 8) * f),
            bg = min(c1 & GREEN_MASK, ((c2 & GREEN_MASK) >> 8) * f),
            bb = min(c1 & BLUE_MASK, ((c2 & BLUE_MASK) * f) >> 8);

          return (min(((c1 & ALPHA_MASK) >>> 24) + f, 0xff) << 24 |
                  (ar + (((br - ar) * f) >> 8)) & RED_MASK |
                  (ag + (((bg - ag) * f) >> 8)) & GREEN_MASK |
                  (ab + (((bb - ab) * f) >> 8)) & BLUE_MASK);
        },
        difference: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = (ar > br) ? (ar - br) : (br - ar),
            cg = (ag > bg) ? (ag - bg) : (bg - ag),
            cb = (ab > bb) ? (ab - bb) : (bb - ab);

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        exclusion: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = ar + br - ((ar * br) >> 7),
            cg = ag + bg - ((ag * bg) >> 7),
            cb = ab + bb - ((ab * bb) >> 7);

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        multiply: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = (ar * br) >> 8,
            cg = (ag * bg) >> 8,
            cb = (ab * bb) >> 8;

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        screen: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = 255 - (((255 - ar) * (255 - br)) >> 8),
            cg = 255 - (((255 - ag) * (255 - bg)) >> 8),
            cb = 255 - (((255 - ab) * (255 - bb)) >> 8);

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        hard_light: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = (br < 128) ? ((ar * br) >> 7) : (255 - (((255 - ar) * (255 - br)) >> 7)),
            cg = (bg < 128) ? ((ag * bg) >> 7) : (255 - (((255 - ag) * (255 - bg)) >> 7)),
            cb = (bb < 128) ? ((ab * bb) >> 7) : (255 - (((255 - ab) * (255 - bb)) >> 7));

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        soft_light: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = ((ar * br) >> 7) + ((ar * ar) >> 8) - ((ar * ar * br) >> 15),
            cg = ((ag * bg) >> 7) + ((ag * ag) >> 8) - ((ag * ag * bg) >> 15),
            cb = ((ab * bb) >> 7) + ((ab * ab) >> 8) - ((ab * ab * bb) >> 15);

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        overlay: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK),
            cr = (ar < 128) ? ((ar * br) >> 7) : (255 - (((255 - ar) * (255 - br)) >> 7)),
            cg = (ag < 128) ? ((ag * bg) >> 7) : (255 - (((255 - ag) * (255 - bg)) >> 7)),
            cb = (ab < 128) ? ((ab * bb) >> 7) : (255 - (((255 - ab) * (255 - bb)) >> 7));

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        dodge: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK);

          var cr = 255;
          if (br !== 255) {
            cr = (ar << 8) / (255 - br);
            cr = (cr < 0) ? 0 : ((cr > 255) ? 255 : cr);
          }

          var cg = 255;
          if (bg !== 255) {
            cg = (ag << 8) / (255 - bg);
            cg = (cg < 0) ? 0 : ((cg > 255) ? 255 : cg);
          }

          var cb = 255;
          if (bb !== 255) {
            cb = (ab << 8) / (255 - bb);
            cb = (cb < 0) ? 0 : ((cb > 255) ? 255 : cb);
          }

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        },
        burn: function(c1, c2) {
          var f  = (c2 & ALPHA_MASK) >>> 24,
            ar = (c1 & RED_MASK) >> 16,
            ag = (c1 & GREEN_MASK) >> 8,
            ab = (c1 & BLUE_MASK),
            br = (c2 & RED_MASK) >> 16,
            bg = (c2 & GREEN_MASK) >> 8,
            bb = (c2 & BLUE_MASK);

          var cr = 0;
          if (br !== 0) {
            cr = ((255 - ar) << 8) / br;
            cr = 255 - ((cr < 0) ? 0 : ((cr > 255) ? 255 : cr));
          }

          var cg = 0;
          if (bg !== 0) {
            cg = ((255 - ag) << 8) / bg;
            cg = 255 - ((cg < 0) ? 0 : ((cg > 255) ? 255 : cg));
          }

          var cb = 0;
          if (bb !== 0) {
            cb = ((255 - ab) << 8) / bb;
            cb = 255 - ((cb < 0) ? 0 : ((cb > 255) ? 255 : cb));
          }

          return applyMode(c1, f, ar, ag, ab, br, bg, bb, cr, cg, cb);
        }
      };
    }());

    function color$4(aValue1, aValue2, aValue3, aValue4) {
      var r, g, b, a;

      if (curColorMode === PConstants.HSB) {
        var rgb = p.color.toRGB(aValue1, aValue2, aValue3);
        r = rgb[0];
        g = rgb[1];
        b = rgb[2];
      } else {
        r = Math.round(255 * (aValue1 / colorModeX));
        g = Math.round(255 * (aValue2 / colorModeY));
        b = Math.round(255 * (aValue3 / colorModeZ));
      }

      a = Math.round(255 * (aValue4 / colorModeA));

      // Limit values less than 0 and greater than 255
      r = (r < 0) ? 0 : r;
      g = (g < 0) ? 0 : g;
      b = (b < 0) ? 0 : b;
      a = (a < 0) ? 0 : a;
      r = (r > 255) ? 255 : r;
      g = (g > 255) ? 255 : g;
      b = (b > 255) ? 255 : b;
      a = (a > 255) ? 255 : a;

      // Create color int
      return (a << 24) & PConstants.ALPHA_MASK | (r << 16) & PConstants.RED_MASK | (g << 8) & PConstants.GREEN_MASK | b & PConstants.BLUE_MASK;
    }

    function color$2(aValue1, aValue2) {
      var a;

      // Color int and alpha
      if (aValue1 & PConstants.ALPHA_MASK) {
        a = Math.round(255 * (aValue2 / colorModeA));
        // Limit values less than 0 and greater than 255
        a = (a > 255) ? 255 : a;
        a = (a < 0) ? 0 : a;

        return aValue1 - (aValue1 & PConstants.ALPHA_MASK) + ((a << 24) & PConstants.ALPHA_MASK);
      }
      // Grayscale and alpha
      if (curColorMode === PConstants.RGB) {
        return color$4(aValue1, aValue1, aValue1, aValue2);
      }
      if (curColorMode === PConstants.HSB) {
        return color$4(0, 0, (aValue1 / colorModeX) * colorModeZ, aValue2);
      }
    }

    function color$1(aValue1) {
      // Grayscale
      if (aValue1 <= colorModeX && aValue1 >= 0) {
          if (curColorMode === PConstants.RGB) {
            return color$4(aValue1, aValue1, aValue1, colorModeA);
          }
          if (curColorMode === PConstants.HSB) {
            return color$4(0, 0, (aValue1 / colorModeX) * colorModeZ, colorModeA);
          }
      }
      // Color int
      if (aValue1) {
        if (aValue1 > 2147483647) {
          // Java Overflow
          aValue1 -= 4294967296;
        }
        return aValue1;
      }
    }

    /**
    * Creates colors for storing in variables of the color datatype. The parameters are
    * interpreted as RGB or HSB values depending on the current colorMode(). The default
    * mode is RGB values from 0 to 255 and therefore, the function call color(255, 204, 0)
    * will return a bright yellow color. More about how colors are stored can be found in
    * the reference for the color datatype.
    *
    * @param {int|float} aValue1        red or hue or grey values relative to the current color range.
    * Also can be color value in hexadecimal notation (i.e. #FFCC00 or 0xFFFFCC00)
    * @param {int|float} aValue2        green or saturation values relative to the current color range
    * @param {int|float} aValue3        blue or brightness values relative to the current color range
    * @param {int|float} aValue4        relative to current color range. Represents alpha
    *
    * @returns {color} the color
    *
    * @see colorMode
    */
    p.color = function(aValue1, aValue2, aValue3, aValue4) {

      // 4 arguments: (R, G, B, A) or (H, S, B, A)
      if (aValue1 !== undef && aValue2 !== undef && aValue3 !== undef && aValue4 !== undef) {
        return color$4(aValue1, aValue2, aValue3, aValue4);
      }

      // 3 arguments: (R, G, B) or (H, S, B)
      if (aValue1 !== undef && aValue2 !== undef && aValue3 !== undef) {
        return color$4(aValue1, aValue2, aValue3, colorModeA);
      }

      // 2 arguments: (Color, A) or (Grayscale, A)
      if (aValue1 !== undef && aValue2 !== undef) {
        return color$2(aValue1, aValue2);
      }

      // 1 argument: (Grayscale) or (Color)
      if (typeof aValue1 === "number") {
        return color$1(aValue1);
      }

      // Default
      return color$4(colorModeX, colorModeY, colorModeZ, colorModeA);
    };

    // Ease of use function to extract the colour bits into a string
    p.color.toString = function(colorInt) {
      return "rgba(" + ((colorInt & PConstants.RED_MASK) >>> 16) + "," + ((colorInt & PConstants.GREEN_MASK) >>> 8) +
             "," + ((colorInt & PConstants.BLUE_MASK)) + "," + ((colorInt & PConstants.ALPHA_MASK) >>> 24) / 255 + ")";
    };

    // Easy of use function to pack rgba values into a single bit-shifted color int.
    p.color.toInt = function(r, g, b, a) {
      return (a << 24) & PConstants.ALPHA_MASK | (r << 16) & PConstants.RED_MASK | (g << 8) & PConstants.GREEN_MASK | b & PConstants.BLUE_MASK;
    };

    // Creates a simple array in [R, G, B, A] format, [255, 255, 255, 255]
    p.color.toArray = function(colorInt) {
      return [(colorInt & PConstants.RED_MASK) >>> 16, (colorInt & PConstants.GREEN_MASK) >>> 8,
              colorInt & PConstants.BLUE_MASK, (colorInt & PConstants.ALPHA_MASK) >>> 24];
    };

    // Creates a WebGL color array in [R, G, B, A] format. WebGL wants the color ranges between 0 and 1, [1, 1, 1, 1]
    p.color.toGLArray = function(colorInt) {
      return [((colorInt & PConstants.RED_MASK) >>> 16) / 255, ((colorInt & PConstants.GREEN_MASK) >>> 8) / 255,
              (colorInt & PConstants.BLUE_MASK) / 255, ((colorInt & PConstants.ALPHA_MASK) >>> 24) / 255];
    };

    // HSB conversion function from Mootools, MIT Licensed
    p.color.toRGB = function(h, s, b) {
      // Limit values greater than range
      h = (h > colorModeX) ? colorModeX : h;
      s = (s > colorModeY) ? colorModeY : s;
      b = (b > colorModeZ) ? colorModeZ : b;

      // Limit values smaller than range
      h = (h < 0) ? 0 : h;

      h = (h / colorModeX) * 360;
      s = (s / colorModeY) * 100;
      b = (b / colorModeZ) * 100;

      var br = Math.round(b / 100 * 255);

      if (s === 0) { // Grayscale
        return [br, br, br];
      }
      var hue = h % 360;
      var f = hue % 60;
      var p = Math.round((b * (100 - s)) / 10000 * 255);
      var q = Math.round((b * (6000 - s * f)) / 600000 * 255);
      var t = Math.round((b * (6000 - s * (60 - f))) / 600000 * 255);
      switch (Math.floor(hue / 60)) {
      case 0:
        return [br, t, p];
      case 1:
        return [q, br, p];
      case 2:
        return [p, br, t];
      case 3:
        return [p, q, br];
      case 4:
        return [t, p, br];
      case 5:
        return [br, p, q];
      default:
        Processing.debug("Unexpectedly hit default case in toRGB function.");
      }
    };

    function colorToHSB(colorInt) {
      var red, green, blue;

      red   = ((colorInt & PConstants.RED_MASK) >>> 16) / 255;
      green = ((colorInt & PConstants.GREEN_MASK) >>> 8) / 255;
      blue  = (colorInt & PConstants.BLUE_MASK) / 255;

      var max = p.max(p.max(red,green), blue),
          min = p.min(p.min(red,green), blue),
          hue, saturation;

      if (min === max) {
        return [0, 0, max*colorModeZ];
      }
      saturation = (max - min) / max;

      if (red === max) {
        hue = (green - blue) / (max - min);
      } else if (green === max) {
        hue = 2 + ((blue - red) / (max - min));
      } else {
        hue = 4 + ((red - green) / (max - min));
      }

      hue /= 6;

      if (hue < 0) {
        hue += 1;
      } else if (hue > 1) {
        hue -= 1;
      }
      return [hue*colorModeX, saturation*colorModeY, max*colorModeZ];
    }

    /**
    * Extracts the brightness value from a color.
    *
    * @param {color} colInt any value of the color datatype
    *
    * @returns {float} The brightness color value.
    *
    * @see red
    * @see green
    * @see blue
    * @see hue
    * @see saturation
    */
    p.brightness = function(colInt){
      return colorToHSB(colInt)[2];
    };

    /**
    * Extracts the saturation value from a color.
    *
    * @param {color} colInt any value of the color datatype
    *
    * @returns {float} The saturation color value.
    *
    * @see red
    * @see green
    * @see blue
    * @see hue
    * @see brightness
    */
    p.saturation = function(colInt){
      return colorToHSB(colInt)[1];
    };

    /**
    * Extracts the hue value from a color.
    *
    * @param {color} colInt any value of the color datatype
    *
    * @returns {float} The hue color value.
    *
    * @see red
    * @see green
    * @see blue
    * @see saturation
    * @see brightness
    */
    p.hue = function(colInt){
      return colorToHSB(colInt)[0];
    };

    /**
    * Extracts the red value from a color, scaled to match current colorMode().
    * This value is always returned as a float so be careful not to assign it to an int value.
    *
    * @param {color} aColor any value of the color datatype
    *
    * @returns {float} The red color value.
    *
    * @see green
    * @see blue
    * @see alpha
    * @see >> right shift
    * @see hue
    * @see saturation
    * @see brightness
    */
    p.red = function(aColor) {
      return ((aColor & PConstants.RED_MASK) >>> 16) / 255 * colorModeX;
    };

    /**
    * Extracts the green value from a color, scaled to match current colorMode().
    * This value is always returned as a float so be careful not to assign it to an int value.
    *
    * @param {color} aColor any value of the color datatype
    *
    * @returns {float} The green color value.
    *
    * @see red
    * @see blue
    * @see alpha
    * @see >> right shift
    * @see hue
    * @see saturation
    * @see brightness
    */
    p.green = function(aColor) {
      return ((aColor & PConstants.GREEN_MASK) >>> 8) / 255 * colorModeY;
    };

    /**
    * Extracts the blue value from a color, scaled to match current colorMode().
    * This value is always returned as a float so be careful not to assign it to an int value.
    *
    * @param {color} aColor any value of the color datatype
    *
    * @returns {float} The blue color value.
    *
    * @see red
    * @see green
    * @see alpha
    * @see >> right shift
    * @see hue
    * @see saturation
    * @see brightness
    */
    p.blue = function(aColor) {
      return (aColor & PConstants.BLUE_MASK) / 255 * colorModeZ;
    };

    /**
    * Extracts the alpha value from a color, scaled to match current colorMode().
    * This value is always returned as a float so be careful not to assign it to an int value.
    *
    * @param {color} aColor any value of the color datatype
    *
    * @returns {float} The alpha color value.
    *
    * @see red
    * @see green
    * @see blue
    * @see >> right shift
    * @see hue
    * @see saturation
    * @see brightness
    */
    p.alpha = function(aColor) {
      return ((aColor & PConstants.ALPHA_MASK) >>> 24) / 255 * colorModeA;
    };

    /**
    * Calculates a color or colors between two colors at a specific increment.
    * The amt parameter is the amount to interpolate between the two values where 0.0
    * equal to the first point, 0.1 is very near the first point, 0.5 is half-way in between, etc.
    *
    * @param {color} c1     interpolate from this color
    * @param {color} c2     interpolate to this color
    * @param {float} amt    between 0.0 and 1.0
    *
    * @returns {float} The blended color.
    *
    * @see blendColor
    * @see color
    */
    p.lerpColor = function(c1, c2, amt) {
      var r, g, b, a, r1, g1, b1, a1, r2, g2, b2, a2;
      var hsb1, hsb2, rgb, h, s;
      var colorBits1 = p.color(c1);
      var colorBits2 = p.color(c2);

      if (curColorMode === PConstants.HSB) {
        // Special processing for HSB mode.
        // Get HSB and Alpha values for Color 1 and 2
        hsb1 = colorToHSB(colorBits1);
        a1 = ((colorBits1 & PConstants.ALPHA_MASK) >>> 24) / colorModeA;
        hsb2 = colorToHSB(colorBits2);
        a2 = ((colorBits2 & PConstants.ALPHA_MASK) >>> 24) / colorModeA;

        // Return lerp value for each channel, for HSB components
        h = p.lerp(hsb1[0], hsb2[0], amt);
        s = p.lerp(hsb1[1], hsb2[1], amt);
        b = p.lerp(hsb1[2], hsb2[2], amt);
        rgb = p.color.toRGB(h, s, b);
        // ... and for Alpha-range
        a = (p.lerp(a1, a2, amt) * colorModeA + 0.5) | 0;

        return (a << 24) & PConstants.ALPHA_MASK |
               (rgb[0] << 16) & PConstants.RED_MASK |
               (rgb[1] << 8) & PConstants.GREEN_MASK |
               rgb[2] & PConstants.BLUE_MASK;
      }

      // Get RGBA values for Color 1 to floats
      r1 = (colorBits1 & PConstants.RED_MASK) >>> 16;
      g1 = (colorBits1 & PConstants.GREEN_MASK) >>> 8;
      b1 = (colorBits1 & PConstants.BLUE_MASK);
      a1 = ((colorBits1 & PConstants.ALPHA_MASK) >>> 24) / colorModeA;

      // Get RGBA values for Color 2 to floats
      r2 = (colorBits2 & PConstants.RED_MASK) >>> 16;
      g2 = (colorBits2 & PConstants.GREEN_MASK) >>> 8;
      b2 = (colorBits2 & PConstants.BLUE_MASK);
      a2 = ((colorBits2 & PConstants.ALPHA_MASK) >>> 24) / colorModeA;

      // Return lerp value for each channel, INT for color, Float for Alpha-range
      r = (p.lerp(r1, r2, amt) + 0.5) | 0;
      g = (p.lerp(g1, g2, amt) + 0.5) | 0;
      b = (p.lerp(b1, b2, amt) + 0.5) | 0;
      a = (p.lerp(a1, a2, amt) * colorModeA + 0.5) | 0;

      return (a << 24) & PConstants.ALPHA_MASK |
             (r << 16) & PConstants.RED_MASK |
             (g << 8) & PConstants.GREEN_MASK |
             b & PConstants.BLUE_MASK;
    };

    /**
    * Changes the way Processing interprets color data. By default, fill(), stroke(), and background()
    * colors are set by values between 0 and 255 using the RGB color model. It is possible to change the
    * numerical range used for specifying colors and to switch color systems. For example, calling colorMode(RGB, 1.0)
    * will specify that values are specified between 0 and 1. The limits for defining colors are altered by setting the
    * parameters range1, range2, range3, and range 4.
    *
    * @param {MODE} mode Either RGB or HSB, corresponding to Red/Green/Blue and Hue/Saturation/Brightness
    * @param {int|float} range              range for all color elements
    * @param {int|float} range1             range for the red or hue depending on the current color mode
    * @param {int|float} range2             range for the green or saturation depending on the current color mode
    * @param {int|float} range3             range for the blue or brightness depending on the current color mode
    * @param {int|float} range4             range for the alpha
    *
    * @returns none
    *
    * @see background
    * @see fill
    * @see stroke
    */
    p.colorMode = function() { // mode, range1, range2, range3, range4
      curColorMode = arguments[0];
      if (arguments.length > 1) {
        colorModeX   = arguments[1];
        colorModeY   = arguments[2] || arguments[1];
        colorModeZ   = arguments[3] || arguments[1];
        colorModeA   = arguments[4] || arguments[1];
      }
    };

    /**
    * Blends two color values together based on the blending mode given as the MODE parameter.
    * The possible modes are described in the reference for the blend() function.
    *
    * @param {color} c1 color: the first color to blend
    * @param {color} c2 color: the second color to blend
    * @param {MODE} MODE Either BLEND, ADD, SUBTRACT, DARKEST, LIGHTEST, DIFFERENCE, EXCLUSION, MULTIPLY,
    * SCREEN, OVERLAY, HARD_LIGHT, SOFT_LIGHT, DODGE, or BURN
    *
    * @returns {float} The blended color.
    *
    * @see blend
    * @see color
    */
    p.blendColor = function(c1, c2, mode) {
      if (mode === PConstants.REPLACE) {
        return p.modes.replace(c1, c2);
      } else if (mode === PConstants.BLEND) {
        return p.modes.blend(c1, c2);
      } else if (mode === PConstants.ADD) {
        return p.modes.add(c1, c2);
      } else if (mode === PConstants.SUBTRACT) {
        return p.modes.subtract(c1, c2);
      } else if (mode === PConstants.LIGHTEST) {
        return p.modes.lightest(c1, c2);
      } else if (mode === PConstants.DARKEST) {
        return p.modes.darkest(c1, c2);
      } else if (mode === PConstants.DIFFERENCE) {
        return p.modes.difference(c1, c2);
      } else if (mode === PConstants.EXCLUSION) {
        return p.modes.exclusion(c1, c2);
      } else if (mode === PConstants.MULTIPLY) {
        return p.modes.multiply(c1, c2);
      } else if (mode === PConstants.SCREEN) {
        return p.modes.screen(c1, c2);
      } else if (mode === PConstants.HARD_LIGHT) {
        return p.modes.hard_light(c1, c2);
      } else if (mode === PConstants.SOFT_LIGHT) {
        return p.modes.soft_light(c1, c2);
      } else if (mode === PConstants.OVERLAY) {
        return p.modes.overlay(c1, c2);
      } else if (mode === PConstants.DODGE) {
        return p.modes.dodge(c1, c2);
      } else if (mode === PConstants.BURN) {
        return p.modes.burn(c1, c2);
      }
	};
}

var PConstants = {
    X: 0,
    Y: 1,
    Z: 2,

    R: 3,
    G: 4,
    B: 5,
    A: 6,

    U: 7,
    V: 8,

    NX: 9,
    NY: 10,
    NZ: 11,

    EDGE: 12,

    // Stroke
    SR: 13,
    SG: 14,
    SB: 15,
    SA: 16,

    SW: 17,

    // Transformations (2D and 3D)
    TX: 18,
    TY: 19,
    TZ: 20,

    VX: 21,
    VY: 22,
    VZ: 23,
    VW: 24,

    // Material properties
    AR: 25,
    AG: 26,
    AB: 27,

    DR: 3,
    DG: 4,
    DB: 5,
    DA: 6,

    SPR: 28,
    SPG: 29,
    SPB: 30,

    SHINE: 31,

    ER: 32,
    EG: 33,
    EB: 34,

    BEEN_LIT: 35,

    VERTEX_FIELD_COUNT: 36,

    // Renderers
    P2D:    1,
    JAVA2D: 1,
    WEBGL:  2,
    P3D:    2,
    OPENGL: 2,
    PDF:    0,
    DXF:    0,

    // Platform IDs
    OTHER:   0,
    WINDOWS: 1,
    MACOSX:  2,
    LINUX:   3,

    EPSILON: 0.0001,

    MAX_FLOAT:  3.4028235e+38,
    MIN_FLOAT: -3.4028235e+38,
    MAX_INT:    2147483647,
    MIN_INT:   -2147483648,

    PI:         Math.PI,
    TWO_PI:     2 * Math.PI,
    TAU:        2 * Math.PI,
    HALF_PI:    Math.PI / 2,
    THIRD_PI:   Math.PI / 3,
    QUARTER_PI: Math.PI / 4,

    DEG_TO_RAD: Math.PI / 180,
    RAD_TO_DEG: 180 / Math.PI,

    WHITESPACE: " \t\n\r\f\u00A0",

    // Color modes
    RGB:   1,
    ARGB:  2,
    HSB:   3,
    ALPHA: 4,
    CMYK:  5,

    // Image file types
    TIFF:  0,
    TARGA: 1,
    JPEG:  2,
    GIF:   3,

    // Filter/convert types
    BLUR:      11,
    GRAY:      12,
    INVERT:    13,
    OPAQUE:    14,
    POSTERIZE: 15,
    THRESHOLD: 16,
    ERODE:     17,
    DILATE:    18,

    // Blend modes
    REPLACE:    0,
    BLEND:      1 << 0,
    ADD:        1 << 1,
    SUBTRACT:   1 << 2,
    LIGHTEST:   1 << 3,
    DARKEST:    1 << 4,
    DIFFERENCE: 1 << 5,
    EXCLUSION:  1 << 6,
    MULTIPLY:   1 << 7,
    SCREEN:     1 << 8,
    OVERLAY:    1 << 9,
    HARD_LIGHT: 1 << 10,
    SOFT_LIGHT: 1 << 11,
    DODGE:      1 << 12,
    BURN:       1 << 13,

    // Color component bit masks
    ALPHA_MASK: 0xff000000,
    RED_MASK:   0x00ff0000,
    GREEN_MASK: 0x0000ff00,
    BLUE_MASK:  0x000000ff,

    // Projection matrices
    CUSTOM:       0,
    ORTHOGRAPHIC: 2,
    PERSPECTIVE:  3,

    // Shapes
    POINT:          2,
    POINTS:         2,
    LINE:           4,
    LINES:          4,
    TRIANGLE:       8,
    TRIANGLES:      9,
    TRIANGLE_STRIP: 10,
    TRIANGLE_FAN:   11,
    QUAD:           16,
    QUADS:          16,
    QUAD_STRIP:     17,
    POLYGON:        20,
    PATH:           21,
    RECT:           30,
    ELLIPSE:        31,
    ARC:            32,
    SPHERE:         40,
    BOX:            41,

    // Arc drawing modes
    //OPEN:          1, // shared with Shape closing modes   
    CHORD:           2,
    PIE:             3, 


    GROUP:          0,
    PRIMITIVE:      1,
    //PATH:         21, // shared with Shape PATH
    GEOMETRY:       3,

    // Shape Vertex
    VERTEX:        0,
    BEZIER_VERTEX: 1,
    CURVE_VERTEX:  2,
    BREAK:         3,
    CLOSESHAPE:    4,

    // Shape closing modes
    OPEN:  1,
    CLOSE: 2,

    // Shape drawing modes
    CORNER:          0, // Draw mode convention to use (x, y) to (width, height)
    CORNERS:         1, // Draw mode convention to use (x1, y1) to (x2, y2) coordinates
    RADIUS:          2, // Draw mode from the center, and using the radius
    CENTER_RADIUS:   2, // Deprecated! Use RADIUS instead
    CENTER:          3, // Draw from the center, using second pair of values as the diameter
    DIAMETER:        3, // Synonym for the CENTER constant. Draw from the center
    CENTER_DIAMETER: 3, // Deprecated! Use DIAMETER instead

    // Text vertical alignment modes
    BASELINE: 0,   // Default vertical alignment for text placement
    TOP:      101, // Align text to the top
    BOTTOM:   102, // Align text from the bottom, using the baseline

    // UV Texture coordinate modes
    NORMAL:     1,
    NORMALIZED: 1,
    IMAGE:      2,

    // Text placement modes
    MODEL: 4,
    SHAPE: 5,

    // Stroke modes
    SQUARE:  'butt',
    ROUND:   'round',
    PROJECT: 'square',
    MITER:   'miter',
    BEVEL:   'bevel',

    // Lighting modes
    AMBIENT:     0,
    DIRECTIONAL: 1,
    //POINT:     2, Shared with Shape constant
    SPOT:        3,

    // Key constants

    // Both key and keyCode will be equal to these values
    BACKSPACE: 8,
    TAB:       9,
    ENTER:     10,
    RETURN:    13,
    ESC:       27,
    DELETE:    127,
    CODED:     0xffff,

    // p.key will be CODED and p.keyCode will be this value
    SHIFT:     16,
    CONTROL:   17,
    ALT:       18,
    CAPSLK:    20,
    PGUP:      33,
    PGDN:      34,
    END:       35,
    HOME:      36,
    LEFT:      37,
    UP:        38,
    RIGHT:     39,
    DOWN:      40,
    F1:        112,
    F2:        113,
    F3:        114,
    F4:        115,
    F5:        116,
    F6:        117,
    F7:        118,
    F8:        119,
    F9:        120,
    F10:       121,
    F11:       122,
    F12:       123,
    NUMLK:     144,
    META:      157,
    INSERT:    155,

    // Cursor types
    ARROW:    'default',
    CROSS:    'crosshair',
    HAND:     'pointer',
    MOVE:     'move',
    TEXT:     'text',
    WAIT:     'wait',
    NOCURSOR: "url('data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='), auto",

    // Hints
    DISABLE_OPENGL_2X_SMOOTH:     1,
    ENABLE_OPENGL_2X_SMOOTH:     -1,
    ENABLE_OPENGL_4X_SMOOTH:      2,
    ENABLE_NATIVE_FONTS:          3,
    DISABLE_DEPTH_TEST:           4,
    ENABLE_DEPTH_TEST:           -4,
    ENABLE_DEPTH_SORT:            5,
    DISABLE_DEPTH_SORT:          -5,
    DISABLE_OPENGL_ERROR_REPORT:  6,
    ENABLE_OPENGL_ERROR_REPORT:  -6,
    ENABLE_ACCURATE_TEXTURES:     7,
    DISABLE_ACCURATE_TEXTURES:   -7,
    HINT_COUNT:                  10,

    // PJS defined constants
    SINCOS_LENGTH:      720,       // every half degree
    PRECISIONB:         15,        // fixed point precision is limited to 15 bits!!
    PRECISIONF:         1 << 15,
    PREC_MAXVAL:        (1 << 15) - 1,
    PREC_ALPHA_SHIFT:   24 - 15,
    PREC_RED_SHIFT:     16 - 15,
    NORMAL_MODE_AUTO:   0,
    NORMAL_MODE_SHAPE:  1,
    NORMAL_MODE_VERTEX: 2,
    MAX_LIGHTS:         8
};
