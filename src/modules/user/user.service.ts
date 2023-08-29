import { Model } from 'mongoose';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { BookFlatDto } from './dto/book-flat.dto';
import { Property, PropertyDocument } from '../../schemas/property.schema';
import { Types } from 'mongoose';
import { FlatDocument } from '../../schemas/flat.schema';
import Stripe from 'stripe';
import { MailerService } from '@nestjs-modules/mailer';
import { I18n, I18nContext } from 'nestjs-i18n';
import { RabbitMQService } from './rabbitmq.service';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        @InjectModel(Property.name) private PropertyModel: Model<Property>,
        private readonly mailerService: MailerService,
        private readonly rabbitMQService: RabbitMQService,

    ) { }

    private readonly stripe = new Stripe(process.env.STRIPE_KEY, { apiVersion: '2023-08-16', });



    async create(createUserDto: CreateUserDto): Promise<User> {
        const { password, ...rest } = createUserDto;
        const hashedPassword = await bcrypt.hash(password, 10);

        const createdUser = new this.UserModel({
            ...rest,
            password: hashedPassword,
            role: 'user',
        });
        return createdUser.save();
    }


  
    async bookFlat(i18n: I18nContext, bookFlatDto: BookFlatDto, user: any): Promise<any> {
        const { propertyId, flatNumber } = bookFlatDto;
        const userId = user.sub;
        const email = user.email;
        const name = (await this.UserModel.findById(userId)).name;

        const property = await this.getPropertyById(propertyId, i18n);
        const flat = this.getFlatByNumber(property, flatNumber, i18n);

        this.checkPropertyAndFlat(property, flat, userId, i18n);

        this.bookFlatAndUpdateProperty(flat, userId, property);

        const data = await this.generateConfirmationMessage(name, flatNumber, propertyId);

        const queueData = await this.sendAndConsume(data);
        await this.createAndSendPDF(queueData, email);

        return ; 
    }

    private async getPropertyById(propertyId: string, i18n: I18nContext) {
        const property = await this.PropertyModel.findById(propertyId);
        if (!property) {
            throw new NotFoundException(i18n.t('test.property.propertyNotFound'));
        }
        return property;
    }

    private getFlatByNumber(property: any, flatNumber: string, i18n: I18nContext) {
        const flat = property.flats.find((flat) => flat.flatNumber === flatNumber);
        if (!flat) {
            throw new NotFoundException(i18n.t('test.flat.flatNotFound'));
        }
        return flat;
    }

    private checkPropertyAndFlat(property: any, flat: any, userId: string, i18n: I18nContext) {
        if (flat.bookedBy) {
            throw new NotFoundException(i18n.t('test.flat.flatAlreadyBooked'));
        }

        const userBookedFlatsCount = property.flats.reduce((count, flat) => {
            if (flat.bookedBy && flat.bookedBy.toString() === userId) {
                count++;
            }
            return count;
        }, 0);

        if (userBookedFlatsCount >= 3) {
            throw new BadRequestException(i18n.t('test.flat.flatMaxBookingLimitReached'));
        }
    }

    private async bookFlatAndUpdateProperty(flat: any, userId: string, property: any) {
        flat.bookedBy = new Types.ObjectId(userId);
        flat.status = 'Booked';
        await property.save();
    }

    private async generateConfirmationMessage(name: string, flatNumber: string, propertyId: string) {
        const property = await this.PropertyModel.findById(propertyId);
        const location = property.location;
        const specifications = property.specifications
        const date = new Date()

        return `Dear ${name},\n\nWe are delighted to inform you that your flat booking has been successfully confirmed. Congratulations on your new home!\n\n
        Booking Details:\n
        - Flat Number: ${flatNumber}\n
        - Property Id: ${propertyId}\n
        - Location: ${location}\n
        - Specifications: ${specifications}\n
        - Booking Date: ${date}\n
    Thank you,\n
    Abhijeet Groups of Industries`;
    }

    private async sendAndConsume(data: string) {
        let receivedMessage;

        await this.rabbitMQService.sendMessage(data);
        console.log("message sent to queue");

        await this.rabbitMQService.consumeMessage(async (message) => {
            console.log(`received message: ${message}`);
            receivedMessage = message;
        });


        return receivedMessage;
    }

    private async createAndSendPDF(data: string, email: string) {
        const pdfDoc = new PDFDocument();
        const pdfFileName = 'message.pdf';
        const pdfStream = fs.createWriteStream(pdfFileName);
        pdfDoc.pipe(pdfStream);
        pdfDoc.font('Helvetica-Bold').fontSize(18).fillColor('blue');
        pdfDoc.text('Flat Booking Confirmation', { align: 'center' });
        pdfDoc.moveDown(1);
        pdfDoc.fontSize(12).fillColor('black');
        pdfDoc.text(data);
        pdfDoc.end();

        pdfStream.on('error', (error) => {
            console.error('Error creating PDF:', error);
        });

        pdfStream.on('finish', async () => {
            console.log(`PDF created: ${pdfFileName}`);

            const mailOptions = {
                to: email,
                subject: 'Flat Booking Confirmation\n\n',
                text: 'Dear Customer,\n\nAttached is the PDF report confirming your flat booking. Congratulations on your new home!\n\nBest regards,\nAbhijeet Groups of Industries.',
                attachments: [
                    {
                        filename: pdfFileName,
                        path: pdfFileName,
                    },
                ],
            };

            try {
                await this.mailerService.sendMail(mailOptions);
                await this.deletePDF(pdfFileName);
            } catch (error) {
                console.error('Error sending email:', error);
                throw error;
            }
        });
    }

    private async deletePDF(pdfFileName: string) {
        fs.unlink(pdfFileName, (unlinkError) => {
            if (unlinkError) {
                console.error('Error deleting PDF:', unlinkError);
                throw unlinkError;
            }
        });
    }



    async bookingDetails(i18n: I18nContext, propertId: string, flatId: string): Promise<any> {
        const property = await this.PropertyModel.findById(propertId);
        if (!property) {
            throw new NotFoundException(i18n.t('test.property.propertyNotFound'));
        }

        const flat = property.flats.find((flat: FlatDocument) => flat._id.toString() === flatId);
        if (!flat) {
            throw new NotFoundException(i18n.t('test.flat.flatNotFound'));
        }

        const booking = {
            status: property.status,
            flat
        }

        return booking;
    }


    async propertyDetails(i18n: I18nContext, propertyId: string, userId: string): Promise<any> {

        const property = await this.PropertyModel.findById(propertyId);
        if (!property) {
            throw new NotFoundException(i18n.t('test.property.propertyNotFound'));
        }

        // const bookedFlats = property.flats.filter(flat => flat.bookedBy && flat.bookedBy.toString() === userId);
        const bookedFlats = property.flats.filter(flat => flat.bookedBy);
        const availableFlats = property.flats.filter(flat => flat.bookedBy == null);


        const details = {
            location: property.location,
            type: property.type,
            status: property.status,
            bookedflats: bookedFlats,
            availableFlats: availableFlats
        }

        return details;
    }




    async payment(email: string, propertyId: string, price: number, currency: string) {
        const existingUser = await this.UserModel.findOne({ email });

        if (!existingUser.stripeId) {
            existingUser.stripeId = await this.createCustomer(email, existingUser.name);
            await existingUser.save();
        }

        const existingProperty = await this.PropertyModel.findById(propertyId);

        if (!existingProperty) {
            throw new NotFoundException('Property not found');
        }

        if (!existingProperty.stripeId) {
            existingProperty.stripeId = await this.createProductAndPrice(existingProperty.location, existingProperty.specifications, price, currency);

            await existingProperty.save();
        }

        const session = await this.createSession(existingUser.stripeId, existingProperty.stripeId);
        return session;
    }


    async createCustomer(email: string, name: string) {
        const customer = await this.stripe.customers.create({
            name,
            email
        });
        return customer.id;
    }



    async createProductAndPrice(location: string, specifications: string, price: number, currency: string) {
        const product = await this.stripe.products.create({
            name: location,
            description: specifications,
        });

        const priceObject = await this.stripe.prices.create({
            unit_amount: price * 100, // Convert price to paisa
            currency,
            product: product.id,
        });

        return priceObject.id;
    }


    async createSession(customerId: string, priceId: string) {
        const session = await this.stripe.checkout.sessions.create({
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'payment',
            payment_intent_data: {
                setup_future_usage: 'on_session',
            },
            customer: customerId,
            success_url: 'http://localhost:3000/user/pay/success/checkout/session?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:3000/user/pay/failed/checkout/session',
        });

        return session;
    }






    async paymentSuccess(res) {
        console.log(res);
    }




    async findOne(email: string): Promise<User | undefined> {
        return this.UserModel.findOne({ email: email }).exec();
    }
}
