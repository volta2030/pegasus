const { ipcRenderer } = require("electron");
const sharp = require("sharp");

var filepath = null;
var buffer = null;

["resizeBtn", "blurBtn", "rotateBtn"].forEach((item, index, arr) => {
  document.getElementById(item).addEventListener("click", (event) => {
    if (filepath !== null) {
      ipcRenderer.send(`${item.replace("Btn", "")}ImgREQ`);
    }
  });
});

ipcRenderer.send("showMenuREQ", "ping");

ipcRenderer.on("openImageCMD", (event, res) => {
  document.getElementById("previewImg").src = filepath = res;
  sharp(filepath).toBuffer((err, buf, info) => {
    buffer = buf;
  });
});

ipcRenderer.on("resizeImgCMD", (event, res) => {
  sharp(buffer)
    .resize({ width: document.getElementById("previewImg").width * res })
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf);
      buffer = buf;
    });
});

ipcRenderer.on("blurImgCMD", (event, res) => {
  sharp(buffer)
    .blur(res)
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf);
      buffer = buf;
    });
});

ipcRenderer.on("rotateRightImgCMD", (event) => {
  sharp(buffer)
    .rotate(90)
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf);
      buffer = buf;
    });
});

ipcRenderer.on("rotateLeftImgCMD", (event) => {
  sharp(buffer)
    .rotate(-90)
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf);
      buffer = buf;
    });
});

ipcRenderer.on("saveImageCMD", (event, res) => {
  var base64Data = document.getElementById("previewImg").src;

  if (!base64Data.includes("base64")) {
    sharp(filepath).toFile(res, (err) => {
      if (err) {
        console.log("failed to save");
      } else {
        console.log("saved successfully");
      }
    });
  } else {
    base64Data = base64Data.replace("data:image/png;base64", "");
    require("fs").writeFile(res, base64Data, "base64", (err) => {
      if (err) {
        console.log("failed to save");
      } else {
        console.log("saved successfully");
      }
    });
  }
});

function updatePreviewImg(buf) {
  document.getElementById("previewImg").src =
    "data:image/png;base64, " + buf.toString("base64");
}
