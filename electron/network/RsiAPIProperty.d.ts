export interface RsiLauncherSigninPostBody {
    username: string;
    password: string;
}

export interface RsiLauncherSigninResponse {
    code: string;
    success: number;
    data: {
        account_id: number;
        avatar: string;
        citizen_id: number;
        displayname: string;
        nickname: string;
        session_id: string;
        tracking_metrics_id: string;
    } | null;
}

export interface RsiLauncherClaimResponse {
    code: string;
    success: number;
    data: string;
}

export interface RsiLauncherTokenPostBody {
    gameId: string;
    claims: string;
}

export interface RsiLauncherTokenResponse {
    code: string;
    success: number;
    data: {
        token: string;
    };
}

export interface RsiLauncherLibraryResponse {
    code: string;
    success: number;
    data: {
        games: [
            {
                channels: [
                    {
                        id: string;
                        name: string;
                        network: string | null;
                        nid: string;
                        platformId: string;
                        servicesEndpoint: string;
                        version: string;
                        versionLabel: string;
                    }
                ]
                id: string;
                name: string;
            }
        ]
    }
}

export interface BasicGraphqlPostBody {
    query: string;
    variables: {
        [key: string]: any;
    };
}

export interface RsiValidateToken {
    rsi_token: string;
    csrf_token: string;
    rsi_device: string;
}

export interface RsiLoginResponse {
    data: {
        account_signin: {
            displayname: string;
            id: string;
        } | null;
    }
    errors: [
        {
            message: string;
            code: string;
        }
    ] | null;
}