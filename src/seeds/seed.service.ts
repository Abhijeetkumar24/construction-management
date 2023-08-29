// src/database/database-seeder.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from '../schemas/admin.schema';
import { Role } from '../interfaces/enum';
import * as bcrypt from 'bcrypt'


@Injectable()
export class SeederService implements OnModuleInit {
  constructor(@InjectModel(Admin.name) private readonly AdminModel: Model<Admin>) {}

  async onModuleInit() {
    await this.seedDB();
  }
  
   //await bcrypt.hash(password, 10);
  
  async seedDB() {
    const seedAdmins = [
      {
        username: 'admin4',
        email: 'admin4@gmail.com',
            password: await bcrypt.hash('1234', 10),
            role: [Role.Admin],
          },
          // {
          //   username: 'admin2',
          //   email: 'admin2@gmail.com',
          //   password: '1234',
          //   role: [Role.Admin],
          // },
          // {
          //   username: 'admin3',
          //   email: 'admin3@gmail.com',
          //   password: '1234',
          //   role: [Role.Admin],
          // },
        
    ];

    try {
    
      await this.AdminModel.insertMany(seedAdmins);
      console.log('Database seeded successfully.');
    } catch (err) {
      console.error('Error seeding database:', err);
    }
  }
}
