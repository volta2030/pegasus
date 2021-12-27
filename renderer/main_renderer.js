const { ipcRenderer } = require("electron");
const sharp = require("sharp");
var path = require("path");

var filepath = null;
var buffer = null;
var extension = null;

var imgInfoText = document.getElementById("imgInfoText");

["resizeBtn", "blurBtn", "sharpenBtn", "rotateBtn"].forEach(
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

ipcRenderer.on("sharpenImgCMD", (event, res) => {
  sharp(buffer)
    .sharpen(res, 1.0, 2.0)
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

function updatePreviewImg(buf) {
  document.getElementById("previewImg").src =
    `data:image/${extension};base64, ` + buf.toString("base64");
  buffer = buf;
}

function updateImgInfoText(info) {
  imgInfoText.innerText = `${info.width} x ${info.height}`;
}

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
        updatePreviewImg(buf);
        document
          .getElementById("alert-box")
          .animate([{ opacity: "1" }, { opacity: "0" }], {
            duration: 1800,
            iterations: 1,
          });
      });
  });

function openImg(filepath, extension) {
  sharp(filepath).toBuffer((err, buf, info) => {
    buffer = buf;
    extractMainColors(buf, info);
    updatePreviewImg(buf);
    updateImgInfoText(info);
    updateExtension(extension);
  });
}

function updateExtension(extension) {
  document.getElementById("extensionComboBox").value = extension;
}

function extractMainColors(buffer, info) {
  sharp(buffer)
    .resize({ width: info.width > 32 ? 32 : info.width })
    .toColorspace("srgb")
    .raw()
    .toBuffer((err, result, info) => {
      var colors = {};
      var step;
      var coef = info.width * info.height * 4 === result.length ? 4 : 3;
      var size = result.length / coef;

      for (step = 0; step < size; step++) {
        // Runs 5 times, with values of step 0 through 4.

        if (
          colors[
            `${result[coef * step]} ${result[coef * step + 1]} ${
              result[coef * step + 2]
            }`
          ] !== undefined
        ) {
          colors[
            `${result[coef * step]} ${result[coef * step + 1]} ${
              result[coef * step + 2]
            }`
          ] += 1;
        } else {
          colors[
            `${result[coef * step]} ${result[coef * step + 1]} ${
              result[coef * step + 2]
            }`
          ] = 1;
        }
      }
      const sortColors = Object.entries(colors)
        .sort(([, a], [, b]) => b - a)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

      var rgb = Object.keys(sortColors)[0].split(" ");
      var hexColor = `#${
        parseInt(rgb[0], 10).toString(16).padStart(2, "0") +
        parseInt(rgb[1], 10).toString(16).padStart(2, "0") +
        parseInt(rgb[2], 10).toString(16).padStart(2, "0")
      }`;
      document.getElementById("mainColor1").style.background = hexColor;
      document.getElementById("mainColor1").title = hexColor;

      if (Object.keys(sortColors).length >= 2) {
        rgb = Object.keys(sortColors)[1].split(" ");
        hexColor = `#${
          parseInt(rgb[0], 10).toString(16).padStart(2, "0") +
          parseInt(rgb[1], 10).toString(16).padStart(2, "0") +
          parseInt(rgb[2], 10).toString(16).padStart(2, "0")
        }`;
        document.getElementById("mainColor2").style.background = hexColor;
        document.getElementById("mainColor2").title = hexColor;
      }

      if (Object.keys(sortColors).length >= 3) {
        rgb = Object.keys(sortColors)[2].split(" ");
        hexColor = `#${
          parseInt(rgb[0], 10).toString(16).padStart(2, "0") +
          parseInt(rgb[1], 10).toString(16).padStart(2, "0") +
          parseInt(rgb[2], 10).toString(16).padStart(2, "0")
        }`;
        document.getElementById("mainColor3").style.background = hexColor;
        document.getElementById("mainColor3").title = hexColor;
      }
    });
}
