const sharp = require("sharp");
var path = require("path");

// class ImageLayerQueue {
//   static imageLayerQueue = [];
//   static num = 0;
// }

const imageLayerQueue = [];

class Parameter {
  static num = 0;
}

class ImageLayer {
  static drawFlag = false;
  static cropFlag = false;
  static dragFlag = false;

  constructor() {
    this.filepath = null;
    this.buffer;
    this.information;
    this.extension;
    this.bufferQueue = [];
    this.infoQueue = [];
    this.extensionQueue = [];
    this.i = -1;
    this.sio = false;

    //initialize
    this.imgPanel = document.createElement("div");
    this.imgPanel.className = "imgPanel";
    this.imgPanel.id = Parameter.num;

    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("class", "img-canvas");
    this.canvas.className = "previewImg";
    this.canvas.id = "default";

    this.mainColorBox = document.createElement("div");
    this.mainColorBox.className = "mainColorBox";

    this.mainColor1 = document.createElement("div");
    this.mainColor1.className = "mainColor1";
    this.mainColor1.className = "colorBox";

    this.mainColor2 = document.createElement("div");
    this.mainColor2.className = "mainColor2";
    this.mainColor2.className = "colorBox";

    this.mainColor3 = document.createElement("div");
    this.mainColor3.className = "mainColor3";
    this.mainColor3.className = "colorBox";

    this.mainColor1.addEventListener("click", (event) => {
      const text = document.createElement("textarea");
      this.imgPanel.appendChild(text);
      text.value = this.mainColor1.title;
      text.select();
      document.execCommand("Copy");
      this.imgPanel.removeChild(text);

      document
        .getElementById("copy_msg")
        .animate([{ opacity: "1" }, { opacity: "0" }], {
          duration: 1800,
          iterations: 1,
        });
    });

    this.mainColor2.addEventListener("click", (event) => {
      const text = document.createElement("textarea");
      this.imgPanel.appendChild(text);
      text.value = this.mainColor2.title;
      text.select();
      document.execCommand("Copy");
      this.imgPanel.removeChild(text);

      document
        .getElementById("copy_msg")
        .animate([{ opacity: "1" }, { opacity: "0" }], {
          duration: 1800,
          iterations: 1,
        });
    });

    this.mainColor3.addEventListener("click", (event) => {
      const text = document.createElement("textarea");
      this.imgPanel.appendChild(text);
      text.value = this.mainColor3.title;
      text.select();
      document.execCommand("Copy");
      this.imgPanel.removeChild(text);

      document
        .getElementById("copy_msg")
        .animate([{ opacity: "1" }, { opacity: "0" }], {
          duration: 1800,
          iterations: 1,
        });
    });

    //
    this.imgInfoText = document.createElement("h2");
    this.imgInfoText.id = "imgInfoText";
    //
    this.extensionComboBox = document.createElement("select");
    this.extensionComboBox.id = "extensionComboBox";

    this.defaultOption = document.createElement("option");
    this.defaultOption.value = "default";
    this.pngOption = document.createElement("option");
    this.pngOption.value = "png";
    this.pngOption.innerText = "png";
    this.jpgOption = document.createElement("option");
    this.jpgOption.value = "jpg";
    this.jpgOption.innerText = "jpg";
    this.jpegOption = document.createElement("option");
    this.jpegOption.value = "jpeg";
    this.jpegOption.innerText = "jpeg";
    this.webpOption = document.createElement("option");
    this.webpOption.value = "webp";
    this.webpOption.innerText = "webp";

    this.ctx = this.canvas.getContext("2d");

    this.initialX;
    this.initialY;
    this.cropWidth;
    this.cropHeight;

    this.realPosX;
    this.realPosY;

    this.image = new Image();
    this.filepath;

    this.build();
  }

