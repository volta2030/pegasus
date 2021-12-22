const { ipcRenderer } = require("electron");
document.getElementById("rotateLeftBtn").addEventListener("click", () => {
  ipcRenderer.send("rotateLeftImgREQ");
});

document.getElementById("rotateRightBtn").addEventListener("click", () => {
  ipcRenderer.send("rotateRightImgREQ");
});
