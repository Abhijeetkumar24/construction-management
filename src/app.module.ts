import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { AdminModule } from './modules/Admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SeedModule } from './seeds/seed.module';
import { ChatModule } from './modules/chat/chat.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMqProducer } from './modules/user/rabbitmq.producer.service';
import { RequestLoggerMiddleware } from './middlewares/request-logger.middleware';



@Module({
  imports: [
    // SeedModule,                                // uncomment when necessary otherwise it seed every time application run
    MongooseModule.forRoot('mongodb://localhost/construction_db'),
    AdminModule,
    AuthModule,
    UserModule,
    ChatModule,

    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),

  ],


  controllers: [AppController],

  providers: [AppService, RabbitMqProducer,],
})

export class AppModule {
  //  add a middleware on all routes
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
