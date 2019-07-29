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
	return Settings


def render(artwork, user, path, settings):
	currentTemplate = "template.html"
	global Error
	if len(Error) > 0 :
		out = "<h1>Errors :</h1>" + "<br />".join(Error)
		Error = []
		return out	
	else:
		auth = current_user.is_authenticated
		if path == "enter":
			auth = True
			path = 'setup'
		if path == 'livesurfaces':
			auth = True
		if path == 'islive':
			auth = True
		if path == 'getmapdata':
			auth = True
		if path == 'loadshader':
			auth = True
		if path == 'getdefaultplaylist':
			auth = True
		if path == 'getplaylist':
			auth = True
		if auth == True:
			templateData = {}
			templateData['artwork'] = artwork
			templateData['user'] = user
			templateData['URL'] = "/a/" + str(artwork.id)
			session["path"] = templateData['URL']
			if path != None:		
				templateData['section'] = path
				if path == 'getplaylists':
					#get the plalists from playlist directory
					directory = os.path.dirname(os.path.abspath(__file__)) + "/files/" + str(artwork.adminID) + "/bmap/" + str(artwork.id) + "/playlists"
					if not os.path.exists(directory):
						os.makedirs(directory)
					
					playListFiles = os.listdir(directory)
					playLists = []
					pattern = "*.json" 
					for playlist in playListFiles:
						if fnmatch.fnmatch(playlist, pattern):
							playLists.append(playlist.replace(".json", ""))
					
					return jsonify(playLists)
				if path == 'deleteplaylist':
					playlist = request.args.get("list")
					directory = os.path.dirname(os.path.abspath(__file__)) + "/files/" + str(artwork.adminID) + "/bmap/" + str(artwork.id) + "/playlists"
					playlistfile = directory + "/" + playlist + ".json"
					if os.path.exists(playlistfile) == True:
						os.remove(playlistfile)
						return '{ "response" : "playlist deleted" }'
					else:
						return '{ "response" : "playlist does not exist" }'
				if path == 'getplaylist':
					playlist = request.args.get("list");
					directory = os.path.dirname(os.path.abspath(__file__)) + "/files/" + str(artwork.adminID) + "/bmap/" + str(artwork.id) + "/playlists"
					playlistfile = directory + "/" + playlist + ".json"
					if os.path.exists(playlistfile) == True:
						return  send_file(playlistfile)
				if path == 'getdefaultplaylist':
					fileNamePath = os.path.dirname(os.path.abspath(__file__)) + "/files/" + str(artwork.adminID) + "/bmap/" + str(artwork.id) + "/playlists/defaultPlayList.txt"
					contents = ""
					if os.path.exists(fileNamePath) == True:
						with open(fileNamePath) as f:
							contents = f.read()
						
					return '{ "defalutPlayList" : "' + contents+ '" }'
				if path == 'defaultplaylist':
					fileNamePath = os.path.dirname(os.path.abspath(__file__)) + "/files/" + str(artwork.adminID) + "/bmap/" + str(artwork.id) + "/playlists/defaultPlayList.txt"
					playlist = request.args.get("list")
					directory = os.path.dirname(os.path.abspath(__file__)) + "/files/" + str(artwork.adminID) + "/bmap/" + str(artwork.id) + "/playlists"
					if os.path.exists(directory + "/" + playlist + ".json"):
						file = open(fileNamePath, 'w') 
						file.write(playlist) 
						file.close()
						return '{ "response" : "default playlist saved" }'
					else:
						return '{ "response" : "playlist does not exist" }'
					
				if path == 'saveplaylist':
					directory = os.path.dirname(os.path.abspath(__file__)) + "/files/" + str(artwork.adminID) + "/bmap/" + str(artwork.id) + "/playlists"
					if not os.path.exists(directory):
						os.makedirs(directory)
						
					playlist = request.form.get("list");
					plist = json.loads(playlist)
					print(plist)
					#if plist.has_key('title'):
					jsonFileNamePath = directory + "/" + plist['title'] + ".json"
					file = open(jsonFileNamePath, 'w') 
					file.write(playlist) 
					file.close()
					return '{ "respone" : "playlist saved" }'
					#else:
					#	return '{ "respone" : "bad request" }'
				
				print(path)
				if path == "savedataurltofile":
					directory = os.path.dirname(os.path.abspath(__file__)) + "/files/"+str(user.id)	+"/upload"
					
					if not os.path.exists(directory):
						os.makedirs(directory)
					
					
					imageFileNamePath = directory + "/" +  request.form.get("fileName"); 
					#print(request.form.get("fileData"), request.form.get("fileName"))
					convert_and_save(str(request.form.get("fileData")), imageFileNamePath)
					outFile = "/f/bmap/files/"+str(user.id)+"/upload/" +  request.form.get("fileName")
					return '{ "url" : "' + outFile + '" }'
				
				if path == 'setup':
					currentTemplate = "bMap.html"
				
				if path == 'shader':	
					currentTemplate = "shaderEdit.html"
					
				if path == "saveshader":
					directory = os.path.dirname(os.path.abspath(__file__)) + "/files/"+str(user.id)	+"/bmap/" + str(artwork.id) + "/shaders"
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
					
					allDir = os.path.dirname(os.path.abspath(__file__)) + "/files/"
					userDirs = os.listdir(allDir)
					
					for userDir in userDirs:
						shaderFile = os.path.dirname(os.path.abspath(__file__)) + "/files/"+str(userDir)+"/bmap/" + str(artwork.id) + "/shaders/"+str(shaderID)+".json";
						print(shaderFile)
						if os.path.exists(shaderFile) == True:
							f = open(shaderFile , "r")
							rdata = {}
							rdata["code"] = f.read()
							rdata['filename'] = shaderID
							return jsonify(rdata)
					
					
					
					rdata = {}
					rdata["code"] = "// item not found"
					rdata['filename'] = "None"
						
					return jsonify(rdata)
				if path == 'shaderimg':
					allDir = os.path.dirname(os.path.abspath(__file__)) + "/files/"
					userDirs = os.listdir(allDir)
					
					shaderID = request.args.get('i')
					
					for userDir in userDirs:
						shaderFile = os.path.dirname(os.path.abspath(__file__)) + "/files/"+str(userDir)+"/bmap/" + str(artwork.id) + "/shaders/"+str(shaderID);
						if os.path.exists(shaderFile) == True:
							return  send_file(shaderFile)
							
						
					return "Nothing is lost"
						
				if path == 'mapimg':
					allDir = os.path.dirname(os.path.abspath(__file__)) + "/files/"
					userDirs = os.listdir(allDir)
					
					mapID = request.args.get('i')
					
					for userDir in userDirs:
						mapFile = os.path.dirname(os.path.abspath(__file__)) + "/files/"+str(userDir)+"/bmap/" + str(artwork.id) + "/maps/"+str(mapID);
						if os.path.exists(mapFile) == True:
							return  send_file(mapFile)
							
						
					return "Nothing is lost"	
				if path == 'content':
					#loop through all 
					
					shaderDir = os.path.dirname(os.path.abspath(__file__)) + "/files/"+str(user.id)	+"/bmap/" + str(artwork.id) + "/shaders/"
					shaders = []
					if os.path.exists(shaderDir) == True:
						listOfFiles = os.listdir(shaderDir)
						pattern = "*.png"  
						for entry in listOfFiles:
							if fnmatch.fnmatch(entry, pattern):
								print (entry)
								shaders.append(entry)
					
					streamDir = os.path.dirname(os.path.abspath(__file__)) + "/files/"+str(user.id)	+"/bmap/" + str(artwork.id) + "/streams/"
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
				if path == 'cue':
					templateData['section'] = 'cue'
					directory = os.path.dirname(os.path.abspath(__file__)) + "/files/"+str(artwork.adminID)	+"/bmap/" + str(artwork.id) + "/maps"
					fileNamePath = directory + "/bmap.json"
					with open(fileNamePath) as file_:
						data = file_.read()
					jdata = json.loads(data)
					surfaces = []
					count = 0
					for polygon in jdata['polygons']:
						surfaces.append(count)
						count = count + 1
					
					templateData['surfaces'] = surfaces
					
					apps = []
					appsDir = os.path.dirname(os.path.abspath(__file__)) + "/template/static/apps"
					
					listOfFiles = os.listdir(appsDir)
					pattern = "*.js"  
					for entry in listOfFiles:
						if fnmatch.fnmatch(entry, pattern):
							print(entry)
							apps.append(entry)
					
					templateData['apps'] = apps
					
					
					allDir = os.path.dirname(os.path.abspath(__file__)) + "/files/"
					userDirs = os.listdir(allDir)
					shaders = []
					for userDir in userDirs:
						shaderDir = os.path.dirname(os.path.abspath(__file__)) + "/files/"+str(userDir)	+"/bmap/" + str(artwork.id) + "/shaders/"
						
						if os.path.exists(shaderDir) == True:
							print(userDir, user.id)
							if str(userDir) != str(user.id):
								listOfFiles = os.listdir(shaderDir)
								pattern = "*.png"  
								for entry in listOfFiles:
									if fnmatch.fnmatch(entry, pattern):
										print (userDir, entry)
										shaders.append(entry)
					
					
					templateData['shaders'] = shaders
					
					myshaders = []
					shaderDir = os.path.dirname(os.path.abspath(__file__)) + "/files/"+str(user.id)+"/bmap/" + str(artwork.id) + "/shaders/"
						
					if os.path.exists(shaderDir) == True:
						listOfFiles = os.listdir(shaderDir)
						pattern = "*.png"  
						for entry in listOfFiles:
							if fnmatch.fnmatch(entry, pattern):
								print (userDir, entry)
								myshaders.append(entry)
				
					templateData['myshaders'] = myshaders
					
				if path == 'futuresurfaces':
					directory = os.path.dirname(os.path.abspath(__file__)) + "/files/" + str(artwork.adminID) + "/bmap/" + str(artwork.id) + "/surfacefuture"
					if not os.path.exists(directory):
						os.makedirs(directory)
					
					
					date = request.form.get("date")
					data = request.form.get("json")
					
					fileNamePath = directory + "/" + date  +".json"
					
					file = open(fileNamePath, 'w') 
					file.write(data) 
					file.close() 
					
					return "Saved"
				if path == 'removecalendar':
					directory = os.path.dirname(os.path.abspath(__file__)) + "/files/" + str(artwork.adminID) + "/bmap/" + str(artwork.id) + "/surfacefuture/"
					filename = request.args.get('f');
					if os.path.exists(directory+filename) == True:
						os.remove(directory+filename)
					return "Done";
						
				if path == 'loadcalendar':	
					calendar = []
					directory = os.path.dirname(os.path.abspath(__file__)) + "/files/" + str(artwork.adminID) + "/bmap/" + str(artwork.id) + "/surfacefuture/"
					
					if os.path.exists(directory) == True:
						listOfFiles = os.listdir(directory)
						pattern = "*.json"  
						listOfFilesSorted = sorted(listOfFiles)
						for entry in listOfFilesSorted:
							if fnmatch.fnmatch(entry, pattern):
								dateTime = {}
								dateTime["file"] = entry
								f = open(directory + entry , "r")
								dateTime["data"] = json.loads(f.read())
								calendar.append(dateTime)
				
					return jsonify(calendar)
				
				if path == 'livesurfaces':
					directory = os.path.dirname(os.path.abspath(__file__)) + "/files/" + str(artwork.adminID) + "/bmap/" + str(artwork.id) + "/live"
					if not os.path.exists(directory):
						os.makedirs(directory)
					
					fileNamePath = directory + "/live.json"
					data = request.form.get("json")
					file = open(fileNamePath, 'w') 
					file.write(data) 
					file.close() 
					return "Saved"
					
				if path == 'islive':
					# isle requirers a has of server current time
					
					if request.args.get('t') == None:
						return 'none'
					else:
						mtime = int(request.args.get('t'))
					
					# search calendar based on date time file entries in 
					directory = os.path.dirname(os.path.abspath(__file__)) + "/files/" + str(artwork.adminID) + "/bmap/" + str(artwork.id) + "/surfacefuture/"
					lastTime = 0;
					theFile = "";
					if os.path.exists(directory) == True:
						listOfFiles = os.listdir(directory)
						pattern = "*.json"  
						listOfFilesSorted = sorted(listOfFiles)
						
						deleteList = []
						for entry in listOfFilesSorted:
							if fnmatch.fnmatch(entry, pattern):
								mentry = int(entry.replace(".json", ""))
								if(mtime > mentry):
									deleteList.append(entry)
								if(mtime > lastTime):
									#readfile and make 
									f = open(directory + entry , "r")
									d = json.loads(f.read())
									v = 0
									for z in d:
										
										if z['surfaceLink'] == '':
											
											v = 1
											break
											
									if v == 1:
										deleteList.append(entry)
									else:
										if(mtime < mentry):
											#lastTime = mentry
											break
									
								lastTime = mentry
								
						theFile = directory + str(lastTime) + ".json"
						#deleteList.pop()
						
						
						for delItem in deleteList:
							print(directory + delItem)
							if os.path.exists(directory + delItem) == True:
								os.remove(directory + delItem)
						
							
					directory = os.path.dirname(os.path.abspath(__file__)) + "/files/" + str(artwork.adminID) + "/bmap/" + str(artwork.id) + "/live"
					fileNamePath = directory + "/live.json"
					if os.path.exists(fileNamePath) == True:
						mtime = os.path.getmtime(fileNamePath) 
						if(mtime > lastTime):
							f = open(fileNamePath , "r")
							rdata = f.read()
						else:
							if theFile == "":
								rdata = 'none'
							else:
								f = open(theFile , "r")
								rdata = f.read()
					else:
						if theFile == "":
							rdata = 'none'
						else:
							f = open(theFile , "r")
							rdata = f.read()
						
						
					return rdata
			else:
				if not hasattr(templateData, 'section'):
					return redirect(templateData['URL'] + '/cue')

			
			
			
			directory = os.path.dirname(os.path.abspath(__file__)) + "/files/"+str(artwork.adminID)	+"/bmap/" + str(artwork.id) + "/maps"
			if templateData['section'] == "getmapdata":
			 	fileNamePath = directory + "/bmap.json"
			 	with open(fileNamePath) as file_:
			 		data = file_.read()
			 	return data
			
			elif templateData['section'] == "datatofile":
				#if os.path.exists(directory):
				#	shutil.rmtree(directory)
				
				#os.makedirs(directory)
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
			return settings["indexHTML"]#redirect('/user/sign-in')





def convert_and_save(b64_string, imgPath):
	header, encoded = b64_string.split(",", 1)
	encoded += '=' * (-len(b64_string) % 4)  # restore stripped '='s
	
	with open(imgPath, "wb") as fh:
		fh.write(base64.b64decode(encoded))

	
