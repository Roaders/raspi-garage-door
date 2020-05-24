import {
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({ transports: ['websocket'] })
export class DoorStatusGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor() {
        console.log(`DoorStatusGateway`);
    }

    @WebSocketServer()
    server!: Server;

    @SubscribeMessage('msgToServer')
    handleMessage(client: Socket, payload: string): void {
        this.server.emit(`msgToClient from ${client}`, payload);
    }

    afterInit(server: Server) {
        console.log(`INIT: ${server}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    handleConnection(client: Socket, ...args: any[]) {
        console.log(`Client connected: ${client.id} args: ${args}`);
    }
}
