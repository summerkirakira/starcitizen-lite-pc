import { Announcement } from './CirnoAPIProperty.d';
import axios from "axios"
import Store from 'electron-store'


const BASE_URL = 'http://127.0.0.1:6088/'

const store = new Store()


async function fetchCirnoAPIPost<T>(url: string, postData: any): Promise<T> {
    const cirno_token = store.get('uuid', null)
    if (!cirno_token) {
        throw new Error('uuid not found')
    }
    const headers = {
        // "User-Agent": "StarCitizenLite/PC",
        "cirno-token": cirno_token.toString(),
    }
    const { data } = await axios.post<T>(BASE_URL + url, postData, { headers })
    return data
}

async function fetchCirnoAPIGet<T>(url: string): Promise<T> {
    const cirno_token = store.get('uuid', null)
    if (!cirno_token) {
        throw new Error('uuid not found')
    }
    const headers = {
        // "User-Agent": "StarCitizenLite/PC",
        "cirno-token": cirno_token.toString(),
    }
    const { data } = await axios.get<T>(BASE_URL + url, { headers })
    return data
}


export class CirnoApi {
    constructor() {

    }

    async getAnnouncement(): Promise<Announcement> {
        return fetchCirnoAPIGet<Announcement>('announcement/latest')
    }
}