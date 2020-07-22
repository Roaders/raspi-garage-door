import { Red, Node, NodeProperties } from 'node-red';
import axios from 'axios';
import { IGarageDoorStatus } from '../shared';

export interface IGarageDoorConfigProperties extends NodeProperties {
    port: number;
}

export interface IGarageDoorConfigNode extends Node {
    port: number;
}

async function loadStatus(node: IGarageDoorConfigNode) {
    const url = `http://localhost:${node.port}/api/garage/door`;

    try {
        node.log(`Getting door status: ${url}`);
        const response = await axios.get<IGarageDoorStatus>(url);

        node.log(`Status loaded: ${response.status}`);
    } catch (e) {
        node.error(`Error fetching garage door status: ${e}`);
    }
}

module.exports = function (module: Red) {
    function GarageDoorConfig(this: IGarageDoorConfigNode, config: IGarageDoorConfigProperties) {
        module.nodes.createNode(this, config);

        this.port = config.port;

        this.on('close', () => {
            this.log(`Closing connection to garage door ${this.port}`);
        });

        loadStatus(this);
    }

    module.nodes.registerType('garage-door-config', GarageDoorConfig);
};
