const { app, BrowserWindow } = require('electron')
const path = require('path')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
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

  win.loadFile("./frontend/index.html")

  win.webContents.openDevTools({ mode: 'detach' });
}

app.whenReady().then(() => {
  mainWindow = createWindow()
  require('./backend_messages').init(mainWindow)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})