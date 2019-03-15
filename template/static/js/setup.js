var colours;
var testAlgo = "Win";//"FS";//"win"// NULL;
width = 640; 
height = 480;
inputWidth = width;
inputHeight = height;

//noiseThreshold = 0.2;
//zscale = 130;
//zskew = 24; 
//renderDetail = 2;
noiseThreshold = 0.0;
zscale = 80;
zskew = 20; 
renderDetail = 3;


$(function() {
	$("#mainNav").hide()
	if(testAlgo == "Win"){
		$("#mainNav").show()
		beginPhasefromDisk()
		
	}else if(testAlgo == "FS"){
		$('.modal-body').html("FULL SCREEN!")
		$('#helpModal').modal('show');
		$('#startSetup').click(function(){
	 		$('#helpModal').modal('show');
	 		x = toggleFullScreen()
 			setTimeout(beginPhasefromDisk, 2000);
 		});
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
	//guiSetup();	
	bLightGui();
});


function beginPhasefromDisk(){
	$("#video").hide();
	initThree();
 	testAlgoFromFiles();
}

var gui, text

// rotation vars
// 
var _Rx1 = 0;
var _Ry1 = 0;
var _Rz1 = 0;
var _Mx1 = 0;
var _My1 = 0;
var _Mz1 = 0;

function guiSetup(){
	text = new renderControls();
  	gui = new dat.GUI();
  	gui.domElement.id = 'gui';
  	var f1 = gui.addFolder('Light Mapper');

  	c1 = f1.add(text, 'noiseThreshold');
  	c2 = f1.add(text, 'zscale');
  	c3 = f1.add(text, 'zskew');
  	c4 = f1.add(text, 'renderDetail');
  	
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
  	
  	 	
	f1.add(text, 'update');
	
}


var renderControls = function() {
  //this.message = 'dat.gui';
  this.noiseThreshold = noiseThreshold ;
  this.zscale = zscale;
  this.zskew = zskew; 
  this.renderDetail = renderDetail ;
  this.update = function() { 
   		
  };
 
};


//
bLightGui = function(){
	$('<div/>', {
    	id: 'bLightGui',
    	class: 'bLightGui',
    }).appendTo('body');
   
    
    $('<div/>', { id:'bLightGuiTitle'}).html('Model Aquistion').addClass('bLightGuiTitle').appendTo("#bLightGui")
    $('<div/>', { id:'bLightGuiNoiseThreshold'}).html('Noise T <input type="text" id="noiseThreshold" class="bLightTextInput" value="'+ noiseThreshold + '">').addClass('bLightGuiTitle').appendTo("#bLightGui");
    $('<div/>', { id:'bLightGuizscale'}).html('z Scale <input type="text" id="zscale" class="bLightTextInput" value="'+ zscale + '">').addClass('bLightGuiTitle').appendTo("#bLightGui");
    $('<div/>', { id:'bLightGuizskew'}).html('z Skew <input type="text" id="zskew" class="bLightTextInput" value="'+ zskew + '">').addClass('bLightGuiTitle').appendTo("#bLightGui");
    $('<div/>', { id:'bLightGuirenderDetail'}).html('Detail <input type="text" id="renderDetail" class="bLightTextInput" value="'+ renderDetail + '">').addClass('bLightGuiTitle').appendTo("#bLightGui");
    $('<div/>', { id:'bLightGuixDistort'}).html('x Distort <input type="text" id="xDistort" class="bLightTextInput" value="'+ xDistort + '">').addClass('bLightGuiTitle').appendTo("#bLightGui");
    $('<div/>', { id:'bLightGuiyDistort'}).html('y Distort <input type="text" id="yDistort" class="bLightTextInput" value="'+ yDistort + '">').addClass('bLightGuiTitle').appendTo("#bLightGui");
    $('<div/>', { id:'bLightGuiUpdate'}).html('Update').addClass('bLightGuiButton').click(
    	function(){ 
		    noiseThreshold =  parseFloat($("#noiseThreshold").val())
		    zscale =  parseFloat($("#zscale").val())
		    zskew =  parseFloat($("#zskew").val())
		    renderDetail =  parseFloat($("#renderDetail").val())
		    xDistort =  parseFloat($("#xDistort").val())
		    yDistort =  parseFloat($("#yDistort").val())
		    processMaps(vImage1, vImage2, vImage3) 
		}
    ).appendTo("#bLightGui");
    
}







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
  return true;
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
	//$("#depthMap").css('background-position-y', (ww*2)+"px");
	setTimeout(snapImage, 1000);
	setTimeout(vline3, 2000);
}

function vline3(){
	$("#depthMap").css('background-position-y', (wh*4)+"px");
	//$("#depthMap").css('background-position-y', (ww*4)+"px");
	setTimeout(snapImage, 1000);
		setTimeout(hline1, 2000);
}

function hline1(){
	$("#depthMap").css('background-position-y', (wh*6)+"px");
	//$("#depthMap").css('background-position-y', (wh*6)+"px");
	setTimeout(snapImage, 1000);
	setTimeout(hline2, 2000);
}

