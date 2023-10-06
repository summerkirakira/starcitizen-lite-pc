import { RefugeSettings } from './../settings/refuge_settings.d';
import Store from 'electron-store'

import { app } from 'electron'
import { getRefugeSettings, setRefugeSettings, updateLocalizationSettings } from '../uitils/settings'
import { loadLocalizationInfoFromFile } from '../uitils/files';


const store = new Store()


export function initialize() {
    checkUUID()
    initializeGameSettings()
    fetchLocalizationInfo()
}


function checkUUID() {
    const uuid = store.get('uuid', null)

    console.log(uuid)

    if (!uuid) {
        const uuid = require('uuid').v4()
        store.set('uuid', require('uuid').v4())
    }
}

function initializeGameSettings() {
    const settings = store.get('refuge_settings', null)
    if (settings == null) {
        store.set('refuge_settings', {
            gameSettings: {
                currentGamePath: null,
                currentGameVersion: null,
                otherGamePaths: [],
            },
            localizationSettings: null,
        })
    }
}

async function fetchLocalizationInfo() {
    const refugeSettings = getRefugeSettings()
    if(refugeSettings.gameSettings.currentGamePath != null) {
        updateLocalizationSettings()
        console.log(refugeSettings)
    }
    if (!refugeSettings.localizationSettings) {
        
    } else {
        const localizationId = refugeSettings.localizationSettings.localizaitonId
        window.CirnoApi.getLocalizationInfo({
            localization_id: localizationId
        }).then((localizationInfo) => {
            const refugeSettings = getRefugeSettings()
            refugeSettings.localizationSettings.latestVersion = localizationInfo.localization_version
            refugeSettings.localizationSettings.latestFontVersion = localizationInfo.localization_font_version
            setRefugeSettings(refugeSettings)
        })
    }
    window.CirnoApi.getAvailiableLocalization().then((availiableLocalizations) => {
        const refugeSettings = getRefugeSettings()
        refugeSettings.availiabeLocalizations = availiableLocalizations
        setRefugeSettings(refugeSettings)
    })
}
