import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';


async function bootstrap() {                //  bootstrap() function is used to initialize and start the Nest application
  dotenv.config();
  const app = await NestFactory.create(AppModule);         // purpose of NestFactory is to create an instance of a Nest application


  const config = new DocumentBuilder()                      // swagger
    .setTitle('Construction Management')
    .setDescription('Construction Management APIs')
    .setVersion('1.0')
    .addTag('APIs')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  


  await app.listen(process.env.PORT);
}
bootstrap();
