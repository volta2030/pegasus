const { ipcRenderer } = require("electron");
const { ImageLayer } = require("imgkit");

const sharp = require("sharp");
var path = require("path");
var fullScreenFlag = false;

["resizeBtn", "filterBtn", "rotateBtn", "paintBtn"].forEach(
  (item, index, arr) => {
    document.getElementById(item).addEventListener("click", (event) => {
      if (imageLayer.filepath !== null) {
        ipcRenderer.send(`${item.replace("Btn", "")}ImgREQ`);
        ImageLayer.cropFlag = false;
        ImageLayer.drawFlag = false;
      }
    });
  }
);

ipcRenderer.send("showMenuREQ", "ping");

ipcRenderer.on("resizeImgCMD", (event, res) => {
  sharp(imageLayer.buffer)
    .resize({ width: document.getElementById("previewImg").width * res })
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info);
    });
});

ipcRenderer.on("blurImgCMD", (event, res) => {
  sharp(imageLayer.buffer)
    .blur(res)
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info);
    });
});

ipcRenderer.on("sharpenImgCMD", (event, res) => {
  sharp(imageLayer.buffer)
    .sharpen(res, 1.0, 2.0)
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info);
    });
});

ipcRenderer.on("normalizeImgCMD", (event) => {
  sharp(imageLayer.buffer)
    .normalize(true)
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info);
    });
});

ipcRenderer.on("medianImgCMD", (event, res) => {
  sharp(imageLayer.buffer)
    .median(res)
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info);
    });
});

ipcRenderer.on("rotateImgCMD", (event, res) => {
  sharp(imageLayer.buffer)
    .rotate(res)
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info);
    });
});

ipcRenderer.on("rotateRightImgCMD", (event) => {
  sharp(imageLayer.buffer)
    .rotate(90)
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info);
    });
});

ipcRenderer.on("rotateLeftImgCMD", (event) => {
  sharp(imageLayer.buffer)
    .rotate(-90)
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info);
    });
});

ipcRenderer.on("flipImgCMD", (event) => {
  sharp(imageLayer.buffer)
    .flip()
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info);
    });
});

ipcRenderer.on("flopImgCMD", (event) => {
  sharp(imageLayer.buffer)
    .flop()
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info);
    });
});

ipcRenderer.on("bitwiseImgCMD", (event) => {
  sharp(imageLayer.buffer)
    .threshold()
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info);
    });
});

ipcRenderer.on("negativeImgCMD", (event) => {
  sharp(imageLayer.buffer)
    .negate(true)
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info);
    });
});

ipcRenderer.on("grayScaleImgCMD", (event) => {
  sharp(imageLayer.buffer)
    .grayscale(true)
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info);
    });
});

ipcRenderer.on("tintImgCMD", (event, res) => {
  sharp(imageLayer.buffer)
    .tint(res)
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info);
    });
});

ipcRenderer.on("cropImgCMD", (event, res) => {
  ImageLayer.cropFlag = res;
  ImageLayer.dragFlag = false;
  // initialX = initialY = cropWidth = cropHeight = 0;
  if (ImageLayer.cropFlag) {
    canvas.setAttribute("draggable", false);
    document.body.style.cursor = "crosshair";
    // cropBtn.style.backgroundColor = "gray";
  } else {
    canvas.setAttribute("draggable", true);
    document.body.style.cursor = "default";
    // cropBtn.style.backgroundColor = "";
  }
});

ipcRenderer.on("drawImgCMD", (event, res) => {
  ImageLayer.drawFlag = res;
  ImageLayer.dragFlag = false;
  if (ImageLayer.drawFlag) {
    canvas.setAttribute("draggable", false);
  } else {
    canvas.setAttribute("draggable", true);
    document.body.style.cursor = "default";
  }
});

const imageLayer = new ImageLayer();
const canvas = imageLayer.canvas;

const imgPanel = document.body.appendChild(imageLayer.imgPanel);

var sioCheckBox = document.getElementById("showImageOnlyCheckBox");

