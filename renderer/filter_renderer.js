const {ipcRenderer} = require('electron');


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