function hline2(){
	$("#depthMap").css('background-position-y', (wh*8)+"px");
	//$("#depthMap").css('background-position-y', (wh*8)+"px");
	setTimeout(snapImage, 1000);
	setTimeout(hline3, 2000);
}

function hline3(){
	$("#depthMap").css('background-position-y', (wh*12)+"px");
	//$("#depthMap").css('background-position-y', (wh*12)+"px");
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





var vImage1, vImage2, vImage3, hImage1, hImage2, hImage3
load = 0

function testLoadCountThenProcessMaps(){
	load++;
	if(load == 3){
		vImage1 = mapContext[0].getImageData(0, 0, width, height);
		vImage2 = mapContext[1].getImageData(0, 0, width, height);
		vImage3 = mapContext[2].getImageData(0, 0, width, height);
		
		/*
		vImage1 = undistort(mapCanvas[0].toDataURL());
		vImage2 = undistort(mapCanvas[1].toDataURL());
		vImage3 = undistort(mapCanvas[2].toDataURL());
		*/
		
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
     loadImage("/assets/1/img/phase1.png", mapContext[0])
     
     mapCanvas[1] = document.createElement('canvas');
	 mapCanvas[1].width = width;
	 mapCanvas[1].height = height;
     mapContext[1] = mapCanvas[1].getContext('2d');
     loadImage("/assets/1/img/phase2.png", mapContext[1])
     
     mapCanvas[2] = document.createElement('canvas');
	 mapCanvas[2].width = width;
	 mapCanvas[2].height = height;
     mapContext[2] = mapCanvas[2].getContext('2d');
     loadImage("/assets/1/img/phase3.png", mapContext[2])
          
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
	vImage1 =  mapContext[0].getImageData(0, 0, width, height);
	vImage2 =  mapContext[1].getImageData(0, 0, width, height);
	vImage3 =  mapContext[2].getImageData(0, 0, width, height);
	sendMaps() // saves maps to disk
	processMaps(vImage1, vImage2, vImage3)
	$("#gui").show()
}

distortion = 3;

function undistort(imgData){
	var distorter = FisheyeGl({image: imgData});
	distorter.run();
	var dataurl = distorter.getSrc();
	var img = new Image();
    img.src = url
	img.onload = function () { 
    	ctx.drawImage(img, 0, 0);
    }
	return ctx.getImageData(0, 0, width, height);//distortContext.
}


function processMaps(img1, img2, img3){
	/* *** */
	
	
	
	
	inputWidth = width;
	inputHeight = height;
	phase = matrix(inputHeight,inputWidth,0);
	mask = matrix(inputHeight,inputWidth,0)
	process = matrix(inputHeight,inputWidth,0);
	colors = matrix(inputHeight,inputWidth,0);

	//console.log(phase, mask, process, colors);
	phaseWrap(img1, img2, img3);
	$('#helpModal').modal('hide');
}




var toProcess = []
var process;

function phaseUnwrap(){
	console.log('function phaseUnwrap')
	startY = inputWidth / 2;
    startX = inputHeight / 2;
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
	b3 = pix[pixel + 2]
	
	m = Math.max((r1+g1+b1), (r2+g2+b2), (r3+g3+b3))
	if(m == (r1+g1+b1)){
		r = r1;
		g = g1;
		b = b1;
	}
	if(m == (r2+g2+b2)){
		r = r2;
		g = g2;
		b = b2;
	}
	if(m == (r3+g3+b3)){
		r = r3;
		g = g3;
		b = b3;
	}

		
		
	//r = getTexture(r1, r2, r3);
	//g = getTexture(g1, g2, g3);
	//b = getTexture(b1, b2, b3);
	
	col = [r, g, b]
	return(col)
	
}

function getTexture(i1, i2, i3) {
  return ((i1 + i2 + i3)  / 3);
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
	//colours.colorMode(PConstants.RGB, 255)
	__c = [r, g, b]//colours.color(r, g, b, a)
	return __c
}

_c = []
function phaseWrap(img1, img2, img3){
	sqrt3 = Math.sqrt(3);
	for (y = 0; y < inputHeight; y++) {
		for (x = 0; x < inputWidth; x++) {     
  			i = x + y * inputWidth;  
  			
  			phase1 = getPixelPhase(i, img1);
 		 	phase2 = getPixelPhase(i, img2);
  			phase3 = getPixelPhase(i, img3);
  			colors[y][x] = getPixelColor(i, vImage1, vImage2, vImage3);
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
  			
  			phase[y][x] = Math.atan2(sqrt3 * (phase1 - phase3), 2 * phase2 - phase1 - phase3) / (Math.PI * 2);// 6.283185307179586476925286766559;
  			//colors[y][x] = getPixelColor(img1, img2, img3) // colours.blendColor(colours.blendColor(color1, color2,  colours.LIGHTEST), color3, colours.LIGHTEST);

  		}
  	}
  	phaseUnwrap();
}



/** MAPPING FUNCTIONS */
v = [];
currentBmap = -1;
function mapClick(event){
	if(currentBmap != -1){
		raycaster.setFromCamera( mouse, selectedCamera );
		
		
		
		canTestPointCloud=true
		var intersectsObj = raycaster.intersectObjects( editPoints.children );
		if ( intersectsObj.length > 0 ) {
			console.log(intersectsObj)
			maps[currentBmap].addVector3(intersectsObj[0].object.position.clone())
		}else{
			var intersects = raycaster.intersectObject( maps[currentBmap].mesh );
			if ( intersects.length > 0 ) {
				var intersect = intersects[ 0 ];
				var face = intersect.face;
				console.log(intersect.faceIndex)
				if(((intersect.faceIndex * 9) + 9) < maps[currentBmap].v){
					maps[currentBmap].removeFaceByIndex(intersect.faceIndex)
					canTestPointCloud=false
				}
				
			}
			
			if(canTestPointCloud==true){
				var intersections = raycaster.intersectObjects( pointclouds );
				intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;
				toggle += clock.getDelta();
				if (  intersection !== null ) {
					maps[currentBmap].addVector3(intersection.point.clone())
					toggle = 0
					console.log("ADD VECTOR")
				}
			}
		}
	}
}



function newMap(){
	maps.push(new bmap());
	
	currentBmap = maps.length-1
	bMapGUI.addBMap(currentBmap);
	selectMap(currentBmap);
}

function selectMap(id){
	currentBmap = id;
	console.log('selectMap' + id);
	
	for(l=0;l<maps.length;l++){
		console.log("unfocus " + l)
		maps[l].unfocus()
		
	}
	maps[currentBmap].focus()
	bMapGUI.projectorToolsLoad()
}





//
bMapGui = function(){
	$('<div/>', {
    	id: 'bMapGui',
    	class: 'bMapGui',
    }).appendTo('body');
   
   
    
    $('<div/>', { id:'bMapGuiTools'}).addClass('bMapGuiTitle').appendTo("#bMapGui")
    $('<span/>').addClass('glyphicon glyphicon-plus').html("1").click(function(){ selectedCamera = camera;  controls.enabled = false; }).appendTo('#bMapGuiTools');
    $('<span/>').addClass('glyphicon glyphicon-plus').html("2").click(function(){ selectedCamera = cameraOrbital;  controls.enabled = true;}).appendTo('#bMapGuiTools');
    
    $('<div/>', { id:'bMapGuiToolBar'}).addClass('bMapGuiTitle').appendTo("#bMapGui")
    $('<span/>').addClass('glyphicon glyphicon-plus').html("+").click(function(){ newMap() }).appendTo('#bMapGuiToolBar');
    $('<span/>').addClass('glyphicon glyphicon-trash').html("-").click(function(){
    	purgeMapInstance();
    	// remove last layer
    	$('.bMapGuiLayer:last').remove()
    	// select first layer if exists
    	$('.bMapGuiLayer').removeClass('selectedBmapLayer');
    	
    	console.log(maps.length);
    	if(maps.length == 0){
    		currentBmap = -1;
    	}else{
    		$('.bMapGuiLayer:first').addClass('selectedBmapLayer');
    		$('.bMapGuiLayer:first').click();
    	}
    	
    }).appendTo('#bMapGuiToolBar');
    $('<span/>').addClass('glyphicon glyphicon-trash float-right').html("save").click(function(){saveScene()}).appendTo('#bMapGuiToolBar'); 
    
    $('<div/>').addClass('bMapGuiTitle selectedBmapLayer').html('Points').click(function(){if(bufferpoints.visible == true){bufferpoints.visible = false; $(this).removeClass('selectedBmapLayer'); }else{bufferpoints.visible=true; $(this).addClass('selectedBmapLayer');} }).appendTo("#bMapGui");
    
    this.addBMap = function(){
    	$('.bMapGuiLayer').removeClass('selectedBmapLayer');
		$('<div/>').addClass('bMapGuiLayer selectedBmapLayer').html('Layer ' + currentBmap).click(function(){ 
			console.log($(this).html())
			console.log($(this).html().replace("Layer ", ""))
			
			id = parseInt($(this).html().replace("Layer ", ""));
			selectMap(id); 
			$('.bMapGuiLayer').removeClass('selectedBmapLayer'); 
			$(this).addClass("selectedBmapLayer"); 
			}).appendTo("#bMapGui")
		
	}
	
	//
	
	
	$('<div/>', {
    	id: 'bMapGuiProjectorTools',
    	class: 'bMapGuiProjectorTools',
    }).appendTo('body');
    
    $('<div/>', { id:'bLightGuiTitle'}).html('Map Tools').addClass('bLightGuiTitle').appendTo("#bMapGuiProjectorTools")
    $('<div/>').html('position').addClass('bLightGuiTitle ptools bmapscale').click(function(){
    	$('.ptools').removeClass('selectedBmapLayer');
    	$(this).addClass('selectedBmapLayer');
    	maps[currentBmap].objControl.setMode( 'translate' );
    }).appendTo("#bMapGuiProjectorTools");
    $('<div/>').html('rotation').addClass('bLightGuiTitle ptools').click(function(){
    	$('.ptools').removeClass('selectedBmapLayer');
    	$(this).addClass('selectedBmapLayer');
    	maps[currentBmap].objControl.setMode( 'rotate' );
    }).appendTo("#bMapGuiProjectorTools");
    $('<div/>').html('scale').addClass('bLightGuiTitle ptools').click(function(){
    	$('.ptools').removeClass('selectedBmapLayer');
    	$(this).addClass('selectedBmapLayer');
    	maps[currentBmap].objControl.setMode( 'scale' );
    }).appendTo("#bMapGuiProjectorTools");
    
    
    $('#bMapGuiProjectorTools').hide();
    
    $("#bMapGuiProjectorTools input").focus(function(){ 
    	if(selectedCamera._name != "static"){
    		UIFocus = true;
			controls.enabled = false;
		}
	})
    
    this.projectorToolsLoad = function(){
    	$('.ptools').removeClass('selectedBmapLayer');
    	$('.bmapscale').addClass('selectedBmapLayer');
    	$('#bMapGuiProjectorTools').show();
   
    }
	
}

mapStart = -30

function saveScene(){
	// point cloud
	var exporter = new THREE.PLYExporter();
	options = {
	
	}
	var bmapScene = {}
	bmapScene.polygons = []
	bmapScene.frustrums = []
	bMapScene.camera = {}
	bMapScene.renderMap = {}
	// layers
	bMapScene.camera.fov
	bMapScene.camera.lookat = {x:0 ,y:0, z:0}
	bMapScene.camera.rotation = {x:0 ,y:0, z:0}
	bMapScene.camera.position = {x:0 ,y:0, z:0}
	var pointCloud = exporter.parse( scene, options );
	for (l=0;l<maps.length;l++){
		bmapScene.polygons.push(exporter.parse( scene, options ));
		bmapScene.frustums.push(exporter.parse( scene, options ));
	}
	//	
}



bmap = function(){
	this.group = new THREE.Group();
	this.name = uuidv4();
	this.frustFOV = 45;
	this.frustRatio = 4 / 3;
	this.frustPlane = width;
	mapStart = mapStart + 30
	this.frustPos = new THREE.Vector3(mapStart,-(height/2),width);
	this.frustRotation = new THREE.Vector3(20,10,0);
	
	this.frustH = this.frustPlane * Math.sin(THREE.Math.degToRad(this.frustFOV * 0.5));
	this.frustW = this.frustH * this.frustRatio;
	this.frustPoints = [
		new THREE.Vector3(),
		new THREE.Vector3( -this.frustW,  this.frustH, -this.frustPlane ),
		new THREE.Vector3(  this.frustW,  this.frustH, -this.frustPlane ),
		new THREE.Vector3( -this.frustW, -this.frustH, -this.frustPlane ),
		new THREE.Vector3(  this.frustW, -this.frustH, -this.frustPlane )
	];
	
	this.frustGeom = new THREE.BufferGeometry().setFromPoints(this.frustPoints);
	this.frustGeom.setIndex([0,1, 0, 2, 0, 3, 0, 4, 1, 2, 2, 4, 4, 3, 3, 1]);
	//this.frustGeom.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1));
	
	this.frustumHelper = new THREE.LineSegments(this.frustGeom, new THREE.LineBasicMaterial({color: 0xff0000}));
	this.frustumHelper.position.set(this.frustPos.x,this.frustPos.y,this.frustPos.z);
	//this.frustumHelper.rotation.set(this.frustRotation);
	this.frustumHelper.rotateX(THREE.Math.degToRad(this.frustRotation.x))
	this.frustumHelper.rotateY(THREE.Math.degToRad(this.frustRotation.y))
	this.frustumHelper.rotateZ(THREE.Math.degToRad(this.frustRotation.z))
	this.frustumHelper.updateMatrixWorld();
	//this.frustumHelper.lookAt(this.frustLookAt)
	this.group.add(this.frustumHelper);
	
	
	/* Bmap Poly select line */
	this.lineGeometry = new THREE.BufferGeometry();
	this.lineGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( 4 * 3 ), 3 ) );
	this.lineMaterial = new THREE.LineBasicMaterial( { color: 0xffffff, transparent: true } );
	this.line = new THREE.Line( this.lineGeometry, this.lineMaterial );
	this.group.add(this.line);


	this.texture = new THREE.TextureLoader().load( '/assets/1/img/UV_Grid_Sm.jpg');
	this.MAX_POINTS = 100000;
	this.bgeometry = new THREE.BufferGeometry();
	var positions = new Float32Array( this.MAX_POINTS * 3 ); 
	this.bgeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	this.material = new THREE.MeshBasicMaterial( { color: 0xffffff,  side: THREE.DoubleSide } );
	this.ProjectionMaterial = new THREE.ShaderMaterial({
	  	uniforms: {
	    	baseColor: {value: new THREE.Color(0xcccccc)},
	    	frustum: { value: [
	      	new THREE.Vector3(),
	        new THREE.Vector3(),
	        new THREE.Vector3(),
	        new THREE.Vector3(),
	        new THREE.Vector3(),
	        ]},
	      texture: {value:  this.texture}
	    },
	    vertexShader: `
	    	
	      varying vec4 vWorldPos;
	    	
	      void main() {
	        vWorldPos = modelMatrix * vec4(position, 1.0);
	        gl_Position = projectionMatrix * viewMatrix * vWorldPos;
	      }
	    `,
	    fragmentShader: `
	    	uniform vec3 baseColor;
	      uniform vec3 frustum[5];
	      uniform sampler2D texture;
	    	
	      varying vec4 vWorldPos;
	      
	      // port from https://github.com/mrdoob/three.js/blob/35ae830a7c4544582ed2759e5b18c5d6ef37c6d9/src/math/Vector3.js#L559
	      vec3 projectOnVector(vec3 a, vec3 b){
	      	float dist = length(b);
	        return b * ( dot(a, b) / (dist * dist) );
	      }
	      
	       void main() {
	      
	      	vec3 dir = vWorldPos.xyz - frustum[0];
	        vec3 center = (frustum[1] + frustum[2] + frustum[3] + frustum[4]) * 0.25;
	        vec3 frustumAxis = center - frustum[0];
	        
	        vec3 projected = projectOnVector(dir, frustumAxis);
	        float scalar = length(frustumAxis) / length(projected);
	        vec3 planeProj = ( dir * scalar ) + frustum[0];
	        
	        // UVs
	        vec3 uvBase = planeProj - frustum[1]; // from top-left corner
	        
	        vec3 sub12 = frustum[2] - frustum[1];
	        vec3 sub12uv = projectOnVector(uvBase, sub12);
	        float u = length(sub12uv) * sign(dot(sub12, sub12uv)) / length(sub12);
	        vec3 sub13 = frustum[3] - frustum[1];
	        vec3 sub13uv = projectOnVector(uvBase, sub13);
	        float v = length(sub13uv) * sign(dot(sub13, sub13uv)) / length(sub13);
	        v = 1. - v;
	        
	        vec3 color = ( max( u,v ) <= 1. && min( u, v ) >= 0. ) ? texture2D(texture, vec2(u, v)).rgb : vec3(1);
	      	
	      	gl_FragColor = vec4(baseColor * color, 1.0);
	      }
	    `,
	    side: THREE.DoubleSide
	});

	this.mesh = new THREE.Mesh( this.bgeometry, this.ProjectionMaterial );
	this.spheres = [];
	this.group.add( this.mesh );
	this.v = 0
	
	this.objControl = new THREE.TransformControls( cameraOrbital, renderer.domElement );
	this.objControl.attach(this.frustumHelper)
	this.objControl.addEventListener( 'dragging-changed', function ( event ) {
		controls.enabled = ! event.value;
	} );
	this.objControl.addEventListener( 'objectChange', function ( event ) {
		maps[currentBmap].updateProjection();
	} );
	this.group.add( this.objControl )
	scene.add( this.group )
	//objectChangeEvent
	
	this.updateProjection = function(){
		this.frustPoints.forEach( (p, idx) => {
			this.frustumHelper.localToWorld(this.ProjectionMaterial.uniforms.frustum.value[idx].copy(p));	
		});
	}
	this.updateProjection();
	
	this.editPoints = []
	
	this.focus = function(){
		this.objControl.setMode( 'translate' );
		this.frustumHelper.visible = true;
		this.objControl.visible = true;
		this.objControl.enable = true;
		
		for(j=0;j<this.editPoints.length;j++){
			this.editPoints[j].visible = true;
		}
	}
	
	this.unfocus = function(){
		
		this.frustumHelper.visible = false;
		this.objControl.visible = false;
		this.objControl.enable = false;
		
		for(j=0;j<this.editPoints.length;j++){
			this.editPoints[j].visible = false;
		}
	}
	
	
	this.addVector3 = function(vector){
		
		var sphereGeometry = new THREE.SphereBufferGeometry( 4, 32, 32 );
		var sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity:0.5, transparent:true } );
		
		this.editPoints.push(new THREE.Mesh( sphereGeometry, sphereMaterial ));
		this.editPoints[ this.editPoints.length - 1 ].position.copy( vector );
		this.editPoints[ this.editPoints.length - 1 ].name = uuidv4()
		editPoints.add( this.editPoints[ this.editPoints.length - 1 ]);
		
		var positions = this.mesh.geometry.attributes.position.array;
		positions[ this.v ++ ] = vector.x;
		positions[ this.v ++ ] = vector.y;
		positions[ this.v ++ ] = vector.z;
		
		this.mesh.geometry.attributes.position.needsUpdate = true;   
		this.mesh.geometry.setDrawRange( 0, parseInt((this.v+1)/3) );  
		this.mesh.geometry.computeBoundingSphere();
		
		//renderer.render(scene, camera);
	}
	
	this.purge = function(){
		
		for(j=0;j<this.editPoints.length;j++){
			//scene.remove(this.editPoints[j].name);
			editPoints.remove(scene.getObjectByName(this.editPoints[j].name))
		}
		
		for (var i = this.group.children.length - 1; i >= 0; i--) {
    		this.group.remove(this.group.children[i]);
		}
		this.group.children = [];
		scene.remove(scene.getObjectByName(this.name))
	}
	
	this.removeFaceByIndex = function(index){
		console.log("REMOVE FACE BY INDEX  : " + index)
		j = index*9;
		var positions = this.mesh.geometry.attributes.position.array;
		positions[ j ] = 0;//px
		positions[ j + 1 ] = 0;//py;
		positions[ j + 2 ] = 0;//pz
		
		positions[ j + 3 ] = 0;//px
		positions[ j + 4 ] = 0;//py;
		positions[ j + 5 ] = 0;//pz

		positions[ j + 6 ] = 0;//px
		positions[ j + 7 ] = 0;//py;
		positions[ j + 8 ] = 0;//pz

		j = index*3;
		this.editPoints[j].visible = false;
		this.editPoints[j+1].visible = false;
		this.editPoints[j+2].visible = false;
		editPoints.remove(scene.getObjectByName(this.editPoints[j].name))
		editPoints.remove(scene.getObjectByName(this.editPoints[j+1].name))
		editPoints.remove(scene.getObjectByName(this.editPoints[j+1].name))
		this.editPoints.splice(j, 3)
		
		/*for(k=(index*9);k<this.MAX_POINTS;k += 9){
			// delete editPoints j tp j+2
			
			if(j + 9 >= this.MAX_POINTS){
				positions[ k ] = 0;//px
				positions[ k + 1 ] = 0;//py;
				positions[ k + 2 ] = 0;//pz
				
				positions[ k + 3 ] = 0;//px
				positions[ k + 4 ] = 0;//py;
				positions[ k + 5 ] = 0;//pz
		
				positions[ k + 6 ] = 0;//px
				positions[ k + 7 ] = 0;//py;
				positions[ k + 8 ] = 0;//pz
			}else{
				positions[ k ] = positions[ k + 9 ];
				positions[ k + 1 ] = positions[ k + 1 + 9 ];
				positions[ k + 2 ] = positions[ k + 2 + 9 ];
				
				positions[ k + 3 ] = positions[ k + 3 + 9 ];
				positions[ k + 4 ] = positions[ k + 4 + 9 ];
				positions[ k + 5 ] = positions[ k + 5 + 9 ];
		
				positions[ k + 6 ] = positions[ k + 6 + 9 ];
				positions[ k + 7 ] = positions[ k + 7 + 9 ];
				positions[ k + 8 ] = positions[ k + 8 + 9 ];
				
			
			}
			this.v = this.v-9; 
			
		}*/
		this.mesh.geometry.attributes.position.needsUpdate = true;   
		this.mesh.geometry.setDrawRange( 0, parseInt((this.v+1)/3) );  
		this.mesh.geometry.computeBoundingSphere();
	}
	
	return this;
}


