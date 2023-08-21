// src/database/database-seeder.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from '../Admin/schemas/admin.schema';
import { Role } from '../auth/enums/role.enum';


@Injectable()
export class SeederService implements OnModuleInit {
  constructor(@InjectModel(Admin.name) private readonly AdminModel: Model<Admin>) {}

  async onModuleInit() {
    await this.seedDB();
  }

  async seedDB() {
    const seedAdmins = [
        {
            username: 'admin1',
            email: 'admin1@gmail.com',
            password: '1234',
            role: [Role.Admin],
          },
          {
            username: 'admin2',
            email: 'admin2@gmail.com',
            password: '1234',
            role: [Role.Admin],
          },
          {
            username: 'admin3',
            email: 'admin3@gmail.com',
            password: '1234',
            role: [Role.Admin],
          },
        
    ];

    try {
    
      await this.AdminModel.insertMany(seedAdmins);
      console.log('Database seeded successfully.');
    } catch (err) {
      console.error('Error seeding database:', err);
    }
  }
}
