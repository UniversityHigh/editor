const application = require("electron").remote.app;
const {net} = require("electron").remote;
const path = require("path");
const fs = require("fs");

const repoURL = "https://github.com/UniversityHigh/universityhigh.github.io/archive/master.zip";

new Vue({
	el: "#app",
	data: {
		authenticated: false,
		topLabel: "Searching for repo...",
		bottomLabel: "",
		repoFound: false
	},
	created: function() {
		let repoPath = path.join(application.getPath("userData", "repo"), "repo");
		if (fs.existsSync(repoPath)) {
			this.topLabel = "Found repo: " + repoPath
			repoFound = true
		}
		else {
			this.topLabel = "Couldn't find repo. Need to download"
			repoFound = false
		}
	},
	methods: {
		downloadRepo: () => {
			console.log("download");
			let request = new net.request(repoURL);
			request.on("response", (res) => {
				let stream = fs.createWriteStream("/Users/Andi/Downloads/repo.zip");
				res.pipe(stream);
			})
			request.on("close", () => {
				console.log("closed");
			});
			request.on("error", (err) => {
				console.log("err");
			});
			request.end();
		}
	}
});