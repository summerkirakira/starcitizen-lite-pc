import Store from 'electron-store'

import { getRefugeSettings, setRefugeSettings } from '../uitils/settings'
import { getShipAliasList, getTranslation, setShipAliasList, setTranslation, updateLocalizationSettings } from '../uitils/files';
import { ipcRenderer } from 'electron';
import { RsiValidateToken } from '../network/RsiAPIProperty';
import { compareVersions } from 'compare-versions';
import { ShipAlias, Translation } from '../network/CirnoAPIProperty';
import { getSessionCookies } from '../uitils/cookies-manager';


const store = new Store()


export function initialize() {
    checkUUID()
    initializeGameSettings()
    fetchLocalizationInfo()
    initializeWebSettings()
    refreshCsrfToken()
    initializeAccountSettings()
    // initializeCliamSettings()
    checkResourceVersion()
    setCookies()
}

export function setCookies() {
    for (const cookie of getSessionCookies()) {
        window.setWebCookie(cookie)
    }
}


function checkUUID() {
    const uuid = store.get('uuid', null)

    if (!uuid) {
        store.set('uuid', require('uuid').v4())
    }
}

function initializeGameSettings() {
    let settings = store.get('refuge_settings', null) as any
    if (settings == null) {
        store.set('refuge_settings', {
            gameSettings: {
                currentGamePath: null,
                currentGameVersion: null,
                otherGamePaths: [],
                startOpts: new Map<string, string>(),
                disableCores: false,
                enabledCores: [],
            },
            localizationSettings: null,
        })
    }
    settings = store.get('refuge_settings', null) as any
    if (settings.gameSettings.startOpts == undefined) {
        settings.gameSettings.startOpts = new Map<string, string>()
    }
    if (settings.gameSettings.disableCores == undefined) {
        settings.gameSettings.disableCores = false
    }
    if (settings.gameSettings.enabledCores == undefined) {
        settings.gameSettings.enabledCores = []
    }

    store.set('refuge_settings', settings)

}

async function fetchLocalizationInfo() {
    const refugeSettings = getRefugeSettings()
    // console.log(refugeSettings)
    if(refugeSettings.gameSettings.currentGamePath != null) {
        updateLocalizationSettings()
        // console.log(refugeSettings)
    }
    // window.CirnoApi.getAvailiableLocalization().then((availiableLocalizations) => {
    //     const refugeSettings = getRefugeSettings()
    //     refugeSettings.availiabeLocalizations = availiableLocalizations
    //     setRefugeSettings(refugeSettings)
    // })
}


function initializeWebSettings() {
    let rsi_divice = store.get('rsi_device', '') as string
    if (rsi_divice == null) {
        rsi_divice = ''
    }
    let rsi_token = store.get('rsi_token', '') as string
    if (rsi_token == null) {
        rsi_token = ''
    }
    window.webSettings = {
        csrfToken: '',
        rsi_token: rsi_token,
        rsi_device: rsi_divice,
        claims: '',
    }
    console.log('initializeWebSettings', window.webSettings)
}

export function refreshCsrfToken() {
    ipcRenderer.invoke('get-csrf-token', window.webSettings.rsi_device, window.webSettings.rsi_token).then((token: RsiValidateToken) => {
        // console.log("get csrf token", token)
        window.webSettings.csrfToken = token.csrf_token
        window.webSettings.rsi_token = token.rsi_token
        window.webSettings.rsi_device = token.rsi_device
        console.log(token)
        store.set('rsi_token', token.rsi_token)
        store.set('rsi_device', token.rsi_device)
    }).catch((error) => {
        console.log(error)
    })
    
}

function initializeAccountSettings() {
    const email = store.get('account:email', '') as string
    const password = store.get('account:password', '') as string
    if (email.length != 0 && password.length != 0) {
        const refugeSettings = getRefugeSettings()
        refugeSettings.accountSettings = {
            email: email,
            password: password,
        }
        setRefugeSettings(refugeSettings)
    }
}

async function initializeCliamSettings() {
    try {
        const refugeSettings = getRefugeSettings()
        if (refugeSettings.gameSettings.currentGamePath != null) {
            if (window.webSettings.claims.length == 0) {
                window.webSettings.claims = (await window.RsiApi.getClaims()).data
            }
        }
    } catch {
        console.log("Failed to get claims")
    }
    
}

async function checkResourceVersion() {
    window.fileManager.shipAliasMap = convertShipAliasListToMap(getShipAliasList())
    window.fileManager.translationMap = convertTranslationToMap(getTranslation())

    const refugeSettings = getRefugeSettings()
    if (refugeSettings.resourceinfo == undefined) {
        refugeSettings.resourceinfo = {
            shipAliasVersion: '0.0.0',
            shipDetailVersion: '0.0.0',
            hangarLocalizationVersion: '0.0.0'
        }
    }
    setRefugeSettings(refugeSettings)
    const resourceInfo = await window.CirnoApi.getResourceInfo({
        androidVersion: 12,
        systemModel: 'Windows',
        version: '0.0.0',
    })
    const latestShipAliasVersion = resourceInfo.shipAliasUrl.split('formatted_ship_alias.')[1].replace('.json', '')
    if (compareVersions(latestShipAliasVersion, refugeSettings.resourceinfo.shipAliasVersion) > 0) {
        const shipAliasList = await window.CirnoApi.getShipAlias(resourceInfo.shipAliasUrl)
        
        setShipAliasList(shipAliasList)
        window.fileManager.shipAliasMap = convertShipAliasListToMap(shipAliasList)
        const refugeSettings = getRefugeSettings()
        refugeSettings.resourceinfo.shipAliasVersion = latestShipAliasVersion
        setRefugeSettings(refugeSettings)
    }
    const translationVersion = await window.CirnoApi.getTranslationVersion()

    if (compareVersions(translationVersion.version, refugeSettings.resourceinfo.hangarLocalizationVersion) > 0) {
        const translationList = await window.CirnoApi.getTranslations()
        window.fileManager.translationMap = convertTranslationToMap(translationList)
        setTranslation(translationList)
        const refugeSettings = getRefugeSettings()
        refugeSettings.resourceinfo.hangarLocalizationVersion = translationVersion.version
        setRefugeSettings(refugeSettings)
    }
}

function convertShipAliasListToMap(shipAliasList: ShipAlias[]): Map<string, ShipAlias> {
    const shipAliasMap = new Map<string, ShipAlias>()
        for (const shipAlias of shipAliasList) {
            shipAliasMap.set(shipAlias.name, shipAlias)
            for (const alias of shipAlias.alias) {
                shipAliasMap.set(alias, shipAlias)
            }
        }
    return shipAliasMap
}

export function convertTranslationToMap(tranlationList: Translation[]): Map<string, string> {
    const translationMap = new Map<string, string>()
    for (const translation of tranlationList) {
        translationMap.set(translation.english_title, translation.title)
    }
    return translationMap
}
