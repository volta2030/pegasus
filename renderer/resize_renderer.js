const { ipcRenderer } = require("electron");
var { cropFlag, drawFlag } = require("imgkit");

var scale = 2;

document.getElementById("resizeValue").addEventListener("input", (event) => {
  scale = event.target.value;
});

document.getElementById("resizeExecuteBtn").addEventListener("click", () => {
  ipcRenderer.send("resizeValueSEND", scale);
});

document.getElementById("cropBtn").addEventListener("click", () => {
  if (!cropFlag) {
    cropFlag = true;
    if (drawFlag) drawFlag = false;
  } else {
    cropFlag = false;
  }
  ipcRenderer.send("cropImgREQ", cropFlag);
});
