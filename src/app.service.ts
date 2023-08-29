import { Injectable, Inject, Get } from '@nestjs/common';
// import { I18n, I18nContext } from 'nestjs-i18n';
import { Stripe } from 'stripe';
import { ClientProxy } from '@nestjs/microservices';
import { RabbitMQService } from './modules/user/rabbitmq.service';


@Injectable()
export class AppService {

  constructor(
    private readonly rabbitMQService: RabbitMQService,
  ) { }

  getHello() {
    return 'Hello World!';
  }

  
  
}
