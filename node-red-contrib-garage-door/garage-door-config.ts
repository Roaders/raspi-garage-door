import { Red, Node, NodeProperties } from 'node-red';
import axios from 'axios';
import { IGarageDoorStatus, IAuthToken } from '../shared';

export interface IGarageDoorConfigProperties extends NodeProperties {
    port: number;
    host: string;
    protocol: 'http' | 'https';
}

export interface IGarageDoorConfigNode extends Node {
    properties: IGarageDoorConfigProperties;
    token: IAuthToken | undefined;
    credentials: { username: string; password: string };
}

function getBaseUrl(node: IGarageDoorConfigNode) {
    return `${node.properties.protocol}://${node.properties.host}:${node.properties.port}`;
}

async function login(node: IGarageDoorConfigNode) {
    const url = `${getBaseUrl(node)}/api/login`;

    try {
        node.log(`Logging in: ${url} ${node.credentials.username}`);
        const response = await axios.post<IAuthToken>(url, {
            username: node.credentials.username,
            password: node.credentials.password,
        });

        node.log(`Logged In: ${response.data.access_token}`);
    } catch (e) {
        node.error(`Error Logging in (${url}): ${e}`);
    }
}

async function loadStatus(node: IGarageDoorConfigNode) {
    if (node.token == null) {
        await login(node);
        return;
    }
    const url = `${getBaseUrl(node)}/api/garage/door`;

    try {
        node.log(`Getting door status: ${url}`);
        const response = await axios.get<IGarageDoorStatus>(url);

        node.log(`Status loaded: ${response.status}`);
    } catch (e) {
        node.error(`Error fetching garage door status (${url}): ${e}`);
    }
}

module.exports = function (module: Red) {
    function GarageDoorConfig(this: IGarageDoorConfigNode, config: IGarageDoorConfigProperties) {
        module.nodes.createNode(this, config);

        this.properties = config;

        console.log(`GarageDoorConfig: ${this.credentials.username}`);

        this.on('close', () => {
            this.log(`Closing connection to garage door`);
        });

        loadStatus(this);
    }

    module.nodes.registerType('garage-door-config', GarageDoorConfig, {
        credentials: {
            username: { type: 'text' },
            password: { type: 'password' },
        },
    });
};
