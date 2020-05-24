import { IServerConfig } from '../../shared';
import { readFileSync } from 'fs';

type httpsOptions = { key: Buffer; cert: Buffer };

export function getSSLConfig(): httpsOptions | undefined {
    const serverConfig: IServerConfig = process.env;

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

export function getPort() {
    const serverConfig: IServerConfig = process.env;
    const sslConfig = getSSLConfig();

    if (sslConfig != null) {
        return serverConfig.sslPort || 3443;
    } else {
        return serverConfig.port || 3000;
    }
}
