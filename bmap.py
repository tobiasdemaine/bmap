import os, json, jinja2
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
		else:
			templateData['section'] = 'que'
		
		if current_user.is_authenticated == True:
			currentTemplate = "template.html"
			path = os.path.abspath(__file__)
			dir_path = os.path.dirname(path)
			templateData['alerts'] = render_template_string("""{% extends "alerts.html" %}""")			
			with open(dir_path +'/template/' + currentTemplate) as file_:
		    		template = jinja2.Template(file_.read())
			
			out = template.render(tmp=templateData)
			return out			
		else:
			return redirect('/user/sign-in')

		


	
