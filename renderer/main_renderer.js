const { ipcRenderer } = require("electron");
const fs = require("fs");
const sharp = require("sharp");

var filepath = null;

document.getElementById("resizeBtn").addEventListener("click", (event) => {
  if (filepath !== null) {
    ipcRenderer.send("resizeImgREQ");
  }
});

ipcRenderer.send("showMenuREQ", "ping");

ipcRenderer.on("openImageCMD", (event, res) => {
  document.getElementById("previewImg").src = filepath = res;
});

ipcRenderer.on("resizeImageCMD", (event, res) => {
  sharp(filepath)
    .resize({ width: document.getElementById("previewImg").width * res })
    .toBuffer((err, buffer, info) => {
      // console.log(buffer);
      document.getElementById("previewImg").src =
        "data:image/png;base64, " + buffer.toString("base64");
    });

  // .toFile("./output.png", () => {
  // document.getElementById("previewImg").src = "./output.png";
  // });
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

// document.getElementById("clickBtn").addEventListener("click", () => {
//   console.log("hello");
// });
