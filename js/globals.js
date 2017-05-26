const opn = require("opn");
const fs = require("fs");
const {ipcRenderer} = require("electron");
const {dialog} = require("electron").remote;

const bus = new Vue();

Vue.component("li-nk", {
	props: ["from", "to", "paths"],
	template: `
		<li :class = "{'active': paths[from] == paths[to]}"><a :href = "to">{{ paths[to] }}</a></li>
	`
});

Vue.component("navbar", {
	props: ["preview-page"],
	template: `
		<nav class="navbar navbar-default navbar-fixed-top">
			<div class="container-fluid">
				<div class="navbar-header">
					<a class="navbar-brand" href="#">UHSSE Editor</a>
				</div>
				<div class="collapse navbar-collapse">
	 				<ul class="nav navbar-nav">
	 					<li class="dropdown">
	 						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button">{{ paths[path] }} <span class="caret"></span></a>
	 						<ul class="dropdown-menu">
	 							<li-nk :from = "path" to = "home.html" :paths = "paths"></li-nk>
	 							<li-nk :from = "path" to = "banners.html" :paths = "paths"></li-nk>
	 							<li-nk :from = "path" to = "annoucements.html" :paths = "paths"></li-nk>
	 							<li class = "dropdown-header">Information</li>
	 							<li-nk :from = "path" to = "contacts.html" :paths = "paths"></li-nk>
	 							<li-nk :from = "path" to = "lunchMenu.html" :paths = "paths"></li-nk>
	 							<li-nk :from = "path" to = "parentOrganizations.html" :paths = "paths"></li-nk>
	 							<li-nk :from = "path" to = "resources.html" :paths = "paths"></li-nk>
	 							<li-nk :from = "path" to = "studentCouncil.html" :paths = "paths"></li-nk>
	 							<li class = "dropdown-header">Academics</li>
	 							<li-nk :from = "path" to = "departments.html" :paths = "paths"></li-nk>
	 							<li-nk :from = "path" to = "classes.html" :paths = "paths"></li-nk>
	 							<li class = "dropdown-header">Extracurriculars</li>
	 							<li-nk :from = "path" to = "athletics.html" :paths = "paths"></li-nk>
	 							<li-nk :from = "path" to = "clubs.html" :paths = "paths"></li-nk>
	 							<li class = "dropdown-header">Prospective Students</li>
	 							<li-nk :from = "path" to = "prospective.html" :paths = "paths"></li-nk>
	 							<li class = "dropdown-header">Editor</li>
	 							<li><a v-on:click = "openGuide">Advanced Guide</a></li>
	 							<li-nk :from = "path" to = "fixIt.html" :paths = "paths"></li-nk>
	 						</ul>
	 					</li>
	 				</ul>
	 				<form class="navbar-form navbar-right">
	 					<button v-on:click = "refresh" type = "button" class = "btn btn-default"><i class = "fa fa-refresh"></i></button>
	 					<button v-on:click = "undo" type = "button" class = "btn btn-default"><i class = "fa fa-undo"></i></button>
	 					<button v-on:click = "redo" type = "button" class = "btn btn-default"><i class = "fa fa-repeat"></i></button>
	 					<button v-on:click = "save" type = "button" class = "btn btn-warning">Save</button>
	 					<button v-on:click = "preview" type = "button" class = "btn btn-default">Save & Preview</button>
	 					<button v-on:click = "push" type = "button" class="btn btn-success">Push Changes</button>
	 				</form>
				</div>
			</div>
		</nav>
		`,
		created: function() {
			ipcRenderer.on("setJSONForPageFailed", (err) => {
				alert(`Failed to save: ${err}`);
			});
		},
		methods: {
			refresh: function() {
				this.webContents.reload();
			},
			undo: function() {
				this.webContents.undo();
			},
			redo: function() {
				this.webContents.redo();
			},
			save: function() {
				bus.$emit("save");
			},
			preview: function()  {
				this.save();
				opn(`http://localhost:8080/${this.previewPage}`);
			},
			openGuide: function() {
				opn("https://github.com/UniversityHigh/universityhigh.github.io/blob/master/GUIDE.md");
			},
			push: function() {
				dialog.showMessageBox({
				type: "warning",
				buttons: ["Continue", "Cancel"],
				title: "Confirm Push",
				message: "Are you sure? Remember that all changes will be deployed live to the real website!"
				}, (response) => {
					if (!response) window.location.assign("push.html"); // Action was confirmed
				});
			}
		},
		data: () => {
			return {
				webContents: require("electron").remote.getCurrentWebContents(),
				path: window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1),
				paths: {
					"login.html": "Login",
					"home.html": "Home",
					"banners.html": "Banners",
					"annoucements.html": "Annoucements",
					"contacts.html": "Contacts",
					"lunchMenu.html": "Lunch Menu",
					"parentOrganizations.html": "Parent Organizations",
					"resources.html": "Resources",
					"studentCouncil.html": "Student Council",
					"departments.html": "Departments",
					"classes.html": "Classes",
					"clubs.html": "Clubs",
					"athletics.html": "Athletics",
					"prospective.html": "Applications & Open Houses",
					"fixIt.html": "Fix Broken Repo"
				}
			}
		}
	});

