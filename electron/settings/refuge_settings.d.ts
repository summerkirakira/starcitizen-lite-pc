export class GameSettings {
    currentGamePath: string;
    currentGameVersion: string;
    otherGamePaths: string[];
}

export class LocalizationSettings {
    localizaitonId: string;
    version: number;
    fontVersion: number;
}

export class RefugeSettings {
    gameSettings: GameSettings | null;
    localizationSettings: LocalizationSettings | null;
}