function purgeMapInstance(){
	maps[currentBmap].purge()
	maps.splice(currentBmap, 1)
	
	 
}

	
/** THREE JS */	
	
var container, stats;
var selectedCamera, camera, cameraOrbital, scene, renderer, controls;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var cube
var points, bufferpoints
var sphere;
var raycaster;
var mouse = new THREE.Vector2();
var toggle =0;
var clock;
var pointSize = 2;
var threshold = 4;
var kdtree;
var maps = []
var drawTriangle = []
var editPoints; // edit point group
var mapObjects


var bMapGUI
var UIFocus = false;
function initThree() {

	container = document.getElementById( 'three' ); 
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer();
	clock = new THREE.Clock();
	
	scene.add( new THREE.AmbientLight( 0x555555 ) );
				var light = new THREE.SpotLight( 0xffffff, 1.5 );
				light.position.set( 0, 500, 2000 );
				scene.add( light );
	
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
	
	camera = new THREE.PerspectiveCamera( 75, width/height, 0.1, 200000 );
	camera._name = "static"
	cameraOrbital = new THREE.PerspectiveCamera( 75, width/height, 0.1, 200000 );
	cameraOrbital._name = "orbital"
	controls = new THREE.OrbitControls( cameraOrbital , renderer.domElement);
	
	selectedCamera = camera;
	
	//controls.update();
	controls.enabled = false;

	//scene.add( new THREE.AxesHelper( 20 ) );
	
	raycaster = new THREE.Raycaster();
	raycaster.params.Points.threshold = threshold;
	
	//objControl = new THREE.TransformControls( cameraOrbital, renderer.domElement );
	//objontrol.addEventListener( 'change', render );

	
	
	container.addEventListener( 'mousemove', onDocumentMouseMove, false );
	container.addEventListener("keydown", onDocumentKeyDown, false);
	container.addEventListener("click", onThreeClick, false);
	animate();
	
	
	bMapGUI = new bMapGui()
	
}
	
