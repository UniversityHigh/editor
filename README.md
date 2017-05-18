# editor
Electron-based editor enabling school administrators to edit UHSSE.org's content.

## Development Note
The editor's code makes extensive use of eval() statements, which as developers made both Andi and I feel extremely uncomfortable. While they are not ideal in most situations, they were unfortunately the only solution we could devise that would allow the editor to properly traverse parent components' paths, data, and specifically JSON without adversely affecting Vue or other editor functionality. We do not, I repeat, DO NOT recommend using eval() regularly. It is slow and almost never works the way it is intended to. Please forgive us for we have failed you, JavaScript.
