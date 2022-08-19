import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { MessageDto } from './dto/message.dto';
import { MessagesService } from './messages.service';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({cors: true})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() private wss: Server;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token)
      await this.messagesService.registerClient(client, payload.id)
      this.wss.emit('clients-updated', this.messagesService.getConnectedClients())
    } catch (error) {
      client.disconnect();
      return;
    }
  }

  handleDisconnect(client: Socket) {
    this.messagesService.removeClient(client.id)
    this.wss.emit('clients-updated', this.messagesService.getConnectedClients())
  }

  @SubscribeMessage('message-from-client')
  onMessage(client: Socket, payload: MessageDto) {
    //al cliente que envio
    //client.emit('message-from-server', payload)
    //a todos los demas
    //client.broadcast.emit('message-from-server', payload)
    this.wss.emit('message-from-server', {
      fullName: this.messagesService.getUserBySocketId(client.id).fullName,
      message: payload.message || 'no message'
    })
  }

}
