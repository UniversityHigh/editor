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
	 							<li class = "dropdown-header">Information</li>
	 							<li-nk :from = "path" to = "contacts.html" :paths = "paths"></li-nk>
	 							<li><a href="#">Lunch Menu</a></li>
	 							<li><a href="#">Parent Organizations</a></li>
	 							<li><a href="#">Guidance</a></li>
	 							<li class = "dropdown-header">Academics</li>
	 							<li><a href="#">Departments</a></li>
	 							<li><a href="#">Classes</a></li>
	 							<li class = "dropdown-header">Extracurriculars</li>
	 							<li><a href="#">Sports</a></li>
	 							<li><a href="#">Clubs</a></li>
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
					"contacts.html": "Contacts"
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
	data: () => {
		return {
			json: "",
		}
	}
});

Vue.component("json-string", {
	props: ["name", "linked", "help"],
	created: function() {
		this.initialValue = this.$parent.json[this.linked];
	},
	methods: {
		update: function() {
			this.$parent.json[this.linked] = event.target.value;
		}
	},
	template: `
		<div class = "form-group">
			<label :for = "linked + 'StringInput'">{{name}}</label>
			<input type = "text" class = "form-control" :id = "linked + 'StringInput'" :value = "initialValue" v-on:input = "update">
			<p v-if = "help" class = "help-block">{{help}}</p>
		</div>
	`,
	data: () => {
		return {
			initialValue: ""
		}
	}
});

Vue.component("json-table", {
	props: ["name", "linked", "columns", "help"],
	template: `
		<div class = "table-scroll">
			<label :for = "linked + 'table'">{{name}}</label>
			<p v-if = "help" class = "help-block" v-html = "help"></p>
			<table class = "table table-striped table-hover table-condensed table-responsive" :id = "linked + 'table'">
				<thead>
					<tr>
						<th v-for = "column in columns">{{ column }}</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for = "item, index in this.$parent.json[linked]">
						<td v-for = "column in columns"><input type = "text" class = "form-control" :value = "item[column]" v-on:input = "modifyColumnForIndex(column, index)"></td>
						<td><button type = "button" v-on:click = "removeRow(index)" class = "btn btn-small btn-danger"><i class = "fa fa-minus-circle"></i></button></td>
					</tr>
				</tbody>
			</table>
			<button type = "button" v-on:click = "addRow" class = "btn btn-success pull-right"><i class = "fa fa-plus"></i> Add</button>
		</div>
	`,
	methods: {
		addRow: function() {
			this.$parent.json[this.linked].push({});
		},
		removeRow: function(index) {
			this.$parent.json[this.linked].splice(index, 1);
		},
		modifyColumnForIndex: function(column, index) {
			this.$parent.json[this.linked][index][column] = event.target.value;
		}
	}
});

Vue.component("json-debug", {
	template: `
		<p>{{this.$parent.json}}</p>
	`
});