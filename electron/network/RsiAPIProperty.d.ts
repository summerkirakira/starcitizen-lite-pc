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

export interface RsiLauncherAccountCheckResponse {

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
            id: number;
        } | null;
    }
    errors: [
        {
            message: string;
            code: string;
            extensions: {
                details: {
                    device_id: string;
                    session_id: string;
                }
            }
        }
    ] | null;
}

export interface RsiGameTokenResponse {
    code: string;
    success: number;
    data: {
        token: string;
    };
}


export interface RsiLauncherReleaseInfoResponse {
    code: string;
    success: number;
    data: {
        channelId: string;
        executable: string;
        gameId: string;
        installDir: string;
        launchOptions: string;
        manifest: {
            signatures: string;
            url: string;
        }
        objects: {
            signature: string;
            url: string;
        }
        p4kBase: {
            signature: string;
            url: string;
        }
        p4kBaseVerificationFile: {
            signature: string;
            url: string;
        }
        platformId: string;
        platformURL: string;
        serviceEndpoint: string;
        universePort: number;
        universeHost: string;
        version: string;
        versionLabel: string;
    }
}

export interface BasicResponseBody {
    success: number;
    code: string;
    msg: string;
}