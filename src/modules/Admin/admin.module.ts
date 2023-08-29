import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin, AdminSchema } from '../../schemas/admin.schema';
import { CommandModule } from 'nestjs-command';
// import { AdminSeed } from '../Admin/seeds/admin.seed';
import { Worker, WorkerSchema } from '../../schemas/worker.schema';
import { Property, PropertySchema } from '../../schemas/property.schema';
import { MaterialCost, MaterialCostSchema } from '../../schemas/materialCost.schema';
import { Attendance, AttendanceSchema } from '../../schemas/attendance.schema';
import { Flat, FlatSchema } from '../../schemas/flat.schema';


@Module({
  imports: [MongooseModule.forFeature([                        // forFeature is used to specify which Mongoose models (or schemas) should be registered and made available within a specific module.name: This is the name of the Mongoose model. In this case, Admin.name. The name property is used by Mongoose to associate the model with a specific name in the database.
    { name: Admin.name, schema: AdminSchema },
    { name: Worker.name, schema: WorkerSchema },
    { name: Property.name, schema: PropertySchema },
    { name: MaterialCost.name, schema: MaterialCostSchema},
    { name: Attendance.name, schema: AttendanceSchema},
    { name: Flat.name , schema: FlatSchema},

  ]),CommandModule],

  controllers: [AdminController],
  providers: [AdminService, ],
  exports: [AdminService]
})
export class AdminModule { }