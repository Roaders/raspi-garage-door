import { Red, Node, NodeProperties } from 'node-red';
import {
    IGarageDoorStatus,
    SocketFactory,
    AuthTokenService,
    GarageDoorHttpService,
    UPDATE_DOOR_STATUS,
    NodeTokenStore,
} from '../shared';
import { from, Observable } from 'rxjs';

export interface IGarageDoorConfigProperties extends NodeProperties {
    port: number;
    host: string;
    protocol: 'http' | 'https';
}

export interface IGarageDoorConfigNode extends Node {
    doorStatus: IGarageDoorStatus | undefined;
    credentials: { username: string; password: string };
    setStatus: (status: UPDATE_DOOR_STATUS) => Observable<IGarageDoorStatus>;
}

function getBaseUrl(properties: IGarageDoorConfigProperties) {
    return `${properties.protocol}://${properties.host}:${properties.port}`;
}

function onStatusChange(node: IGarageDoorConfigNode, status: IGarageDoorStatus) {
    node.doorStatus = status;
    node.emit('doorStatus', status);
}

module.exports = function (module: Red) {
    function GarageDoorConfig(this: IGarageDoorConfigNode, config: IGarageDoorConfigProperties) {
        module.nodes.createNode(this, config);

        const socketFactory = new SocketFactory(this, getBaseUrl(config));
        const authTokenService = new AuthTokenService(new NodeTokenStore());
        const httpService = new GarageDoorHttpService(authTokenService, socketFactory);
        httpService.baseUrl = getBaseUrl(config);

        this.setStatus = (status: UPDATE_DOOR_STATUS) => from(httpService.setGarageState(status));

        httpService.statusUpdatesStream().subscribe((update: IGarageDoorStatus) => onStatusChange(this, update));

        this.on('close', () => {
            socketFactory.close();
        });

        socketFactory.createSocket(() =>
            authTokenService.authToken == null
                ? httpService.login(this.credentials.username, this.credentials.password)
                : httpService.exchangeToken(),
        );
    }

    module.nodes.registerType('garage-door-config', GarageDoorConfig, {
        credentials: {
            username: { type: 'text' },
            password: { type: 'password' },
        },
    });
};
