import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { AdminModule } from './modules/Admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SeedModule } from './modules/seeds/seed.module';
import { ChatModule } from './modules/chat/chat.module';


@Module({
  imports: [
    // SeedModule,                                // uncomment when necessary otherwise it seed every time application run
    MongooseModule.forRoot('mongodb://localhost/construction_db'),
    AdminModule,
    AuthModule,
    UserModule,
    ChatModule
  
  ],
  controllers: [AppController],
  
  providers: [AppService],
})
export class AppModule {}
