import { Model } from 'mongoose';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from '../../schemas/admin.schema';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';
import { CreateWorkerDto } from './dto/create-worker-dto';
import { Worker } from '../../schemas/worker.schema';
import { Request } from 'express';
import { Property } from '../../schemas/property.schema';
import { CreatePropertyDto } from './dto/create-property.dto';
import { HireWorkerDto } from './dto/hire-worker.dto';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { MaterialCostDto } from './dto/material-cost.dto';
import { MaterialCost } from '../../schemas/materialCost.schema';
import { AddAttendanceDto } from './dto/add-attendance.dto';
import { Attendance } from '../../schemas/attendance.schema';
import { AddFlatDto } from './dto/add-flat.dto';
import { Flat } from '../../schemas/flat.schema';
import axios from 'axios';
import { MailerService } from '@nestjs-modules/mailer';
import { I18nContext } from 'nestjs-i18n';
import { Readable } from 'stream';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { UpdateAdminDto } from '../auth/dto/update.admin.dto';
import { google } from 'googleapis'
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class AdminService {

    private readonly logger = new Logger('AdminService');

    private readonly CLIENT_ID = process.env.DRIVE_CLIENT_ID;
    private readonly CLIENT_SECRET = process.env.DRIVE_CLIENT_SECRET;
    private readonly REDIRECT_URI = process.env.DRIVE_REDIRECT_URI;
    private readonly REFRESH_TOKEN = process.env.DRIVE_REFRESH_TOKEN;


    private readonly oauth2Client = new google.auth.OAuth2(
        this.CLIENT_ID,
        this.CLIENT_SECRET,
        this.REDIRECT_URI,
    );



    constructor(@InjectModel(Admin.name) private AdminModel: Model<Admin>,      //This constructor is used for dependency injection. It injects the Mongoose model associated with the Admin entity into the AdminService class. The @InjectModel(Admin.name) decorator specifies that the injected model is associated with the Admin entity. The private AdminModel: Model<Admin> parameter defines a private property named AdminModel of type Model<Admin>, which represents the Mongoose model for the Admin entity.
        @InjectModel(Worker.name) private WorkerModel: Model<Worker>,
        @InjectModel(Property.name) private PropertyModel: Model<Property>,
        @InjectModel(MaterialCost.name) private MaterialCostModel: Model<MaterialCost>,
        @InjectModel(Attendance.name) private AttendanceModel: Model<Attendance>,
        @InjectModel(Flat.name) private FlatModel: Model<Flat>,
        private readonly mailerService: MailerService,

    ) {
        this.oauth2Client.setCredentials({ refresh_token: this.REFRESH_TOKEN });
    }


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


    async updateAdmin(updateAdminDto: UpdateAdminDto, adminId: string): Promise<Admin> {
        const { name, username, email } = updateAdminDto;

        const updateAdmin = await this.AdminModel.findByIdAndUpdate(
            adminId,
            {
                name,
                username,
                email
            },
            { new: true }
        );

        return updateAdmin.save();
    }


    async addWorker(createWorkerDto: CreateWorkerDto, adminId: string, i18n: I18nContext): Promise<Worker> {
        const { name, email, availability, skills } = createWorkerDto;

        const existingWorker = await this.WorkerModel.findOne({ email });
        if (existingWorker) {
            throw new ConflictException(i18n.t('test.WorkerWithEmailExists'));
        }

        const createWorker = new this.WorkerModel({
            adminId,
            name,
            email,
            availability,
            skills,

        });

        return createWorker.save();
    }


    async addProperty(createPropertyDto: CreatePropertyDto, adminId: string, i18n: I18nContext): Promise<Property> {
        const { location, type, specifications, status, workers, flats, materialCost } = createPropertyDto;

        const existingProperty = await this.PropertyModel.findOne({ specifications });
        if (existingProperty) {
            throw new ConflictException(i18n.t('test.PropertyAlreadyExists'));
        }

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


    async updateProperty(updatePropertyDto: UpdatePropertyDto, propertyId: string, i18n: I18nContext): Promise<Property> {
        const { location, type, specifications, status, workers, flats, materialCost } = updatePropertyDto;

        const property = await this.PropertyModel.findOne({ _id: propertyId });
        if (!property) {
            throw new NotFoundException(i18n.t('test.PropertyNotFound'));
        }

        const updatedProperty = await this.PropertyModel.findByIdAndUpdate(
            propertyId,
            {
                location,
                type,
                specifications,
                status,
                workers,
                flats,
                materialCost
            },
            { new: true }
        );

        return updatedProperty.save();
    };



    async activeConstructions(adminId: string, i18n: I18nContext): Promise<Property[]> {
        return this.PropertyModel.find({ adminId, status: 'under-construction' }).exec();
    }



    async hireWorker(propertyId: string, hireWorkerDto: HireWorkerDto, adminId: string, i18n: I18nContext): Promise<any> {
        const property = await this.PropertyModel.findOne({ _id: propertyId, adminId });
        if (!property) {
            throw new HttpException(i18n.t('test.PropertyNotFound'), HttpStatus.NOT_FOUND);

        }
        const workerId = hireWorkerDto.workerId;

        const worker = await this.WorkerModel.findOne({ _id: workerId, adminId })
        if (!worker) {
            throw new HttpException(i18n.t('test.WorkerNotFound'), HttpStatus.NOT_FOUND);

        }

        if (worker.availability !== 'yes') {
            throw new HttpException(i18n.t('test.WorkerNotAvailable'), HttpStatus.BAD_REQUEST);
        }

        for (const skill of hireWorkerDto.skills) {
            if (!worker.skills.includes(skill)) {
                throw new HttpException(i18n.t('test.SkillsNotFound'), HttpStatus.BAD_REQUEST);
            }
        }

        property.workers.push(worker._id);
        await property.save();

        worker.availability = 'no';
        await worker.save();

        return property;

    }



    async workerList(propertyId: string, i18n: I18nContext): Promise<any> {
        const property = await this.PropertyModel.findOne({ _id: propertyId });
        if (!property) {
            throw new NotFoundException(i18n.t('test.PropertyNotFound'));
        }
        return property.workers;
    }

    async addMaterialCost(propertyId: string, materailCostDto: MaterialCostDto, i18n: I18nContext): Promise<any> {
        const property = await this.PropertyModel.findById(propertyId);
        if (!property) {
            throw new NotFoundException(i18n.t('test.PropertyNotFound'));
        }

        const materialExpense = new this.MaterialCostModel(materailCostDto);

        property.materialCost.push(materialExpense);
        await property.save();

        const totalMaterialCost = property.materialCost.reduce((total, expense) => total + expense.cost, 0);


        return {
            AllMaterial: property.materialCost,
            TotalCost: totalMaterialCost
        };
    }


    async getAllProperty(adminId: string, i18n: I18nContext): Promise<Property[]> {
        return this.PropertyModel.find({ adminId });
    }


    async propertyDetails(propertyId: string, adminId: string, i18n: I18nContext): Promise<any> {

        const property = await this.PropertyModel.findById(propertyId);
        if (!property) {
            throw new NotFoundException(i18n.t('test.PropertyNotFound'));
        }

        const totalMaterialCost = property.materialCost.reduce((total, expense) => total + expense.cost, 0);

        return {
            location: property.location,
            type: property.type,
            specificaton: property.specifications,
            status: property.status,
            workers: property.workers,
            flats: property.flats,
            expenses: property.materialCost,
            totalCost: totalMaterialCost
        }


    }


    async addFlat(addFlatDto: AddFlatDto, propertyId: string, i18n: I18nContext): Promise<any> {

        const property = await this.PropertyModel.findById(propertyId);
        if (!property) {
            throw new NotFoundException(i18n.t('test.PropertyNotFound'));
        }

        const newFlat = new this.FlatModel(addFlatDto);

        property.flats.push(newFlat);
        await property.save();

        return property.flats;

    }


    async addAttendance(addAttendanceDto: AddAttendanceDto, workerId: string, adminId: string, i18n: I18nContext): Promise<any> {
        const { propertyId, date, status } = addAttendanceDto;

        const property = await this.PropertyModel.findById(propertyId);
        if (!property) {
            throw new NotFoundException(i18n.t('test.PropertyNotFound'));
        }


        const existingAttendance = await this.AttendanceModel.findOne({ workerId, date });
        if (existingAttendance) {
            throw new ConflictException(i18n.t('test.AttendanceAlreadyExists'));
        }

        const addAttendance = new this.AttendanceModel({
            adminId,
            workerId,
            propertyId,
            date,
            status

        })
        addAttendance.save();
        return { date, status }

    }



    async findAttendance(propertyId: string, date: string, i18n: I18nContext): Promise<any> {
        const attendance = await this.AttendanceModel.find({ propertyId, status: 'present', date });

        if (!attendance || attendance.length === 0) {
            throw new NotFoundException(i18n.t('test.AttendaceNotFound'));
        }

        const workerIds = attendance.map(doc => doc.workerId);       // beacuse find method return array of result
        return workerIds;
    }


    async getWeather(city: String, i18n: I18nContext): Promise<any> {
        try {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.weatherKey}`)
            const weatherData = {
                temperature: (response.data.main.temp - 273).toFixed(2),
                weatherCondition: response.data.weather[0].description,
                humidity: response.data.main.humidity,
                wind: response.data.wind.speed,
            };

            let message: string;
            if (response.data.weather[0].description.toLowerCase().includes('rain')) {

                const emails = await this.WorkerModel.distinct('email');    // get all distinct emails

                let subject = i18n.t('test.WorkSiteClosureNotification');
                let text = i18n.t('test.EmailText');

                for (const email of emails) {
                    const mailOptions = {
                        to: email,
                        subject: subject,
                        text: text,
                    };

                    await this.mailerService.sendMail(mailOptions);
                }


                message = i18n.t('test.BadConditionForConstruction');

            } else {
                message = i18n.t('test.ConditionGoodForConstruction');
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


    async uploadFile(qrCodeFileName: any, mimeTypeVar: string): Promise<any> {
        try {
            const drive = google.drive({
                version: 'v3',
                auth: this.oauth2Client,
            });

            const filePath = `/home/user/Desktop/daily-work/construction-management/${qrCodeFileName}`;

            console.log(filePath);

            const response = await drive.files.create({
                requestBody: {
                    name: qrCodeFileName, 
                    mimeType: mimeTypeVar,
                },
                media: {
                    mimeType: mimeTypeVar,
                    body: fs.createReadStream(filePath),
                },
            });
            console.log("hii")

            return response.data;
        } catch (error) {
            throw new Error(error.message);
        }
    }


    async generatePublicUrl(fileId: string): Promise<any> {
        try {

            const drive = google.drive({
                version: 'v3',
                auth: this.oauth2Client,
            });


            await drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });

            const result = await drive.files.get({
                fileId: fileId,
                fields: 'webViewLink, webContentLink',
            });
            return result.data;


        } catch (error) {
            throw new Error(error.message);
        }
    }




    async findOne(email: string): Promise<Admin | undefined> {
        return this.AdminModel.findOne({ email: email }).exec();
    }


    async findAll(): Promise<Admin[]> {
        return this.AdminModel.find().exec();
    }
}
