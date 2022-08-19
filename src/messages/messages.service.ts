import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';

interface ConnectedClients {
    [id: string]: {
        socket: Socket
        user: User
    }
}

@Injectable()
export class MessagesService {

    private connectedClients: ConnectedClients = {}

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async registerClient(client: Socket, userId: string){
        const user = await this.userRepository.findOneBy({id: userId});
        if(!user || !user.isActive) throw new Error('User not found/is not active');
        this.checkUserConnection(user);
        this.connectedClients[client.id] = {
            socket: client,
            user
        }
    }

    removeClient(clientId: string){
        delete this.connectedClients[clientId];
    }

    getConnectedClients() {
        return Object.keys(this.connectedClients);
    }

    getUserBySocketId(socketId: string) {
        return this.connectedClients[socketId].user;
    }

    private checkUserConnection(user: User){
        Object.keys(this.connectedClients).forEach(socketId => {
            if(this.connectedClients[socketId].user.id === user.id){
                this.connectedClients[socketId].socket.disconnect()
            }
        })
    }

}
