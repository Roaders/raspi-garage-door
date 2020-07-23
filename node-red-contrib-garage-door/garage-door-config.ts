import { Red, Node, NodeProperties } from 'node-red';
import axios from 'axios';
import { IGarageDoorStatus, IAuthToken, DOOR_STATUS_UPDATES } from '../shared';
import { from, of, Observable } from 'rxjs';
import { map, tap, mergeMap, catchError } from 'rxjs/operators';
import io from 'socket.io-client';

export interface IGarageDoorConfigProperties extends NodeProperties {
    port: number;
    host: string;
    protocol: 'http' | 'https';
}

export interface IGarageDoorConfigNode extends Node {
    properties: IGarageDoorConfigProperties;
    token: IAuthToken | undefined;
    socket: SocketIOClient.Socket | undefined;
    doorStatus: IGarageDoorStatus | undefined;
    credentials: { username: string; password: string };
    setStatus: (status: IGarageDoorStatus) => Observable<IGarageDoorStatus>;
}

function getBaseUrl(node: IGarageDoorConfigNode) {
    return `${node.properties.protocol}://${node.properties.host}:${node.properties.port}`;
}

function createAxiosConfig(token: string) {
    return {
        headers: {
            Authorization: 'Bearer ' + token,
        },
    };
}

function login(node: IGarageDoorConfigNode) {
    if (node.token != null) {
        return of(node.token);
    }
    const url = `${getBaseUrl(node)}/api/login`;

    return from(
        axios.post<IAuthToken>(url, {
            username: node.credentials.username,
            password: node.credentials.password,
        }),
    ).pipe(
        map((response) => response.data),
        tap((token) => (node.token = token)),
    );
}

function exchangeToken(node: IGarageDoorConfigNode, token: IAuthToken) {
    const url = `${getBaseUrl(node)}/api/exchangeToken`;

    return from(axios.get<IAuthToken>(url, createAxiosConfig(token.refresh_token))).pipe(
        map((response) => response.data),
        tap((token) => (node.token = token)),
    );
}

function loadStatus(node: IGarageDoorConfigNode) {
    function getStatus(token: IAuthToken) {
        const url = `${getBaseUrl(node)}/api/garage/door`;
        return from(axios.get<IGarageDoorStatus>(url, createAxiosConfig(token.access_token)));
    }

    return login(node).pipe(
        mergeMap((token) =>
            getStatus(token).pipe(
                catchError(() => exchangeToken(node, token).pipe(mergeMap((newToken) => getStatus(newToken)))),
                catchError(() => login(node).pipe(mergeMap((newToken) => getStatus(newToken)))),
            ),
        ),
        map((response) => response.data),
    );
}

function setStatus(node: IGarageDoorConfigNode, status: IGarageDoorStatus) {
    function putStatus(token: IAuthToken) {
        const url = `${getBaseUrl(node)}/api/garage/door`;
        return from(axios.put<IGarageDoorStatus>(url, status, createAxiosConfig(token.access_token)));
    }

    return login(node).pipe(
        mergeMap((token) =>
            putStatus(token).pipe(
                catchError(() => exchangeToken(node, token).pipe(mergeMap((newToken) => putStatus(newToken)))),
                catchError(() => login(node).pipe(mergeMap((newToken) => putStatus(newToken)))),
            ),
        ),
        map((response) => response.data),
    );
}

function onStatusChange(node: IGarageDoorConfigNode, status: IGarageDoorStatus) {
    node.doorStatus = status;
    node.emit('doorStatus', status);
}

function createSocket(node: IGarageDoorConfigNode, token: IAuthToken) {
    if (node.socket) {
        node.socket.close();
    }

    const url = `${getBaseUrl(node)}?token=${token.access_token}`;

    try {
        const socket = io(url);
        node.socket = socket;

        socket.on('connect', () => {
            node.log(`SOCKET CONNECTED`);
        });

        socket.on(DOOR_STATUS_UPDATES, (update: IGarageDoorStatus) => onStatusChange(node, update));

        socket.on('disconnect ', () => node.log(`SOCKET DISCONNECTED`));
        socket.on('error', (error: any) => node.log(`Error from stream: ${error}`));
    } catch (e) {
        node.log(`Error setting up stream: ${e}`);
    }
}

module.exports = function (module: Red) {
    function GarageDoorConfig(this: IGarageDoorConfigNode, config: IGarageDoorConfigProperties) {
        module.nodes.createNode(this, config);

        this.properties = config;

        this.on('close', () => {
            if (this.socket != null) {
                this.socket.close();
            }
        });

        loadStatus(this).subscribe(
            (status) => onStatusChange(this, status),
            (error) => this.error(`Could not load status: ${error}`),
        );

        this.setStatus = (status: IGarageDoorStatus) => setStatus(this, status);

        let _token: IAuthToken | undefined;

        Object.defineProperty(this, 'token', {
            get: () => _token,
            set: (value: IAuthToken) => {
                _token = value;
                createSocket(this, value);
            },
        });
    }

    module.nodes.registerType('garage-door-config', GarageDoorConfig, {
        credentials: {
            username: { type: 'text' },
            password: { type: 'password' },
        },
    });
};
