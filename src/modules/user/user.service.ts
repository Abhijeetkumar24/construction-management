import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { BookFlatDto } from './dto/book-flat.dto';
import { Property, PropertyDocument } from '../Admin/schemas/property.schema';
import { Types } from 'mongoose';
import { FlatDocument } from '../Admin/schemas/flat.schema';
import Stripe from 'stripe';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private UserModel: Model<User>,
        @InjectModel(Property.name) private PropertyModel: Model<Property>,

    ) { }

    private readonly stripe = new Stripe(process.env.STRIPE_KEY,{apiVersion: '2023-08-16',});

    async create(createUserDto: CreateUserDto, adminId: string): Promise<User> {
        const { password, ...rest } = createUserDto;
        const hashedPassword = await bcrypt.hash(password, 10);

        const createdUser = new this.UserModel({
            ...rest,
            password: hashedPassword,
            adminId,
            role: 'user',
        });
        return createdUser.save();
    }


    async bookFlat(bookFlatDto: BookFlatDto, userId: string): Promise<any> {
        const { propertyId, flatNumber } = bookFlatDto;

        const property = await this.PropertyModel.findById(propertyId);
        if (!property) {
            throw new NotFoundException('Property Not Found');
        }

        const flat = property.flats.find(flat => flat.flatNumber === flatNumber);
        if (!flat) {
            throw new NotFoundException('Flat Not Found');
        }


        if (flat.bookedBy) {
            throw new NotFoundException('Flat is already booked');
        }

        flat.bookedBy = new Types.ObjectId(userId);
        flat.status = 'Booked';


        await property.save();
        console.log(flat);

        return flat;

    }


    async bookingDetails(propertId: string, flatId: string): Promise<any> {
        const property = await this.PropertyModel.findById(propertId);
        if (!property) {
            throw new NotFoundException('Property not found');
        }

        const flat = property.flats.find((flat: FlatDocument) => flat._id.toString() === flatId);
        if (!flat) {
            throw new NotFoundException('flat not found');
        }

        const booking = {
            status: property.status,
            flat
        }

        return booking;
    }


    async propertyDetails(propertyId: string, userId: string): Promise<any> {

        const property = await this.PropertyModel.findById(propertyId);
        if (!property) {
            throw new NotFoundException('Property Not found');
        }

        const bookedFlats = property.flats.filter(flat => flat.bookedBy && flat.bookedBy.toString() === userId);

        const details = {
            location: property.location,
            type: property.type,
            status: property.status,
            bookedflats: bookedFlats
        }

        return details;
    }




    async paymentIntent(amount: number, currency: string): Promise<any> {

        const paymentIntent = await this.stripe.paymentIntents.create({
            amount,
            currency,
        })

        return paymentIntent;
    }




    async findOne(email: string): Promise<User | undefined> {
        return this.UserModel.findOne({ email: email }).exec();
    }
}
