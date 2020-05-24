import { WebSocketGateway, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class DoorStatusGateway implements OnGatewayInit {
    constructor() {
        console.log(`DoorStatusGateway`);
    }

    @WebSocketServer()
    server: Server | undefined;

    public handleConnection(client: Socket, ...args: any[]): void {
        console.log(`Client connected: ${client.id} ${args}`);
    }

    public afterInit(): void {
        console.log(`Init ${this.server}`);

        setInterval(() => this.server?.emit('newmsg', `test: ${Date.now()}`), 500);
    }
}
