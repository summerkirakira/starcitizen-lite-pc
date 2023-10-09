import { FileSturcture } from "../network/CirnoAPIProperty";

export class GameSettings {
    currentGamePath: string | null;
    currentGameVersion: string;
    otherGamePaths: string[];
}

export class LocalizationSettings {
    localizaitonId: string;
    version: number;
    fontVersion: number;
    latestVersion: number;
    latestFontVersion: number;
    hashes: FileSturcture[];
    path: string;
}

export class AvailiableLocalization {
    id: string;
    name: string;
    description: string;
}

export class RefugeSettings {
    gameSettings: GameSettings | null;
    localizationSettings: LocalizationSettings | null;
    availiabeLocalizations: AvailiableLocalization[];
    accountSettings: {
        email: string;
        password: string;
    } | null;
}

export class GameStartUpSettings {
    libraryFolder: string;
    gameName: string;
    channelId: string;
    nickname: string;
    token: string;
    authToken: string;
    hostname: string;
    port: number;
    installDir: string;
    executable: string;
    launchOptions: string;
    servicesEndpoint: string;
    network: string;
    TMid: string;
}