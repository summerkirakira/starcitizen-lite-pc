import Store from 'electron-store'
import { GameStartUpSettings, RefugeSettings } from '../settings/refuge_settings'


const store = new Store()


export function getRefugeSettings(): RefugeSettings {
    return store.get('refuge_settings') as RefugeSettings
}

export function setRefugeSettings(settings: RefugeSettings) {
    store.set('refuge_settings', settings)
}


export const DEFALUT_STARTUP_SETTINGS: GameStartUpSettings = {
    libraryFolder: "",
    gameName: 'StarCitizen',
    channelId: 'LIVE',
    nickname: '',
    token: '',
    authToken: '',
    hostname: 'public.universe.robertsspaceindustries.com',
    port: 8000,
    installDir: 'StarCitizen',
    executable: 'StarCitizen_Launcher.exe',
    launchOptions: "",
    servicesEndpoint: "https://pub-sc-alpha-3200-8701927.test1.cloudimperiumgames.com:443",
    network: "live",
    TMid: "c5f2b100-d5db-4e61-ba76-48cd35bd20f7"
}