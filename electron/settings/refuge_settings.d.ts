import { User } from "../database/DatabaseEntities";
import { FileSturcture } from "../network/CirnoAPIProperty";

export class GameSettings {
    currentGamePath: string | null;
    currentGameVersion: string;
    otherGamePaths: string[];
    startOpts: Map<string, string>;
    disableCores: boolean;
    enabledCores: boolean[];
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
    currentUser: User | null;
    accountSettings: {
        email: string;
        password: string;
    } | null;
    resourceinfo: {
        hangarLocalizationVersion: string;
        shipDetailVersion: string;
        shipAliasVersion: string;
    }
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