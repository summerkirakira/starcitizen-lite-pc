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