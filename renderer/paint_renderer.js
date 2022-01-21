const { ipcRenderer } = require("electron");
var { drawFlag, cropFlag } = require("imgkit");

document.getElementById("drawBtn").addEventListener("click", () => {
  if (!drawFlag) {
    drawFlag = true;
    if (cropFlag) cropFlag = false;
  } else {
    drawFlag = false;
  }
  ipcRenderer.send("drawImgREQ", drawFlag);
});
