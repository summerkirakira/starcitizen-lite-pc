import { app, BrowserWindow, shell, ipcMain, globalShortcut, session, clipboard, nativeTheme } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import { chooseFile } from '../uitils/files'
import { CirnoApi, getZipFile } from '../network/CirnoAPIService'
import { RsiGet, RsiPost, RsiPostWithFullResponse, getCsrfToken } from '../network/RsiAPIService'
import { RsiValidateToken } from '../network/RsiAPIProperty'
import Store from 'electron-store'

const store = new Store()

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
const rsi_preload = join(__dirname, '../preload/rsi.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')
const extensionPath = join(process.env.DIST_ELECTRON, '../extensions')
const extensionNames = [
  'ccugame.6.0.2_0'
]

let mainWindow: BrowserWindow | null = null

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

  // win.on("ready-to-show", () => {
  //   win.webContents.openDevTools();
  // });

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
  mainWindow = win
  updateHandle()

  // ipcMain.on('open-devtools', () => {
  //   win.webContents.openDevTools()
  // })

}

app.whenReady().then(() => { 
  createWindow()

  ipcMain.handle('set-web-cookie', (event, cookie: any): Promise<any> => {
    return session.defaultSession.cookies.set(cookie)
  })

  ipcMain.handle('open-rsi-web', (event, url: string): Promise<any> => {
    const rsiWebWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        preload: rsi_preload,
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false,
        sandbox:false,
        allowRunningInsecureContent: true
      },
      backgroundColor: '#222222'
    })

    rsiWebWindow.setMinimumSize(1200, 800)
    rsiWebWindow.setMenu(null)

    // rsiWebWindow.once('ready-to-show', () => {
    //   rsiWebWindow.show()
    // })

    if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
      rsiWebWindow.loadURL(url)
      // Open devTool if the app is not packaged
      rsiWebWindow.on("ready-to-show", () => {
        rsiWebWindow.webContents.openDevTools();
      });
    } else {
      rsiWebWindow.loadURL(url)
    }
    return 
  })
  
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


  // extensionNames.forEach((name) => {
  //   const myExtension = path.join(extensionPath, name);
  //   console.log(`loading extension ${myExtension}`)
  //   console.log('extensionPath', myExtension);
  //   session.defaultSession.loadExtension(myExtension);
  // });


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

ipcMain.handle('write-to-clipboard', (event, text: string): void => {
  clipboard.writeText(text)
})

ipcMain.handle('open-external', (event, url: string): void => {
  shell.openExternal(url)
})




// // Auto Update

// const appPath = app.getAppPath();

// const unpackDownloadPath = path.join(appPath, 'app.asar.unpacked.zip');

// const distFolderPath = path.join(appPath, 'dist');
// const distElectronFolderPath = path.join(appPath, 'dist-electron');

// const appVersion = '1.0.5';

// console.log('appPath', appPath);
// console.log('appVersion', appVersion);
// console.log('unpackDownloadPath', unpackDownloadPath);
// console.log('untgzPath', distFolderPath);


// if (process.platform === 'win32') {
//   new CirnoApi().getDesktopVersion().then((version) => {
//     // console.log('desktop version', version);
//     if (compareVersions(version.version, appVersion) > 0) {
//       console.log('new version found');
//       axios.get(version.download_url, {
//         responseType: 'arraybuffer',
//       }).then((response) => {
//         fs.writeFileSync(unpackDownloadPath, response.data);
//         uncompressAndUpdate(version.version);
//       });
//     }
//   });
// }


