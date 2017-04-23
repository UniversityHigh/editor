const opn = require("opn");

Vue.component("li-nk", {
	props: ["from", "to", "paths"],
	template: `
		<li :class = "{'active': paths[from] == paths[to]}"><a :href = "to">{{ paths[to] }}</a></li>
	`
});

Vue.component("navbar", {
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
	 					<button v-on:click = "preview" type = "button" class = "btn btn-default">Preview</button>
	 					<button type = "button" class="btn btn-danger">Push Changes</button>
	 				</form>
				</div>
			</div>
		</nav>
		`,
		methods: {
			preview: function()  {
				opn("http://localhost:8080");
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

// <nav class="navbar navbar-default navbar-fixed-top">
// 		<div class="container-fluid">
// 			<!-- Brand and toggle get grouped for better mobile display -->
// 			<div class="navbar-header">
// 				<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
// 					<span class="sr-only">Toggle navigation</span>
// 					<span class="icon-bar"></span>
// 					<span class="icon-bar"></span>
// 					<span class="icon-bar"></span>
// 				</button>
// 				<a class="navbar-brand" href="#">UHSSE Editor</a>
// 			</div>

// 			<!-- Collect the nav links, forms, and other content for toggling -->
// 			<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
// 				<ul class="nav navbar-nav">
// 					<li class="dropdown">
// 						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Home <span class="caret"></span></a>
// 						<ul class="dropdown-menu">
// 							<li class= "active"><a href="#">Home</a></li>
// 							<li><a href="#">Banners</a></li>
// 							<li><a href="#">Navigation Bar & Notifications</a></li>
// 							<li class = "dropdown-header">Information</li>
// 							<li><a href="#">Contacts</a></li>
// 							<li><a href="#">Lunch Menu</a></li>
// 							<li><a href="#">Parent Organizations</a></li>
// 							<li><a href="#">Guidance</a></li>
// 							<li class = "dropdown-header">Academics</li>
// 							<li><a href="#">Departments</a></li>
// 							<li><a href="#">Classes</a></li>
// 							<li class = "dropdown-header">Extracurriculars</li>
// 							<li><a href="#">Sports</a></li>
// 							<li><a href="#">Clubs</a></li>
// 							<li class = "dropdown-header">Prospective Students</li>
// 							<li><a href="#">Application & Open Houses</a></li>
// 							<li class = "dropdown-header">Editor</li>
// 							<li><a href="#">Fix Preview</a></li>
// 							<li><a href="#">Advanced Guide</a></li>
// 							<li><a href="#">Contact Developers</a></li>
// 						</ul>
// 					</li>
// 				</ul>
// 				<form class="navbar-form navbar-right">
// 					<button type = "button" class = "btn btn-default">Preview</button>
// 					<button type="button" class="btn btn-danger">Push Changes</button>
// 				</form>
// 			</div><!-- /.navbar-collapse -->
// 		</div><!-- /.container-fluid -->
// 	</nav>