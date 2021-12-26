const { ipcRenderer } = require("electron");

var scale = 1.0;

document.getElementById("sharpenValue").addEventListener("input", (event) => {
  scale = event.target.value;
});

document
  .getElementById("sharpenExecuteBtn")
  .addEventListener("click", (event) => {
    ipcRenderer.send("sharpenValueSEND", Number(scale));
  });
