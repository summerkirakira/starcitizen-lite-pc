import axios from "axios"
import { BasicGraphqlPostBody, RsiLoginResponse, RsiValidateToken } from "./RsiAPIProperty"
import { getCookie } from "../uitils/cookies-manager"
import { ipcRenderer } from "electron"


const BASE_URL = 'https://robertsspaceindustries.com/'
axios.defaults.withCredentials = true;


export async function RsiPost<T>(url: string, postData: any, headers: any): Promise<T> {
    const { data } = await axios.post<T>(BASE_URL + url, postData, { headers, withCredentials: true})
    console.log(data)
    return data
} 


async function RsiLogin(email: string, password: string, captcha: string, remember: boolean, headers: any): Promise<RsiLoginResponse> {
    const postData: BasicGraphqlPostBody = {
        query: "mutation signin($email: String!, $password: String!, $captcha: String, $remember: Boolean) {\naccount_signin(email: $email, password: $password, captcha: $captcha, remember: $remember) {\ndisplayname\nid\n__typename\n}\n}",
        variables: {
            captcha,
            email,
            password,
            remember
        }
    }
    const data = await ipcRenderer.invoke('rsi-api-post', 'graphql', postData, headers) as RsiLoginResponse
    return data
}

async function MultiStepRsiLogin(code: string, headers: any): Promise<RsiLoginResponse> {
    const postData: BasicGraphqlPostBody = {
        query: "mutation multistep($code: String!, $deviceType: String!, $deviceName: String!, $duration: String!) {\naccount_multistep(code: $code, device_type: $deviceType, device_name: $deviceName, duration: $duration) {\ndisplayname\nid\n__typename\n}\n}",
        variables: {
            code
        }
    }
    const data = await ipcRenderer.invoke('rsi-api-post', 'graphql', postData, { headers }) as RsiLoginResponse
    return data
}

export async function getCsrfToken(rsi_token: string, rsi_device: string): Promise<RsiValidateToken> {
    // Please note that this function is only avaliable in main process
    const regex = /<meta\s+name="csrf-token"\s+content="([^"]+)"\s*\/?>/i
    let cookie = "CookieConsent={stamp:%27-1%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true%2Cmarketing:true%2Cmethod:%27implied%27%2Cver:1%2Cutc:1695456095624%2Cregion:%27CN%27};";
    if (rsi_device.length != 0) {
        cookie += ` _rsi_device=${window.webSettings.rsi_device};`;
    }
    if (rsi_token.length != 0) {
        cookie += ` Rsi-Token=${window.webSettings.rsi_token};`;
    }
    const response = await axios.get<string>(BASE_URL, { headers: { 'Cookies': cookie } })
    // console.log(response.headers)
    let new_rsi_token = ''
    if (response.headers['set-cookie']) {
        new_rsi_token = response.headers['set-cookie'][0].split(';')[0].split('=')[1]
        cookie += ` Rsi-Token=${new_rsi_token};`;
        // console.log(cookie)
        const res = await axios.get<string>(BASE_URL, { headers: { 'Cookie': cookie } })
        // console.log(res.headers)
        const csrfToken = res.data.match(regex)
        return {
            rsi_token: new_rsi_token,
            csrf_token: csrfToken[1],
            rsi_device: rsi_device
        }
    }
    
    const csrfToken = response.data.match(regex)
    if (!csrfToken) {
        throw new Error('csrf token not found')
    }
    // window.webSettings.csrfToken = csrfToken[1]
    if (new_rsi_token.length == 0) {
        new_rsi_token = rsi_token
    }
    return {
        rsi_token: new_rsi_token,
        csrf_token: csrfToken[1],
        rsi_device: rsi_device
    }
}

export class RsiApiService {
    constructor() {
        
    }

    getHeaders(): any {
        const headers = {
            'x-csrf-token': window.webSettings.csrfToken,
            'Cookie': getCookie(),
       }
         return headers
    }

    async login(email: string, password: string, captcha: string, remember: boolean): Promise<RsiLoginResponse> {
        return await RsiLogin(email, password, captcha, remember, this.getHeaders())
    }

    async multiStepLogin(code: string): Promise<RsiLoginResponse> {
        return await MultiStepRsiLogin(code, this.getHeaders())
    }
}