function onDocumentMouseMove( event ) {
	event.preventDefault();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	
}

function onThreeClick( event ){
	if(UIFocus == true){
		UIFocus = true;
		if(selectedCamera._name != "static"){
			 controls.enabled = true;
		}
	}
	
	mapClick(event)
}


var xSpeed = 1;
var ySpeed = 1;

var radian = 0.01;

function onDocumentKeyDown(event) {
    var keyCode = event.which;
    console.log(keyCode)
    
    if (keyCode == 87) {
        camera.position.y += ySpeed;
    } else if (keyCode == 83) {
        camera.position.y -= ySpeed;
    } else if (keyCode == 65) {
       camera.position.x -= xSpeed;
    } else if (keyCode == 68) {
        camera.position.x += xSpeed;
    } else if (keyCode == 68) {
        camera.position.x += xSpeed;
    } else if (keyCode == 90) {
        camera.position.z -= xSpeed;
    } else if (keyCode == 88) {
        camera.position.z += xSpeed;
    } else if (keyCode == 32) {
        camera.position.set(0, 0, 0);
    }
    camera.lookAt(new THREE.Vector3(0,0,0));
};


animate = function () {
		requestAnimationFrame( animate );
		if(bufferpoints !== undefined){
			//if(controls.enabled == true){
				//cameraOrbital.lookAt(new THREE.Vector3(0,0,0));
				controls.target.set(0, 0, 0);
				controls.update();
			//}
		}
		
		
		if(isLoaded == true){
			raycaster.setFromCamera( mouse, selectedCamera );
			///console.log(pointclouds )
		    var canSelectPoint = true
		    if(currentBmap !== -1){
				var intersects = raycaster.intersectObject( maps[currentBmap].mesh );
				if ( intersects.length > 0 ) {
					var intersect = intersects[ 0 ];
					var face = intersect.face;
					if(((intersect.faceIndex * 9) + 9) < maps[currentBmap].v){
						var linePosition = maps[currentBmap].line.geometry.attributes.position;
						var meshPosition = maps[currentBmap].mesh.geometry.attributes.position;
						linePosition.copyAt( 0, meshPosition, face.a );
						linePosition.copyAt( 1, meshPosition, face.b );
						linePosition.copyAt( 2, meshPosition, face.c );
						linePosition.copyAt( 3, meshPosition, face.a );
						maps[currentBmap].mesh.updateMatrix();
						maps[currentBmap].line.geometry.applyMatrix( maps[currentBmap].mesh.matrix );
						maps[currentBmap].line.visible = true;
						canSelectPoint = false
					}
				} else {
					maps[currentBmap].line.visible = false;
				}
			}
			if(canSelectPoint == true){
				var intersections = raycaster.intersectObjects( pointclouds );
				intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;
				toggle += clock.getDelta();
				if (  intersection !== null ) {
					sphere.position.copy( intersection.point );
					toggle = 0 ;
					sphere.visible = true;
				}else{
					sphere.visible = false;
				}
			}else{
				sphere.visible = false;
			}
		
		}
		renderer.render( scene, selectedCamera );
		
};
	
