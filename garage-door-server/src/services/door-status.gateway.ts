import { WebSocketGateway, ConnectedSocket, OnGatewayInit, OnGatewayConnection } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class DoorStatusGateway implements OnGatewayInit, OnGatewayConnection {
    constructor() {
        console.log(`DoorStatusGateway`);
    }

    afterInit(@ConnectedSocket() client: Socket) {
        setInterval(() => {
            const now = Date.now();
            console.log(`Emitting... (${now})`);
            client.emit(`Time is ${now}`);
        }, 2500);
    }

    handleConnection() {
        console.log(`Gateway connection`);
    }
}
