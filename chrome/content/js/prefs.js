var Ushahidi_Options = {
	
	load : function() {
		
		logger.log("Loading Preferences");
		
		const prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		const branch = prefService.getBranch("extensions.ushahidi.deployments.");

		// List of deployments
		var names = branch.getChildList("name.", {});
		for (var i = 0; i < names.length; i++) {
			Ushahidi_Options.addToDeploymentList(
				branch.getCharPref("name." + i),
				branch.getCharPref("url." + i),
				branch.getCharPref("reports." + i));
		}
	},

	save : function() {
		logger.log("Start Saving Deployment");
		const prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		const branch = prefService.getBranch("extensions.ushahidi.");
 
		// Remove all deployments first ...	
		branch.deleteBranch("deployments.name");
		branch.deleteBranch("deployments.url");
		branch.deleteBranch("deployments.reports");

		// and add them again
		var deploymentList = document.getElementById("Ushahidi-Opt-Deployments");
		var deployments = deploymentList.getElementsByTagName("listitem");
		for (var i = 0; i < deployments.length; i++) {
			var items = deployments[i].childNodes;
			branch.setCharPref("deployments.name." + i, items[0].getAttribute("label"));
			branch.setCharPref("deployments.url." + i, items[1].getAttribute("label"));
			branch.setCharPref("deployments.reports." + i, 0);
		}
		
		logger.log("End Saving Deployment");
	},

	addOrEditDeployment : function() {
		if (document.getElementById("Ushahidi-Opt-AddEditName").value != ""
			&& document.getElementById("Ushahidi-Opt-AddEditUrl").value != "") {
			
			Ushahidi_Options.addToDeploymentList(
				document.getElementById("Ushahidi-Opt-AddEditName").value,
				document.getElementById("Ushahidi-Opt-AddEditUrl").value, 0); 
		}
	},

	addToDeploymentList : function(name, url, reports) {
		const prefService = Components.classes["@mozilla.org/preferences-service;1"]
																	.getService(Components.interfaces.nsIPrefService);
		const branch = prefService.getBranch("extensions.ushahidi.");
		var deploymentList = document.getElementById("Ushahidi-Opt-Deployments");
		var deployment = document.createElement("listitem");
		var pName = document.createElement("listcell");
		pName.setAttribute("label", name);
		var pUrl	= document.createElement("listcell");
		pUrl.setAttribute("label", url);
		var pReports = document.createElement("listcell");
		pReports.setAttribute("label", reports);
		deployment.appendChild(pName);
		deployment.appendChild(pUrl);
		deployment.appendChild(pReports);
		deploymentList.appendChild(deployment);
	},

	removeAllDeployments : function() {
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
														.getService(Components.interfaces.nsIPromptService);
		var check = {value: false};
		var result = prompts.confirmCheck(window, "Ushahidi", 
												"Do you really want to remove all deployments?",
												"Do not ask me again", check);

		if (result) {
			var deploymentList = document.getElementById("Ushahidi-Opt-Deployments");
			var elements = deploymentList.getElementsByTagName("listitem");
			for (var i = elements.length-1; i >= 0; i--) {
				elements[i].parentNode.removeChild(elements[i]); 
			}
		}
	},

	removeDeployment : function() {
		logger.log("Removing Deployment");
		
		var deploymentList = document.getElementById("Ushahidi-Opt-Deployments");
		var elements = deploymentList.getElementsByTagName("listitem");
		for (var i = 0; i < elements.length; i++) {
			if (elements[i].hasAttribute("selected"))
				elements[i].parentNode.removeChild(elements[i]); 
		}
	},
	
	IsJsonString : function(str){
		logger.log("Validating JSON String");
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	}
};

var logger = {
	loggerService : Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),
	log : function(message) {
		this.loggerService.logStringMessage(message);
	}
};
