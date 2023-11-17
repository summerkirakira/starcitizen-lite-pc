import Store from 'electron-store'
import { refreshCsrfToken } from '../preload/initialize'
import { RsiLoginResponse } from '../network/RsiAPIProperty'
import { getRefugeSettings } from './settings'

const store = new Store()

export async function rsiLogin(email: string, password: string) {
    const recaptcha = (await window.CirnoApi.getRecaptchaToken()).captcha_list[0].token
    const response = await window.RsiApi.login(email, password, recaptcha, true)
    const loginResponse = response.data as RsiLoginResponse
    if (loginResponse.errors === undefined) {
        for (const set_cookie of response.set_cookie) {
            if (set_cookie.startsWith('Rsi-Token')) {
                window.webSettings.rsi_token = set_cookie.split(';')[0].split('=')[1]
                store.set('rsi_token', window.webSettings.rsi_token)
            }
        }
        return loginResponse
    }
    if (loginResponse.errors[0].code === 'AlreadyLoggedInException') {
        return loginResponse
    }
    if (loginResponse.errors[0].code === 'InvalidPasswordException') {
        return loginResponse
    }
    if (loginResponse.errors[0].code === 'MultiStepRequiredException') {
        console.log(loginResponse)
        window.webSettings.rsi_token = loginResponse.errors[0].extensions.details.session_id
        window.webSettings.rsi_device = loginResponse.errors[0].extensions.details.device_id
        store.set('rsi_token', window.webSettings.rsi_token)
        store.set('rsi_device', window.webSettings.rsi_device)
        // refreshCsrfToken()
        throw new Error('MultiStepRequiredException')
    }
    console.log(loginResponse)
    throw new Error(loginResponse.errors[0].code)
}

export async function rsiForceLogin(email: string, password: string) {
    window.webSettings.rsi_token = ''
    await refreshCsrfToken()
    // delay 4000ms to avoid csrf token error
    await new Promise(resolve => setTimeout(resolve, 8000));
    return rsiLogin(email, password)
}

export async function rsiMultiStepLogin(code: string) {
    const response = await window.RsiApi.multiStepLogin(code)
    if (response.errors === null || response.errors === undefined) {
        return response
    } else {
        throw new Error(response.errors[0].code)
    }
}

export async function rsiLauncherSignin() {
    const response = await window.RsiApi.rsiLauncherSignin()
    if (response.code === 'OK') {
        window.webSettings.rsi_token = response.data.session_id
        store.set('rsi_token', window.webSettings.rsi_token)
    } else
        throw new Error(response.code)

}

export function applyUserSettings() {
    const refugeSettings = getRefugeSettings()
    window.webSettings.rsi_token = refugeSettings.currentUser.rsi_token
    window.webSettings.rsi_device = refugeSettings.currentUser.rsi_device
    store.set('rsi_token', window.webSettings.rsi_token)
    store.set('rsi_device', window.webSettings.rsi_device)
}