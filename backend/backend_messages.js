const { ipcMain, dialog, BrowserWindow } = require('electron')
const { exec } = require("child_process");

fs = require('fs')

module.exports = { init: (mainWindow) => {

   srcFolder = null
   destFolder = null
   folders = []
   files = []
   idx = 0

   loadFiles = (folder) => {
      // https://stackoverflow.com/questions/41472161/fs-readdir-ignore-directories
      dirents = fs.readdirSync(folder, { withFileTypes: true });
      return dirents
          .filter(dirent => dirent.isFile())
          .map(dirent => dirent.name);
   }

   loadFolders = (folder) => {
      // https://stackoverflow.com/questions/41472161/fs-readdir-ignore-directories
      dirents = fs.readdirSync(folder, { withFileTypes: true });
      return dirents
          .filter(dirent => !dirent.isFile())
          .map(dirent => dirent.name).
          sort();
   }   

   ipcMain.on('src-folder-select', (event, arg) => {
      folder = dialog.showOpenDialogSync(mainWindow, {
        properties: ['openDirectory']
      })

      if (!folder) {
         event.returnValue = []
         return
      }
      
      srcFolder = folder[0]

      files = loadFiles(srcFolder)
      idx = 0
      event.returnValue = [srcFolder, files.length]
   })

   ipcMain.on('dest-folder-select', (event, arg) => {
      folder = dialog.showOpenDialogSync(mainWindow, {
        properties: ['openDirectory']
      })

      if (!folder) {
         event.returnValue = []
         return
      }
      destFolder = folder[0]

      folders = loadFolders(destFolder)
      event.returnValue = [destFolder, folders]
   })

   ipcMain.on('move-to-folder', (event, folder) => {
      if (!srcFolder || !files[idx]) { return "" }

      currentFile = `${srcFolder}/${files[idx]}`
      destPath = `${destFolder}/${folder}/${files[idx]}`
      // console.log({currentFile,  destPath})
      fs.renameSync(currentFile, destPath)
      files.splice(idx, 1)
      if (idx >= files.length) { idx = 0 }
      event.returnValue = `${srcFolder}/${files[idx]}`
   })

   ipcMain.on("open-img", (event, path) => {
      // console.log("OPEN IMG: " + path)
      // exec(`open ${path}`)
      win = new BrowserWindow({
       fullscreen: false,
       icon: "icon.png",
       webPreferences: {
         // The "right way" is to use the preload script with content bridge.
         // Ain't got time for that.
          nodeIntegration: true,
          contextIsolation: false,
          protocol: "file",
          webSecurity: false
         // preload: path.join(__dirname, "../frontend/preload.js")
       },      
      })
      win.loadFile(path)
      win.webContents.setZoomFactor(1.0);
      win.maximize()
        
      // Upper Limit is working of 500 %
      win.webContents
          .setVisualZoomLevelLimits(1, 5)
          .then(console.log("Zoom Levels Have been Set between 100% and 500%"))
          .catch((err) => console.log(err));
        
      win.webContents.on("zoom-changed", (event, zoomDirection) => {
          console.log(zoomDirection);
          var currentZoom = win.webContents.getZoomFactor();
          console.log("Current Zoom Factor - ", currentZoom);
          // console.log('Current Zoom Level at - '
          // , win.webContents.getZoomLevel());
          console.log("Current Zoom Level at - ", win.webContents.zoomLevel);
        
          if (zoomDirection === "in") {
              
              // win.webContents.setZoomFactor(currentZoom + 0.20);
              win.webContents.zoomFactor = currentZoom + 0.2;
        
              console.log("Zoom Factor Increased to - "
                          , win.webContents.zoomFactor * 100, "%");
          }
          if (zoomDirection === "out") {
              
              // win.webContents.setZoomFactor(currentZoom - 0.20);
              win.webContents.zoomFactor = currentZoom - 0.2;
        
              console.log("Zoom Factor Decreased to - "
                          , win.webContents.zoomFactor * 100, "%");
          }
      });      
   })

   ipcMain.on("get-next-img", (event, {cachedSrcFolder, mode="reload"}) => {
      if (mode == "increment") { idx += 1 }
      if (mode == "decrement") { idx -= 1 }
      if (idx >= files.length) { idx = 0 }
      if (idx < 0) { idx = files.length - 1 }

      if (cachedSrcFolder && files.length == 0) {
         srcFolder = cachedSrcFolder
         files = loadFiles(cachedSrcFolder)
      }

      file = `${srcFolder || cachedSrcFolder}/${files[idx]}`
      event.returnValue = [files.length, file]
   })   

   ipcMain.on("get-cached-folders", (event, cachedDestFolder) => {
      destFolder = cachedDestFolder
      folders = loadFolders(destFolder)
      event.returnValue = folders
   })

   ipcMain.on("add-new-folder", (event, folderName) => {
      try {
         fs.mkdirSync(`${destFolder}/${folderName}`)
         event.returnValue = [true]
      } catch (err) {
         event.returnValue = [false, err]
      }
      
   })
}}

// Event handler for asynchronous incoming messages
// ipcMain.on('test', (event, arg) => {
//    event

   // Event emitter for sending asynchronous messages
   // event.sender.send('asynchronous-reply', 'async pong')
// })

// Event handler for synchronous incoming messages
