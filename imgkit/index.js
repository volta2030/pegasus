class ImageLayer {
  constructor() {
    this.canvas = document.createElement("canvas");

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
  }
}

module.exports = {
  ImageLayer: ImageLayer,
};
