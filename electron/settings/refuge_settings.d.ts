export class GameSettings {
    gamePath: string;
    gameVersion: string;
}

export class LocalizationSettings {
    localizaiton_id: string;
    version: number;
    font_version: number;
}

export class RefugeSittings {
    game_settings: GameSettings;
    localization_settings: LocalizationSettings;
}