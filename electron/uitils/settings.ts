import Store from 'electron-store'
import { GameStartUpSettings, RefugeSettings } from '../settings/refuge_settings'


const store = new Store()


export function getRefugeSettings(): RefugeSettings {
    return store.get('refuge_settings') as RefugeSettings
}

export function setRefugeSettings(settings: RefugeSettings) {
    store.set('refuge_settings', settings)
}