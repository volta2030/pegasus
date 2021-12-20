const { ipcRenderer } = require("electron");
const sharp = require("sharp");

var filepath = null;

document.getElementById("resizeBtn").addEventListener("click", (event) => {
  if (filepath !== null) {
    ipcRenderer.send("resizeImgREQ");
  }
});

ipcRenderer.send("showMenuREQ", "ping");

ipcRenderer.on("openImageCMD", (event, res) => {
  document.getElementById("previewImg").src = res;
  filepath = res;
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

// document.getElementById("clickBtn").addEventListener("click", () => {
//   console.log("hello");
// });
