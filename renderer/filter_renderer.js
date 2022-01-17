const { ipcRenderer } = require("electron");

var rgb = { r: "123", g: "123", b: "123" };

var blurValue = 1.0;
var sharpenValue = 1.0;
var medianValue = 5;

document.getElementById("blurValue").addEventListener("input", (event) => {
  blurValue = event.target.value;
});

document.getElementById("blurBtn").addEventListener("click", () => {
  ipcRenderer.send("blurValueSEND", Number(blurValue));
});

document.getElementById("sharpenValue").addEventListener("input", (event) => {
  sharpenValue = event.target.value;
});

document.getElementById("sharpenBtn").addEventListener("click", () => {
  ipcRenderer.send("sharpenValueSEND", Number(sharpenValue));
});

document.getElementById("medianValue").addEventListener("input", (event) => {
  medianValue = event.target.value;
});

document.getElementById("medianBtn").addEventListener("click", () => {
  ipcRenderer.send("medianValueSEND", Number(medianValue));
});

document.getElementById("negativeBtn").addEventListener("click", () => {
  ipcRenderer.send("negativeImgREQ");
});

document.getElementById("grayScaleBtn").addEventListener("click", () => {
  ipcRenderer.send("grayScaleImgREQ");
});

document.getElementById("tintExecuteBtn").addEventListener("click", () => {
  ipcRenderer.send("tintValueSEND", rgb);
});

document.getElementById("normalizeBtn").addEventListener("click", () => {
  ipcRenderer.send("normalizeImgREQ");
});

document.getElementById("redValue").addEventListener("input", (event) => {
  rgb.r = event.target.value; //parseInt(event.target.value, 10).toString(16).padStart(2, "0");
  updateTintBtnBackground(rgb);
});

document.getElementById("greenValue").addEventListener("input", (event) => {
  rgb.g = event.target.value; //parseInt(event.target.value, 10).toString(16).padStart(2, "0");
  updateTintBtnBackground(rgb);
});

document.getElementById("blueValue").addEventListener("input", (event) => {
  rgb.b = event.target.value; //parseInt(event.target.value, 10).toString(16).padStart(2, "0");
  updateTintBtnBackground(rgb);
});

function updateTintBtnBackground(rgb) {
  console.log(rgb);
  var colorString = `#${parseInt(rgb.r, 10)
    .toString(16)
    .padStart(2, "0")}${parseInt(rgb.g, 10)
    .toString(16)
    .padStart(2, "0")}${parseInt(rgb.b, 10).toString(16).padStart(2, "0")}`;
  console.log(colorString);
  document.getElementById("tintExecuteBtn").style.backgroundColor = colorString;
}
