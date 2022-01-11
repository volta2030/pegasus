const { createBrotliCompress } = require("zlib");

var bufferQueue = [];
var infoQueue = [];
var extensionQueue = [];
var i = -1;

var canvas = document.getElementById("previewImg");
canvas.setAttribute("class", "img-canvas");
var ctx = canvas.getContext("2d");
const image = new Image();
openImg("./assets/addImage.png", "png");

ipcRenderer.on("openImgCMD", (event, res) => {
  filepath = res;
  if (filepath === undefined || filepath === null) {
    openImg("./assets/addImage.png", "png");
  } else {
    extension = path.extname(filepath).replace(".", "");
    openImg(filepath, extension);
  }
});

ipcRenderer.on("setExtensionCMD", (event) => {
  ipcRenderer.send("extensionValueSEND", extension);
});

ipcRenderer.on(
  "saveImgCMD",
  (event, res) => {
    var base64Data = image.src.replace(`data:image/${extension};base64,`, "");
    // console.log(base64Data);
    require("fs").writeFile(res, base64Data, "base64", (err) => {
      if (err) {
        console.log("failed to save");
      } else {
        console.log("saved successfully");
      }
    });
  }
  // }
);

function openImg(filepath, extension) {
  sharp(filepath).toBuffer((err, buf, info) => {
    updatePreviewImg(buf, info, extension);
  });
}

function updatePreviewImg(buf, info, extension) {
  canvas.width = info.width;
  canvas.height = info.height;

  image.src = `data:image/${extension};base64, ` + buf.toString("base64");
  image.onload = () => {
    ctx.drawImage(image, 0, 0, info.width, info.height);
  };

  // console.log(canvas.toDataURL());

  updateImgInfoText(info);
  extractMainColors(buf, info);
  updateExtension(extension);

  buffer = buf;
  i++;

  if (i > 10) {
    bufferQueue.shift();
    infoQueue.shift();
    extensionQueue.shift();
    i--;
  } else {
    if (bufferQueue[i + 1] !== null) {
      bufferQueue = bufferQueue.slice(0, i);
      infoQueue = infoQueue.slice(0, i);
      extensionQueue = extensionQueue.slice(0, i);
    }
  }
  bufferQueue.push(buf);
  infoQueue.push(info);
  extensionQueue.push(extension);
}

function updateExtension(extension) {
  document.getElementById("extensionComboBox").value = extension;
}

function updateImgInfoText(info) {
  document.getElementById(
    "imgInfoText"
  ).innerText = `${info.width} x ${info.height}`;
}

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

    const image = new Image();
    image.src = `data:image/${extension};base64, ` + buffer.toString("base64");
    image.onload = () => {
      ctx.drawImage(image, 0, 0);
    };

    updateImgInfoText(info);
    extractMainColors(buffer, info);
    updateExtension(extension);
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

    const image = new Image();
    image.src = `data:image/${extension};base64, ` + buffer.toString("base64");
    image.onload = () => {
      ctx.drawImage(image, 0, 0);
    };

    extractMainColors(buffer, info);
    updateImgInfoText(info);
    updateExtension(extension);
  } catch (err) {
    i--;
  }
}

function extractMainColors(buffer, info) {
  //initialize
  document.getElementById("mainColor1").style.background = null;
  document.getElementById("mainColor1").title = "empty";
  document.getElementById("mainColor2").style.background = null;
  document.getElementById("mainColor2").title = "empty";
  document.getElementById("mainColor3").style.background = null;
  document.getElementById("mainColor3").title = "empty";

  sharp(buffer)
    .resize({ width: info.width > 24 ? 24 : info.width })
    .toColorspace("srgb")
    .raw()
    .toBuffer((err, result, info) => {
      var colors = {};
      var step;
      var coef = info.width * info.height * 4 === result.length ? 4 : 3;
      var size = result.length / coef;

      for (step = 0; step < size; step++) {
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
    filepath = event.dataTransfer.files[0]["path"];
    extension = path.extname(filepath).replace(".", "");
    openImg(filepath, extension);
  },
  false
);
