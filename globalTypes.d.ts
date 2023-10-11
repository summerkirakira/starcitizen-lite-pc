import { Filter, chooseFile } from './electron/uitils/files';
import { CirnoDatabase } from './electron/database/DatabaseEntities'
import { CirnoApi } from './electron/network/CirnoAPIService'
import { RsiApiService } from './electron/network/RsiAPIService';
import { User } from './electron/database/DatabaseEntities';


declare global {
    interface Window {
      CirnoApi: CirnoApi
      RsiApi: RsiApiService
      database: CirnoDatabase
      chooseFile: (filter: Filter) => Promise<string[]>
      appPath: string
      openDevTools: () => void
      fileManager: {
        getZipFile: (url: string, targetPath: string) => Promise<string>
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

