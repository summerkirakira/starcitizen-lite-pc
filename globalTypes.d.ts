import { Filter, chooseFile } from './electron/uitils/files';
import { CirnoApi } from './electron/network/CirnoAPIService'
import { RsiApiService } from './electron/network/RsiAPIService';
import { User } from './electron/database/DatabaseEntities';
import { ShipAlias } from './electron/network/CirnoAPIProperty';


declare global {
    interface Window {
      CirnoApi: CirnoApi
      RsiApi: RsiApiService
      ipcRenderer: any
      chooseFile: (filter: Filter) => Promise<string[]>
      setWebCookie: (webSettings: any) => void
      openRsiWeb: (url: string) => void
      shareData: (data: any) => void
      appPath: string
      openDevTools: () => void
      openExternal: (url: string) => void
      fileManager: {
        getZipFile: (url: string, targetPath: string) => Promise<string> | null
        shipAliasMap: Map<string, ShipAlias>
        translationMap: Map<string, string>
        writeToClipboard: (text: string) => void
      }
      webSettings: {
        csrfToken: string
        rsi_token: string
        rsi_device: string
        claims: string
      },
      cureentUser: User
    }
}

