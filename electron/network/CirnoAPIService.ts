import { Announcement } from './CirnoAPIProperty.d';
import axios from "axios"
import Store from 'electron-store'
import fs from "fs"
import path from "path"


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


export async function getZipFile(url: string, targetPath: string): Promise<void> {
    const cirno_token = store.get('uuid', null)
    if (!cirno_token) {
        throw new Error('uuid not found')
    }
    const headers = {
        // "User-Agent": "StarCitizenLite/PC",
        "cirno-token": cirno_token.toString(),
    }
    const writer = fs.createWriteStream(path.join(targetPath, 'temp.zip'))
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        headers
    })
    response.data.pipe(writer)
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}


export class CirnoApi {
    constructor() {

    }

    async getAnnouncement(): Promise<Announcement> {
        return fetchCirnoAPIGet<Announcement>('announcement/latest')
    }

    async downloadGameZip(url: string, targetPath: string): Promise<void> {
        return getZipFile(url, path.join(targetPath, 'temp.zip'))
    }
}