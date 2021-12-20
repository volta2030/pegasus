const { ipcRenderer } = require("electron");
// const { fs } = require("fs");

var scale = 0.5;

document.getElementById("resizeValue").addEventListener("input", (event) => {
  scale = event.target.value;
});

document.getElementById("resizeExecuteBtn").addEventListener("click", () => {
  ipcRenderer.send("resizeValueSEND", scale);
});

// ipcRenderer.on("resizeImageCMD", (event, res) => {
//   console.log(res);
// });
