export interface IServerConfig {
    keyPath?: string;
    certificatePath?: string;
}

export interface IUser {
    username: string;
    salt: string;
    hash: string;
}
