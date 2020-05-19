export interface IServerConfig {
    keyPath?: string;
    certificatePath?: string;
    jwtSecret?: string;
    port?: number;
}

export interface IUser {
    username: string;
}

export interface IUserToken extends IUser, IRefreshToken {}

export interface IUserAuth extends IUser {
    salt: string;
    hash: string;
}

export interface IAuthToken {
    access_token: string;
    refresh_token: string;
}

export interface IRefreshToken {
    refresh_token: string;
}

export function isAuthResponse(value: any): value is IAuthToken {
    const authResponse = value as IAuthToken;
    return (
        authResponse != null &&
        typeof authResponse.access_token === 'string' &&
        typeof authResponse.refresh_token === 'string'
    );
}

export function isIUser(value: any): value is IUser {
    const user = value as IUser;
    return user != null && typeof user.username === 'string';
}
