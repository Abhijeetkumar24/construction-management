
import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMqProducer {
 
  async sendMessage(message: string) {
    const queueName = 'pdf-generation'
    
    const connection = await amqp.connect('amqp://localhost'); 
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: false });     // durable option determines whether the queue will survive server restarts

    channel.sendToQueue(queueName, Buffer.from(message));
  }

}