sioCheckBox.addEventListener("click", (event) => {
  if (sioCheckBox.checked) {
    imageLayer.mainColorBox.style.visibility = "hidden";
    imageLayer.imgInfoText.style.visibility = "hidden";
    imageLayer.extensionComboBox.style.visibility = "hidden";
  } else {
    imageLayer.mainColorBox.style.visibility = "visible";
    imageLayer.imgInfoText.style.visibility = "visible";
    imageLayer.extensionComboBox.style.visibility = "visible";
  }
});

document.body.addEventListener("mouseup", (event) => {
  ImageLayer.dragFlag = false;
  if (
    ImageLayer.cropFlag &&
    event.x - imageLayer.realPosX < canvas.clientWidth &&
    event.y - imageLayer.realPosY < canvas.clientHeight
  ) {
    if (
      imageLayer.cropWidth < 0 ||
      imageLayer.cropHeight < 0 ||
      imageLayer.cropWidth > canvas.clientWidth ||
      imageLayer.cropHeight > canvas.clientHeight
    ) {
      this.ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      this.ctx.drawImage(imageLayer.image, 0, 0);
    } else {
      sharp(imageLayer.buffer)
        .extract({
          left: parseInt(imageLayer.initialX),
          top: parseInt(imageLayer.initialY),
          width: parseInt(imageLayer.cropWidth),
          height: parseInt(imageLayer.cropHeight),
        })
        .toBuffer((err, buf, info) => {
          imageLayer.updatePreviewImg(buf, info);
        });
    }
  }
});

imageLayer.openImg("./assets/addImage.png");
console.log(imageLayer.filepath);
ipcRenderer.on("openImgCMD", (event, res) => {
  imageLayer.filepath = res;
  if (imageLayer.filepath === undefined || imageLayer.filepath === null) {
    imageLayer.openImg("./assets/addImage.png");
  } else {
    imageLayer.openImg(imageLayer.filepath);
  }
});

ipcRenderer.on("setExtensionCMD", (event) => {
  ipcRenderer.send("extensionValueSEND", imageLayer.extension);
});

ipcRenderer.on("saveImgCMD", (event) => {
  // console.log(imageLayer.filepath, imageLayer.extension);
  if (imageLayer.filepath !== "./assets/addImage.png") {
    imageLayer.saveImg(imageLayer.filepath);
  }
});

ipcRenderer.on("saveAsImgCMD", (event, res) => {
  imageLayer.saveImg(res);
});

document.getElementById("mainColor1").addEventListener("click", (event) => {
  const text = document.createElement("textarea");
  document.body.appendChild(text);
  text.value = document.getElementById("mainColor1").title;
  text.select();
  document.execCommand("Copy");
  document.body.removeChild(text);

  document
    .getElementById("copy_msg")
    .animate([{ opacity: "1" }, { opacity: "0" }], {
      duration: 1800,
      iterations: 1,
    });
});

document.getElementById("mainColor2").addEventListener("click", (event) => {
  const text = document.createElement("textarea");
  document.body.appendChild(text);
  text.value = document.getElementById("mainColor2").title;
  text.select();
  document.execCommand("Copy");
  document.body.removeChild(text);

  document
    .getElementById("copy_msg")
    .animate([{ opacity: "1" }, { opacity: "0" }], {
      duration: 1800,
      iterations: 1,
    });
});

document.getElementById("mainColor3").addEventListener("click", (event) => {
  const text = document.createElement("textarea");
  document.body.appendChild(text);
  text.value = document.getElementById("mainColor3").title;
  text.select();
  document.execCommand("Copy");
  document.body.removeChild(text);

  document
    .getElementById("copy_msg")
    .animate([{ opacity: "1" }, { opacity: "0" }], {
      duration: 1800,
      iterations: 1,
    });
});

document.addEventListener("keydown", function (event) {
  if (event.ctrlKey && event.key === "z") {
    imageLayer.undoPreviewImg();
  } else if (event.ctrlKey && event.key === "y") {
    imageLayer.redoPreviewImg();
  } else if (event.ctrlKey && event.key === "s") {
    ipcRenderer.send("saveImgREQ");
  } else if (event.which === 122) {
    if (!fullScreenFlag) {
      ipcRenderer.send("FullScreenREQ");
      fullScreenFlag = true;
    } else {
      ipcRenderer.send("DefaultScreenREQ");
      fullScreenFlag = false;
    }
  }
});
