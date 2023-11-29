

import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMqConsumer {
    async consumeMessage(): Promise<string> {
        const queueName = 'pdf-generation';
        let consumeData: string ;

        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        await channel.assertQueue(queueName, { durable: false });

        const message = await new Promise<string>((resolve) => {
            channel.consume(
                queueName,
                (message) => {
                    if (message !== null) {
                        const content = message.content.toString();
                        consumeData = content;
                        channel.ack(message);
                        resolve(consumeData);
                    }
                },
                { noAck: false }
            );
        });

        await channel.close();
        await connection.close();

        return message;
    }
}
