const opn = require("opn");
const fs = require("fs");
const {ipcRenderer} = require("electron");

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
	 							<li-nk :from = "path" to = "login.html" :paths = "paths"></li-nk>
	 							<li-nk :from = "path" to = "home.html" :paths = "paths"></li-nk>
	 							<li-nk :from = "path" to = "banners.html" :paths = "paths"></li-nk>
	 							<li-nk :from = "path" to = "annoucements.html" :paths = "paths"></li-nk>
	 							<li class = "dropdown-header">Information</li>
	 							<li-nk :from = "path" to = "contacts.html" :paths = "paths"></li-nk>
	 							<li-nk :from = "path" to = "lunchMenu.html" :paths = "paths"></li-nk>
	 							<li-nk :from = "path" to = "parentOrganizations.html" :paths = "paths"></li-nk>
	 							<li-nk :from = "path" to = "guidance.html" :paths = "paths"></li-nk>
	 							<li class = "dropdown-header">Academics</li>
	 							<li-nk :from = "path" to = "departments.html" :paths = "paths"></li-nk>
	 							<li-nk :from = "path" to = "classes.html" :paths = "paths"></li-nk>
	 							<li class = "dropdown-header">Extracurriculars</li>
	 							<li-nk :from = "path" to = "athletics.html" :paths = "paths"></li-nk>
	 							<li-nk :from = "path" to = "clubs.html" :paths = "paths"></li-nk>
	 							<li class = "dropdown-header">Prospective Students</li>
	 							<li-nk :from = "path" to = "prospective.html" :paths = "paths"></li-nk>
	 							<li class = "dropdown-header">Editor</li>
	 							<li-nk :from = "path" to = "guide.html" :paths = "paths"></li-nk>
	 							<li-nk :from = "path" to = "fixIt.html" :paths = "paths"></li-nk>
	 						</ul>
	 					</li>
	 				</ul>
	 				<form class="navbar-form navbar-right">
	 					<button v-on:click = "undo" type = "button" class = "btn btn-default"><i class = "fa fa-undo"></i></button>
	 					<button v-on:click = "redo" type = "button" class = "btn btn-default"><i class = "fa fa-repeat"></i></button>
	 					<button v-on:click = "save" type = "button" class = "btn btn-warning">Save</button>
	 					<button v-on:click = "preview" type = "button" class = "btn btn-default">Save & Preview</button>
	 					<button type = "button" class="btn btn-success">Push Changes</button>
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
					"guidance.html": "Guidance",
					"departments.html": "Departments",
					"classes.html": "Classes",
					"clubs.html": "Clubs",
					"athletics.html": "Athletics",
					"prospective.html": "Applications & Open Houses",
					"guide.html": "Advanced Guide",
					"fixIt.html": "Fix Broken Repo"
				}
			}
		}
	});


Vue.component("json-form", {
	props: ["page", "id"],
	template: `
		<form :id = "id">
			<slot :json = "json"></slot>
		</form>
	`,
	created: function() {
		this.json = ipcRenderer.sendSync("getJSONForPage", this.page);
		bus.$on("save", () => {
			ipcRenderer.send("setJSONForPage", this.page, this.json);
		});
	},
	methods: {
		interpret: function(str) {
			return eval(str);
		}
	},
	data: () => {
		return {
			json: "",
		}
	}
});

Vue.component("json-string", {
	props: ["name", "path", "id", "big", "help"],
	created: function() {
		parentFound = false;
		parents = 1;
		while (!parentFound) {
			if (eval(this.absolutePath) !== undefined) {
				parentFound = true;
			} else {
				parents += 1;
				this.absolutePath = `this.${'$parent.'.repeat(parents)}json`;
			}
		}
		this.absolutePath = `${this.absolutePath}${this.path}`;
		this.initialValue = eval(this.absolutePath); // hax but it works
	},
	methods: {
		update: function() {
			eval(`${this.absolutePath} = event.target.value`);
		}
	},
	template: `
		<div class = "form-group">
			<label :for = "id">{{name}}</label>
			<textarea v-if = "big" class = "form-control" v-on:input = "update">{{ initialValue }}</textarea>
			<input v-else type = "text" class = "form-control" :id = "id" :value = "initialValue" v-on:input = "update">
			<p v-if = "help" class = "help-block">{{help}}</p>
		</div>
	`,
	data: () => {
		return {
			initialValue: "",
			absolutePath: "this.$parent.json"
		}
	}
});


