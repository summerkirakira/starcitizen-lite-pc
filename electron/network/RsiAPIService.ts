import axios, { AxiosResponse } from "axios"
import { BasicGraphqlPostBody, BasicResponseBody, RsiGameTokenResponse, RsiLauncherClaimResponse, RsiLauncherLibraryResponse, RsiLauncherReleaseInfoResponse, RsiLauncherSigninResponse, RsiLoginResponse, RsiValidateToken } from "./RsiAPIProperty"
import { getCookie } from "../uitils/cookies-manager"
import { ipcRenderer } from "electron"
import { getRefugeSettings } from "../uitils/settings"


const BASE_URL = 'https://robertsspaceindustries.com/'
axios.defaults.withCredentials = true;

const RsiAixoInstance = axios.create()

RsiAixoInstance.interceptors.request.use((config) => {
    // console.log('AXIO HEADERS', config.headers)
    return config
})

export async function RsiPost<T>(url: string, postData: any, headers: any): Promise<T> {
    // console.log(headers)
    const { data } = await RsiAixoInstance.post<T>(BASE_URL + url, postData, { headers, withCredentials: true})
    return data
} 

export async function RsiPostWithFullResponse<T>(url: string, postData: any, headers: any): Promise<any> {
    const response = await RsiAixoInstance.post<T>(BASE_URL + url, postData, { headers, withCredentials: true})
    return {
        data: response.data,
        set_cookie: response.headers['set-cookie']
    }
}

export async function RsiGet<T>(url: string, headers: any): Promise<T> {
    const { data } = await RsiAixoInstance.get<T>(BASE_URL + url, { headers , withCredentials: true})
    return data
}

export async function RsiGetWithCookie<T>(url: string, headers: any): Promise<AxiosResponse<T>> {
    const response = await ipcRenderer.invoke('rsi-api-get', url, headers)
    return response
}

export async function RsiPostWithCookie<T>(url: string, postData: any, headers: any): Promise<T> {
    const response = await ipcRenderer.invoke('rsi-api-post', url, postData, headers)
    return response
}


async function RsiLogin(email: string, password: string, captcha: string, remember: boolean, headers: any): Promise<AxiosResponse> {
    const postData: BasicGraphqlPostBody = {
        query: "mutation signin($email: String!, $password: String!, $captcha: String, $remember: Boolean) {\naccount_signin(email: $email, password: $password, captcha: $captcha, remember: $remember) {\ndisplayname\nid\n__typename\n}\n}",
        variables: {
            captcha,
            email,
            password,
            remember
        }
    }
    const data = await ipcRenderer.invoke('rsi-api-post-with-full-response', 'graphql', postData, headers) as RsiLoginResponse
    return data as any
}

async function MultiStepRsiLogin(code: string, headers: any): Promise<RsiLoginResponse> {
    const postData: BasicGraphqlPostBody = {
        query: "mutation multistep($code: String!, $deviceType: String!, $deviceName: String!, $duration: String!) {\naccount_multistep(code: $code, device_type: $deviceType, device_name: $deviceName, duration: $duration) {\ndisplayname\nid\n__typename\n}\n}",
        variables: {
            code,
            deviceType: "computer",
            deviceName: "RefugePC",
            duration: "year"
        }
    }
    const data = await ipcRenderer.invoke('rsi-api-post', 'graphql', postData, headers) as RsiLoginResponse
    return data
}

async function LauncherMultiStepRsiLogin(code: string, headers: any): Promise<RsiLoginResponse> {
    const postData = {
        "code": code,
        "device_type": "computer",
        "device_name": "RefugePC",
        "duration": "year"
    }
    const data = await RsiPost<RsiLoginResponse>('api/launcher/v3/signin/multiStep', postData, {
        'x-rsi-token': window.webSettings.rsi_token,
        'x-rsi-device': window.webSettings.rsi_device,
    })
    return data
}

