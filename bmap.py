import shutil, os, json, jinja2, base64, fnmatch, uuid
from flask import Flask, request, render_template_string, send_from_directory, send_file, redirect, session, jsonify
from flask_user import current_user, login_required, roles_required, UserManager, UserMixin
Settings = {}
Error = []

def loadSettings(settingsJSON):
	if settingsJSON != None:
		Settings = json.loads(settingsJSON)
	else:
		Error.append("No Settings File For Plugin")



def render(artwork, user, path):
	currentTemplate = "template.html"
	global Error
	if len(Error) > 0 :
		out = "<h1>Errors :</h1>" + "<br />".join(Error)
		Error = []
		return out	
	else:
		templateData = {}
		templateData['artwork'] = artwork
		templateData['user'] = user
		templateData['URL'] = "/a/" + str(artwork.id)
		session["path"] = templateData['URL']
		if path != None:		
			templateData['section'] = path
			if path == 'setup':
				currentTemplate = "bMap.html"
			if path == 'removestream':
				streamID = request.args.get('s')
				streamFile = os.path.dirname(os.path.abspath(__file__)) + "/files/"+str(user.id)+"/bmap/streams/"+str(streamID)+".json";
				if os.path.exists(streamFile) == True:
					os.remove(streamFile)
				return redirect("/a/" + str(artwork.id) + '/content')
			
			if path == 'stream':
				streamID = request.args.get('s')
				streamFile = os.path.dirname(os.path.abspath(__file__)) + "/files/"+str(user.id)+"/bmap/streams/"+str(streamID)+".json";
				if os.path.exists(streamFile) == True:
					print("x")
					f = open(streamFile , "r")
					x= f.read()
					e = json.loads(x)
				else:
					e = {}
					e["url"] = ""
					e["type"] = ""
					e["id"] = ""
				templateData['stream'] = e	
				currentTemplate = "template.html"
				
			if path == 'addstream':
				directory = os.path.dirname(os.path.abspath(__file__)) + "/files/"+ str(user.id)	+"/bmap/streams"
				if not os.path.exists(directory):
					os.makedirs(directory)
				print(request.form['url'])
				rdata = {}
				rdata["url"] = request.form['url']
				rdata["type"] = request.form['type']
				if(request.form['id'] == ''):
					shaderID = str(uuid.uuid4())
				else:
					shaderID = request.form['id']
				rdata["id"] = shaderID
				_json = json.dumps(rdata)
				jsonFileNamePath = os.path.dirname(os.path.abspath(__file__)) + "/files/"+ str(user.id) +"/bmap/streams/"+str(shaderID)+".json";
				file = open(jsonFileNamePath, 'w') 
				file.write(_json) 
				file.close() 
				return redirect("/a/" + str(artwork.id) + '/content')
				
				
			if path == 'shader':	
				currentTemplate = "shaderEdit.html"
			if path == "saveshader":
				directory = os.path.dirname(os.path.abspath(__file__)) + "/files/"+str(user.id)	+"/bmap/shaders"
				if not os.path.exists(directory):
					os.makedirs(directory)
				data = request.get_json(force=True)
				
				if str(data["filename"]) == str("None"):
					shaderID = str(uuid.uuid4())
				else:
					shaderID = str(data["filename"])
				
				#print(str(request.form.get("code")))
				jsonFileNamePath = directory + "/" + shaderID + ".json"
				imageFileNamePath = directory + "/" + shaderID + ".png"
				file = open(jsonFileNamePath, 'w') 
				file.write(data["code"]) 
				file.close() 
				convert_and_save(str(data["image"]), imageFileNamePath)
				rdata = {}
				rdata["code"] = data["code"]
				rdata['filename'] = shaderID
				
				return shaderID
			if path == 'loadshader':
				shaderID = request.args.get('h')
				shaderFile = os.path.dirname(os.path.abspath(__file__)) + "/files/"+str(user.id)	+"/bmap/shaders/"+str(shaderID)+".json";
				print(shaderFile)
				if os.path.exists(shaderFile) == True:
					f = open(shaderFile , "r")
					rdata = {}
					rdata["code"] = f.read()
					rdata['filename'] = shaderID
				else:
					rdata = {}
					rdata["code"] = "// item not found"
					rdata['filename'] = "None"
					
				return jsonify(rdata)
			if path == 'shaderimg':
				shaderID = request.args.get('i')
				shaderFile = os.path.dirname(os.path.abspath(__file__)) + "/files/"+str(user.id)+"/bmap/shaders/"+str(shaderID);
				if os.path.exists(shaderFile) == True:
					return  send_file(shaderFile)
				else:
					return "Nothing is lost"	
					
			if path == 'content':
				shaderDir = os.path.dirname(os.path.abspath(__file__)) + "/files/"+str(user.id)	+"/bmap/shaders/"
				shaders = []
				if os.path.exists(shaderDir) == True:
					listOfFiles = os.listdir(shaderDir)
					pattern = "*.png"  
					for entry in listOfFiles:
						if fnmatch.fnmatch(entry, pattern):
							print (entry)
							shaders.append(entry)
				
				streamDir = os.path.dirname(os.path.abspath(__file__)) + "/files/"+str(user.id)	+"/bmap/streams/"
				streams = []
				if os.path.exists(streamDir) == True:
					listOfFiles = os.listdir(streamDir)
					pattern = "*.json"  
					for entry in listOfFiles:
						if fnmatch.fnmatch(entry, pattern):
							f = open(streamDir + entry , "r")
							print (streamDir + entry)
							x= f.read()
							e = json.loads(x)
							streams.append(e)
					
				templateData['shaders'] = shaders
				templateData['streams'] = streams
		else:
			templateData['section'] = 'que'
		
		
		
		if current_user.is_authenticated == True:
			directory = os.path.dirname(os.path.abspath(__file__)) + "/files/"+str(user.id)	+"/bmap/maptemp"
			if templateData['section'] == "getmapdata":
			 	fileNamePath = directory + "/bmap.json"
			 	with open(fileNamePath) as file_:
			 		data = file_.read()
			 	return data
			
			elif templateData['section'] == "datatofile":
				if os.path.exists(directory):
					shutil.rmtree(directory)
				
				os.makedirs(directory)
				fileNamePath = directory + "/bmap.json"
				data = request.form.get("data")
				
				file = open(fileNamePath, 'w') 
				file.write(data) 
				file.close() 
				return "Done"
			
			
			elif templateData['section'] == "dataurltofile":
				
				if os.path.exists(directory):
					shutil.rmtree(directory)
				
				os.makedirs(directory)
				p = []
				for x in range(5):
					fileNamePath = directory + "/phase" + str(x) + ".png"
					p.append(fileNamePath)
					data = request.form.get(str("img"+str(x)))
					convert_and_save(data, fileNamePath)
				return "Done"
			else:
				
				path = os.path.abspath(__file__)
				dir_path = os.path.dirname(path)
				templateData['alerts'] = render_template_string("""{% extends "alerts.html" %}""")			
				with open(dir_path +'/template/' + currentTemplate) as file_:
			    		template = jinja2.Template(file_.read())
				
				out = template.render(tmp=templateData)
				return out			
		else:
			return redirect('/user/sign-in')





def convert_and_save(b64_string, imgPath):
	header, encoded = b64_string.split(",", 1)
	encoded += '=' * (-len(b64_string) % 4)  # restore stripped '='s
	
	with open(imgPath, "wb") as fh:
		fh.write(base64.b64decode(encoded))

	
