import { Announcement, LocalizationInfo, LocalizationInfoPostBody, AvailiableLocalization, ReCaptchaResponse, VersionRequestPostBody, VersionResponse, ShipAlias, Translation, TranslationVersion } from './CirnoAPIProperty.d';
import axios from "axios"
import Store from 'electron-store'
import fs from "fs"
import path from "path"
import crypto from "crypto"
import { getRecaptchaToken } from './reCaptcha';


const BASE_URL = 'http://biaoju.site:6088/'

const store = new Store()

function generateMD5(inputString: string): string {
    const md5Hash = crypto.createHash('md5');
    md5Hash.update(inputString);
    return md5Hash.digest('hex');
  }

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


export async function getZipFile(url: string, targetPath: string): Promise<string> {
    const cirno_token = store.get('uuid', null)
    if (!cirno_token) {
        throw new Error('uuid not found')
    }
    const headers = {
        "User-Agent": "StarCitizenLite/PC",
        "cirno-token": cirno_token.toString(),
    }
    const downloadPath = path.join(targetPath, generateMD5(url))
    // if (fs.existsSync(downloadPath)) {
    //     return downloadPath
    // }
    const writer = fs.createWriteStream(downloadPath)
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        headers
    })
    response.data.pipe(writer)
    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(downloadPath))
        writer.on('error', reject)
    })
}


export class CirnoApi {
    constructor() {

    }

    async getAnnouncement(): Promise<Announcement> {
        return fetchCirnoAPIGet<Announcement>('announcement/latest')
    }

    async downloadGameZip(url: string, targetPath: string): Promise<string> {
        console.log(url, targetPath)
        return getZipFile(url, targetPath)
    }

    async getLocalizationInfo(localizationInfoPostBody: LocalizationInfoPostBody): Promise<LocalizationInfo> {
        return fetchCirnoAPIPost<LocalizationInfo>('localization/info', localizationInfoPostBody)
    }

    async getAvailiableLocalization(): Promise<AvailiableLocalization[]> {
        return fetchCirnoAPIGet<AvailiableLocalization[]>('localization/list')
    }

    async getRecaptchaToken(): Promise<string> {
        return getRecaptchaToken()
    }

    async getResourceInfo(versionRequest: VersionRequestPostBody): Promise<VersionResponse> {
        return fetchCirnoAPIPost<VersionResponse>('version', versionRequest)
    }

    async getShipAlias(url: string): Promise<ShipAlias[]> {
        return axios.get<ShipAlias[]>(url).then((response) => {
            return response.data
        })
    }

    async getTranslations(): Promise<Translation[]> {
        return fetchCirnoAPIGet<Translation[]>('translation/all')
    }

    async getTranslationVersion(): Promise<TranslationVersion> {
        return fetchCirnoAPIGet<TranslationVersion>('translation/version')
    }

    async getDesktopVersion(): Promise<{version: string, download_url: string}> {
        return fetchCirnoAPIGet<{version: string, download_url: string}>('desktop/version')
    }
}