import { Inject, Injectable, NotFoundException, UnauthorizedException, Req, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from 'src/modules/Admin/admin.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminDocument } from 'src/schemas/admin.schema';
import { UserService } from 'src/modules/user/user.service';
import { User, UserDocument } from 'src/schemas/user.schema';
import { CreateAdminDto } from '../Admin/dto/create-admin.dto';
import { Admin } from 'src/schemas/admin.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ResetPasswordDto } from './dto/reset.password.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from '../../schemas/session.schema';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { Verify2faDto } from './dto/verify2fa.dto';
import { TwoFaDto } from './dto/two.fa.dto';
import { jwtConstants } from './constants';
import { UpdateAdminDto } from './dto/update.admin.dto';

@Injectable()
export class AuthService {

    private readonly logger = new Logger('AuthService');
    
    constructor(
        @InjectModel(Admin.name) private AdminModel: Model<Admin>,
        @InjectModel(Session.name) private SessionModel: Model<Session>,
        @InjectModel(User.name) private UserModel: Model<User>,
        private adminService: AdminService,
        private jwtService: JwtService,
        private userService: UserService,
        private readonly mailerService: MailerService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,


    ) { }


    async adminSignup(createAdminDto: CreateAdminDto): Promise<Admin> {

        const existingAdmin = await this.AdminModel.findOne({ email: createAdminDto.email })
        if (existingAdmin) {
            throw new ConflictException('An admin with same email address already exists');
        }

        const result = await this.adminService.create(createAdminDto);
        if (!result) {
            throw new NotFoundException('Error in admin creation');
        }

        return result;

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


    async adminLogin(email: string, password: string, otp: string, token: string): Promise<any> {
        const user = await this.adminService.findOne(email) as AdminDocument;
        if (!user) {
            return { error: "Invalid email" };
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return { error: "Invalid password" };
        }


        const payload = { sub: user._id, email: user.email, role: user.role };
        const access_token = await this.jwtService.signAsync(payload);

        const verified = speakeasy.totp.verify({            // 2fa (google auth)
            secret: user.twoFaSecret,
            encoding: 'ascii',
            // encoding: 'base32',
            token,
        });

        const redisOTP = await this.cacheManager.get(email);             // when we select email in 2fa 

        // console.log(verified, "red:"+ redisOTP, "otp:" + otp);
        if (!verified && (!redisOTP || JSON.stringify(redisOTP) !== otp)) {
            throw new BadRequestException("Invalid OTP or Token")
        }


        await this.cacheManager.set(JSON.stringify(user._id), payload);     // stroe in session

        return {
            message: "Admin Login successful",
            access_token,
        };


    }



    async userSignup(createUserDto: CreateUserDto): Promise<User> {

        const existingUser = await this.UserModel.findOne({ email: createUserDto.email });
        if (existingUser) {
            throw new ConflictException('A user with the same email already exists');
        }

        const result = await this.userService.create(createUserDto);
        if (!result) {
            throw new NotFoundException('Error in user creation');
        }

        return result;
    }



    async userLogin(email: string, password: string): Promise<any> {
        const user = await this.userService.findOne(email) as UserDocument;
        if (!user) {
            return { error: "Invalid email" };
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return { error: "Invalid password" };
        }

        const payload = { sub: user._id, email: user.email, role: user.role };
        const access_token = await this.jwtService.signAsync(payload);
        const value = await this.cacheManager.set(JSON.stringify(user._id), payload, 1800);

        const newSession = await new this.SessionModel({
            userId: user._id,
        })

        newSession.save()

        return {
            message: "Login successful ",
            access_token,
        };


    }



    async generateOtp(email: string): Promise<void> {
        const user = await this.adminService.findOne(email);

        if (!user) {
            throw new Error('Email not found');
        }

        const OTP = Math.floor(1000 + Math.random() * 9000);
        const value = await this.cacheManager.set(email, OTP);

        const mailOptions = {
            to: email,
            subject: 'Password Reset Request',
            text: `\n\nYOUR RESET PASSWORD OTP IS: ${OTP}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        await this.mailerService.sendMail(mailOptions);


    }



    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<string> {
        const { email, otp, newPassword } = resetPasswordDto;

        const admin = await this.AdminModel.findOne({ email });
        if (!admin) {
            throw new Error('Invalid User');
        }

        const redisOTP = await this.cacheManager.get(email);

        if (!redisOTP || JSON.stringify(redisOTP) !== otp) {
            throw new Error('Invalid OTP');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        admin.password = hashedPassword;

        await admin.save();
        return 'Password reset successfully';
    }


    async userLogout(userId: string): Promise<any> {
        const value = await this.cacheManager.del(JSON.stringify(userId));
        console.log(value);
        return { message: "Logout successful" }
    }


    async setupTwoFactorAuth(twoFaDto: TwoFaDto) {

        const { email, twoFaType } = twoFaDto;
        const existingAdmin = await this.AdminModel.findOne({ email });
        if (!existingAdmin) {
            throw new NotFoundException('Admin not found');
        }

        if (twoFaType == 'googleAuth') {
            const secret = speakeasy.generateSecret();
            // this.secret = secret.base32;

            if (existingAdmin.twoFaSecret) {
                throw new BadRequestException("Google 2FA already set");
            }

            const otpauth_url = speakeasy.otpauthURL({
                secret: secret.base32,
                label: email,
                issuer: 'MyApp',
            });
            // console.log(otpauth_url);
            // console.log("base32" + secret.base32);
            // console.log("ascii" + secret.ascii);

            const qrCodeFileName = await this.generateQRCode(otpauth_url,email);


            existingAdmin.twoFaSecret = secret.base32;
            
            // if api got server timeout then it occure due to google drive upload but qrcode is still accessible in folder
            const upload = await this.adminService.uploadFile(qrCodeFileName,'image/jpg' )  
            
            const driveUrl = await this.adminService.generatePublicUrl(upload.id)
            existingAdmin.driveQrCode = driveUrl.webViewLink;
            await existingAdmin.save();

            return { message: `QR code image saved as ${qrCodeFileName}`, secret: secret.base32, qrCodeFileName , googleDrive: upload, driveUrl: driveUrl};
        }
        else {

            const OTP = Math.floor(1000 + Math.random() * 9000);

            const mailOptions = {
                to: email,
                subject: 'Otp for Two Factor Authentication',
                text: `\n\n Your OTP: ${OTP} .\n`,
            };

            await this.cacheManager.set(`2fa:${email}`, OTP);
            await this.mailerService.sendMail(mailOptions);
            return { message: 'Otp send on mail' }

        }
    }


    private async generateQRCode(otpauthUrl: string, email: string): Promise<string> {
        return new Promise((resolve, reject) => {

            const qrCodeFileName = `qrcode_${email}.jpg`; 

            qrcode.toFile(qrCodeFileName, otpauthUrl, (err) => {
                if (err) {
                    console.error('Error generating QR code:', err);
                    reject(err);
                } else {
                    console.log(`QR code image saved as ${qrCodeFileName}`);
                    resolve(qrCodeFileName);
                }
            });
        });
    }


  

    async findOrCreateGoogleUser(userName: string, fullName: string, email: string): Promise<any> {

        let user = await this.UserModel.findOne({ email }).exec();
        if (!user) {

            user = new this.UserModel({
                email,
                username: userName,
                name: fullName,
                role: 'user'

            });
            await user.save();

        }

        const payload = { sub: user._id, email: user.email, role: user.role };
        const access_token = await this.jwtService.signAsync(payload);
        const value = await this.cacheManager.set(JSON.stringify(user._id), payload, 1800);

        const newSession = await new this.SessionModel({
            userId: user._id,
        })

        newSession.save()

        return {
            message: "Login successful ",
            access_token,
        };

    }



    googleLogin(req) {
        if (!req.user) {
            return 'No user from google'
        }
        return {
            message: 'User Info from Google',
            user: req.user
        }
    }


    
    async getUserFromAuthenticationToken(token: string) {
        
        const payload = await this.jwtService.verify(token, {
            secret: jwtConstants.secret
        });

        const userId = payload.sub

        if (userId) {
            return this.UserModel.findById(userId);
        }
    }



}
