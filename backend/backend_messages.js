const { ipcMain, dialog } = require('electron')
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

   ipcMain.on("get-next-img", (event, {cachedSrcFolder, mode="reload"}) => {
      if (mode == "increment") { idx += 1 }
      if (mode == "decrement") { idx -= 1 }
      if (idx >= files.length) { idx = 0 }
      if (idx < 0) { idx = files.length - 1 }

      if (cachedSrcFolder && files.length == 0) {
         srcFolder = cachedSrcFolder
         files = loadFiles(cachedSrcFolder)
      }

      event.returnValue = `${srcFolder || cachedSrcFolder}/${files[idx]}`
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