export async function getCsrfToken(rsi_token: string, rsi_device: string): Promise<RsiValidateToken> {
    // Please note that this function is only avaliable in main process
    console.log('Getting csrf token', rsi_token, rsi_device)
    const regex = /<meta\s+name="csrf-token"\s+content="([^"]+)"\s*\/?>/i
    let cookie = "CookieConsent={stamp:%27-1%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true%2Cmarketing:true%2Cmethod:%27implied%27%2Cver:1%2Cutc:1695456095624%2Cregion:%27CN%27};";
    if (rsi_device.length != 0) {
        cookie += ` _rsi_device=${rsi_device};`;
    }
    if (rsi_token.length != 0) {
        cookie += ` Rsi-Token=${rsi_token};`; 
    }
    // console.log(cookie)
    const response = await axios.get<string>(BASE_URL, { 
        headers: { 'Cookie': cookie, 'Cache-Control': 'no-cache' },
        params: { 'nocache': Date.now() }
     })
    // console.log(response.headers)
    let new_rsi_token = ''
    if (response.headers['set-cookie']) {
        console.log('Resetting Rsi-Token',response.headers['set-cookie'])
        for (const set_cookie of response.headers['set-cookie']) {
            if (set_cookie.startsWith('Rsi-Token')) {
                new_rsi_token = set_cookie.split(';')[0].split('=')[1]
                break
            }
        }
        cookie += ` Rsi-Token=${new_rsi_token};`;
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
    // console.log(response.data.slice(0, 2000))
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
            // 'X-Csrf-Token': window.webSettings.csrfToken,
            'Cookie': getCookie(),
       }
    //    console.log(headers)
         return headers
    }

    async getPage(url: string): Promise<string> {
        const data = await ipcRenderer.invoke('rsi-api-get', url, this.getHeaders())
        return data
    }

    async login(email: string, password: string, captcha: string, remember: boolean): Promise<any> {
        return await RsiLogin(email, password, captcha, remember, this.getHeaders())
    }

    async multiStepLogin(code: string): Promise<RsiLoginResponse> {
        return await LauncherMultiStepRsiLogin(code, this.getHeaders())
    }

    async getClaims(): Promise<RsiLauncherClaimResponse> {
        const claims = await RsiPost<RsiLauncherClaimResponse>('api/launcher/v3/games/claims', {}, {
            'x-rsi-token': window.webSettings.rsi_token,
            'x-rsi-device': window.webSettings.rsi_device,
        })
        window.webSettings.claims = claims.data
        return claims
    }

    async getLibrary(): Promise<RsiLauncherLibraryResponse> {
        const library = await RsiPost<RsiLauncherLibraryResponse>('api/launcher/v3/games/library', { "claims": (await window.RsiApi.getClaims()).data }, {
            'x-rsi-token': window.webSettings.rsi_token,
            'x-rsi-device': window.webSettings.rsi_device,
        })
        return library
    }

    async rsiLauncherSignin(): Promise<RsiLauncherSigninResponse> {
        const refugeSettings = getRefugeSettings()
        const signin = await RsiPost<RsiLauncherSigninResponse>('api/launcher/v3/signin', {
            "password": refugeSettings.accountSettings.password,
            "username": refugeSettings.accountSettings.email,
        }, {
            'x-rsi-device': window.webSettings.rsi_device,
        })
        return signin
    }

    async rsiLauncherLogin(email: String, password: String, captcha: string | null): Promise<RsiLauncherSigninResponse> {
        const signin = await RsiPost<RsiLauncherSigninResponse>('api/launcher/v3/signin', {
            "password": password,
            "username": email,
            "captcha": captcha
        }, {
            'x-rsi-device': window.webSettings.rsi_device,
            'x-rsi-token': window.webSettings.rsi_token
        })
        return signin
    }

    async rsiLauncherCaptcha(): Promise<string> {
        const response = await axios.post('https://robertsspaceindustries.com/api/launcher/v3/signin/captcha',
            {}, {
                headers: {
                    'x-rsi-token': window.webSettings.rsi_token
                },
                responseType: "blob"
            }
          );
        const blob = new Blob([response.data], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        return url
    }

    async getGameToken(claims: string): Promise<string> {
        const token = await RsiPost<RsiGameTokenResponse>('api/launcher/v3/games/token', {
            "claims": claims,
            "gameId": "SC"
        }, {
            'x-rsi-token': window.webSettings.rsi_token,
            'x-rsi-device': window.webSettings.rsi_device,
        })
        return token.data.token
    }

    async checkAccountStatus(): Promise<boolean> {
        try {
            const response = await RsiPost<any>('api/launcher/v3/account/check', {}, {
                'x-rsi-token': window.webSettings.rsi_token,
                'x-rsi-device': window.webSettings.rsi_device,
            })
            if (response.data.auth) {
                return true
            } else {
                return false
            }
        } catch (error) {
            return false
        }
        
    }
    async getReleaseInfo(channelId: string, claims: string, gameId: string, platformId: string): Promise<RsiLauncherReleaseInfoResponse> {
        const postData = {
            "channelId": channelId,
            "claims": claims,
            "gameId": gameId,
            "platformId": platformId
        }
        const releaseInfo = await RsiPost<RsiLauncherReleaseInfoResponse>('api/launcher/v3/games/release', postData, {
            'x-rsi-token': window.webSettings.rsi_token,
            'x-rsi-device': window.webSettings.rsi_device,
        })
        return releaseInfo
    }

    async reclaimPledge(pledge_id: string, current_password: string): Promise<BasicResponseBody> {
        const postData = {
            "current_password": current_password,
            "pledge_id": pledge_id
        }
        const headers = this.getHeaders()
        headers['x-rsi-token'] = window.webSettings.rsi_token
        const response = await RsiPostWithCookie<BasicResponseBody>('api/account/reclaimPledge', postData, headers)
        return response
    }

    async reclaimPledges(pledge_ids: number[], current_password: string): Promise<BasicResponseBody[]> {
        const responses: BasicResponseBody[] = []
        for (const pledge_id of pledge_ids) {
            responses.push(await this.reclaimPledge(pledge_id.toString(), current_password))
        }
        return responses
    }

    async giftPledge(pledge_id: string, current_password: string, email: string, name: string) {
        const postData = {
            "current_password": current_password,
            "email": email,
            "name": name,
            "pledge_id": pledge_id
        }
        const headers = this.getHeaders()
        headers['x-rsi-token'] = window.webSettings.rsi_token
        const response = await RsiPostWithCookie<BasicResponseBody>('api/account/giftPledge', postData, headers)
        return response
    }

    async undoGiftPledge(pledge_id: string) {
        const postData = {
            "pledge_id": pledge_id
        }
        const headers = this.getHeaders()
        headers['x-rsi-token'] = window.webSettings.rsi_token
        const response = await RsiPostWithCookie<BasicResponseBody>('api/account/cancelGift', postData, headers)
        return response
    }
}