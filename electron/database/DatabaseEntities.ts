import Dexie, { Table } from 'dexie'


export interface User {
    id?: number,
    name: string,
    
    // login_id: string,
    // email: string,
    // password: string,
    // rsi_token: string,
    // rsi_device: string,
  
    // handle: string,
    // profile_image: string,
    // language: string,
    // country: string,
    // region: string,
    // referral_code: string,
  }
  
  
  export class CirnoDatabase extends Dexie {
    users: Table<User>
  
    constructor() {
      super('StarCitizenLite')
      this.version(1).stores({
        users: '++id, name',
      })
    }
  }
  
  export const db = new CirnoDatabase()