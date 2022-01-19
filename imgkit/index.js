const sharp = require("sharp");

class ImageLayer {
  constructor() {
    //initialize
    this.imgPanel = document.createElement("div");
    this.imgPanel.id = "div";

    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("class", "img-canvas");
    this.canvas.id = "previewImg";

    this.mainColorBox = document.createElement("div");
    this.mainColor1 = document.createElement("div");
    this.mainColor1.id = "mainColor1";
    this.mainColor1.className = "colorBox";

    this.mainColor2 = document.createElement("div");
    this.mainColor2.id = "mainColor2";
    this.mainColor2.className = "colorBox";

    this.mainColor3 = document.createElement("div");
    this.mainColor3.id = "mainColor3";
    this.mainColor3.className = "colorBox";
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

    // <select id="extensionComboBox">
    //   <option value="default"></option>
    //   <option value="png">png</option>
    //   <option value="jpg">jpg</option>
    //   <option value="jpeg">jpeg</option>
    //   <option value="webp">webp</option>
    // </select>;

    this.ctx = this.canvas.getContext("2d");

    this.bufferQueue = [];
    this.infoQueue = [];
    this.extensionQueue = [];
    this.i = -1;

    this.initialX;
    this.initialY;
    this.cropWidth;
    this.cropHeight;

    this.realPosX;
    this.realPosY;

    this.image = new Image();
    this.filepath;

    this.attach();
  }

  attach() {
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
  }

  updatePreviewImg(buf, info, extension) {
    canvas.width = info.width;
    canvas.height = info.height;

    image.src = `data:image/${extension};base64, ` + buf.toString("base64");
    image.onload = () => {
      this.ctx.drawImage(image, 0, 0, info.width, info.height);
    };

    this.updateImgInfoText(info);
    this.extractMainColors(buf, info);
    this.updateExtension(extension);

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

  updateExtension(extension) {
    this.extensionComboBox.value = extension;
  }

  openImg(filepath, extension) {
    sharp(filepath).toBuffer((err, buf, info) => {
      this.updatePreviewImg(buf, info, extension);
    });
  }

  saveImg(filepath, extension) {
    var base64Data = this.image.src.replace(
      `data:image/${extension};base64,`,
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
}

module.exports = {
  ImageLayer: ImageLayer,
};
