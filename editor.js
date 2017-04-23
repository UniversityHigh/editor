const {app, BrowserWindow, ipcMain} = require("electron");
const path = require("path");
const url = require("url");
const backendModule = require("./backend");

let win;
let backend = new backendModule();
let port = 8080; // Add some way to change this at some point

ipcMain.on("checkForRepo", (event) => event.returnValue = backend.checkForRepo());
ipcMain.on("fetchRepo", (event) => {
	backend.fetchRepo(
		(err) => win.webContents.send("fetchRepoErr", err), 
		(currentBytes, totalBytes) => win.webContents.send("fetchRepoProgress", currentBytes, totalBytes),
		() => win.webContents.send("fetchRepoSuccess")
		);
});
ipcMain.on("deleteRepo", (event) => {
	backend.deleteRepo((err) => win.webContents.send("deletedRepo", err));
});
ipcMain.on("checkForUpdates", (event) => {
	backend.checkForUpdates(
		(msg) => win.webContents.send("updatesAvailable", msg), 
		(err) => win.webContents.send("updateCheckFailed", err));
});
ipcMain.on("startServer", (event) => {
	backend.startServer(port, () => {
		win.webContents.send("serverStarted");
	});
});

function createWindow() {
	win = new BrowserWindow({
		minWidth: 768,
		minHeight: 480,
		width: 800,
		height: 600,
		icon: __dirname + "/img/icon.ico"
	});
	win.loadURL(`file:///${__dirname}/startup.html`);
	win.setMenuBarVisibility(false);
	win.webContents.openDevTools();
	win.on("closed", () => {
		win = null;
	});
}

app.on("ready", createWindow);

app.on('activate', () => {
	if (win === null) {
		createWindow();
	}
});

app.on("windows-all-closed", app.quit);