import os, json, jinja2
from flask import Flask, request, render_template_string, send_from_directory, redirect
Settings = {}
Error = []

def loadSettings(settingsJSON):
	if settingsJSON != None:
		Settings = json.loads(settingsJSON)
	else:
		Error.append("No Settings File For Plugin")



def render(artwork, user):
	global Error
	if len(Error) > 0 :
		out = "<h1>Errors :</h1>" + "<br />".join(Error)
		Error = []	
	else:
		out = "succesfully loaded plugin"
		if request.args.get('q') != None:		
			out = "q = " + request.args.get('q') 
		else:
			
			path = os.path.abspath(__file__)
			dir_path = os.path.dirname(path)
			with open(dir_path +'/template/template.html') as file_:
	    			template = jinja2.Template(file_.read())
			templateData = {}
			templateData['artwork'] = artwork
			templateData['user'] = user
			out = template.render(tmp=templateData)
	return out


	
