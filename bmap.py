import shutil, os, json, jinja2, base64
import uuid
from flask import Flask, request, render_template_string, send_from_directory, redirect, session
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
					#print str("img"+str(x))
					data = request.form.get(str("img"+str(x)))
					#print data
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

	
