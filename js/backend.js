const {net, app} = require("electron").remote;
const fs = require("fs");
const path = require("path");
const admZip = require("adm-zip");
const harponica = require("harponica");
const rimraf = require("rimraf");

class Backend {
	constructor() {
		this.userDataPath = app.getPath("userData");
		this.repoURL = "https://github.com/UniversityHigh/universityhigh.github.io/archive/master.zip";
		this.repoPath = path.join(this.userDataPath, "universityhigh.github.io-master");
		this.harponicaPath = path.join(this.repoPath, "_harponica");
		this.server = undefined;
		this.serving = false;
	}

	checkForRepo() {
		return fs.existsSync(this.repoPath);
	}

	fetchRepo(errCallback, progressCallback, successCallback) {
		let request = new net.request(this.repoURL);
		let currentBytes = 0;
		let totalBytes = 0;
		request.on("response", (res) => {
			if (!("content-length" in res.headers)) {
				return errCallback("No content-length???");
			}
		 	totalBytes = res.headers["content-length"][0];
			res.on("data", (data) => {
				currentBytes += data.length;
				fs.appendFileSync(`${this.repoPath}.zip`, data);
				progressCallback(currentBytes, totalBytes);
			});
		});
		request.on("error", (err) => errCallback(err));
		request.on("close", () => {
			if (currentBytes == totalBytes) {
				let zip = new admZip(`${this.repoPath}.zip`);
				zip.extractAllTo(this.userDataPath);
				fs.unlink(`${this.repoPath}.zip`, () => {}); // No longer any need for the zip
				// Empty callback because apparently not passing in a callback is deprecated (?)
				successCallback();
			}
			else {
				return errCallback("Download wasn't completed fully");
			}
		});
		request.end(); // Send it
	}

	deleteRepo(callback) {
		rimraf(this.repoPath, {disableGlob: true}, (err) => callback(err));
	}

	startServer(port, callback) {
		if (!this.checkForRepo()) return;
		if (!this.server) this.server = new harponica.Server(this.harponicaPath);
		this.server.start(port, () => {
			this.serving = true;
			callback();
		});

	}

	stopServer(callback) {
		if (this.server) this.server.stop(() => {
			this.serving = false;
			callback();
		});
	}

	compile(callback) {
		if (!this.server) this.server = new harponica.Server(this.harponicaPath);
		this.server.compile(this.repoPath, callback);
	}


}

module.exports = Backend;