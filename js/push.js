const {ipcRenderer} = require("electron");
const gh = require("github");

let github = new gh({
	headers: {
		"user-agent": "UniversityHighEditor"
	}
});
let queue = ["/_harponica/_locals.json", "/_harponica/_globals.json"];

let vm = new Vue({
	el: "#main",
	methods: {
		updateFile: function(path) {
			console.log(path);
			console.log(ipcRenderer.sendSync("getFile", path));
			if (queue.length > 0) {
				this.updateFile(queue.shift());
			}
			else {
				console.log("finished");
			}
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