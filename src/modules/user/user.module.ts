import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from '../../schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Property, PropertySchema } from '../../schemas/property.schema';
import { CacheModule } from '@nestjs/cache-manager';
import { RabbitMqProducer } from './rabbitmq.producer.service';
import { RabbitMqConsumer } from './rabbitmq.consumer.service';
import { Admin, AdminSchema } from 'src/schemas/admin.schema';
import { AdminModule } from '../Admin/admin.module';
import { Payment, PaymentSchema } from 'src/schemas/payment.schema';



@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Property.name, schema: PropertySchema },
      { name: Admin.name, schema: AdminSchema },
      { name: Payment.name, schema: PaymentSchema}

    ]),
    AdminModule
  ],
  controllers: [UserController],
  providers: [UserService, RabbitMqProducer, RabbitMqConsumer],
  exports: [UserService]
})
export class UserModule { }
