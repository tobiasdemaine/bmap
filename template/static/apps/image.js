var image = function() {
    this.init = function (data) {
		this.url = data.imgURL;
		this.texture = new THREE.TextureLoader().load( this.url );
	}
	this.renderTexture = function(){
		return this.texture;
	}
	this.configGUI = function(values){
		console.log(values)
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
			'background-color': 'rgba(0, 0, 0, 0.7)',
			'width': '80%',
			'padding': '20px',
			'border-radius': '10px'
		})

		$("#appConfigDialog").append("<h3 style='font-weight:100;'>Image as Texture Config</h3>");
		// image uploader
		$("#appConfigDialog").append("<div id='currentImage'></div>");
		$("#appConfigDialog").append("<div class='form-group'><label for='externalImage'>Select Image </label><input type='file' class='form-control' accept='image/x-png,image/jpeg' id='externalImage'></div>");
		$("#appConfigDialog").append("<div><input type='text' id='imgURL' style='width:100%; background-color: #333; color: white; border-color: black;' readonly></div>");
		$("#appConfigDialog").append("<button class='btn btn-primary mb-2' id='imageUploadButton'>Set Image</button>");
		
		if(typeof(values)!="undefined"){
            //values can be loaded in
            for (v in values){
				 if(v == 'imgURL'){
				 	 $("#currentImage").html("<img src='"+values[v]+"' style='height:100px;'>")
					 $('#imgURL').val(values[v])
				 }
			}
		}
		
		$('#externalImage').on('change', function () {
			var fileReader = new FileReader();
			var _fileName = ""
			fileReader.onload = function () {
				var data = fileReader.result;  // data <-- in this var you have the file data in Base64 format
				fdata = { fileName : _fileName, fileData :fileReader.result }
				url = window.location.href.split("/cue")[0]+'/savedataurltofile';
				$.post( url, fdata, function( jdata ) {
				 	$('#imgURL').val(jdata.url)
					$("#currentImage").html("<img src='"+jdata.url+"' style='height:100px;'>")
				}, 'json');
			};
			fileName = $('#externalImage').prop('files')[0].name;
			var idxDot = fileName.lastIndexOf(".") + 1;
        	var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
        	if (extFile=="jpg" || extFile=="jpeg" || extFile=="png"){
            	//TO DO
				_fileName = getUUID() + "." + extFile;
				fileReader.readAsDataURL($('#externalImage').prop('files')[0]);
        	}else{
            	alert("Only jpg/jpeg and png files are allowed!");
        	}   
			
		});
		
		$("#imageUploadButton").click(function(e){
                
			_imgURL = $("#imgURL").val();
			console.log("'"+_imgURL+"'")
			errors = '';
			if(_imgURL == ''){
			   errors = errors + 'IMAGE URL REQUIRED\n';
			}
			 if(errors != ''){
			   alert(errors)
			}else{
				_cfg = { 
					'imgURL' : _imgURL
				}
				$("#imageUploadButton").unbind('click');
				$("#appConfigOverlay").remove();
				// calls  function to store initData
				console.log(_cfg)
				appSetLoadParamsFromConfig(_cfg);
			}
        });
	}
	getUUID = function() {
		// http://www.ietf.org/rfc/rfc4122.txt
		var s = [];
		var hexDigits = "0123456789abcdef";
		for (var i = 0; i < 36; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
		s[8] = s[13] = s[18] = s[23] = "-";

		var uuid = s.join("");
		return uuid;
	}
}
