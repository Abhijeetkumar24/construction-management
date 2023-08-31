import { Injectable, Inject, Get } from '@nestjs/common';
import { RabbitMQService } from './modules/user/rabbitmq.service';


@Injectable()
export class AppService {

  constructor() { }

  getHello() {
    return 'Hello World!';
  }
  
}
