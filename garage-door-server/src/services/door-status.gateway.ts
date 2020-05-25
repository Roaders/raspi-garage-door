import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IGarageDoorStatus, GarageDoorService } from '../../../rpi-garage-door/src';
import { DOOR_STATUS_UPDATES } from '../../../shared';

@WebSocketGateway()
export class DoorStatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private garageDoorService: GarageDoorService) {}

    private clients: { [key: string]: any[] } = {};
    private _listening = false;

    @WebSocketServer()
    server: Server | undefined;

    public handleConnection(client: Socket, ...args: any[]) {
        this.clients[client.id] = args;
        console.log(`Client ${client.id} connected (${Object.keys(this.clients).length})`);

        this.listenForEvents();
    }

    handleDisconnect(client: Socket) {
        delete this.clients[client.id];

        console.log(`Client ${client.id} disconnected (${Object.keys(this.clients).length})`);
    }

    public updateStatus(status: IGarageDoorStatus) {
        this.server?.emit(DOOR_STATUS_UPDATES, status);
    }

    private async listenForEvents() {
        if (!this._listening) {
            this._listening = true;
            for await (const event of this.garageDoorService) {
                this._listening = true;
                this.updateStatus(event);
            }
        }
    }
}
