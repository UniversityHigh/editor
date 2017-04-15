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
		compile: function() {
			this.backend.compile(() => {
				this.log("Compiled");
			});
		},
		openPreview: () => opn("http://localhost:8080"),
		log: function(msg) {
			this.logText += msg + "\n";
			console.log(msg);
		}
	}
});