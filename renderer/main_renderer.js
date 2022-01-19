const { ipcRenderer } = require("electron");
const { ImageLayer, openImg } = require("imgkit");
const sharp = require("sharp");
var path = require("path");
var filepath = null;
var buffer = null;
var extension = null;

["resizeBtn", "filterBtn", "rotateBtn"].forEach((item, index, arr) => {
  document.getElementById(item).addEventListener("click", (event) => {
    if (filepath !== null) {
      ipcRenderer.send(`${item.replace("Btn", "")}ImgREQ`);
    }
  });
});

ipcRenderer.send("showMenuREQ", "ping");

ipcRenderer.on("resizeImgCMD", (event, res) => {
  sharp(buffer)
    .resize({ width: document.getElementById("previewImg").width * res })
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("blurImgCMD", (event, res) => {
  sharp(buffer)
    .blur(res)
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("sharpenImgCMD", (event, res) => {
  sharp(buffer)
    .sharpen(res, 1.0, 2.0)
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("normalizeImgCMD", (event) => {
  sharp(buffer)
    .normalize(true)
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("medianImgCMD", (event, res) => {
  sharp(buffer)
    .median(res)
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("rotateImgCMD", (event, res) => {
  sharp(buffer)
    .rotate(res)
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("rotateRightImgCMD", (event) => {
  sharp(buffer)
    .rotate(90)
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("rotateLeftImgCMD", (event) => {
  sharp(buffer)
    .rotate(-90)
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("flipImgCMD", (event) => {
  sharp(buffer)
    .flip()
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("flopImgCMD", (event) => {
  sharp(buffer)
    .flop()
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("bitwiseImgCMD", (event) => {
  sharp(buffer)
    .threshold()
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("negativeImgCMD", (event) => {
  sharp(buffer)
    .negate(true)
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("grayScaleImgCMD", (event) => {
  sharp(buffer)
    .grayscale(true)
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("tintImgCMD", (event, res) => {
  sharp(buffer)
    .tint(res)
    .toBuffer((err, buf, info) => {
      imageLayer.updatePreviewImg(buf, info, extension);
    });
});

var bufferQueue = [];
var infoQueue = [];
var extensionQueue = [];
var i = -1;
var cropOption = false;
var isDrag;

const imageLayer = new ImageLayer();
const canvas = imageLayer.canvas;

const imgPanel = document.body.appendChild(imageLayer.imgPanel);
// imgPanel.appendChild(imageLayer.mainColorBox);
// imageLayer.imgPanel.appendChild(imageLayer.extensionComboBox);
//document.getElementById("imgPanel").appendChild(canvas);

// const canvas = document.getElementById("previewImg");
var sioCheckBox = document.getElementById("showImageOnlyCheckBox");
const cropBtn = document.getElementById("cropBtn");
// var ctx = canvas.getContext("2d");

sioCheckBox.addEventListener("click", (event) => {
  if (sioCheckBox.checked) {
    document.getElementById("mainColorBox").style.visibility = "hidden";
    document.getElementById("imgInfoText").style.visibility = "hidden";
    imageLayer.extensionComboBox.style.visibility = "hidden";
  } else {
    document.getElementById("mainColorBox").style.visibility = "visible";
    document.getElementById("imgInfoText").style.visibility = "visible";
    imageLayer.extensionComboBox.style.visibility = "visible";
  }
});

canvas.addEventListener("mousedown", (event) => {
  isDrag = true;
  if (cropOption) {
    var ctxs = canvas.getContext("2d");
    imageLayer.realPosX = event.clientX;
    imageLayer.realPosY = event.clientY;
    imageLayer.initialX = event.clientX - canvas.getBoundingClientRect().left;
    imageLayer.initialY = event.clientY - canvas.getBoundingClientRect().top;
    ctxs.setLineDash([2]);

    canvas.addEventListener("mousemove", (evt) => {
      if (isDrag && cropOption) {
        ctxs.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
        imageLayer.cropWidth = evt.clientX - event.clientX;
        imageLayer.cropHeight = evt.clientY - event.clientY;
        ctxs.drawImage(image, 0, 0);
        ctxs.strokeRect(
          imageLayer.initialX,
          imageLayer.initialY,
          imageLayer.cropWidth,
          imageLayer.cropHeight
        );
      }
    });
  }
});

document.body.addEventListener("mouseup", (event) => {
  isDrag = false;
  if (
    cropOption &&
    event.x - imageLayer.realPosX < canvas.clientWidth &&
    event.y - imageLayer.realPosY < canvas.clientHeight
  ) {
    if (
      imageLayer.cropWidth < 0 ||
      imageLayer.cropHeight < 0 ||
      imageLayer.cropWidth > canvas.clientWidth ||
      imageLayer.cropHeight > canvas.clientHeight
    ) {
      var ctxs = canvas.getContext("2d");
      ctxs.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      ctxs.drawImage(image, 0, 0);
    } else {
      sharp(buffer)
        .extract({
          left: parseInt(imageLayer.initialX),
          top: parseInt(imageLayer.initialY),
          width: parseInt(imageLayer.cropWidth),
          height: parseInt(imageLayer.cropHeight),
        })
        .toBuffer((err, buf, info) => {
          imageLayer.updatePreviewImg(buf, info, extension);
        });
    }
  }
});

const image = imageLayer.image;
imageLayer.openImg("./assets/addImage.png", "png");

ipcRenderer.on("openImgCMD", (event, res) => {
  filepath = res;
  if (filepath === undefined || filepath === null) {
    imageLayer.openImg("./assets/addImage.png", "png");
  } else {
    extension = path.extname(filepath).replace(".", "");
    imageLayer.openImg(filepath, extension);
  }
});

ipcRenderer.on("setExtensionCMD", (event) => {
  ipcRenderer.send("extensionValueSEND", extension);
});

ipcRenderer.on("saveImgCMD", (event) => {
  imageLayer.saveImg(filepath, extension);
});

ipcRenderer.on("saveAsImgCMD", (event, res) => {
  imageLayer.saveImg(res, extension);
  filepath = res;
});

function undoPreviewImg() {
  if (i === 0) return;

  i--;
  console.log(i);
  try {
    buffer = bufferQueue[i];
    info = infoQueue[i];
    extension = extensionQueue[i];

    canvas.width = infoQueue[i].width;
    canvas.height = infoQueue[i].height;

    image.src = `data:image/${extension};base64, ` + buffer.toString("base64");
    image.onload = () => {
      imageLayer.ctx.drawImage(image, 0, 0);
    };

    imageLayer.updateImgInfoText(info);
    imageLayer.extractMainColors(buffer, info);
    imageLayer.updateExtension(extension);
  } catch (err) {
    i++;
  }
}

function redoPreviewImg() {
  i++;
  try {
    buffer = bufferQueue[i];
    info = infoQueue[i];
    extension = extensionQueue[i];

    canvas.width = infoQueue[i].width;
    canvas.height = infoQueue[i].height;

    image.src = `data:image/${extension};base64, ` + buffer.toString("base64");
    image.onload = () => {
      imageLayer.ctx.drawImage(image, 0, 0);
    };

    imageLayer.updateImgInfoText(info);
    imageLayer.extractMainColors(buffer, info);
    imageLayer.updateExtension(extension);
  } catch (err) {
    i--;
  }
}

canvas.addEventListener("drag", function (event) {}, false);

canvas.addEventListener(
  "dragover",
  function (event) {
    event.preventDefault();
  },
  false
);

canvas.addEventListener(
  "drop",
  function (event) {
    event.preventDefault();
    filepathTmp = event.dataTransfer.files[0]["path"];
    extension = path.extname(filepath).replace(".", "");
    imageLayer.openImg(filepathTmp, extension);
  },
  false
);

cropBtn.addEventListener("click", (event) => {
  isDrag = false;
  // initialX = initialY = cropWidth = cropHeight = 0;
  if (!cropOption) {
    canvas.setAttribute("draggable", false);
    document.body.style.cursor = "crosshair";
    cropBtn.style.backgroundColor = "gray";
    cropOption = true;
  } else {
    canvas.setAttribute("draggable", true);
    document.body.style.cursor = "default";
    cropBtn.style.backgroundColor = "";
    cropOption = false;
  }
});

imageLayer.extensionComboBox.addEventListener("change", (event) => {
  extension = event.target.value;
  sharp(buffer)
    .toFormat(extension)
    .toBuffer((err, buf, info) => {
      buffer = buf;
      imageLayer.updatePreviewImg(buf, info, extension);
      document
        .getElementById("convert_msg")
        .animate([{ opacity: "1" }, { opacity: "0" }], {
          duration: 1800,
          iterations: 1,
        });
    });
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
    undoPreviewImg();
  } else if (event.ctrlKey && event.key === "y") {
    redoPreviewImg();
  } else if (event.ctrlKey && event.key === "s") {
    ipcRenderer.send("saveImgREQ");
  } else if (event.which === 122) {
    ipcRenderer.send("FullScreenREQ");
  } else if (event.key === "Escape") {
    ipcRenderer.send("DefaultScreenREQ");
  }
});
