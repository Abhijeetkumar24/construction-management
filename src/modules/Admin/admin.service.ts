import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from './schemas/admin.schema';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';
import { CreateWorkerDto } from './dto/create-worker-dto';
import { Worker } from './schemas/worker.schema';
import { Request } from 'express';
import { Property } from './schemas/property.schema';
import { CreatePropertyDto } from './dto/create-property.dto';
import { HireWorkerDto } from './dto/hire-worker.dto';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { MaterialCostDto } from './dto/material-cost.dto';
import { MaterialCost } from './schemas/materialCost.schema';
import { AddAttendanceDto } from './dto/add-attendance.dto';
import { Attendance } from './schemas/attendance.schema';
import { AddFlatDto } from './dto/add-flat.dto';
import { Flat } from './schemas/flat.schema';
import axios from 'axios';




@Injectable()
export class AdminService {


    private readonly drive;

    constructor(@InjectModel(Admin.name) private AdminModel: Model<Admin>,      //This constructor is used for dependency injection. It injects the Mongoose model associated with the Admin entity into the AdminService class. The @InjectModel(Admin.name) decorator specifies that the injected model is associated with the Admin entity. The private AdminModel: Model<Admin> parameter defines a private property named AdminModel of type Model<Admin>, which represents the Mongoose model for the Admin entity.
        @InjectModel(Worker.name) private WorkerModel: Model<Worker>,
        @InjectModel(Property.name) private PropertyModel: Model<Property>,
        @InjectModel(MaterialCost.name) private MaterialCostModel: Model<MaterialCost>,
        @InjectModel(Attendance.name) private AttendanceModel: Model<Attendance>,
        @InjectModel(Flat.name) private FlatModel: Model<Flat>,


    ) { }


    private readonly weatherKey = process.env.OPEN_WEATHER_KEY;


    async create(createAdminDto: CreateAdminDto): Promise<Admin> {      
        const { password, ...rest } = createAdminDto;
        const hashedPassword = await bcrypt.hash(password, 10);

        const createdAdmin = new this.AdminModel({
            ...rest,
            role: 'admin',
            password: hashedPassword,
        });
        return createdAdmin.save();
    }

    async addWorker(createWorkerDto: CreateWorkerDto, adminId: string): Promise<Worker> {
        const { name, email, availability, skills } = createWorkerDto;

        const createWorker = new this.WorkerModel({
            adminId,
            name,
            email,
            availability,
            skills,

        });

        return createWorker.save();
    }


    async addProperty(createPropertyDto: CreatePropertyDto, adminId: string): Promise<Property> {
        const { location, type, specifications, status, workers, flats, materialCost } = createPropertyDto;

        const createProperty = new this.PropertyModel({
            adminId,
            location,
            type,
            specifications,
            status,
            workers,
            flats,
            materialCost

        });

        return createProperty.save();
    };

    async activeConstructions(adminId: string): Promise<Property[]> {
        return this.PropertyModel.find({ adminId, status: 'under-construction' }).exec();
    }


    async hireWorker(propertyId: string, hireWorkerDto: HireWorkerDto, adminId: string): Promise<any> {
        const property = await this.PropertyModel.findOne({ _id: propertyId, adminId });
        if (!property) {
            throw new NotFoundException('Property not found');
        }
        const workerId = hireWorkerDto.workerId;

        const worker = await this.WorkerModel.findOne({ _id: workerId, adminId })
        if (!worker) {
            throw new NotFoundException('Worker not found');
        }

        if (worker.availability !== 'yes') {
            throw new HttpException('Worker is not available', HttpStatus.BAD_REQUEST);
        }

        for (const skill of hireWorkerDto.skills) {
            if (!worker.skills.includes(skill)) {
                throw new HttpException('Skills not found', HttpStatus.BAD_REQUEST);
            }
        }

        property.workers.push(worker._id);
        await property.save();

        worker.availability = 'no';
        await worker.save();

        return property;

    }


    async workerList(propertyId: string): Promise<any> {
        const property = await this.PropertyModel.findOne({ _id: propertyId });
        if (!property) {
            throw new NotFoundException('Property not found');
        }
        return property.workers;
    }

    async addMaterialCost(propertyId: string, materailCostDto: MaterialCostDto): Promise<any> {
        const property = await this.PropertyModel.findById(propertyId);
        if (!property) {
            throw new NotFoundException('Property Not Found');
        }

        const materialExpense = new this.MaterialCostModel(materailCostDto);

        property.materialCost.push(materialExpense);
        await property.save();

        return property.materialCost;
    }


    async getAllProperty(adminId: string): Promise<Property[]> {
        return this.PropertyModel.find({ adminId });
    }

    async propertyDetails(propertyId: string, adminId: string): Promise<Property[]> {
        return this.PropertyModel.find({ _id: propertyId, adminId, });
    }


    async addFlat(addFlatDto: AddFlatDto, propertyId: string): Promise<any> {
        
        const property = await this.PropertyModel.findById(propertyId);
        if (!property) {
            throw new NotFoundException('property not found');
        }

        const newFlat = new this.FlatModel(addFlatDto);

        property.flats.push(newFlat);
        await property.save();

        return property.flats;

    }


    async addAttendance(addAttendanceDto: AddAttendanceDto, workerId: string, adminId: string): Promise<any> {
        const { propertyId, date, status } = addAttendanceDto;
        const addAttendance = new this.AttendanceModel({
            adminId,
            workerId,
            propertyId,
            date,
            status

        })
        return addAttendance.save();

    }

    async findAttendance(propertyId: string, date: string): Promise<any> {
        const attendance = await this.AttendanceModel.find({ propertyId, status: 'present', date });
        if (!attendance) {
            throw new NotFoundException(' Attendace not found');
        }

        const workerIds = attendance.map(doc => doc.workerId);       // beacuse find method return array of result
        return workerIds;
    }


    async getWeather(city: String): Promise<any> {
        try {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.weatherKey}`)
            const weatherData = {
                temperature: response.data.main.temp - 273,
                weatherCondition: response.data.weather[0].description,
                humidity: response.data.main.humidity,
                wind: response.data.wind.speed,
            };
            let message: string;
            if (response.data.weather[0].description != 'rainny') {
                message = 'Conditon good for construction';
            }
            else {
                message = 'Bad condition for construction';
            }
            return {
                message,
                weatherData
            };
        }
        catch (error) {
            throw new Error(`Error fetching weather data: ${error.message}`);

        }
    }



    async findOne(email: string): Promise<Admin | undefined> {
        return this.AdminModel.findOne({ email: email }).exec();
    }


    async findAll(): Promise<Admin[]> {
        return this.AdminModel.find().exec();
    }
}
