
import { Controller, Get, Inject, Session, Req, Res, Post, Redirect, Param, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { google } from "googleapis";
import * as fs from 'fs'




@Controller()
export class AppController {

  constructor(
    private readonly appService: AppService,

  ) { }
  


  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

}






