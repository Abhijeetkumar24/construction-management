import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminModule } from 'src/modules/Admin/admin.module';
import { jwtConstants } from './constants';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/modules/user/user.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from '../../schemas/admin.schema';
import { Session, SessionSchema } from '../../schemas/session.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { GoogleStrategy } from './google.strategy';
import { AdminService } from '../Admin/admin.service';



@Module({
  imports: [
    AdminModule,
    UserModule,
    JwtModule.register({            // registering out jwt constants as global
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1hr' },
    }),

    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: Session.name, schema: SessionSchema},
      { name: User.name, schema: UserSchema}
    ]),

    MailerModule.forRootAsync({            // nodeMailer
      useFactory: () => ({
        transport: {
          host: 'smtp.gmail.com',
          auth: {
            
            user: process.env.GMAIL,
            pass: process.env.GMAIL_APP_PASSWORD,

          },
        },
      }),
    }),

    CacheModule.register({ 
      isGlobal: true,
      store: redisStore,
      host: 'localhost',
      port: process.env.REDIS_PORT,
      ttl:3600,
    }),

   
    
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, ],
  exports: [AuthService]
})
export class AuthModule { }
