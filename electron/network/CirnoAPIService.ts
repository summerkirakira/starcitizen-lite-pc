import { Announcement } from './CirnoAPIProperty.d';
import axios from "axios"

const BASE_URL = 'http://127.0.0.1:6088/'


async function fetchCirnoAPIPost<T>(url: string, postData: any): Promise<T> {
    const headers = {
        // "User-Agent": "StarCitizenLite/PC",
        "cirno-token": "1b858d23-cb73-49ed-9d88-9404b17f4b2e",
    }
    const { data } = await axios.post<T>(BASE_URL + url, postData, { headers })
    return data
}

async function fetchCirnoAPIGet<T>(url: string): Promise<T> {
    const headers = {
        // "User-Agent": "StarCitizenLite/PC",
        "cirno-token": "1b858d23-cb73-49ed-9d88-9404b17f4b2e",
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