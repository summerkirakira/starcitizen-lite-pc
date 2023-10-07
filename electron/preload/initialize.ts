import Store from 'electron-store'

import { getRefugeSettings, setRefugeSettings } from '../uitils/settings'
import { updateLocalizationSettings } from '../uitils/files';


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
    // window.CirnoApi.getAvailiableLocalization().then((availiableLocalizations) => {
    //     const refugeSettings = getRefugeSettings()
    //     refugeSettings.availiabeLocalizations = availiableLocalizations
    //     setRefugeSettings(refugeSettings)
    // })
}
