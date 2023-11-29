import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WinstonModule } from 'nest-winston';
import { transports, format } from 'winston';
import 'winston-daily-rotate-file';




async function bootstrap() {                                              //  bootstrap() function is used to initialize and start the Nest application
  dotenv.config();
  const app = await NestFactory.create(AppModule, {                      // purpose of NestFactory is to create an instance of a Nest application
    logger: WinstonModule.createLogger({                                 // Wingston logger
      level: 'debug',                                                    // we comment out this line then debug and verbose don't work
      transports: [                                                      // Transports determine where log messages are stored or output
        
        new transports.DailyRotateFile({                                 // This transport logs error messages to daily rotating log files. 
          // %DATE will be replaced by the current date
          filename: `logs/%DATE%-error.log`,
          level: 'error',
          format: format.combine(format.timestamp(), format.json()),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,                                          // don't want to zip our logs
          maxFiles: '30d',                                              // will keep log until they are older than 30 days
        }),

        new transports.DailyRotateFile({                                  // This transport logs messages of all levels (info, warn, error, etc.) 
          filename: `logs/%DATE%-combined.log`,
          format: format.combine(format.timestamp(), format.json()),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxFiles: '30d',
        }),
        new transports.Console({                                          // This transport logs all levels of messages to the console
          format: format.combine(
            format.cli(),
            format.splat(),                                               // format.splat() in formatting pipeline, Winston will process log messages to replace placeholders with their values.
            format.timestamp(),
            format.printf((info) => {
              return `${info.timestamp} ${info.level}: ${info.message}`;
            }),
          ),
        }),  
      ],
    }),
  });


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
