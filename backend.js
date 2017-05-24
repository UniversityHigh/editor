const {net, app} = require("electron");
const fs = require("fs");
const path = require("path");
const admZip = require("adm-zip");
const harponica = require("@uhsse/harponica");
const rimraf = require("rimraf");
const request = require("request");
const storage = require("electron-json-storage");

class Backend {
	constructor() {
		this.userDataPath = app.getPath("userData");
		this.repoURL = "https://github.com/UniversityHigh/universityhigh.github.io/archive/master.zip";
		this.headURL = "https://api.github.com/repos/universityhigh/universityhigh.github.io/git/refs/heads/master";
		this.baseCommitURL = "https://api.github.com/repos/UniversityHigh/universityhigh.github.io/git/commits";
		this.repoPath = path.join(this.userDataPath, "universityhigh.github.io-master");
		this.harponicaPath = path.join(this.repoPath, "_harponica");
		this.localsPath = path.join(this.harponicaPath, "_locals.json");
		this.globalsPath = path.join(this.harponicaPath, "_globals.json");
		this.server = undefined;
		this.serving = false;
	}

	checkForRepo() {
		return fs.existsSync(this.repoPath);
	}

	checkForUpdates(msgCallback, errCallback) {
		this.getLatestCommitHash((hash) => {
			this.getHashFromDisk((hashOnDisk) => {
				if (hash == hashOnDisk) return msgCallback(null);
				this.getCommitMessageFromHash(hash, (msg) => {
					msgCallback(msg);
				}, (err) => msgCallback(`Error while obtaining latest commit message, however there are updates available: ${err})`));
			});
		}, (err) => errCallback(`Error while obtaining latest commit hash: ${err}`));
	}

	getLatestCommitHash(hashCallback, errCallback) {
		request({
			url: this.headURL,
			headers: {
				"User-Agent": "UniversityHighEditor"
			}
		}, (err, res, body) => {
			if (err) return errCallback(err);
			if (res.statusCode != 200) return errCallback(`Received error code from server: ${res.statusCode}`);
			try {
				let json = JSON.parse(body);
				let hash = json.object.sha;
				hashCallback(hash);
			}
			catch (err) {
				errCallback(`Received invalid data from server: ${err}`);
			}
		});
	}

	getHashFromDisk(hashCallback) {
		storage.get("commitOnDisk", (err, json) => {
			if (err) return hashCallback(null);
			hashCallback(json.sha);
		});
	}

	getCommitMessageFromHash(hash, msgCallback, errCallback) {
		request({
			url: `${this.baseCommitURL}/${hash}`,
			headers: {
				"User-Agent": "UniversityHighEditor"
			}
		}, (err, res, body) => {
			if (err) return errCallback(err);
			if (res.statusCode != 200) return errCallback(`Received error code from server: ${res.statusCode}`);
			try {
				let json = JSON.parse(body);
				let msg = json.message;
				msgCallback(msg);
			}
			catch (err) {
				errCallback(`Received invalid data from server: ${err}`);
			}
		});
	}

	fetchRepo(errCallback, progressCallback, successCallback) {
		let request = new net.request(this.repoURL);
		let currentBytes = 0;
		let totalBytes = 0;
		request.on("response", (res) => {
			if (!("content-length" in res.headers)) {
				return errCallback("No content-length!");
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
			if (currentBytes != 0 && currentBytes == totalBytes) {
				let zip = new admZip(`${this.repoPath}.zip`);
				zip.extractAllTo(this.userDataPath);
				fs.unlink(`${this.repoPath}.zip`, () => {}); // No longer any need for the zip
				// Empty callback because apparently not passing in a callback is deprecated (?)
				this.getLatestCommitHash((hash) => {
					storage.set("commitOnDisk", {
						sha: hash
					}, (err) => {
						if (err) return errCallback(`Error while saving latest hash to disk: ${err}`);
						successCallback();
					});
				}, (err) => errCallback(`Error while obtaining latest hash for this repo: ${err}`));
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
		if (!this.server) this.server = new harponica(this.harponicaPath);
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

	getJSONForPage(page) {
		if (page == "globals") {
			return JSON.parse(fs.readFileSync(this.globalsPath, "utf8"));
		}
		let json = JSON.parse(fs.readFileSync(this.localsPath, "utf8"));
		return page ? json[page] : json;
	}

	setJSONForPage(page, pageJSON, callback) {
		if (page == "globals") {
			fs.writeFile(this.globalsPath, JSON.stringify(pageJSON, null, 2), (err) => callback(err));
			return;
		}
		let json = JSON.parse(fs.readFileSync(this.localsPath, "utf8")); 
		json[page] = pageJSON;
		fs.writeFile(this.localsPath, JSON.stringify(json, null, 2), (err) => callback(err)); // beautify w/ 2 tabs
	}

	getFile(filePath) {
		return fs.readFileSync(path.join(this.repoPath, filePath));
	}

	compile(callback) {
		if (!this.server) this.server = new harponica(this.harponicaPath);
		this.server.compile(this.repoPath, callback);
	}
}

module.exports = Backend;