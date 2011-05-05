var UshahidiToolbar= {

	urlExists : false,

	ushahidiToolbarPrefListener : null,
	
	ReportCount : "View Reports (0 Total Reports)",
	
	Init : function() {
		// Initialize and register preferences listener
		UshahidiToolbar.ushahidiToolbarPrefListener = new UshahidiToolbar.PrefListener("extensions.ushahidi.",
			function(branch, name) {
				switch (name) {
					case "currentdeployment":
						UshahidiToolbar.Change_Deployment_Label(); 
						break;
				}
		});
		UshahidiToolbar.ushahidiToolbarPrefListener.register();
		
		// Set the deployment title to be the current deployment title
		UshahidiToolbar.Change_Deployment_Label();
	},

	Change_Deployment_Label : function() {
		var deploymentButton = document.getElementById('Ushahidi-Toolbar-Deployment-Button');
		if (deploymentButton){
			deploymentButton.setAttribute('label', UshahidiToolbar.getPref('currentdeployment'));
		}
		
		var viewButton = document.getElementById('Ushahidi-Toolbar-View-Button');
		if (viewButton){
			viewButton.setAttribute("label", "Loading Report Count. Please Wait...");
		}
		var host = UshahidiToolbar.getDeploymentUrl();
		if (UshahidiToolbar.UrlExists(host)) {
			UshahidiToolbar.getReportsCountJson(host + "/api?task=incidentcount");
		} else {
			UshahidiToolbar.getReportsCountJson(host + "/api?task=incidentcount");
		}
	},

	Exit : function() {
		
	},

	loadUrl : function(url) {
		window._content.document.location = url;
		window.content.focus();
	},

	loadPage : function(page) {
		var url = "";
		var host = UshahidiToolbar.getDeploymentUrl();
		var currDeployment = UshahidiToolbar.getPref('currentdeployment');
		
		switch(page) {
			case 'HOME':
				url = host;
				break;
			case 'VIEW':
				url = host + "/reports";
				break;
			case 'SUBMIT':
				url = host + "/reports/submit";
				break;
			case 'ALERTS':
				url = host + "/alerts";
				break;
			case 'ADMIN':
				url = host + "/admin";
				break;
			default:
				alert('No such page: ' + page + ' on ' + currDeployment);
		}
		UshahidiToolbar.loadUrl(url);
	},
	
	getReportsCountJson : function(url) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function() {
			if(xhr.readyState == 4) {
				if(xhr.status == 200) {
					UshahidiToolbar.UpdateCount(xhr.responseText);
				}
			}
		};
		xhr.send(null);
	},

	getReportsJson : function(url) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function() {
			if(xhr.readyState == 4) {
				if(xhr.status == 200) {
					UshahidiToolbar.Populate(xhr.responseText);
				}
			}
		};
		xhr.send(null);
	},

	PopulateReports : function() {
		var viewButton = document.getElementById('Ushahidi-Toolbar-View-Button');
		if (viewButton){
			viewButton.setAttribute("label", "Loading 20 Latest Reports. Please Wait...");
		}
		var host = UshahidiToolbar.getDeploymentUrl();
		var currDeployment = UshahidiToolbar.getPref('currentdeployment');
		if (UshahidiToolbar.UrlExists(host)) {
			UshahidiToolbar.getReportsJson(host + "/api?task=incidents&limit=20");
		} else {
			UshahidiToolbar.getReportsJson(host + "/api?task=incidents&limit=20");
		}
	},

	UrlExists : function(url) {
		var xhr = new XMLHttpRequest();
		xhr.open("HEAD", url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					UshahidiToolbar.urlExists = true;
				}
			}
		};
		xhr.send(null);
		return UshahidiToolbar.urlExists;
	},
	
	UpdateCount : function(doc) {
		if (UshahidiToolbar.IsJsonString(doc)) {
			logger.log("Parsing Valid JSON");
			var jsObject = JSON.parse(doc);
			if (typeof jsObject.payload.count[0].count != 'undefined') {
				logger.log("JSON Count Return: "+jsObject.payload.count[0].count);
				var viewButton = document.getElementById('Ushahidi-Toolbar-View-Button');
				if (viewButton){
					UshahidiToolbar.ReportCount = "View Reports ("+jsObject.payload.count[0].count+" Total Reports)";
					viewButton.setAttribute("label", UshahidiToolbar.ReportCount);
				}
			} else {
				
			}
		}
	},

	Populate : function(doc) {
		// Maximum number of reports menu items
		const MAXENTRIES = 20;

		// Get the menupopup element that we will be working with
		var menu = document.getElementById("Ushahidi-Toolbar-Reports-Popup");

		// Remove all exisiting items first, otherwise the newly created items
		// are appended to the list
		logger.log("Removing Previous Items");
		for (var i=menu.childNodes.length - 1; i >= 0; i--) {
			menu.removeChild(menu.childNodes.item(i));
		}
		
		// Valid JSON?
		if (UshahidiToolbar.IsJsonString(doc)) {
			logger.log("Parsing Valid JSON");
			var jsObject = JSON.parse(doc);
			if (typeof jsObject.payload.incidents != 'undefined') {
				logger.log("Parsing Valid Ushahidi JSON");
				var incidents = jsObject.payload.incidents;
				// iterate over incidents
				for (var i=0; i < incidents.length; i++) {
					incident = incidents[i];
					incidentTitle = incident.incident.incidenttitle;
					incidentUrl = UshahidiToolbar.getDeploymentUrl() + "/reports/view/"
					 	+ incident.incident.incidentid;
					incidentDate = incident.incident.incidentdate;
					locationName = incident.incident.locationname;
					verified = incident.incident.incidentverified;
					
					logger.log("Adding new Menu Item: "+incidentTitle);
					
					// Create a new menu item to be added
					var tempItem = document.createElement("menuitem");
					// Set the new menu item's label
					tempItem.setAttribute("label", incidentTitle + " ("+Date.parse(incidentDate).toString("MMMM d, yyyy")+")" + " Location: "+locationName);
					
					// Set the new menu item's action
					tempItem.setAttribute("oncommand", "UshahidiToolbar.loadUrl('" + incidentUrl + "');");
					
					// Menu Item Style
					if (verified == 1) {
						tempItem.setAttribute("class", "Ushahidi-Toolbar-Reports-Item-Verified");
					} else {
						tempItem.setAttribute("class", "Ushahidi-Toolbar-Reports-Item");
					}

					// Add the item to out menu
					menu.appendChild(tempItem);
				};
			} else {
				
			}
		};
		
		var viewButton = document.getElementById('Ushahidi-Toolbar-View-Button');
		if (viewButton){
			viewButton.setAttribute("label", UshahidiToolbar.ReportCount);
		}
	},

	StartsWith : function(haystack, needle) {
		return haystack.substr(0, needle.length) === needle;
	},

	getDeploymentUrl : function() {
		var currentDeployment = UshahidiToolbar.getPref('currentdeployment');
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);
		var branch = prefs.getBranch("extensions.ushahidi.deployments.name");
		var children = branch.getChildList("", {});
		for (var i = 0; i < children.length; i++) {
		if (prefs.getCharPref("extensions.ushahidi.deployments.name." + i) == currentDeployment)
			return prefs.getCharPref("extensions.ushahidi.deployments.url." + i);
		}
		return "No deployment";
	},
	
	getDeploymentReportCount : function() {
		var currentDeployment = UshahidiToolbar.getPref('currentdeployment');
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);
		var branch = prefs.getBranch("extensions.ushahidi.deployments.name");
		var children = branch.getChildList("", {});
		for (var i = 0; i < children.length; i++) {
		if (prefs.getCharPref("extensions.ushahidi.deployments.name." + i) == currentDeployment)
			return prefs.getCharPref("extensions.ushahidi.deployments.reportcount." + i);
		}
		return 0;
	},

	getPref : function(pref) {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
									.getService(Components.interfaces.nsIPrefService);
		var branch = prefs.getBranch("extensions.ushahidi.");
		return branch.getCharPref(pref);
	},

	PopulateDeployments : function() {
		var menu = document.getElementById("Ushahidi-Toolbar-Deployment-Popup");
		
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);
		var branch = prefs.getBranch("extensions.ushahidi.deployments.name");
		var children = branch.getChildList("", {});

		while (menu.hasChildNodes())
			menu.removeChild(menu.firstChild);

		for (var i = 0; i < children.length; i++) { 
			var tempItem = document.createElement("menuitem");
			var deploymentName = branch.getCharPref(children[i]);
			tempItem.setAttribute("label", deploymentName);
			tempItem.setAttribute("oncommand", "UshahidiToolbar.Change_Deployment('" + deploymentName + "');");
			menu.appendChild(tempItem);
		}
	},

	Change_Deployment : function(deploymentName) {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);
		var branch = prefs.getBranch("extensions.ushahidi.");
		branch.setCharPref("currentdeployment", deploymentName);
	},

	showPrefsDialog : function() {
		var x = window.openDialog("chrome://ushahidi/content/prefs.xul",
			"Ushahidi Toolbar Options", "centerscreen=yes,chrome=yes,modal=yes,resizable=yes");
	},
	
	showAboutDialog : function() {
		var x = window.openDialog("chrome://ushahidi/content/about.xul",
			"Ushahidi Toolbar About", "centerscreen=yes,chrome=yes,modal=yes,resizable=yes");
	},

	PrefListener : function(branchName, func) {
		var prefService = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);
		var branch = prefService.getBranch(branchName);
		branch.QueryInterface(Components.interfaces.nsIPrefBranch2);

		this.register = function() {
			branch.addObserver("", this, false);
			branch.getChildList("", { })
						.forEach(function (name) { func(branch, name); });
		};

		this.unregister = function unregister() {
			if (branch)
				branch.removeObserver("", this);
		};

		this.observe = function(subject, topic, data) {
			if (topic == "nsPref:changed")
				func(branch, data);
			};
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

}; // End of UshahidiToolbar

var logger = {
	loggerService : Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),
	log : function(message) {
		this.loggerService.logStringMessage(message);
	}
};

window.addEventListener("load", UshahidiToolbar.Init, false);
window.addEventListener("unload", UshahidiToolbar.Exit, false);