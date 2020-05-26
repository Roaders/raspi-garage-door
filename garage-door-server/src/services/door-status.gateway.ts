import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IGarageDoorStatus, GarageDoorService } from '../../../rpi-garage-door/src';
import { DOOR_STATUS_UPDATES } from '../../../shared';
import { AuthService } from '../auth/';

@WebSocketGateway()
export class DoorStatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private garageDoorService: GarageDoorService, private authService: AuthService) {}

    private clients: { [key: string]: string } = {};
    private _listening = false;

    @WebSocketServer()
    server: Server | undefined;

    public handleConnection(socket: Socket) {
        const tokenValid = this.authService.validateToken(socket.handshake.query.token);

        if (tokenValid == null) {
            socket.disconnect();
        }

        this.clients[socket.id] = socket.id;
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
            for await (const event of this.garageDoorService.events) {
                this._listening = true;
                this.updateStatus(event);
            }
        }
    }
}
