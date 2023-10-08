import Store from 'electron-store'
import { refreshCsrfToken } from '../preload/initialize'

const store = new Store()

export async function rsiLogin(email: string, password: string) {
    const recaptcha = (await window.CirnoApi.getRecaptchaToken()).captcha_list[0].token
    const loginResponse = await window.RsiApi.login(email, password, recaptcha, true)
    if (loginResponse.errors === null) {
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
    throw new Error(loginResponse.errors[0].code)
}

export async function rsiMultiStepLogin(code: string) {
    const response = await window.RsiApi.multiStepLogin(code)
    if (response.errors === null) {
        return response
    } else {
        throw new Error(response.errors[0].code)
    }
}