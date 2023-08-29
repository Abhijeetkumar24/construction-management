
import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService {
  private readonly queueName = 'pdf-generation';

  constructor() {
    this.setupQueue();
  }

  async setupQueue() {
    const connection = await amqp.connect('amqp://localhost'); 
    const channel = await connection.createChannel();                 // creates a channel for communication
    await channel.assertQueue(this.queueName, { durable: false });     // durable option determines whether the queue will survive server restarts
  }

  async sendMessage(message: string) {
    const connection = await amqp.connect('amqp://localhost'); 
    const channel = await connection.createChannel();
    channel.sendToQueue(this.queueName, Buffer.from(message));
  }

  async consumeMessage(callback: (message: string) => void) {
    const connection = await amqp.connect('amqp://localhost'); 
    const channel = await connection.createChannel();

    await channel.consume(
      this.queueName,
      (message) => {
        if (message !== null) {
          const content = message.content.toString();
          callback(content);
          channel.ack(message);
        }
      },
      { noAck: false }                              //  manually acknowledge each message after processing it
    );
  }
}