  build() {
    this.imgPanel.addEventListener("click", (event) => {
      Parameter.num = this.imgPanel.id;
      this.updateFocus();
      this.updateSio();
      // console.log(this.imgPanel.id);
      // console.log(Parameter.num);
    });
    // this.ctx.lineWidth = 1;
    this.canvas.addEventListener("drag", function (event) {}, false);

    this.canvas.addEventListener(
      "dragover",
      function (event) {
        event.preventDefault();
      },
      false
    );

    this.canvas.addEventListener("drop", (event) => {
      event.preventDefault();
      if (this.canvas.id !== "full") {
        Parameter.num++;
        imageLayerQueue.push(new ImageLayer());
        document.body.appendChild(imageLayerQueue[Parameter.num].imgPanel);
        imageLayerQueue[Parameter.num].openImg("./assets/addImage.png");
      }
      this.openImg(event.dataTransfer.files[0]["path"]);
    });

    this.canvas.addEventListener("mousedown", (event) => {
      ImageLayer.dragFlag = true;
      if (ImageLayer.drawFlag) {
        // console.log( ImageLayer.drawFlag);
        this.ctx.beginPath();
        this.ctx.moveTo(
          event.clientX - this.canvas.getBoundingClientRect().left,
          event.clientY - this.canvas.getBoundingClientRect().top
        );
        this.canvas.addEventListener("mousemove", (evt) => {
          if (ImageLayer.dragFlag && ImageLayer.drawFlag) {
            this.ctx.lineTo(
              evt.x - this.canvas.getBoundingClientRect().left,
              evt.y - this.canvas.getBoundingClientRect().top
            );
            this.ctx.stroke();
          }
        });
        this.ctx.closePath();
      }

      if (ImageLayer.cropFlag) {
        var ctxs = this.canvas.getContext("2d");
        this.realPosX = event.clientX;
        this.realPosY = event.clientY;
        this.initialX =
          event.clientX - this.canvas.getBoundingClientRect().left;
        this.initialY = event.clientY - this.canvas.getBoundingClientRect().top;
        ctxs.setLineDash([2]);

        this.canvas.addEventListener("mousemove", (evt) => {
          if (ImageLayer.dragFlag && ImageLayer.cropFlag) {
            ctxs.clearRect(
              0,
              0,
              this.canvas.clientWidth,
              this.canvas.clientHeight
            );
            this.cropWidth = evt.clientX - event.clientX;
            this.cropHeight = evt.clientY - event.clientY;
            ctxs.drawImage(this.image, 0, 0);
            ctxs.strokeRect(
              this.initialX,
              this.initialY,
              this.cropWidth,
              this.cropHeight
            );
          }
        });
      }
    });

    this.canvas.addEventListener("mouseup",(event)=>{
      if(ImageLayer.drawFlag){
        //paste
      }
    })

    this.imgPanel.appendChild(this.canvas);
    this.imgPanel.appendChild(this.mainColorBox);
    this.imgPanel.appendChild(this.imgInfoText);
    this.imgPanel.appendChild(this.extensionComboBox);

    this.mainColorBox.appendChild(this.mainColor1);
    this.mainColorBox.appendChild(this.mainColor2);
    this.mainColorBox.appendChild(this.mainColor3);

    this.extensionComboBox.appendChild(this.defaultOption);
    this.extensionComboBox.appendChild(this.pngOption);
    this.extensionComboBox.appendChild(this.jpgOption);
    this.extensionComboBox.appendChild(this.jpegOption);
    this.extensionComboBox.appendChild(this.webpOption);
    this.extensionComboBox.addEventListener("change", (event) => {
      this.extension = event.target.value;
      this.filepath = this.filepath.replace(
        path.extname(this.filepath),
        `.${this.extension}`
      );
      sharp(this.buffer)
        .toFormat(this.extension)
        .toBuffer((err, buf, info) => {
          this.updatePreviewImg(buf, info);
          document
            .getElementById("convert_msg")
            .animate([{ opacity: "1" }, { opacity: "0" }], {
              duration: 1800,
              iterations: 1,
            });
        });
    });
  }

  updateFocus() {
    for (var j = 0; j < imageLayerQueue.length; j++) {
      // console.log(imageLayerQueue.length);
      // console.log(Parameter.num);
      // console.log(j);
      if (j == Parameter.num) {
        imageLayerQueue[j].imgPanel.style.border = "solid #e0e0e0 1px";
        imageLayerQueue[j].imgPanel.style.borderRadius = "5px";
      } else {
        imageLayerQueue[j].imgPanel.style.border = "none";
      }
    }
    this.imgPanel.focus();
  }

  updateSio() {
    if (this.sio) {
      document.getElementById("showImageOnlyCheckBox").checked = true;
      this.mainColorBox.style.visibility = "hidden";
      this.imgInfoText.style.visibility = "hidden";
      this.extensionComboBox.style.visibility = "hidden";
    } else {
      document.getElementById("showImageOnlyCheckBox").checked = false;
      this.mainColorBox.style.visibility = "visible";
      this.imgInfoText.style.visibility = "visible";
      this.extensionComboBox.style.visibility = "visible";
    }
  }

  updatePreviewImg(buf, info) {
    this.buffer = buf;
    this.information = info;
    this.canvas.width = info.width;
    this.canvas.height = info.height;

    this.image.src =
      `data:image/${this.extension};base64, ` + buf.toString("base64");
    this.image.onload = () => {
      this.ctx.drawImage(this.image, 0, 0, info.width, info.height);
    };

    this.updateImgInfoText(info);
    this.extractMainColors(buf, info);
    this.updateExtension();

    this.buffer = buf;
    this.i++;

    if (this.i > 10) {
      this.bufferQueue.shift();
      this.infoQueue.shift();
      this.extensionQueue.shift();
      this.i--;
    } else {
      if (this.bufferQueue[this.i + 1] !== null) {
        this.bufferQueue = this.bufferQueue.slice(0, this.i);
        this.infoQueue = this.infoQueue.slice(0, this.i);
        this.extensionQueue = this.extensionQueue.slice(0, this.i);
      }
    }
    this.bufferQueue.push(buf);
    this.infoQueue.push(info);
    this.extensionQueue.push(this.extension);
  }

