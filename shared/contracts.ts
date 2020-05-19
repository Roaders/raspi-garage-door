export interface IServerConfig {
    keyPath?: string;
    certificatePath?: string;
    jwtSecret?: string;
}

export interface IUser {
    username: string;
}

export interface IUserAuth extends IUser {
    salt: string;
    hash: string;
}

export interface IAuthToken {
    access_token: string;
}

export function isAuthResponse(value: any): value is IAuthToken {
    const authResponse = value as IAuthToken;
    return authResponse != null && typeof authResponse.access_token === 'string';
}
