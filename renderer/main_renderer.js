const { ipcRenderer } = require("electron");
const { ImageLayer } = require("imgkit");

const sharp = require("sharp");
var path = require("path");
var isDrag = false;
var filepath = null;
var buffer = null;
var infos = null;
var extension = null;
var cropFlag = false;
var drawFlag = false;

["resizeBtn", "filterBtn", "rotateBtn", "paintBtn"].forEach(
  (item, index, arr) => {
    document.getElementById(item).addEventListener("click", (event) => {
      if (filepath !== null) {
        ipcRenderer.send(`${item.replace("Btn", "")}ImgREQ`);
        ImageLayer.cropFlag = false;
        ImageLayer.drawFlag = false;
      }
    });
  }
);

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

ipcRenderer.on("cropImgCMD", (event, res) => {
  cropFlag = res;
  isDrag = false;
  // initialX = initialY = cropWidth = cropHeight = 0;
  if (cropFlag) {
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
  drawFlag = res;
  isDrag = false;
  if (drawFlag) {
    canvas.setAttribute("draggable", false);
  } else {
    canvas.setAttribute("draggable", true);
    document.body.style.cursor = "default";
  }
});

var bufferQueue = [];
var infoQueue = [];
var extensionQueue = [];
var i = -1;
const imageLayer = new ImageLayer();
const canvas = imageLayer.canvas;

const imgPanel = document.body.appendChild(imageLayer.imgPanel);
// imgPanel.appendChild(imageLayer.mainColorBox);
// imageLayer.imgPanel.appendChild(imageLayer.extensionComboBox);
//document.getElementById("imgPanel").appendChild(canvas);

// const canvas = document.getElementById("previewImg");
var sioCheckBox = document.getElementById("showImageOnlyCheckBox");
// const cropBtn = document.getElementById("cropBtn");
// const paintBtn = document.getElementById("paintBtn");
var ctx = imageLayer.canvas.getContext("2d");

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

canvas.addEventListener("mousedown", (event) => {
  isDrag = true;
  if (drawFlag) {
    console.log(drawFlag);
    ctx.beginPath();
    ctx.moveTo(
      event.clientX - canvas.getBoundingClientRect().left,
      event.clientY - canvas.getBoundingClientRect().top
    );
    canvas.addEventListener("mousemove", (evt) => {
      if (isDrag && drawFlag) {
        ctx.lineTo(
          evt.x - canvas.getBoundingClientRect().left,
          evt.y - canvas.getBoundingClientRect().top
        );
        ctx.stroke();
      }
    });
    ctx.closePath();
  }

  if (cropFlag) {
    var ctxs = canvas.getContext("2d");
    imageLayer.realPosX = event.clientX;
    imageLayer.realPosY = event.clientY;
    imageLayer.initialX = event.clientX - canvas.getBoundingClientRect().left;
    imageLayer.initialY = event.clientY - canvas.getBoundingClientRect().top;
    ctxs.setLineDash([2]);

    canvas.addEventListener("mousemove", (evt) => {
      if (isDrag && cropFlag) {
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
    cropFlag &&
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
          infos = info;
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
    imageLayopenImg(filepath, extension);
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
    infos = infoQueue[i];
    extension = extensionQueue[i];

    canvas.width = infoQueue[i].width;
    canvas.height = infoQueue[i].height;

    image.src = `data:image/${extension};base64, ` + buffer.toString("base64");
    image.onload = () => {
      imageLayer.ctx.drawImage(image, 0, 0);
    };

    imageLayer.updateImgInfoText(infos);
    imageLayer.extractMainColors(buffer, infos);
    imageLayer.updateExtension(extension);
  } catch (err) {
    i++;
  }
}

function redoPreviewImg() {
  i++;
  try {
    buffer = bufferQueue[i];
    infos = infoQueue[i];
    extension = extensionQueue[i];

    canvas.width = infoQueue[i].width;
    canvas.height = infoQueue[i].height;

    image.src = `data:image/${extension};base64, ` + buffer.toString("base64");
    image.onload = () => {
      imageLayer.ctx.drawImage(image, 0, 0);
    };

    imageLayer.updateImgInfoText(infos);
    imageLayer.extractMainColors(buffer, infos);
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
    filepath = event.dataTransfer.files[0]["path"];
    extension = path.extname(filepath).replace(".", "");
    imageLayer.openImg(filepath, extension);
  },
  false
);

function inactivate() {}

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
