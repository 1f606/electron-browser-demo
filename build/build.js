const { app, BrowserWindow, BrowserView, Menu } = require('electron')
const path = require('path')
let mainWindow

Menu.setApplicationMenu(null)

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      webSecurity: false,
      webviewTag: true,
      nodeIntegration: true
    }
  })
  mainWindow.loadFile(path.join(__dirname + './index.html'))

  let extensions = ['xlsx', 'xls']

  app.on('web-contents-created', function (webContentsCreatedEvent, contents) {
    if (contents.getType() === 'webview') {
      contents.on('new-window', function (event, url, frameName, disposition, options, additionalFeatures, referrer, postBody) {
        let startIndex = url.lastIndexOf('.') + 1;
        let extension = url.slice(startIndex);
        event.preventDefault();
        if (extensions.includes(extension)) {
          const view = new BrowserView()
          mainWindow.setBrowserView(view)
          view.webContents.loadURL(url)
        } else {
          const win = new BrowserWindow({
            webContents: options.webContents,
            show: false
          })
          win.once('ready-to-show', () => win.show())
          if (!options.webContents) {
            const loadOptions = {
              httpReferrer: referrer
            }
            if (postBody != null) {
              const { data, contentType, boundary } = postBody
              loadOptions.postData = postBody.data
              loadOptions.extraHeaders = `content-type: ${contentType}; boundary=${boundary}`
            }
            win.loadURL(url, loadOptions)
          }
          event.newGuest = win
        }
      });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
