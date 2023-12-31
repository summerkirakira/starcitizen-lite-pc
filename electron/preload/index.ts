import path from 'path';
import { CirnoApi } from "../network/CirnoAPIService"
import { ipcRenderer } from "electron"
import { Filter} from "../uitils/files"
import { initialize } from "./initialize"
import { RsiApiService } from '../network/RsiAPIService';
import Store from 'electron-store';

const store = new Store()


function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  z-index: 9;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 4999)


// ----------------------------------------------------------------------


window.CirnoApi = new CirnoApi()

window.RsiApi = new RsiApiService()

window.chooseFile = (filter: Filter) => ipcRenderer.invoke('choose-file', filter)

window.fileManager = {
  getZipFile: (url: string, targetPath: string): Promise<string> => ipcRenderer.invoke('download-file', url, targetPath)
}

window.fileManager.writeToClipboard = (text: string) => ipcRenderer.invoke('write-to-clipboard', text)
window.openExternal = (url: string) => ipcRenderer.invoke('open-external', url)

window.setWebCookie = (webSettings: any) => ipcRenderer.invoke('set-web-cookie', webSettings)
window.ipcRenderer = ipcRenderer

ipcRenderer.invoke('get-app-path').then((appPath: string) => {
  // const refugePath = path.join(appPath, 'refuge-pc')
  // if(!fs.existsSync(refugePath)) {
  //   fs.mkdirSync(refugePath)
  // }
  window.appPath = path.dirname(appPath)
})

window.openDevTools = () => ipcRenderer.send('open-dev-tools')

window.openRsiWeb = (url: string) => ipcRenderer.invoke('open-rsi-web', url)

window.shareData = (data: any) => ipcRenderer.send('share-data', data)

initialize()