function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}


function removeEntity(object) {
    var selectedObject = scene.getObjectByName(object.name);
    scene.remove( selectedObject );
    animate();
}

var objs = new Array();	

function createCurvePath(start, end, elevation) {
    var start3 = globe.translateCordsToPoint(start[0], start[1]);
    var end3 = globe.translateCordsToPoint(end[0], end[1]);
    var mid = (new LatLon(start[0], start[1])).midpointTo(new LatLon(end[0], end[1]));
    var middle3 = globe.translateCordsToPoint(mid.lat(), mid.lon(), elevation);

    var curveQuad = new (start3, middle3, end3);
    //   var curveCubic = new THREE.CubicBezierCurve3(start3, start3_control, end3_control, end3);

    var cp = new THREE.CurvePath();
    cp.add(curveQuad);
    //   cp.add(curveCubic);
    return cp;
}


yDistort = -250
xDistort = 0

function drawScene(){	
	var dataPoints = [];
	//translate(-width / 2, -height / 2);
	
	while(scene.children.length > 0){ 
    		scene.remove(scene.children[0]); 
	}
	
	
	wpath = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,0,0),new THREE.Vector3((width/2),0,yDistort),new THREE.Vector3(width,0,0) )  
	hpath = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,0,0),new THREE.Vector3(0,(height/2),xDistort),new THREE.Vector3(0,height,0)) 
	
	wpathPoints = wpath.getPoints(width)
	hpathPoints = hpath.getPoints(height)
		
	console.log(wpath)
	c=[]
	console.log(colors)
	for (y = 0; y < inputHeight; y += renderDetail) {
		planephase = 0.5 - (y - (inputHeight / 2)) / zskew;
		for (x = 0; x < inputWidth; x += renderDetail){
			
			if (!mask[y][x]) {
				if(!colors[y][x]){
					console.log(y, x)
				}
				//console.log(y, x)
				var luma = Math.round((colors[y][x][0] + colors[y][x][1] + colors[y][x][2]) * 0.3333);
				if(luma > 60){
			    	z = ((phase[y][x] - planephase) * zscale) + (wpathPoints[y].z) 
			   		dataPoints.push([y, x, z])
			   		c.push(colors[y][x]);
			   	}
			}
		}
	}
	
	//dataPoints = trimSoloPoints( dataPoints, 8 )
	mapObjects = new THREE.Group();
	
	pointsGeometry = new THREE.Geometry();
	
	var positions = new Float32Array( dataPoints.length * 3 );
	var colorz = new Float32Array( dataPoints.length * 3 );
	
	var points3d = []	
	for(i=0;i<dataPoints.length;i++){
		var star = new THREE.Vector3();
		
		star.set(dataPoints[i][0],dataPoints[i][1],dataPoints[i][2]);
		
		pointsGeometry.vertices.push(star);
		points3d.push(star)
		
		positions[i*3] = parseFloat(dataPoints[i][0]);
		positions[i*3+1] = parseFloat(dataPoints[i][1]);
		positions[i*3+2] = parseFloat(dataPoints[i][2]);
		colorz[i*3] =  parseFloat(c[i][0]/255)
		colorz[i*3+1] = parseFloat(c[i][1]/255)
		colorz[i*3+2] = parseFloat(c[i][2]/255)
	}
	
	
	cameraOrbital.position.set((width/2), (height/2), (width)); // Set position like this
	//cameraOrbital.lookAt(new THREE.Vector3(0,0,0));
	controls.update();
	
	camera.position.set(0, 0, ( width/100 * 90));
	// find closet data point on xy axis
	
	camera.lookAt(new THREE.Vector3(0,0,0));
	
	
	pointsBufferGeometry = new THREE.BufferGeometry().setFromPoints(points3d);
	pointsBufferGeometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( points3d.length * 3 ), 3 ) );
	var clr = new THREE.Color();
	for ( var i = 0; i < dataPoints.length; i ++ ) {
		clr.setRGB( c[i][0], c[i][1], c[i][2]);
		pointsBufferGeometry.attributes.color.setXYZ( i, clr.r, clr.g, clr.b );
	}
	
	//pointsBufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	pointsBufferGeometry.addAttribute( 'color', new THREE.BufferAttribute( colorz, 3 ) );
	pointsBufferGeometry.name = "pointsBufferGeometery";
	
	
	pointsGeometry.rotateZ( THREE.Math.degToRad(270) );
	pointsGeometry.translate(-(width /2), (	height / 2), 0);
	
	
	pointsBufferGeometry.rotateZ( THREE.Math.degToRad(270) );
	pointsBufferGeometry.translate(-(width /2), (height/2 ), 0);
	
	pointsGeometry.computeBoundingBox(); 
	pointsBufferGeometry.computeBoundingBox(); 
	
	bb = pointsBufferGeometry.boundingBox.clone();
	
	pointsBufferGeometryMaterial = new THREE.PointsMaterial( { size: pointSize, vertexColors: THREE.VertexColors, side: THREE.DoubleSide } );
	
	
	bufferpoints = new THREE.Points(pointsBufferGeometry, pointsBufferGeometryMaterial );
	mapObjects.add(bufferpoints);
	
	/*var box = new THREE.BoxHelper( bufferpoints, 0xffff00 );
	//box.scale.set( 0.2, 0.2, 0.2 );
	mapObjects.add( box );
	*/
	//var measureStart = new Date().getTime();

	// creating the kdtree takes a lot of time to execute, in turn the nearest neighbour search will be much faster
	//kdtree = new THREE.TypedArrayUtils.Kdtree( points, distanceFunction, 3 );
	//var imagePositionsInRange = kdtree.nearest( [ position.x, position.y, position.z ], 100, maxDistance );

	//console.log( 'TIME building kdtree', new Date().getTime() - measureStart );
	
	/* skinned */ 
	/*
	var indexDelaunay = Delaunator.from(
	  points3d.map(v => {
	    return [v.x, v.z];
	  })
	);
	
	var meshIndex = []; // delaunay index => three.js index
	for (let i = 0; i < indexDelaunay.triangles.length; i++){
	  meshIndex.push(indexDelaunay.triangles[i]);
	}
	
	toMeshGeometry = new THREE.BufferGeometry().setFromPoints(points3d);
	toMeshGeometry.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array( points3d.length * 3 ), 3 ) );
	var clr = new THREE.Color();
	for ( var i = 0; i < dataPoints.length; i ++ ) {
		clr.setRGB( c[i][0], c[i][1], c[i][2]);
		toMeshGeometry.attributes.color.setXYZ( i, clr.r, clr.g, clr.b );
	}
	toMeshGeometry.setIndex(meshIndex); // add three.js index to the existing geometry
	toMeshGeometry.computeVertexNormals();
	var mesh = new THREE.Mesh(
	  toMeshGeometry, 
	  meshMaterial
	);
	//mapObjects.add(mesh);
	*/
	pointclouds = [bufferpoints]
	
	

	/* MOUSE SPHERE */

	var sphereGeometry = new THREE.SphereBufferGeometry( 5, 32, 32 );
	var sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
	
	sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
	scene.add( sphere );
	isLoaded = true;
	
	editPoints = new THREE.Group();
	scene.add( mapObjects );
	scene.add( editPoints );

}
isLoaded = false;	






/* function source */
function testPointCoordinate(p1, p2, spray){
	b = false;
	if(p1 > p2){
		if((p1-p2) < spray){
			b = true;
		}
	}else if(p1 < p2){
		if((p2-p1) < spray){
			b = true;
		}
	}else if(p1 == p2){
		b = true;
	}
	return b;
}

function testPointCoordinates(p1, p2, spray){
	if(testPointCoordinate(p1[2],p2[2])){
		b = true;
	}
	return b;
}
	
function trimSoloPoints( dPoints, spray ){
	newPoints = []
	for (i=0;i<dPoints.length;i++){
		addPoint = false;
		for (j=0;j<dPoints.length;j++){
			if(i != j){
				if(!testPointCoordinates(dPoints[i], dPoints[j], spray)){
					addPoint = true;	
				}
			}
		}
		if(addPoint== true){
			newPoints.push(dPoints[i])
		}
	}
	console.log(x)
	return newPoints;
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


function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
