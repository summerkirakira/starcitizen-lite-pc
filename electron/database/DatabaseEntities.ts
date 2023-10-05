import Dexie, { Table } from 'dexie'


const db_version = 1

export interface User {
    id?: number,
    name: string,
    
    login_id: string,
    email: string,
    password: string,
    rsi_token: string,
    rsi_device: string,
  
    handle: string,
    profile_image: string,
    language: string,
    country: string,
    region: string,
    referral_code: string,
    referral_count: number,

    store: number,
    uec: number,
    rec: number,
    hangar_value: number,
    total_spent: number,
    is_concierge: boolean,
    is_subscriber: boolean,

    organization_image: string,

    register_time: number,
    org_name: string,
    org_logo: string,
    org_rank: string,
    location: string,
    fluency: string
  }
  
  
  export class CirnoDatabase extends Dexie {
    users: Table<User>
  
    constructor() {
      super('StarCitizenLite')
      this.version(db_version).stores({
        users: '++id, name, login_id, email, password, rsi_token, rsi_device, handle, profile_image, language, country, region, referral_code, referral_count, store, uec, rec, hangar_value, total_spent, is_concierge, is_subscriber, organization_image, register_time, org_name, org_logo, org_rank, location, fluency'
      })
    }
  }
  
  export const db = new CirnoDatabase()