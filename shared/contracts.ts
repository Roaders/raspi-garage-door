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

export interface IAuthResponse {
    access_token: string;
}
