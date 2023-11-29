// src/database/database.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeederService } from './seed.service';
import { Admin, AdminSchema } from '../schemas/admin.schema';

@Module({
    imports: [
        MongooseModule.forRoot('mongodb://localhost/construction_db'),

        MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    ],
    providers: [SeederService],
})
export class SeedModule { }
