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

export interface FileSturcture {
    name: string;
    md5: string;
}

export interface LocalizationInfo {
    path: string;
    localization_id: string;
    localization_version: number;
    localization_url: string;
    localization_font_url: string;
    localization_font_version: number;
    hashes: FileSturcture[];
}

export interface LocalizationInfoPostBody {
    localization_id: string | null;
}


export interface AvailiableLocalization {
    id: string;
    name: string;
    description: string;
}

export interface ReCaptchaResponse {
    code: number;
    message: string;
    error: string | null;
    captcha_list: {
        token: string;
    }
}