import path from 'path';
import { RsiLauncherLibraryResponse } from "../network/RsiAPIProperty";
import { getRefugeSettings } from "./settings";
import { GameStartUpSettings } from '../settings/refuge_settings';
import { GameLauncher } from '../../electron/rsi-sdk/game-launcher'
import { rsiLauncherSignin } from './signin';


function getChannelData(libray: RsiLauncherLibraryResponse, channelId: string) {
    for (const game of libray.data.games) {
        for (const channel of game.channels) {
            if (channel.id === channelId) {
                return channel
            }
        }
    }
    return null
}

export async function startGame() {
    const isLogin  = await window.RsiApi.checkAccountStatus()
    if (!isLogin) await rsiLauncherSignin()
    const refugeSettings = getRefugeSettings()
    const claim = (await window.RsiApi.getClaims()).data
    const library = await window.RsiApi.getLibrary()
    const authToken = await window.RsiApi.getGameToken(claim)
    let channelId = ''
    if (refugeSettings.gameSettings.currentGamePath.endsWith('LIVE')) {
        channelId = 'LIVE'
    } else if (refugeSettings.gameSettings.currentGamePath.endsWith('PTU')) {
        channelId = 'PTU'
    } else if (refugeSettings.gameSettings.currentGamePath.endsWith('EVO')) {
        channelId = 'EVO'
    }
    const releaseInfo = await window.RsiApi.getReleaseInfo(channelId, claim, 'SC', 'prod')
    // const channelData = getChannelData(library, channelId)
    // console.log(releaseInfo)
    const servicesEndpoint = releaseInfo.data.serviceEndpoint
    const token = window.webSettings.rsi_token
    const port = releaseInfo.data.universePort
    const nickname = refugeSettings.accountSettings.email
    const hostname = releaseInfo.data.universeHost
    const TMid = 'c5f2b100-d5db-4e61-ba76-48cd35bd20f7'
    const executable = releaseInfo.data.executable
    const libraryFolder = path.dirname(path.dirname(refugeSettings.gameSettings.currentGamePath))
    const installDir = path.basename(path.dirname(refugeSettings.gameSettings.currentGamePath))
    const gameName = 'StarCitizen'
    const launchOptions = releaseInfo.data.launchOptions
    const startOpt: GameStartUpSettings = {
        libraryFolder: libraryFolder,
        gameName: gameName,
        channelId: channelId,
        nickname: nickname,
        token: token,
        authToken: authToken,
        hostname: hostname,
        port: port,
        installDir: installDir,
        executable: executable,
        launchOptions: launchOptions,
        servicesEndpoint: servicesEndpoint,
        network: "",
        TMid: TMid
    }
    // console.log(startOpt)
    const gameLauncher = new GameLauncher(startOpt)
    gameLauncher.start(startOpt)
}