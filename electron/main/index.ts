import { app, BrowserWindow, shell, ipcMain, globalShortcut } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import { chooseFile, extractZipToPath } from '../uitils/files'
import { CirnoApi, getZipFile } from '../network/CirnoAPIService'
import { autoUpdater } from 'electron-updater'
import { RsiGet, RsiPost, RsiPostWithFullResponse, getCsrfToken } from '../network/RsiAPIService'
import { RsiValidateToken } from '../network/RsiAPIProperty'
import fs from 'fs'
import fse from 'fs-extra'
import path from 'path'
import { compareVersions } from 'compare-versions'
import axios from 'axios'

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: '星河避难所',
    icon: join(process.env.VITE_PUBLIC, 'favicon.ico'),
    width: 1200,
    height: 800,
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
  })


  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.on("ready-to-show", () => {
      win.webContents.openDevTools();
    });
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  // win.webContents.setWindowOpenHandler(({ url }) => {
  //   if (url.startsWith('https:')) shell.openExternal(url)
  //   return { action: 'deny' }


  win.setMinimumSize(1200, 800)
  win.setMenu(null)

  // ipcMain.on('open-devtools', () => {
  //   win.webContents.openDevTools()
  // })

}

app.whenReady().then(() => { 
  createWindow()
  
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    BrowserWindow.getFocusedWindow().webContents.openDevTools();
  });

  const ElectronStore = require('electron-store');
  ElectronStore.initRenderer();
  ipcMain.handle('choose-file', (event, filter) => {
    return chooseFile(filter);
  })
  ipcMain.handle('download-file', (event, url, targetPath): Promise<string> => {
    return getZipFile(url, targetPath);
  })
  ipcMain.handle('get-app-path', (event) => {
    return app.getAppPath();
  })
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

ipcMain.handle('get-csrf-token', (event, rsi_device: string, rsi_token: string): Promise<RsiValidateToken> => {
  // console.log("getting csrf token")
  return getCsrfToken(rsi_token, rsi_device)
})

ipcMain.handle('rsi-api-post', (event, url: string, postData: any, headers: any): Promise<any> => {
    return RsiPost(url, postData, headers)
})

ipcMain.handle('rsi-api-post-with-full-response', (event, url: string, postData: any, headers: any): Promise<any> => {
    return RsiPostWithFullResponse(url, postData, headers)
})

ipcMain.handle('rsi-api-get', (event, url: string, headers: any): Promise<any> => {
  return RsiGet(url, headers)
})





// Auto Update

const appPath = path.dirname(app.getAppPath());

const unpackDownloadPath = path.join(appPath, 'app.asar.unpacked.zip');

const untgzPath = path.join(appPath, 'app.asar.unpacked');

const appVersion = '1.0.3';

console.log('appPath', appPath);
console.log('appVersion', appVersion);
console.log('unpackDownloadPath', unpackDownloadPath);
console.log('untgzPath', untgzPath);

new CirnoApi().getDesktopVersion().then((version) => {
  console.log('desktop version', version);
  if (compareVersions(version.version, appVersion) > 0) {
    console.log('new version found');
    axios.get(version.download_url, {
      responseType: 'arraybuffer',
    }).then((response) => {
      fs.writeFileSync(unpackDownloadPath, response.data);
      uncompressAndUpdate();
    });
  }
});


function uncompressAndUpdate() {
  // 先备份当前的 app.asar.unpacked 目录
  fse.renameSync(untgzPath, `${untgzPath}.back`);
  try {
    extractZipToPath(unpackDownloadPath, untgzPath);
    fse.removeSync(`${untgzPath}.back`);
    fse.removeSync(unpackDownloadPath);
    app.relaunch();
    app.exit(0);
  } catch (err) {
    // 记录错误日志
    console.log(err);
    fs.renameSync(`${untgzPath}.back`, untgzPath);
  }
}