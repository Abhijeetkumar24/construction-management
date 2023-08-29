import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    Post,
    Req,
    UseGuards,
    Res,
    UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../../guards/auth.guard';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/user.login.dto';
import { CreateAdminDto } from '../Admin/dto/create-admin.dto';
import { Admin } from '../../schemas/admin.schema';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ApiProperty, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ResetPasswordDto } from './dto/reset.password.dto';
import * as speakeasy from 'speakeasy';
import { Verify2faDto } from './dto/verify2fa.dto';
import { TwoFaDto } from './dto/two.fa.dto';
import { AdminLoginDto } from './dto/admin.login.dto';
import { ErrorsInterceptor } from 'src/interceptor/error.handler.interceptor';
import  {AuthGuard as PassportAuthGuard }  from '@nestjs/passport';




@ApiTags('Auth')
@UseInterceptors(ErrorsInterceptor)
@Controller('auth')
export class AuthController {

    private secret: string;

    constructor(private authService: AuthService) { }


    @Post('admin-signup')
    async adminSignup(@Body(new ValidationPipe) createAdminDto: CreateAdminDto) {     // body me se jo data aayega usko createAdminDto me dal dege
        try {
            return this.authService.adminSignup(createAdminDto);                           // //  calls the create method of the injected adminService instance, passing the createAdminDto as an argument
        } catch (error) {
            return { message: 'An error occurred while signing up as an admin', error: error.message };
        }
    }


    @ApiBearerAuth()
    @Post('adminlogin')
    async adminLogin(@Body(new ValidationPipe) adminLoginDto: AdminLoginDto) {
        try {

            const { email, password, emailOtp, token } = adminLoginDto;
            return this.authService.adminLogin(email, password, emailOtp, token);

        } catch (error) {
            return { message: 'An error occurred while logging in as an admin', error: error.message };
        }
    }


    @ApiBearerAuth()
    @Post('user-signup')
    async userSignup(@Body(new ValidationPipe) createUserDto: CreateUserDto): Promise<any> {
        try {

            return this.authService.userSignup(createUserDto);

        } catch (error) {
            return { message: 'An error occurred while signing up as a user', error: error.message };
        }

    }


    @ApiBearerAuth()
    @Post('userlogin')
    userLogin(@Body(new ValidationPipe) userLoginDto: UserLoginDto) {
        const { email, password } = userLoginDto;
        return this.authService.userLogin(email, password);
    }


    @Post('generate-otp')
    async generateOtp(@Body('email') email: string) {
        try {
            await this.authService.generateOtp(email);

            return { message: 'Otp send to email' };
        } catch (error) {
            throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @Post('reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
        const message = await this.authService.resetPassword(resetPasswordDto);
        return { message };
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Delete('logout')
    async logout(@Req() request: Request): Promise<any> {
        try {

            const user = request['user'];
            await this.authService.userLogout(user.sub);
            return { message: 'Logout successful' };

        } catch (error) {
            return { message: 'An error occurred during logout', error: error.message };
        }
    }



    @Post('setup-2fa')
    async setupTwoFactorAuth(@Body() twoFaDto: TwoFaDto) {
        return await this.authService.setupTwoFactorAuth(twoFaDto);
    }


    @Get('google-login')                      // not work in postman in chrome "localhost:3000/auth/google-login"
    @UseGuards(PassportAuthGuard('google'))
    async googleAuth(@Req()req: Request) { 
        
    }


    @Get('auth/google/callback')
    @UseGuards(PassportAuthGuard('google'))
    googleAuthRedirect(@Req() req) {
        return this.authService.googleLogin(req)
    }

}