  updateImgInfoText(info) {
    this.imgInfoText.innerText = `${info.width} x ${info.height}`;
  }

  extractMainColors(buffer, info) {
    //initialize
    this.mainColor1.style.background = null;
    this.mainColor1.title = "empty";
    this.mainColor2.style.background = null;
    this.mainColor2.title = "empty";
    this.mainColor3.style.background = null;
    this.mainColor3.title = "empty";

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
        this.mainColor1.style.background = hexColor;
        this.mainColor1.title = hexColor;

        if (Object.keys(sortColors).length >= 2) {
          rgb = Object.keys(sortColors)[1].split(" ");
          hexColor = `#${
            parseInt(rgb[0], 10).toString(16).padStart(2, "0") +
            parseInt(rgb[1], 10).toString(16).padStart(2, "0") +
            parseInt(rgb[2], 10).toString(16).padStart(2, "0")
          }`;
          this.mainColor2.style.background = hexColor;
          this.mainColor2.title = hexColor;
        }

        if (Object.keys(sortColors).length >= 3) {
          rgb = Object.keys(sortColors)[2].split(" ");
          hexColor = `#${
            parseInt(rgb[0], 10).toString(16).padStart(2, "0") +
            parseInt(rgb[1], 10).toString(16).padStart(2, "0") +
            parseInt(rgb[2], 10).toString(16).padStart(2, "0")
          }`;
          this.mainColor3.style.background = hexColor;
          this.mainColor3.title = hexColor;
        }
      });
  }

  updateExtension() {
    this.extensionComboBox.value = this.extension;
  }

  openImg(filepath) {
    if (filepath !== "./assets/addImage.png") {
      this.canvas.id = "full";
    }
    this.filepath = filepath;
    this.extension = path.extname(this.filepath).replace(".", "");
    sharp(filepath).toBuffer((err, buf, info) => {
      this.updatePreviewImg(buf, info);
    });
  }

  saveImg(filepath) {
    this.filepath = filepath;
    var base64Data = this.image.src.replace(
      `data:image/${this.extension};base64,`,
      ""
    );

    require("fs").writeFile(filepath, base64Data, "base64", (err) => {
      if (err) {
        // console.log("failed to save");
      } else {
        // console.log("saved successfully");
        document
          .getElementById("save_msg")
          .animate([{ opacity: "1" }, { opacity: "0" }], {
            duration: 1800,
            iterations: 1,
          });
      }
    });
  }

  undoPreviewImg() {
    if (this.i === 0) return;
    this.i--;
    // console.log(this.i);
    try {
      this.buffer = this.bufferQueue[this.i];
      this.information = this.infoQueue[this.i];
      this.extension = this.extensionQueue[this.i];

      this.canvas.width = this.infoQueue[this.i].width;
      this.canvas.height = this.infoQueue[this.i].height;

      this.image.src =
        `data:image/${this.extension};base64, ` +
        this.buffer.toString("base64");
      this.image.onload = () => {
        this.ctx.drawImage(this.image, 0, 0);
      };

      this.updateImgInfoText(this.information);
      this.extractMainColors(this.buffer, this.information);
      this.updateExtension();
    } catch (err) {
      console.log(err);
      this.i++;
    }
  }

  redoPreviewImg() {
    this.i++;
    try {
      this.buffer = this.bufferQueue[this.i];
      this.information = this.infoQueue[this.i];
      this.extension = this.extensionQueue[this.i];

      this.canvas.width = this.infoQueue[this.i].width;
      this.canvas.height = this.infoQueue[this.i].height;

      this.image.src =
        `data:image/${this.extension};base64, ` +
        this.buffer.toString("base64");
      this.image.onload = () => {
        this.ctx.drawImage(this.image, 0, 0);
      };

      this.updateImgInfoText(this.information);
      this.extractMainColors(this.buffer, this.information);
      this.updateExtension();
    } catch (err) {
      this.i--;
    }
  }
}

module.exports = {
  ImageLayer: ImageLayer,
  Parameter: Parameter,
  drawFlag: ImageLayer.drawFlag,
  cropFlag: ImageLayer.cropFlag,
  dragFlag: ImageLayer.dragFlag,
  imageLayerQueue: imageLayerQueue,
};