function find(object, path) {
	if (typeof path === "string") {
		path = path.match(new RegExp(/\w+/, "g"));
	}
	
	if (path.length > 1) {
		let e = path.shift();
		return find(object[e] = typeof object[e] === "object" ? object[e] : {}, path);
	} else {
		return object[path[0]];
	}
}

function assign(object, path, value) {
	if (typeof path === "string") {
		path = path.match(new RegExp(/\w+/, "g"));
	}
	
	if (path.length > 1) {
		let e = path.shift();
		assign(object[e] = typeof object[e] === "object" ? object[e] : {}, path, value);
	} else {
		object[path[0]] = value;
	}
}

const relativeJson = {
	methods: {
		getRootJson: function(parent) {
			if(!parent) parent = this.$parent;
			if(parent.rootJson === undefined) {
				return this.getRootJson(parent.$parent);
			} else {
				return parent.rootJson;
			}
		}
	},
	computed: {
		relativeJson: {
			get: function() {
				return find(this.getRootJson(), this.path);
			},
			set: function(value) {
				assign(this.getRootJson(), this.path, value);
			}
		}
	}
}

Vue.component("json-form", {
	props: ["page", "id"],
	template: `
		<form :id = "id">
			<slot :rootJson = "rootJson"></slot>
		</form>
	`,
	created: function() {
		this.rootJson = ipcRenderer.sendSync("getJSONForPage", this.page);
		bus.$on("save", () => {
			ipcRenderer.send("setJSONForPage", this.page, this.rootJson);
		});
	},
	data: () => {
		return {
			rootJson: {}
		}
	}
});

Vue.component("json-string", {
	mixins: [relativeJson],
	props: ["name", "path", "id", "big", "help"],
	template: `
		<div class = "form-group">
			<label :for = "id">{{name}}</label>
			<textarea v-if = "big" class = "form-control" v-model="relativeJson"></textarea>
			<input v-else type = "text" class = "form-control" :id = "id" v-model="relativeJson">
			<p v-if = "help" class = "help-block" v-html = "help"></p>
		</div>
	`
});

Vue.component("json-checkbox", {
	mixins: [relativeJson],
	props: ["name", "path", "id", "help"],
	template: `
		<div class = "checkbox">
			<label :for = "id">
				<input type = "checkbox" :id = "id" v-model="relativeJson"> {{name}}
			</label>
			<p v-if = "help" class = "help-block">{{help}}</p>
		</div>
	`
});

Vue.component("json-color", {
	mixins: [relativeJson],
	props: ["name", "path", "id", "help"],
	created: function() {
		this.initialColor = this.relativeJson;
	},
	methods: {
		reset: function() {
			this.$refs['colorPicker'].value = this.initialColor;
		}	
	},
	data: function() {
		return {
			initialColor: "#ffffff"
		}
	},
	template: `
		<div class = "form-group">
			<label :for = "id">{{name}}</label>
			<br>
			<input type = "color" :id = "id" v-model = "relativeJson" ref = "colorPicker" :defaultValue = "initialColor">
			<button type = "button" v-on:click = "reset" class = "btn btn-default btn-small">
				<i class = "fa fa-undo"></i>
			</button>
			<p v-if = "help" class = "help-block" v-html = "help"></p>
		</div>
	`
});

