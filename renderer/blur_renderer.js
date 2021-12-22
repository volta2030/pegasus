const { ipcRenderer } = require("electron");

var scale = 1.0;
document.getElementById("blurValue").addEventListener("input", (event) => {
  scale = event.target.value;
});

document.getElementById("blurExecuteBtn").addEventListener("click", (event) => {
  console.log("hellow");
  ipcRenderer.send("blurValueSEND", Number(scale));
});
