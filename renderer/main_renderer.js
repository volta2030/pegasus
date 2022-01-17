const { ipcRenderer } = require("electron");
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
      updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("blurImgCMD", (event, res) => {
  sharp(buffer)
    .blur(res)
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("sharpenImgCMD", (event, res) => {
  sharp(buffer)
    .sharpen(res, 1.0, 2.0)
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("normalizeImgCMD", (event) => {
  sharp(buffer)
    .normalize(true)
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("medianImgCMD", (event, res) => {
  sharp(buffer)
    .median(res)
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("rotateImgCMD", (event, res) => {
  sharp(buffer)
    .rotate(res)
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("rotateRightImgCMD", (event) => {
  sharp(buffer)
    .rotate(90)
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("rotateLeftImgCMD", (event) => {
  sharp(buffer)
    .rotate(-90)
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("flipImgCMD", (event) => {
  sharp(buffer)
    .flip()
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("flopImgCMD", (event) => {
  sharp(buffer)
    .flop()
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("negativeImgCMD", (event) => {
  sharp(buffer)
    .negate(true)
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("grayScaleImgCMD", (event) => {
  sharp(buffer)
    .grayscale(true)
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf, info, extension);
    });
});

ipcRenderer.on("tintImgCMD", (event, res) => {
  sharp(buffer)
    .tint(res)
    .toBuffer((err, buf, info) => {
      updatePreviewImg(buf, info, extension);
    });
});

document
  .getElementById("extensionComboBox")
  .addEventListener("change", (event) => {
    extension = event.target.value;
    sharp(buffer)
      .toFormat(extension)
      .toBuffer((err, buf, info) => {
        buffer = buf;
        updatePreviewImg(buf, info, extension);
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

// document.getElementById("cropBtn").addEventListener("click", (event) => {});

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
