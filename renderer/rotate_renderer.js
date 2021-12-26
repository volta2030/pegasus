const { ipcRenderer } = require("electron");

document.getElementById("flipBtn").addEventListener("click", () => {
  ipcRenderer.send("flipImgREQ");
});

document.getElementById("flopBtn").addEventListener("click", () => {
  ipcRenderer.send("flopImgREQ");
});

document.getElementById("rotateLeftBtn").addEventListener("click", () => {
  ipcRenderer.send("rotateLeftImgREQ");
});

document.getElementById("rotateRightBtn").addEventListener("click", () => {
  ipcRenderer.send("rotateRightImgREQ");
});
