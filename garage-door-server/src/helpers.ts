import { IServerConfig, UntypedServerConfig, DOOR_STATUS, IStatusChangeImage } from '../../shared';
import { readFileSync } from 'fs';

type httpsOptions = { key: Buffer; cert: Buffer };

export function getSSLConfig(serverConfig: IServerConfig): httpsOptions | undefined {
    if (serverConfig.certificatePath == null || serverConfig.keyPath == null) {
        return undefined;
    }

    const key = readFileSync(serverConfig.keyPath);
    const cert = readFileSync(serverConfig.certificatePath);

    return {
        key,
        cert,
    };
}

export function getPort(serverConfig: IServerConfig) {
    const sslConfig = getSSLConfig(serverConfig);

    if (sslConfig != null) {
        return serverConfig.sslPort || 3443;
    } else {
        return serverConfig.port || 3000;
    }
}

function mapStringToBoolean(value?: unknown): boolean | undefined {
    if (value == null) {
        return undefined;
    }

    if (typeof value === 'string' && value === 'true') {
        return true;
    }

    if (typeof value === 'boolean' && value === true) {
        return true;
    }

    return false;
}

export function parseConfig(config: UntypedServerConfig): IServerConfig {
    const invertRelayControl = mapStringToBoolean(config.invertRelayControl);

    return {
        ...config,
        invertRelayControl,
    };
}

function handleNever(value: never) {
    console.log(`Unknown status: ${value}`);
    return undefined;
}

function getStatus(value: string): DOOR_STATUS | undefined {
    const status = value as DOOR_STATUS;
    switch (status) {
        case 'CLOSED':
        case 'CLOSING':
        case 'OPEN':
        case 'OPENING':
        case 'UNKNOWN':
            return status;

        default:
            return handleNever(status);
    }
}

export function createImageDTO(regExResult?: RegExpExecArray | null): IStatusChangeImage | undefined {
    if (regExResult == null) {
        return undefined;
    }

    const status = getStatus(regExResult[2]);
    const timestamp = parseInt(regExResult[1]);

    if (status == null || isNaN(timestamp)) {
        return undefined;
    }

    return {
        name: regExResult[0],
        timestamp,
        status,
    };
}
