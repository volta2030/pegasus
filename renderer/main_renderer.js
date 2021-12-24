const { ipcRenderer } = require("electron");
const sharp = require("sharp");

var filepath = null;
var buffer = null;
var extension = null;

var imgInfoText = document.getElementById("imgInfoText");

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
  extension = getExtension(filepath);
  sharp(filepath).toBuffer((err, buf, info) => {
    buffer = buf;
    updateImgInfoText(info);
  });
});

ipcRenderer.on("resizeImgCMD", (event, res) => {
  sharp(buffer)
    .resize({ width: document.getElementById("previewImg").width * res })
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf);
      updateImgInfoText(info);
    });
});

ipcRenderer.on("blurImgCMD", (event, res) => {
  sharp(buffer)
    .blur(res)
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf);
    });
});

ipcRenderer.on("rotateRightImgCMD", (event) => {
  sharp(buffer)
    .rotate(90)
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf);
      updateImgInfoText(info);
    });
});

ipcRenderer.on("rotateLeftImgCMD", (event) => {
  sharp(buffer)
    .rotate(-90)
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf);
      updateImgInfoText(info);
    });
});

ipcRenderer.on("flipImgCMD", (event) => {
  sharp(buffer)
    .flip()
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf);
    });
});

ipcRenderer.on("flopImgCMD", (event) => {
  sharp(buffer)
    .flop()
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf);
    });
});

ipcRenderer.on("saveImageCMD", (event, res) => {
  var base64Data = document.getElementById("previewImg").src;
  console.log(res);
  if (!base64Data.includes("base64")) {
    sharp(filepath).toFile(res, (err) => {
      if (err) {
        console.log("failed to save");
      } else {
        console.log("saved successfully");
      }
    });
  } else {
    base64Data = base64Data.replace(`data:image/${extension};base64`, "");
    res = extension === "jpg" ? res.replace(".png", ".jpg") : res;
    require("fs").writeFile(res, base64Data, "base64", (err) => {
      if (err) {
        console.log("failed to save");
      } else {
        console.log("saved successfully");
      }
    });
  }
});

function getExtension(filepath) {
  return filepath.includes(".jpg") ? "jpg" : "png";
}

function updatePreviewImg(buf) {
  document.getElementById("previewImg").src =
    `data:image/${extension};base64, ` + buf.toString("base64");

  buffer = buf;
}

function updateImgInfoText(info) {
  imgInfoText.innerText = `${info.width} x ${info.height}`;
}
