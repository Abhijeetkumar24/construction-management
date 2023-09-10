import { ChatsService } from './chat.service';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageDto } from './dto/message.dto';


@WebSocketGateway()                                              //  This decorator marks the class as a WebSocket gateway. 
export class ChatGateway implements OnGatewayConnection {
    constructor(private chatsService: ChatsService) {}
    @WebSocketServer()                                            //  This decorator creates a WebSocket server instance and assigns it to the server property of the class
    server: Server;


    async handleConnection(socket: Socket) {                       // This method is called when a new WebSocket connection is established
        await this.chatsService.getUserFromSocket(socket)
    }
   
    @SubscribeMessage('send_message')                               //  This decorator is used  to specify that this method should be triggered when a WebSocket client sends a message with the event name 'send_message'
    async listenForMessages(@MessageBody() message: MessageDto, @ConnectedSocket() socket: Socket) {
         
        const user = await this.chatsService.getUserFromSocket(socket)           // send message wala user
        const newmessage = await this.chatsService.createMessage(message, user['id'])        // new message in db
        this.server.sockets.emit('receive_message', newmessage);                          // emits a WebSocket message with the event name 'receive_message' to all connected WebSocket clients

        return newmessage
    }

    @SubscribeMessage('get_all_messages')
    async getAllMessages(@ConnectedSocket() socket: Socket) {

        await this.chatsService.getUserFromSocket(socket)
        const messages = await this.chatsService.getAllMessages()

        this.server.sockets.emit('receive_message', messages);

        return messages
    }


}


// in postman create socket connection using the token and send_message event and create another new connection with token and receive_message event and enable listen , send message in json { "message": "hii" }

