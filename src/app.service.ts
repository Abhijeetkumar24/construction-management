import { Injectable, Inject, Get } from '@nestjs/common';



@Injectable()
export class AppService {

  constructor() { }

  getHello() {
    return 'Hello World!';
  }
  
}
