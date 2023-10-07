import { Filter, chooseFile } from './electron/uitils/files';
import { CirnoDatabase } from './electron/database/DatabaseEntities'
import { CirnoApi } from './electron/network/CirnoAPIService'


declare global {
    interface Window {
      CirnoApi: CirnoApi
      database: CirnoDatabase
      chooseFile: (filter: Filter) => Promise<string[]>
      appPath: string
      openDevTools: () => void
      fileManager: {
        getZipFile: (url: string, targetPath: string) => Promise<string>
      }
    }
}

