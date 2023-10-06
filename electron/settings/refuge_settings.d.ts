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
}