// function uncompressAndUpdate(version: string) {
//   // 先备份当前的 app.asar.unpacked 目录
//   fse.renameSync(distFolderPath, `${distFolderPath}.back`);
//   fse.renameSync(distElectronFolderPath, `${distElectronFolderPath}.back`);
//   try {
//     extractZipToPath(unpackDownloadPath, appPath);
//     fse.removeSync(`${distFolderPath}.back`);
//     fse.removeSync(`${distElectronFolderPath}.back`);
//     fse.removeSync(unpackDownloadPath);
//     store.set('recently_update', version);
//     app.relaunch();
//     app.exit(0);
//   } catch (err) {
//     // 记录错误日志
//     console.log(err);
//     fs.renameSync(`${distFolderPath}.back`, distFolderPath);
//     fs.renameSync(`${distElectronFolderPath}.back`, distElectronFolderPath);
//   }
// }

// loadExtensions();

// ------------------------------------------------------------------------

// App Update

// Object.defineProperty(app, 'isPackaged', { // remove when released
//   get() {
//     return true;
//   }
// });

const { autoUpdater } = require('electron-updater')
const server = 'http://biaoju.site/starcitizen';
const updateUrl = `${server}/update/${process.platform}`;
// 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写
function updateHandle () {
  let message = {
    error: {status: -1, msg: '检测更新查询异常'},
    checking: {status: 0, msg: '正在检查更新...'},
    updateAva: {status: 1, msg: '检测到新版本,正在下载,请稍后'},
    updateNotAva: {status: 2, msg: '您现在使用的版本为最新版本,无需更新!'},
  }
  let versionInfo = ''
  console.log('updateUrl', updateUrl)
  autoUpdater.setFeedURL(updateUrl)
  autoUpdater.autoDownload = false
  autoUpdater.checkForUpdates().then(function (data) {
    console.log('checkForUpdates', data)
  })
  // console.log('updateHandle', autoUpdater.getFeedURL())
// 检测更新查询异常
  autoUpdater.on('error', function (error) {
    sendUpdateMessage(message.error)
  })
// 当开始检查更新的时候触发
  autoUpdater.on('checking-for-update', function () {
    sendUpdateMessage(message.checking)
  })
// 当发现有可用更新的时候触发，更新包下载会自动开始
  autoUpdater.on('update-available', function (info) {
    sendUpdateMessage(message.updateAva)
    mainWindow.webContents.send('updateAvailable', info)
  })
// 当发现版本为最新版本触发
  autoUpdater.on('update-not-available', function (info) {
    sendUpdateMessage(message.updateNotAva)
  })
  // 更新下载进度事件
  autoUpdater.on('download-progress', function (progressObj) {
    mainWindow.webContents.send('downloadProgress', progressObj)
  })
 // 包下载成功时触发
  autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
 // 收到renderer进程确认更新
    ipcMain.on('updateNow', (e, arg) => {
      console.log('开始更新')
      autoUpdater.quitAndInstall() // 包下载完成后，重启当前的应用并且安装更新
    })
 // 主进程向renderer进程发送是否确认更新
    mainWindow.webContents.send('isUpdateNow', versionInfo)
  })

  ipcMain.on('checkForUpdate', () => {
      // 收到renderer进程的检查通知后，执行自动更新检查
      // autoUpdater.checkForUpdates()
      let checkInfo = autoUpdater.checkForUpdates()
      checkInfo.then(function (data) {
        versionInfo = data.versionInfo // 获取更新包版本等信息
      })
      console.log('checkForUpdate', checkInfo)
    })
   ipcMain.on('downloadNow', () => {
      // 收到renderer进程的下载通知后，执行自动更新下载
      console.log('开始下载')
      autoUpdater.downloadUpdate()
    })
}

// 通过main进程发送事件给renderer进程，提示更新信息
function sendUpdateMessage (text) {
  mainWindow.webContents.send('message', text)
}

ipcMain.handle('dark-mode:toggle', () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = 'light'
  } else {
    nativeTheme.themeSource = 'light'
  }
  return nativeTheme.shouldUseDarkColors
})

nativeTheme.themeSource = 'light'

// ipcMain.handle('dark-mode:system', () => {
//   nativeTheme.themeSource = 'light'
// })