
import { Controller, Get, Inject, Session, Req, Res, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { RabbitMQService } from './modules/user/rabbitmq.service';
import { MailerService } from '@nestjs-modules/mailer';


@Controller()
export class AppController {

  constructor(
    private readonly appService: AppService,
    private readonly rabbitMQService: RabbitMQService,

  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @Get()
  // async sendMessage() {
  //   const data = 'Hello, this will become a PDF!';
  //   await this.rabbitMQService.sendMessage(data);
  //   return 'Message sent to RabbitMQ queue';
  // }

  // @Get('consume')
  // async consume(){
  //   await this.rabbitMQService.consumeMessage(
  //     async (message) => {
  //           console.log(`Received message: ${message}`);
  //         }
  //   );

  // }

  
}






