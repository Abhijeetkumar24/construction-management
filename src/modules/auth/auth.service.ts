import { Inject, Injectable, NotFoundException, UnauthorizedException,Req } from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from 'src/modules/Admin/admin.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminDocument } from 'src/modules/Admin/schemas/admin.schema';
import { UserService } from 'src/modules/user/user.service';
import { User, UserDocument } from 'src/modules/user/schemas/user.schema';
import { CreateAdminDto } from '../Admin/dto/create-admin.dto';
import { Admin } from 'src/modules/Admin/schemas/admin.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ResetPasswordDto } from './dto/reset.password.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from '../user/schemas/session.schema';

@Injectable()
export class AuthService {

    constructor(
        @InjectModel(Admin.name) private AdminModel: Model<Admin>, 
        @InjectModel(Session.name) private SessionModel: Model<Session>, 
        private  adminService: AdminService,
        private jwtService: JwtService,
        private userService: UserService,
        private readonly mailerService: MailerService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,


    ) { }


    async adminSignup(createAdminDto: CreateAdminDto): Promise<Admin> {      

        const result = await this.adminService.create(createAdminDto);
        if (!result) {
            throw new NotFoundException('Error in admin creation');
        }

        return result;

    }

    async adminLogin(email: string, password: string): Promise<any> {
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
        const value = await this.cacheManager.set(JSON.stringify(user._id) , payload) ;

        return {
            message: "Admin Login successful",
            access_token,
        };


    }


    async userSignup(createUserDto: CreateUserDto, adminId: string): Promise<User> {
        const result = await this.userService.create(createUserDto, adminId);
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
        const value = await this.cacheManager.set(JSON.stringify(user._id) , payload, 1800) ;

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
        const value = await this.cacheManager.set(email,OTP);

        const mailOptions = {
            to: email,
            subject: 'Password Reset Request',
            text: `\n\nYOUR RESET PASSWORD OTP IS: ${OTP}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        await this.mailerService.sendMail(mailOptions);


    }



    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<string> {
        const { email, otp, newPassword } = resetPasswordDto;
        
        const admin = await this.AdminModel.findOne({email});
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
    

    async userLogout(userId: string): Promise <any> {
        const value= await this.cacheManager.del(JSON.stringify(userId));
        console.log(value);
        return {message: "Logout successful"}
    }

}
