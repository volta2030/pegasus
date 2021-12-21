// Modules to control application life and create native browser window
var electron = require("electron");
const { app, ipcMain, dialog, BrowserWindow, BrowserView, Menu } = electron;

//electron refresh (only develop)
// require("electron-reload")(__dirname, {
//   electron: require(`${__dirname}/node_modules/electron`),
// });

function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 1024,
    center: true,
    icon: `${__dirname}/assets/icon.ico`,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      // devTools: true,
      //   preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");
  // Open the DevTools.(only develop)
  // mainWindow.webContents.openDevTools();

  return mainWindow;
}

function createView(type, mainWindow) {
  const view = new BrowserView({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      // devTools: true,
      //   preload: path.join(__dirname, "preload.js"),
    },
  });
  mainWindow.setBrowserView(view);
  view.setBounds({ x: 0, y: 32, width: 200, height: 100 });
  view.webContents.loadFile("resize_panel.html");
  // view.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 1024,
    center: true,
    icon: `${__dirname}/assets/icon.ico`,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      // devTools: true,
      //   preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");
  // Open the DevTools.(only develop)
  mainWindow.webContents.openDevTools();

  ipcMain.on("resizeImgREQ", (event) => {
    createView("resize", mainWindow);
  });

  ipcMain.on("resizeValueSEND", (event, res) => {
    mainWindow.webContents.send("resizeImageCMD", res);
  });

  // main
  ipcMain.on("showMenuREQ", (event) => {
    const template = [
      {
        label: "File",
        submenu: [
          {
            label: "Open Image",
            click: () => {
              dialog
                .showOpenDialog({
                  properties: ["openFile"],
                  filters: [{ name: "Images", extensions: ["png"] }],
                })
                .then((result) => {
                  event.sender.send("openImageCMD", result.filePaths[0]);
                });
            },
          },
          {
            label: "Save Image",
            click: () => {
              dialog
                .showSaveDialog({
                  title: "Save image",
                  filters: [{ name: "Png file", extensions: ["png"] }],
                })
                .then((result) => {
                  event.sender.send("saveImageCMD", result.filePath);
                });
            },
          },
        ],
      },
      {
        label: "Help",
        submenu: [
          {
            label: "About",
            click: () => {
              dialog.showMessageBox({
                title: "About",
                buttons: ["Ok"],
                message:
                  "Author : tmpark\nVersion : v1.0.0\nLicense : MIT Lisence\n",
              });
            },
          },
        ],
      },
    ];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  });

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