Vue.component("json-checkbox", {
	props: ["name", "path", "id", "help"],
	created: function() {
		parentFound = false;
		parents = 1;
		while (!parentFound) {
			if (eval(this.absolutePath) !== undefined) {
				parentFound = true;
			} else {
				parents += 1;
				this.absolutePath = `this.${'$parent.'.repeat(parents)}json`;
			}
		}
		this.absolutePath = `${this.absolutePath}${this.path}`;
		this.initialValue = eval(this.absolutePath); // hax but it works
	},
	methods: {
		update: function() {
			eval(`${this.absolutePath} = event.target.checked`);
		}
	},
	template: `
		<div class = "checkbox">
			<label :for = "id">
				<input type = "checkbox" :id = "id" :checked = "initialValue" v-on:change = "update"> {{name}}
			</label>
			<p v-if = "help" class = "help-block">{{help}}</p>
		</div>
	`,
	data: () => {
		return {
			initialValue: "",
			absolutePath: "this.$parent.json"
		}
	}
});

Vue.component("json-table", {
	props: ["name", "id", "path", "columns", "color", "help"],
	created: function() {
		this.absolutePath = "this.$parent.json";
		parentFound = false;
		parents = 1;
		while (!parentFound) {
			if (eval(this.absolutePath) !== undefined) {
				parentFound = true;
			} else {
				parents += 1;
				this.absolutePath = `this.${'$parent.'.repeat(parents)}json`;
			}
		}
		this.absolutePath = `${this.absolutePath}${this.path}`;
	},
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
						<tr v-for = "item, index in getTable()">
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
								<button type = "button" v-if = "getTable().length > 1" v-on:click = "removeRow(index)" class = "btn btn-small btn-danger"><i class = "fa fa-minus-circle"></i></button>
							</td>
						</tr>
					</tbody>
				</table>
				<button type = "button" v-on:click = "addRow" class = "btn btn-success btn-add-row pull-right"><i class = "fa fa-plus"></i> Add</button>
			</div>
		</div>
	`,
	methods: {
		getTable: function() {
			return eval(this.absolutePath);
		},
		addRow: function() {
			eval(`${this.absolutePath}.push({})`);
		},
		removeRow: function(index) {
			eval(`${this.absolutePath}.splice(index, 1)`);
		},
		modifyColumnForIndex: function(column, index, value) {
			if (!value) value = event.target.value;
			eval(`${this.absolutePath}[index][column] = value`);
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
						<tr v-for = "item, index in getTable()">
							<td style = "width: 90vw"><input type = "text" class = "form-control" :value = "item" :maxlength = "maxlength" v-on:input = "modifyIndex(index)"></td>
							<td><button v-if = "getTable().length > 1" type = "button" v-on:click = "removeRow(index)" class = "btn btn-small btn-danger"><i class = "fa fa-minus-circle"></i></button></td>
						</tr>
					</tbody>
				</table>
				<button type = "button" v-on:click = "addRow" class = "btn btn-success btn-add-row pull-right"><i class = "fa fa-plus"></i> Add</button>
			</div>
		</div>
	`,
	methods: {
		getTable: function() {
			return eval(`this.$parent.json${this.path}`);
		},
		addRow: function() {
			eval(`this.$parent.json${this.path}.push("")`);
		},
		removeRow: function(index) {
			eval(`this.$parent.json${this.path}.splice(index, 1)`);
		},
		modifyIndex: function(index) {
			eval(`this.$parent.json${this.path}[index] = event.target.value`);
		}
	}
});


Vue.component("json-repeat", {
	props: ["name", "path", "id", "help"],
	created: function() {
		this.items = eval(`this.$parent.json${this.path}`);
		let self = this;
		bus.$on("sanity-check", function() {
		});
	},
	template: `
		<div :id = "id">
			<label :for = "id">{{name}}</label>
			<p v-if = "help" class = "help-block" v-html = "help"></p>
			<div class = "well" v-for = "item, index in items">
				<button type = "button" v-if = "items.length > 1" v-on:click = "removeRow(index)" class = "btn btn-small btn-danger pull-right">
					<i class = "fa fa-minus-circle"></i>
				</button>
				<br />
				<slot :item = "item" :index = "index"></slot>
			</div>
			<button type = "button" v-on:click = "addRow" class = "btn btn-success btn-add-row pull-right"><i class = "fa fa-plus"></i> Add</button>
		</div>
	`,
	data: () => {
		return {
			initialValue: ""
		}
	},
	methods: {
		addRow: function() {
			let lastRow = eval(`this.$parent.json${this.path}[this.$parent.json${this.path}.length - 1]`);
			lastRow = Object.assign({}, lastRow);
			eval(`this.$parent.json${this.path}.push(lastRow)`);
			this.$forceUpdate();
		},
		removeRow: function(index) {
			//eval(`this.$parent.json${this.path}.splice(index, 1)`);
			eval(`Vue.delete(this.$parent.json${this.path}, index)`);
			bus.$emit("sanity-check");
			this.$forceUpdate();
		}
	}
});

Vue.component("json-debug", {
	template: `
		<p>{{this.$parent.json}}</p>
	`
});
