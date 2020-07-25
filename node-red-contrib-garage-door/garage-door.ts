import { Red, Node, NodeProperties } from 'node-red';
import { IGarageDoorConfigNode } from './garage-door-config';
import { DOOR_STATUS, IGarageDoorStatus, UPDATE_DOOR_STATUS } from 'shared';

export interface IGarageDoorProperties extends NodeProperties {
    server: string;
}

interface IGarageDoorNode extends Node {
    server: IGarageDoorConfigNode | null;
}

function updateStatus(node: IGarageDoorNode, status?: DOOR_STATUS) {
    switch (status) {
        case 'CLOSED':
            node.status({ fill: 'green', shape: 'dot', text: status });
            break;
        case 'OPEN':
            node.status({ fill: 'red', shape: 'dot', text: status });
            break;
        case 'CLOSING':
        case 'OPENING':
            node.status({ fill: 'yellow', shape: 'dot', text: status });
            break;
        default:
            node.status({ fill: 'yellow', shape: 'dot', text: 'Unknown' });
    }
}

function createPayload(status: IGarageDoorStatus) {
    return {
        ...status,
        isOpen: status.status === 'OPEN',
        isClosed: status.status === 'CLOSED',
        isOpening: status.status === 'OPENING',
        isClosing: status.status === 'CLOSING',
        isUnknown: status.status === 'UNKNOWN',
    };
}

module.exports = function (module: Red) {
    function GarageDoorNode(this: IGarageDoorNode, config: IGarageDoorProperties) {
        module.nodes.createNode(this, config);

        this.server = module.nodes.getNode(config.server) as IGarageDoorConfigNode;

        updateStatus(this);

        this.server.on('doorStatus', (status: IGarageDoorStatus) => {
            this.send({ payload: createPayload(status) });
            updateStatus(this, status.status);
        });

        this.on('input', (msg) => {
            if (this.server == null) {
                return;
            }
            const payload: UPDATE_DOOR_STATUS | boolean | undefined = msg.payload;

            let newStatus: UPDATE_DOOR_STATUS | undefined;

            if (typeof payload === 'boolean') {
                newStatus = payload ? 'OPEN' : 'CLOSED';
            } else {
                switch (payload) {
                    case 'OPEN':
                    case 'CLOSED':
                        newStatus = payload;
                        break;
                    default:
                        this.warn(
                            `Could not process message payload '${payload}'. Payload should be true (for OPEN), false, "OPEN" or "CLOSED"`,
                        );
                }
            }

            if (newStatus != null) {
                this.server.setStatus(newStatus).subscribe(
                    (status) => updateStatus(this, status.status),
                    (error) => this.error(`Could not update door state: ${error}`),
                );
            }
        });
    }

    module.nodes.registerType('garage-door', GarageDoorNode);
};
