import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IGarageDoorStatus } from '../../../rpi-garage-door/src';
import { DOOR_STATUS_UPDATES } from '../../../shared';

@WebSocketGateway()
export class DoorStatusGateway {
    @WebSocketServer()
    server: Server | undefined;

    public handleConnection(client: Socket, ...args: any[]): void {
        console.log(`Client connected: ${client.id} ${args}`);
    }

    public updateStatus(status: IGarageDoorStatus) {
        this.server?.emit(DOOR_STATUS_UPDATES, status);
    }
}
