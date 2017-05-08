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
	 							<li-nk :from = "path" to = "home.html" :paths = "paths"></li-nk>
	 							<li><a href="#">Notification Banner</a></li>
	 							<li class = "dropdown-header">Information</li>
	 							<li-nk :from = "path" to = "contacts.html" :paths = "paths"></li-nk>
	 							<li-nk :from = "path" to = "lunchMenu.html" :paths = "paths"></li-nk>
	 							<li-nk :from = "path" to = "parentOrganizations.html" :paths = "paths"></li-nk>
	 							<li-nk :from = "path" to = "guidance.html" :paths = "paths"></li-nk>
	 							<li class = "dropdown-header">Academics</li>
	 							<li><a href="#">Departments</a></li>
	 							<li><a href="#">Classes</a></li>
	 							<li class = "dropdown-header">Extracurriculars</li>
	 							<li-nk :from = "path" to = "sports.html" :paths = "paths"></li-nk>
	 							<li-nk :from = "path" to = "clubs.html" :paths = "paths"></li-nk>
	 							<li class = "dropdown-header">Prospective Students</li>
	 							<li><a href="#">Application & Open Houses</a></li>
	 							<li class = "dropdown-header">Editor</li>
	 							<li><a href="#">Advanced Guide</a></li>
	 							<li><a href="#">Contact Developers</a></li>
	 						</ul>
	 					</li>
	 				</ul>
	 				<form class="navbar-form navbar-right">
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
				path: window.location.pathname.substring(window.location.pathname.lastIndexOf("/") + 1),
				paths: {
					"home.html": "Home",
					"contacts.html": "Contacts",
					"lunchMenu.html": "Lunch Menu",
					"parentOrganizations.html": "Parent Organizations",
					"guidance.html": "Guidance",
					"clubs.html": "Clubs",
					"sports.html": "Sports"
				}
			}
		}
	});


Vue.component("json-form", {
	props: ["page"],
	template: `
		<form>
			<slot></slot>
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

Vue.component("json-table", {
	props: ["name", "id", "path", "columns", "help"],
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
							<td v-for = "column in columns"><input type = "text" class = "form-control" :value = "item[column]" v-on:input = "modifyColumnForIndex(column, index)"></td>
							<td><button type = "button" v-on:click = "removeRow(index)" class = "btn btn-small btn-danger"><i class = "fa fa-minus-circle"></i></button></td>
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
			eval(`this.$parent.json${this.path}.push({})`);
		},
		removeRow: function(index) {
			eval(`this.$parent.json${this.path}.splice(index, 1)`);
		},
		modifyColumnForIndex: function(column, index) {
			eval(`this.$parent.json${this.path}[index][column] = event.target.value`);
		}
	}
});

Vue.component("json-simple-table", {
	props: ["name", "id", "path", "column", "help"],
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
							<td style = "width: 90vw"><input type = "text" class = "form-control" :value = "item" v-on:input = "modifyIndex(index)"></td>
							<td><button type = "button" v-on:click = "removeRow(index)" class = "btn btn-small btn-danger"><i class = "fa fa-minus-circle"></i></button></td>
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
			lastRow = eval(`this.$parent.json${this.path}[this.$parent.json${this.path}.length - 1]`);
			eval(`this.$parent.json${this.path}.push(lastRow)`);
			this.$forceUpdate();
		},
		removeRow: function(index) {
			eval(`this.$parent.json${this.path}.splice(index, 1)`);
			this.$forceUpdate();
		}
	}
});

Vue.component("json-debug", {
	template: `
		<p>{{this.$parent.json}}</p>
	`
});
