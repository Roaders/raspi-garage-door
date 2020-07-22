import { Red, Node, NodeProperties } from 'node-red';
import { IGarageDoorConfigNode } from './garage-door-config';

export interface IGarageDoorProperties extends NodeProperties {
    server: string;
}

interface IGarageDoorNode extends Node {
    server: IGarageDoorConfigNode | null;
}

module.exports = function (module: Red) {
    function GarageDoorNode(this: IGarageDoorNode, config: IGarageDoorProperties) {
        module.nodes.createNode(this, config);

        this.server = module.nodes.getNode(config.server) as IGarageDoorConfigNode;

        if (this.server != null) {
            this.log(`GarageDoorNode PORT: ${this.server.port}`);
        } else {
            this.warn(`GarageDoorNode NO PORT`);
        }

        this.on('input', (msg: any) => {
            msg.payload = msg.payload.toLowerCase();
            this.send(msg);
        });
    }

    module.nodes.registerType('garage-door', GarageDoorNode);
};