Vue.component("json-table", {
	mixins: [relativeJson],
	props: ["name", "id", "path", "columns", "color", "help"],
	mounted: function() {
		// Go through each input color and set its starting value to its defaultValue
		if (this.color) {
			if (!this.id) {
				console.log("FAIL: ID required for tables with color inputs");
				return;
			}
			let colorInputs = document.getElementsByClassName(`${this.id}-input-color`);
			Array.prototype.forEach.call(colorInputs, (input) => {
 				input.setAttribute("defaultValue", input.value);
			});
		}
	},
	template: `
		<div class = "table-container">
			<label :for = "id">{{name}}</label>
			<p v-if = "help" class = "help-block" v-html = "help"></p>
			<div class = "table-scroll">
				<table class = "table table-striped table-hover table-condensed table-responsive" :id = "id">
					<thead>
						<tr>
							<th v-for = "column in columns">{{ column }}</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						<tr v-for = "item, index in relativeJson">
							<td v-for = "column in columns" key = "columnizer">
								<span v-if = "column == color">
									<input type = "color" :class = "id + '-input-color'" :value = "item[column]" v-on:input = "modifyColumnForIndex(column, index)">
									<button type = "button" v-on:click = "resetColor($event)" class = "btn btn-default btn-small">
										<i class = "fa fa-undo"></i>
									</button>
								</span>
								<input v-else type = "text" class = "form-control" :value = "item[column]" v-on:input = "modifyColumnForIndex(column, index)">
							</td>
							<td>
								<button type = "button" v-if = "relativeJson.length > 1" v-on:click = "removeRow(index)" class = "btn btn-small btn-danger"><i class = "fa fa-minus-circle"></i></button>
							</td>
						</tr>
					</tbody>
				</table>
				<button type = "button" v-on:click = "addRow" class = "btn btn-success btn-add-row pull-right"><i class = "fa fa-plus"></i> Add</button>
			</div>
		</div>
	`,
	methods: {
		addRow: function() {
			this.relativeJson.push({});
		},
		removeRow: function(index) {
			let self = this;
			dialog.showMessageBox({
				type: "warning",
				buttons: ["Continue", "Cancel"],
				title: "Confirm Action",
				message: "Are you sure?"
			}, (response) => {
				if(!response) {
					self.relativeJson.splice(index, 1);	
				}
			});
		},
		modifyColumnForIndex: function(column, index, value) {
			if (!value) value = event.target.value;
			this.relativeJson[index][column] = value;
		},
		resetColor: function(event) {
			// Reset the input element to its defaultValue (assigned in mounted)
			let input = null;
			if (event.srcElement.localName == "button") {
				input = event.srcElement.previousElementSibling;
			}
			else if (event.srcElement.localName == "i") {
				input = event.srcElement.parentElement.previousElementSibling;
			}
			else {
				console.log("FAIL: event came from unknown element");
				return;
			}
			input.value = input.getAttribute("defaultValue");
		}
	}
});

Vue.component("json-simple-table", {
	mixins: [relativeJson],
	props: ["name", "id", "path", "column", "maxlength", "help"],
	template: `
		<div class = "table-container">
			<label :for = "id">{{name}}</label>
			<p v-if = "help" class = "help-block" v-html = "help"></p>
			<div class = "table-scroll">
				<table class = "table table-striped table-hover table-condensed table-responsive" :id = "id">
					<thead>
						<tr>
							<th>{{ column }}</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						<tr v-for = "item, index in relativeJson">
							<td style = "width: 90vw"><input type = "text" class = "form-control" :value = "item" :maxlength = "maxlength" v-on:input = "modifyIndex(index)"></td>
							<td><button v-if = "relativeJson.length > 1" type = "button" v-on:click = "removeRow(index)" class = "btn btn-small btn-danger"><i class = "fa fa-minus-circle"></i></button></td>
						</tr>
					</tbody>
				</table>
				<button type = "button" v-on:click = "addRow" class = "btn btn-success btn-add-row pull-right"><i class = "fa fa-plus"></i> Add</button>
			</div>
		</div>
	`,
	methods: {
		addRow: function() {
			this.relativeJson.push({});
		},
		removeRow: function(index) {
			let self = this;
			dialog.showMessageBox({
				type: "warning",
				buttons: ["Continue", "Cancel"],
				title: "Confirm Action",
				message: "Are you sure?"
			}, (response) => {
				if(!response) {
					self.relativeJson.splice(index, 1);	
				}
			});
		},
		modifyIndex: function(index) {
			this.relativeJson[index] = event.target.value;
		}
	}
});


Vue.component("json-repeat", {
	mixins: [relativeJson],
	props: ["name", "path", "id", "help"],
	template: `
		<div :id = "id">
			<label :for = "id">{{name}}</label>
			<p v-if = "help" class = "help-block" v-html = "help"></p>
			<div class = "well" v-for = "item, index in relativeJson" :key="item">
				<button type = "button" v-if = "relativeJson.length > 1" v-on:click = "removeRow(index)" class = "btn btn-small btn-danger pull-right">
					<i class = "fa fa-minus-circle"></i>
				</button>
				<br />
				<slot :item = "item" :index = "index"></slot>
			</div>
			<button type = "button" v-on:click = "addRow" class = "btn btn-success btn-add-row pull-right"><i class = "fa fa-plus"></i> Add</button>
		</div>
	`,
	methods: {
		addRow: function() {
			this.relativeJson.push(Object.assign({}, this.relativeJson[this.relativeJson.length - 1]));
		},
		removeRow: function(index) {
			let self = this;
			dialog.showMessageBox({
				type: "warning",
				buttons: ["Continue", "Cancel"],
				title: "Confirm Action",
				message: "Are you sure?"
			}, (response) => {
				if(!response) {
					self.relativeJson.splice(index, 1);	
				}
			});
		}
	}
});
