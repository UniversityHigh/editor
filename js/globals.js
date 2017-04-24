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
	 					<button v-on:click = "save" type = "button" class = "btn btn-success">Save</button>
	 					<button v-on:click = "preview" type = "button" class = "btn btn-default">Save & Preview</button>
	 					<button type = "button" class="btn btn-danger">Push Changes</button>
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

Vue.component("json-debug", {
	template: `
		<p>{{this.$parent.json}}</p>
	`
});