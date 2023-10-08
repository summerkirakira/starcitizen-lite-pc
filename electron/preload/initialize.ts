import Store from 'electron-store'

import { getRefugeSettings, setRefugeSettings } from '../uitils/settings'
import { updateLocalizationSettings } from '../uitils/files';
import { ipcRenderer } from 'electron';
import { RsiValidateToken } from '../network/RsiAPIProperty';


const store = new Store()


export function initialize() {
    checkUUID()
    initializeGameSettings()
    fetchLocalizationInfo()
    initializeWebSettings()
    refreshCsrfToken()
}


function checkUUID() {
    const uuid = store.get('uuid', null)

    console.log(uuid)

    if (!uuid) {
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


function initializeWebSettings() {
    window.webSettings = {
        csrfToken: '',
        rsi_token: store.get('rsi_token', '') as string,
        rsi_device: store.get('rsi_device', '') as string,
        claims: '',
    }
}

function refreshCsrfToken() {
    ipcRenderer.invoke('get-csrf-token', window.webSettings.rsi_device, window.webSettings.rsi_token).then((token: RsiValidateToken) => {
        console.log("get csrf token", token)
        window.webSettings.csrfToken = token.csrf_token
        window.webSettings.rsi_token = token.rsi_token
        window.webSettings.rsi_device = token.rsi_device
        store.set('rsi_token', token.rsi_token)
        store.set('rsi_device', token.rsi_device)
      })
}
