const {ipcRenderer} = require("electron");
const gh = require("github");

let owner = "UniversityHigh";
let repo = "universityhigh.github.io";
let github = new gh({
	headers: {
		"user-agent": "UniversityHighEditor"
	}
});
let queue = ["_harponica/_locals.json", "_harponica/_globals.json", "academics.html", "alumni.html", "counseling.html", "extracurriculars.html", "index.html", "information.html", "prospective.html"];

let vm = new Vue({
	el: "#main",
	methods: {
		updateFile: function(path) {
			let self = this;;
			this.status = `Updating file: ${path}`;
			let content = ipcRenderer.sendSync("getFileContentsBase64", path);
			github.repos.getContent({
				owner: owner,
				repo: repo,
				path: path
			}).then((contents) => {
				let sha = contents.data.sha;
				return github.repos.updateFile({
					owner: owner,
					repo: repo,
					path: path,
					sha: sha,
					message: self.commitMessage,
					content: content
				});
			}).then(() => {
				if (queue.length > 0) {
					self.updateFile(queue.shift());
				}
				else {
					self.status = `Push successful. Redirecting back to editor in 3 seconds...`;
					setTimeout(() => window.location.assign("home.html"), 3000);
				}
			}).catch((err) => {
				console.log(err);
				self.status = `Encountered error: ${err}. Redirecting back to editor in 3 seconds...`;
				setTimeout(() => window.location.assign("home.html"), 3000);
			});
		},
		push: function() {
			let self = this;
			this.pushStarted = true;
			let credentials = ipcRenderer.sendSync("getCredentials");
			github.authenticate({
				type: "basic",
				username: credentials.username,
				password: credentials.password
			});
			this.status = "Compiling changes...";
			setTimeout(() => ipcRenderer.send("compile"), 2000); // Wait 2 seconds to allow the UI to load since compilation blocks the main thread
			ipcRenderer.on("compileFinished", () => {
				self.updateFile(queue.shift());
				// let updateStatus = (file) => self.status = `Uploading updated file: ${file}`;
				// updateStatus("_harponica/_locals.json");
				// github.repos.getContent({
				// 	owner: "UniversityHigh",
				// 	repo: "universityhigh.github.io",
				// 	path: "_harponica/_locals.json"
				// }).then((contents) => {
				// 	let sha = contents.data.sha;
				// 	console.log(sha);
				// 	return github.repos.updateFile({
				// 		owner: "UniversityHigh",
				// 		repo: "universityhigh.github.io",
				// 		path: "_harponica/_locals.json",
				// 		sha: sha,
				// 		message: self.commitMessage,
				// 		content: "dGhpcyBpcyBhIHRlc3Q="
				// 	});
				// }).then((result) => {
				// 	console.log(result);
				// });
			});
		}
	},
	data: {
		status: "Obtaining credentials...",
		commitMessage: "",
		pushStarted: false
	}
});