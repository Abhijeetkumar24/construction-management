import { Controller, Post, Body, UseGuards, Req, Param, Query, Get, UseInterceptors, Res, Put, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../../schemas/user.schema';
import { AuthGuard } from '../../guards/auth.guard';
import { Request, query } from 'express';
import { BookFlatDto } from './dto/book-flat.dto';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '../../interfaces/enum';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ErrorsInterceptor } from 'src/interceptor/error.handler.interceptor';
import { PaymentDto } from './dto/payment.dto';
import { UpdateUserDto } from './dto/update.user.dto';
// import { CookiesAuthenticatedGuard } from '../auth/guards/cookies.auth.guard';



@ApiTags('User')
@ApiBearerAuth()
@Roles(Role.User)
// @UseGuards(AuthGuard, RolesGuard)
// @UseInterceptors(CacheInterceptor)          if we use it then it store the result of all Get api in redis
@UseInterceptors(ErrorsInterceptor)
@Controller('user')
export class UserController {

    private readonly logger = new Logger('UserController');
    
    constructor(private readonly userService: UserService) { }
    

    @UseGuards(AuthGuard, RolesGuard)
    @Put('update-user')
    async updateUser(@Body(new ValidationPipe) updateUserDto: UpdateUserDto, @Req() request: Request, @I18n() i18n: I18nContext) {

        const user = request['user']
        const result = await this.userService.updateUser(updateUserDto, user.sub);
        console.log(result)
        return { message: i18n.t(`test.UserUpdateSuccessfully`), result };
    }


    @UseGuards(AuthGuard, RolesGuard)
    @Post('flat-booking')
    async bookFlat(@I18n() i18n: I18nContext, @Body(new ValidationPipe) bookFlatDto: BookFlatDto, @Req() request: Request): Promise<any> {

        const user = request['user'];
        const result = await this.userService.bookFlat(i18n, bookFlatDto, user);
        return { message: i18n.t(`test.flat.flatBookingSuccess`), result };
    }


    @UseGuards(AuthGuard, RolesGuard)
    @Get('booking-details')
    async bookingDetails(@I18n() i18n: I18nContext, @Query('propertyId') propertyId: string, @Query('flatId') flatId: string): Promise<any> {

        const result = await this.userService.bookingDetails(i18n, propertyId, flatId);
        return { messsage: i18n.t(`test.booking.bookingDetailsSuccess`), result };
    }


    @UseGuards(AuthGuard, RolesGuard)
    @Get('property-details')
    async propertyDetails(@I18n() i18n: I18nContext, @Query('propertyId') propertyId: string, @Req() request: Request): Promise<any> {

        this.logger.warn('This is a warn message.');
        this.logger.debug('This is an debug message.');
        this.logger.verbose('This is a verbose message.');
        this.logger.log('This is a log message.');
        this.logger.error('This is an error message.');
       
        const user = request['user'];
        const result = await this.userService.propertyDetails(i18n, propertyId, user.sub);
        return { message: i18n.t(`test.property.propertyDetailsSuccess`), result };

    }

    @UseGuards(AuthGuard, RolesGuard)
    @Get('payment')
    async payment(@Req() request: Request, @Body() paymentDto: PaymentDto) {
        const user = request['user']
        const { propertyId, price, currency } = paymentDto;
        return this.userService.payment(user.email, propertyId, price, currency);
    }


    @Get('pay/success/checkout/session')
    paymentSuccess(@Res({ passthrough: true }) res: Response) {                 // if we don't use passthrough then we don't go to success page, { passthrough: true } pass the response object to paymentSuccess method so that you can use it within the method.

        return this.userService.paymentSuccess(res);
    }
}


