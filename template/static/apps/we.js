var we = function() {
    this.init = function (data) {
        this.url = "/a/5/"
		this.faceType = data.faceType;
		this.latitude = data.latitude;
		this.longitude = data.longitude; 
		this.halfBoundKm = data.halfBoundKm;
	
		this.width = 1024;
		this.height = 768;
	
		this.renderer = new THREE.WebGLRenderer();
		this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height); // texture size
	
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 45, this.width / this.height, 1, 1000 );
		this.scene.add(this.camera)
        this.camera.position.set(0,0,255)
		this.camera.lookAt(0,0,0)
		this.ambientLight = new THREE.AmbientLight( 0x555555 ) 
		this.scene.add(this.ambientLight );
		this.spotlight = new THREE.SpotLight( 0xffffff, 1.5 );
		this.spotlight.position.set( 0, 500, 2000 );
		this.scene.add( this.spotlight );
        this.models = {}
	    this.getFileList()
		this.cameraPositions = []
		this.cameraPositions.push(new THREE.Vector3(0,0,255));
		this.cameraPositions.push(new THREE.Vector3(0,50,255));
		this.cameraPositions.push(new THREE.Vector3(50,0,255));
		this.cameraPositions.push(new THREE.Vector3(-50,0,255));
		this.scene.background = new THREE.Color( 0x000000 );
		this.cameraTween();
        // start loading model
		this.shaderMaterial = new THREE.ShaderMaterial({
			  uniforms: {
				  texture0: {type: 't', value: null},
				  texture1: {type: 't', value: null},
				  step : {value: null},
				  positionTo : {type:'v3', value: null}
			  },
			  vertexShader: `
				attribute vec3 positionTo;
				uniform float step;
				varying vec2 texCoord0;
				void main() {
					texCoord0 = uv;
					vec3 morphed = vec3( 0.0 , 0.0 , 0.0 );
					morphed = ( positionTo - position ) * step;
					morphed += position;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( morphed, 1.0 );
				}
			  `,
			  fragmentShader: `
				uniform sampler2D texture0;
				uniform sampler2D texture1;
				uniform float step;
				varying vec2 texCoord0;
				void main() {
					vec4 texel0 = texture2D(texture0, texCoord0);
					vec4 texel1 = texture2D(texture1, texCoord0);
					gl_FragColor = texel0 * step + texel1 * (1.0-step);
				}
			  `,
			});
		
	}
	
	
	this.cameraTween=function(){
		this.cameraPosition = this.cameraPositions[ Math.floor(this.cameraPositions.length * Math.random()) ]
		var that = this;
  		this.tween = new TWEEN.Tween( this.camera.position )
		.to( {
			x: this.cameraPosition.x,
			y: this.cameraPosition.y,
			z: this.cameraPosition.z}, 400 
		   )
		.onUpdate(function(){
			that.camera.lookAt(0,0,-50)
}		)
		.onComplete(function(){
			that.cameraTween()
		})
		.start();
	}
	
	this.currentMesh = false;
	this.morphTarget = false;
	this.workerMesh = false;
	this.morphStep = 0
	this.renderTexture = function(){
		if(this.currentMesh == false){
			var keys = Object.keys(this.models)
			rand = keys[ keys.length * Math.random() << 0]
			if(typeof(this.models[rand].mesh) != 'undefined'){
				this.currentMesh = this.models[rand].mesh
				this.currentMesh.visible = false;
				this.workerMesh = new THREE.Mesh(this.currentMesh.geometry, this.shaderMaterial);
				this.scene.add(this.workerMesh)
			}
		}
		if(this.morphTarget == false){
			var keys = Object.keys(this.models)
			rand = keys[ keys.length * Math.random() << 0]
			if(typeof(this.models[rand].mesh) != 'undefined'){
				this.morphTarget = this.models[rand].mesh
    			this.morphTarget.visible = false;
				this.morphTarget.geometry.verticesNeedUpdate = true;
			}
		}
		if(this.currentMesh != false){
			if(this.morphTarget != false){
				if(this.morphStep == 0){
					this.currentMesh.geometry.addAttribute('positionTo' , this.morphTarget.geometry.attributes.position.clone());
					this.morphTarget.geometry.verticesNeedUpdate = true;
					this.shaderMaterial.uniforms.texture0.value = this.currentMesh.material.map;
					this.shaderMaterial.uniforms.texture1.value = this.morphTarget.material.map;
					this.shaderMaterial.uniforms.step.value = 0
					this.shaderMaterial.needsUpdate = true;
					this.workerMesh.geometry = this.currentMesh.geometry
					this.workerMesh.material.map = this.currentMesh.material.map
				}
				this.shaderMaterial.uniforms.step.value = this.morphStep
				this.shaderMaterial.needsUpdate = true;
				renderer.render(this.scene, this.camera, this.renderTarget);
				this.morphStep = this.morphStep + 0.05
				if(this.morphStep >= 1){
					this.morphStep = 0
					this.currentMesh.visible=false;
					this.scene.remove(this.currentMesh);
					this.currentMesh.geometry.dispose();
					this.currentMesh.material.dispose();
					this.currentMesh = undefined;
					this.currentMesh = this.morphTarget;
					this.morphTarget = false;
				}	
			}
		}
        TWEEN.update();
        return this.renderTarget;
	}
	
	
	this.reindexGeometry = function(geometryTmp){
		const vertices  = geometryTmp.getAttribute("position");
		const normals  = geometryTmp.getAttribute("normal");
		const uv  = geometryTmp.getAttribute("uv");
		let verticesTmp = new Float32Array(3 * geometryTmp.index.array.length);
		let normalTmp = new Float32Array(3 * geometryTmp.index.array.length);
		let j = 0;
		for(let i = 0; i < verticesTmp.length; i += 3) {
			let index = geometryTmp.index.array[j];
			verticesTmp[i] = vertices.getX(index);
			verticesTmp[i+1] = vertices.getY(index);
			verticesTmp[i+2] = vertices.getZ(index);

			normalTmp[i] = normals.getX(index);
			normalTmp[i+1] = normals.getY(index);
			normalTmp[i+2] = normals.getZ(index);
			j++;

		}

		let newGeomtry = new THREE.BufferGeometry();
		newGeomtry.addAttribute( 'position', new THREE.BufferAttribute( verticesTmp, 3 ) );
		newGeomtry.addAttribute( 'normal', new THREE.BufferAttribute( normalTmp, 3 ) );
		newGeomtry.drawRange = geometryTmp.drawRange;
		return(newGeomtry);  
	}
	
	this.loadModel = function(thatis, modelPATH){
		var loader = new THREE.GLTFLoader();
		console.log(modelPATH)
		var that = thatis
		var root = this
		loader.load(this.url+"loadFace?file="+modelPATH, function (gltf, e) {
			//console.log(gltf)
			gltf.scene.traverse( function ( child ) {
	     		if ( child.isMesh ) {
	     			//child.castShadow = true;
	      			//child.receiveShadow = true;
	      			child.material.side = THREE.DoubleSide;
				}
		 	});
		
			that.loaded = true;
			that.gltf = gltf;
			that.mesh = that.gltf.scene.children[0]	
			root.scene.add(that.mesh)
			that.mesh.visible = false;
		});
	}
	
	this.getFileList = function(){
		facelisturl = this.url + this.faceType; 
		
		data = { latitude: this.latitude, 
				longitude: this.longitude,
				halfBoundKm: this.halfBoundKm } 
		var that = this;
		$.getJSON( facelisturl, data).done(function( files ) {
			var keys = Object.keys(that.models)
			out = keys.length
			
			if(keys.length >= 100){
				// purg keys down to 75
				out = keys.length - 75
				for(i=0; i < out; i++){
					
					if(that.models[keys[i]].mesh.uuid == that.currentMesh.uuid){
						out++;
					}else if(that.models[keys[i]].mesh.uuid == that.morphTarget.uuid){
						out++;
					}else{
						delete that.models[keys[i]];
					}
				}
			}
            for(e in files){
		  		isNew = true;
				for(z in that.models){
		  			if(z == files[e]){
		  				isNew == false
		  				break;
		  			}
		  		}
		  		if(isNew == true){
					that.models[files[e]] = { 'loaded':false }
					that.loadModel(that.models[files[e]], files[e]);
		  		}
		  	}
		}).fail(function( jqxhr, textStatus, error ) {
		    var err = textStatus + ", " + error;
		    console.log( "Request Failed: " + err );
		});
		setTimeout(this.getFileList.bind(this), (60000*2));
	}
	
	
    
    this.configGUI = function(values){
            // create the background
            var docHeight = $(document).height();

            $("body").append("<div id='appConfigOverlay'><div id='appConfigDialog'></div>");
           
            $("#appConfigOverlay").css({
                'position': 'fixed',
                'width':'100%',
                'height':'100%',
                'top': 0,
                'left': 0,
                'background-color': 'rgba(0,0,0,0.5)',
                'width': '100%',
                'z-index': 5000
              });
            
            $("#appConfigDialog").css({
                'position': 'absolute',
                'top': '50%',
                'left': '50%',
                'transform': 'translate(-50%, -50%)',
                'background-color': 'rgba(254, 254, 254, 0.9)',
                'width': '80%',
                'padding': '20px',
                'border-radius': '10px'
            })

            $("#appConfigDialog").append("<h3>WE Config</h3>")
            $("#appConfigDialog").append("<div class='form-group'><label for='weTypeSelect'>Type</label><SELECT id='weTypeSelect' class='form-control'>"+"<option value='WeFace'>WeFace</option>" +
                "<option value='AdultFace'>AdultFace</option>" +
                "<option value='AdultAndrogynousFace'>AdultAndrogynousFace</option>" +
                "<option value='AdultMaleFace'>AdultMaleFace</option>" +
                "<option value='AdultFemaleFace'>AdultFemaleFace</option>" +
                "<option value='ChildFace'>ChildFace</option>" +
                "<option value='ChildMaleFace'>ChildMaleFace</option>" +
                "<option value='ChildFemaleFace'>ChildFemaleFace</option>" +
                "</select></div>")
            $("#appConfigDialog").append("<div class='form-group'><label for='weLatitudeSelect'>Latitude</label><input type='text' id='weLatitudeSelect' class='form-control' value='0'></div>");
            $("#appConfigDialog").append("<div class='form-group'><label for='weLongitudeSelect'>Longitude</label><input type='text' class='form-control' id='weLongitudeSelect' value='0'></div>");
            $("#appConfigDialog").append("<div class='form-group'><label for='weHalfBoundKm'>Half Bound in Km</label><input type='text' class='form-control' id='weHalfBoundKm' value='0'></div>");
            $("#appConfigDialog").append("<button class='btn btn-primary mb-2' id='weSetButton'>Set We Config</button>");
        
            if(typeof(values)!="undefined"){
                //values can be loaded in
                for (v in values){
                    if(v == 'faceType'){
                        $("#weTypeSelect").val(values[v]);
                    }
                    if(v == 'latitude'){
                        $("#weLatitudeSelect").val(values[v]);
                    }
                    if(v == 'longitude'){
                         $("#weLongitudeSelect").val(values[v]);
                    }
                    if(v == 'halfBoundKm'){
                        $("#weHalfBoundKm").val(values[v]);
                    }
                }
            }
            
            $("#weSetButton").click(function(e){
                
                faceType = $("#weTypeSelect").val();
                latitude = $("#weLatitudeSelect").val();
                longitude = $("#weLongitudeSelect").val();
                halfboundkm = $("#weHalfBoundKm").val();
                errors = '';
                if(latitude==""){
                   error = errors + 'Latitude Required\n';
                }
                if(longitude==""){
                   error = errors + 'Longitude Required\n';
                }
                if(halfboundkm==""){
                   error = errors + 'Half Bound in Km';
                }
                if(errors != ''){
                   alert(errors)
                }else{
                    cfg = { 
                        'faceType' : faceType,
                        'latitude' : latitude,
                        'longitude' : longitude,
                        'halfBoundKm' : halfboundkm
                    }
                    $("#weSetButton").unbind('click');
                    $("#appConfigOverlay").remove();
                    // calls  function to store initData
                    appSetLoadParamsFromConfig(cfg);
                }
            });
        
        console.log("GUI SHOW")
        
    }
	
}
//we.init("WeFace", 0, 0, 0)
//we.init("WeFace", latitude, longitude, halfBoundKm)
//we.texture >> WE.renderTarget.texture