const { ipcRenderer } = require("electron");
const sharp = require("sharp");
var path = require("path");
const colour = require("sharp/lib/colour");

var filepath = null;
var buffer = null;
var extension = null;

["resizeBtn", "blurBtn", "sharpenBtn", "rotateBtn", "paintBtn"].forEach(
  (item, index, arr) => {
    document.getElementById(item).addEventListener("click", (event) => {
      if (filepath !== null) {
        ipcRenderer.send(`${item.replace("Btn", "")}ImgREQ`);
      }
    });
  }
);

ipcRenderer.send("showMenuREQ", "ping");

ipcRenderer.on("openImgCMD", (event, res) => {
  try {
    filepath = res;
    extension = path.extname(filepath).replace(".", "");
    openImg(filepath, extension);
  } catch (error) {
    if (filepath === null) {
      document.getElementById("previewImg").src = "./assets/addImage.png";
      filepath = null;
      extension = null;
      buffer = null;
    }
  }
});

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

ipcRenderer.on("saveImgCMD", (event, res) => {
  var base64Data = document.getElementById("previewImg").src;

  if (!base64Data.includes("base64")) {
    sharp(filepath).toFile(res.replace(".png", `.${extension}`), (err) => {
      if (err) {
        console.log("failed to save");
      } else {
        console.log("saved successfully");
      }
    });
  } else {
    base64Data = base64Data.replace(`data:image/${extension};base64`, "");
    res = res.replace(".png", `.${extension}`);
    require("fs").writeFile(res, base64Data, "base64", (err) => {
      if (err) {
        console.log("failed to save");
      } else {
        console.log("saved successfully");
      }
    });
  }
});

document
  .getElementById("previewImg")
  .addEventListener("drag", function (event) {}, false);

document.getElementById("previewImg").addEventListener(
  "dragover",
  function (event) {
    event.preventDefault();
  },
  false
);

document.getElementById("previewImg").addEventListener(
  "drop",
  function (event) {
    event.preventDefault();
    filepath = event.dataTransfer.files[0].path;
    extension = path.extname(filepath).replace(".", "");
    openImg(filepath, extension);
  },
  false
);

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

document.addEventListener("keydown", function (event) {
  if (event.ctrlKey && event.key === "z") {
    undoPreviewImg();
  } else if (event.ctrlKey && event.key === "y") {
    redoPreviewImg();
  }
});
