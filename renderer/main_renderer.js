const { ipcRenderer } = require("electron");
const sharp = require("sharp");

var filepath = null;
var buffer = null;
var extension = null;

var imgInfoText = document.getElementById("imgInfoText");


["resizeBtn", "blurBtn", "rotateBtn"].forEach((item, index, arr) => {
  document.getElementById(item).addEventListener("click", (event) => {
    if (filepath !== null) {
      ipcRenderer.send(`${item.replace("Btn", "")}ImgREQ`);
    }
  });
});

ipcRenderer.send("showMenuREQ", "ping");

ipcRenderer.on("openImgCMD", (event, res) => {
  document.getElementById("previewImg").src = filepath = res;
  extension = getExtension(filepath);
  sharp(filepath).toBuffer((err, buf, info) => {
  buffer = buf;  
  extractMainColors(buffer);
  updateImgInfoText(info);

  })
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
  console.log(res);
  if (!base64Data.includes("base64")) {
    sharp(filepath).toFile(res, (err) => {
      if (err) {
        console.log("failed to save");
      } else {
        console.log("saved successfully");
      }
    });
  } else {
    base64Data = base64Data.replace(`data:image/${extension};base64`, "");
    res = extension === "jpg" ? res.replace(".png", ".jpg") : res;
    require("fs").writeFile(res, base64Data, "base64", (err) => {
      if (err) {
        console.log("failed to save");
      } else {
        console.log("saved successfully");
      }
    });
  }
});

function getExtension(filepath) {
  return filepath.includes(".jpg") ? "jpg" : "png";
}

function updatePreviewImg(buf) {
  document.getElementById("previewImg").src =
    `data:image/${extension};base64, ` + buf.toString("base64");

  buffer = buf;
}

function updateImgInfoText(info) {
  imgInfoText.innerText = `${info.width} x ${info.height}`;
}

function extractMainColors(buffer){
  sharp(buffer).resize({width:32}).toColorspace('srgb').raw().toBuffer((err, result, info)=>{
      
    var colors ={}
    var step;
    var coef = info.width * info.height * 4 ===result.length ? 4 : 3;
    var size = result.length/coef;
    // if( info.width * info.height * 4 ===buffer.length) coef = 4;
    // else{coef = 3;}
    // console.log(coef);

    for (step = 0; step < size; step++) {
      // Runs 5 times, with values of step 0 through 4.
      
      if( colors[`${result[coef*step]} ${result[coef*step+1]} ${result[coef*step+2]}`] !== undefined){
        colors[`${result[coef*step]} ${result[coef*step+1]} ${result[coef*step+2]}`] += 1;
      }else{
        colors[`${result[coef*step]} ${result[coef*step+1]} ${result[coef*step+2]}`] = 1;
      }
     
    }
    const sortColors = Object.entries(colors)
    .sort(([, a], [, b]) => b - a)
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

    console.log(sortColors);

    var rgb = Object.keys(sortColors)[0].split(" ");
    var hexColor = `#${parseInt( rgb[0] , 10 ).toString( 16 ).padStart(2,"0") +  parseInt( rgb[1], 10 ).toString( 16 ).padStart(2,"0") + parseInt( rgb[2], 10 ).toString( 16 ).padStart(2,"0")}`;
    document.getElementById('mainColor1').style.background = hexColor;
    document.getElementById('mainColor1').title = hexColor;
    // console.log(`#${parseInt( rgb[0] , 10 ).toString( 16 ).padStart(2,"0") +  parseInt( rgb[1], 10 ).toString( 16 ).padStart(2,"0") + parseInt( rgb[2], 10 ).toString( 16 ).padStart(2,"0")}`);
    rgb = Object.keys(sortColors)[1].split(" ");
    hexColor = `#${parseInt( rgb[0] , 10 ).toString( 16 ).padStart(2,"0") +  parseInt( rgb[1], 10 ).toString( 16 ).padStart(2,"0") + parseInt( rgb[2], 10 ).toString( 16 ).padStart(2,"0")}`;
    document.getElementById('mainColor2').style.background = hexColor;
    document.getElementById('mainColor2').title = hexColor;
    //
    rgb = Object.keys(sortColors)[2].split(" ");
    hexColor = `#${parseInt( rgb[0] , 10 ).toString( 16 ).padStart(2,"0") +  parseInt( rgb[1], 10 ).toString( 16 ).padStart(2,"0") + parseInt( rgb[2], 10 ).toString( 16 ).padStart(2,"0")}`;
    document.getElementById('mainColor3').style.background = hexColor;
    document.getElementById('mainColor3').title = hexColor;    
  });
}
