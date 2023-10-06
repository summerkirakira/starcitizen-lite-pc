import Store from 'electron-store'
import { RefugeSettings } from '../settings/refuge_settings'
import path from 'path'
import { loadLocalizationInfoFromFile } from './files'


const store = new Store()


export function getRefugeSettings(): RefugeSettings {
    return store.get('refuge_settings') as RefugeSettings
}

export function setRefugeSettings(settings: RefugeSettings) {
    store.set('refuge_settings', settings)
}

export function updateLocalizationSettings() {
    const settings = getRefugeSettings()
    const localizationFolderPath = path.join(settings.gameSettings.currentGamePath, 'data')
    const localizationInfoFilePath = path.join(localizationFolderPath, 'version.json')
    const localizationInfo = loadLocalizationInfoFromFile(localizationInfoFilePath)
    settings.localizationSettings = localizationInfo
    setRefugeSettings(settings)
}