export interface Announcement {
    id: number;
    title: string;
    content: string;
    date: string;
}

export interface Version {
    version: string;
    url: string;
    shipDetailVersion: string;
    shipDetailUrl: string;
    shipAliasUrl: string;
    isVip: boolean;
    vipExpire: number;
    credit: number;
    totalVipTime: number;
}

export interface LocalizationInfo {
    path: string;
    localization_id: string;
    localization_version: number;
    localization_url: string;
    localization_font_url: string;
    localization_font_version: number;
}

