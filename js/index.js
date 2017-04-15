const backend = require("./js/backend");
const opn = require("opn");

new Vue({
	el: "#app",
	data: {
		authenticated: false,
		logText: "",
		downloadProgress: "",
		server: undefined,
		backend: new backend()
	},
	methods: {
		downloadRepo: function() {
			// errCallback(err), progressCallback(current, total), successCallback()
			this.backend.fetchRepo((err) => {
				alert(err);
				this.downloadProgress = "(FAIL)";
				this.log("Couldn't download repo");
			}, (current, total) => {
				let percentage = (current / total) * 100;
				this.downloadProgress = `(${percentage.toFixed(2)}%)`;
			}, () => {
				this.log("Downloaded and unzipped repo");
				this.downloadProgress = "";
			});
		},
		deleteRepo: function() {
			this.backend.deleteRepo(() => {
				this.log("Deleted repo");
			});
		},
		startServer: function() {
			this.backend.startServer(8080, () => {
				this.log("Started server");
			});
		},
		stopServer: function() {
			this.backend.stopServer(() => {
				this.log("Stopped server");
			})
		},
		openPreview: () => opn("http://localhost:8080"),
		log: function(msg) {
			this.logText += msg + "\n";
			console.log(msg);
		}
	}
});

// new Vue({
// 	el: "#app",
// 	data: {
// 		authenticated: false,
// 		topLabel: "Searching for repo...",
// 		bottomLabel: "Server is offline.",
// 		repoFound: false,
// 		serverControl: "Enable Server",
// 		logText: "",
// 		server: undefined
// 	},
// 	mounted: function() {
// 		this.checkForRepo();
// 	},
// 	methods: {
// 		checkForRepo: function() {
// 			if (fs.existsSync(repoPath)) {
// 				this.log("Found");
// 				this.topLabel = "Found repo: " + repoPath;
// 				this.repoFound = true;
// 			}
// 			else {
// 				this.topLabel = "Couldn't find repo. Need to download.";
// 				this.repoFound = false;
// 			}
// 		},
// 		downloadRepo: function() {
// 			let request = new net.request(repoURL);
// 			let currentBytes = 0;
// 			let totalBytes = 0;
// 			this.log("Sending download request...");
// 			request.on("response", (res) => {
// 				if (!("content-length" in res.headers)) {
// 					this.log("Request didn't contain a content-length???");
// 					return;
// 				}
// 				totalBytes = res.headers["content-length"][0]; // Might not always exist
// 				res.on("data", (data) => {
// 					currentBytes += data.length;
// 					fs.appendFileSync(`${repoPath}.zip`, data);
// 					this.topLabel = `Downloading repo zip file (${currentBytes} bytes / ${totalBytes} bytes)`;
// 				})
// 			})
// 			request.on("close", () => {
// 				this.log("Request closed");
// 				if (currentBytes == totalBytes) {
// 					this.log("Download successful, unzipping repo...");
// 					let zip = new Zip(`${repoPath}.zip`);
// 					zip.extractAllTo(appPath);
// 					this.log("Repo unzipped");
// 					fs.unlink(`${repoPath}.zip`, () => {}); // No longer any need for the zip, also this has an empty callback because apparently not passing in a callback is deprecated (?)
// 					this.checkForRepo();
// 				}
// 				else {
// 					this.log("Download unsuccessful");
// 				}
// 			});
// 			request.on("error", (err) => {
// 				this.log(`Request errored: ${err}`);
// 			});
// 			request.end();
// 		},
// 		deleteRepo: function() {
// 			this.topLabel = "Deleting repo...";
// 			rimraf(repoPath, {disableGlob: true}, (err) => {
// 				if (err) {
// 					this.log(`Failed to delete: ${err}`);
// 				}
// 				else {
// 					this.log("Deleted repo successfully");
// 				}
// 				this.checkForRepo();
// 			});
// 		},
// 		toggleServer: function() {
// 			if (this.server != undefined) {
// 				this.log("Stopping server...");
// 				this.serverControl = "Stopping...";
// 				let self = this;
// 				this.server.stop(() => {
// 					self.log("Stopped");
// 					self.serverControl = "Enable Server";
// 					self.server = undefined;
// 				});
// 			}
// 			else {
// 				this.log("Starting server...");
// 				this.serverControl = "Starting...";
// 				this.server = new harponica.Server(harpPath);
// 				let self = this;
// 				this.server.start(8080, () => {
// 					self.log("Started");
// 					self.serverControl = "Disable Server";
// 				});
// 			}
// 		},
// 		log: function(msg) {
// 			this.logText += msg + "\n";
// 			console.log(msg);
// 		}
// 	}
// });