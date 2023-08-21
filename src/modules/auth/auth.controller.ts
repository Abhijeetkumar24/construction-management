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
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signInDto';
import { CreateAdminDto } from '../Admin/dto/create-admin.dto';
import { Admin } from '../Admin/schemas/admin.schema';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ApiProperty, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ResetPasswordDto } from './dto/reset.password.dto';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }


    @Post('admin-signup')
    async adminSignup(@Body(new ValidationPipe) createAdminDto: CreateAdminDto ): Promise<Admin> {     // body me se jo data aayega usko createAdminDto me dal dege
        return this.authService.adminSignup(createAdminDto);                           // //  calls the create method of the injected adminService instance, passing the createAdminDto as an argument

    }

    @ApiBearerAuth()
    @Post('adminlogin')
    adminLogin(@Body(new ValidationPipe) signInDto: SignInDto ) {
        const { email, password } = signInDto;
        return this.authService.adminLogin(email, password);
    }


    @ApiBearerAuth()
    @UseGuards(AuthGuard)        // admin token passed and verified and decode and store adminId in user
    @Post('user-signup')
    async userSignup(@Body(new ValidationPipe) createUserDto: CreateUserDto, @Req() request: Request): Promise<any> {     
        const user = request['user'];
        return this.authService.userSignup(createUserDto, user.sub);                           
    }


    @ApiBearerAuth()
    @Post('userlogin')
    userLogin(@Body(new ValidationPipe) signInDto: SignInDto) {
        const { email, password } = signInDto;
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

        const user = request['user'];
       return await this.authService.userLogout(user.sub);
        
    }

   
}
