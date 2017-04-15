const application = require("electron").remote.app;
const {net} = require("electron").remote;
const path = require("path");
const fs = require("fs");
const Zip = require("adm-zip");
const harponica = require("harponica");

const repoURL = "https://github.com/UniversityHigh/universityhigh.github.io/archive/master.zip"; // Repo can be downloaded from here
const appPath = application.getPath("userData"); // All app files go here
const repoPath = path.join(appPath, "universityhigh.github.io-master"); // Repo should be here
const harpPath = path.join(repoPath, "_harp");

new Vue({
	el: "#app",
	data: {
		authenticated: false,
		topLabel: "Searching for repo...",
		bottomLabel: "Server is offline.",
		repoFound: false,
		serverControl: "Enable Server",
		logText: "",
		server: undefined
	},
	mounted: function() {
		this.checkForRepo();
	},
	methods: {
		checkForRepo: function() {
			if (fs.existsSync(repoPath)) {
				this.log("Found");
				this.topLabel = "Found repo: " + repoPath;
				this.repoFound = true;
			}
			else {
				this.topLabel = "Couldn't find repo. Need to download.";
				this.repoFound = false;
			}
		},
		downloadRepo: function() {
			let request = new net.request(repoURL);
			let currentBytes = 0;
			let totalBytes = 0;
			this.log("Sending download request...");
			request.on("response", (res) => {
				if (!("content-length" in res.headers)) {
					this.log("Request didn't contain a content-length???");
					return;
				}
				totalBytes = res.headers["content-length"][0]; // Might not always exist
				res.on("data", (data) => {
					currentBytes += data.length;
					fs.appendFileSync(`${repoPath}.zip`, data);
					this.topLabel = `Downloading repo zip file (${currentBytes} bytes / ${totalBytes} bytes)`;
				})
			})
			request.on("close", () => {
				this.log("Request closed");
				if (currentBytes == totalBytes) {
					this.log("Download successful, unzipping repo...");
					let zip = new Zip(`${repoPath}.zip`);
					zip.extractAllTo(appPath);
					this.log("Repo unzipped");
					fs.unlink(`${repoPath}.zip`, () => {}); // No longer any need for the zip, also this has an empty callback because apparently not passing in a callback is deprecated (?)
					this.checkForRepo();
				}
				else {
					this.log("Download unsuccessful");
				}
			});
			request.on("error", (err) => {
				this.log(`Request errored: ${err}`);
			});
			request.end();
		},
		deleteRepo: function() {
			this.topLabel = "Deleting repo...";
			fs.rmdir(repoPath, (err) => {
				if (err) {
					this.log(`Failed to delete: ${err}`);
				}
				else {
					this.log("Deleted repo successfully");
				}
				this.checkForRepo();
			});
		},
		toggleServer: function() {
			if (this.server != undefined) {
				this.log("Stopping server...");
				this.serverControl = "Stopping...";
				let self = this;
				this.server.stop(() => {
					self.log("Stopped");
					self.serverControl = "Enable Server";
					self.server = undefined;
				});
			}
			else {
				this.log("Starting server...");
				this.serverControl = "Starting...";
				this.server = new harponica.Server(this.harpPath);
				let self = this;
				this.server.start(8080, () => {
					self.log("Started");
					self.serverControl = "Disable Server";
				});
			}
		},
		log: function(msg) {
			this.logText += msg + "\n";
			console.log(msg);
		}
	}
});