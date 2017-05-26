const {ipcRenderer} = require("electron");

const currentPage = "startup.html";
const nextPage = "home.html";

let vm = new Vue({
	el: "#main",
	mounted: function() {
		let repoExists = ipcRenderer.sendSync("checkForRepo");
		if (repoExists) {
			this.status = "Found repo on disk. Checking for updates...";
			ipcRenderer.send("checkForUpdates");
			ipcRenderer.on("updatesAvailable", (event, latestCommitMsg) => {
				if (latestCommitMsg == null) {
					this.status = "No updates available.";
					this.prepareForNextPage();
				}
				else {
					this.status = `Update found with commit message: ${latestCommitMsg}`;
					this.updateAvailable = true;
				}
			});
			ipcRenderer.on("updateCheckFailed", (event, err) => {
				this.status = `Failed to check for updates with error: ${err}. Try restarting the application and check your Internet connection.`;
				this.failed = true;
			});
		}
		else {
			this.status = "No repo on disk. Downloading...";
			ipcRenderer.send("fetchRepo");
			ipcRenderer.on("fetchRepoErr", (event, err) => {
				this.status = `Couldn't download the repo due to an error: ${err}.`;
				this.failed = true;
			})
			ipcRenderer.on("fetchRepoProgress", (event, currentBytes, totalBytes) => {
				let percentage = ((currentBytes / totalBytes) * 100).toFixed(0);
				this.status = `No repo on disk. Downloading... ${percentage}%`;
 			});
			ipcRenderer.on("fetchRepoSuccess", (event) => {
				this.status = "Successfully downloaded repo."
				this.prepareForNextPage();
			});
		}
	},
	methods: {
		updateNow: function() {
			this.updateAvailable = false;
			this.status = "Deleting repo on disk...";
			ipcRenderer.send("deleteRepo");
			ipcRenderer.on("deletedRepo", (event, err) => {
				if (err) {
					this.status = "Failed to delete repo on disk. Try restarting the application.";
					this.failed = true;
				}
				else {
					this.status = "Repo deleted.";
					window.location.assign(currentPage); // Refresh to trigger download procedure
				}
			});

		},
		prepareForNextPage: function() {
			this.status = "Starting live server...";
			ipcRenderer.send("startServer");
			ipcRenderer.on("serverStarted", (event) => {
				window.location.assign(nextPage);
			});
		},
		reload: function() {
			window.location.assign(currentPage);
		}
	},
	data: {
		backend: null,
		status: "Checking for repo on disk...",
		updateAvailable: false,
		failed: true
	}
});