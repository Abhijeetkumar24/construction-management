import { Controller, Post, Body, UseGuards, Req, Param, Query, Get, UseInterceptors ,Res} from '@nestjs/common';
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


// import { CookiesAuthenticatedGuard } from '../auth/guards/cookies.auth.guard';



@ApiTags('User')
@ApiBearerAuth()
@Roles(Role.User)
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(ErrorsInterceptor)
// @UseInterceptors(CacheInterceptor)          if we use it then it store the result of all Get api in redis
@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) { }

    @Post('flat-booking')
    async bookFlat(@I18n() i18n: I18nContext, @Body(new ValidationPipe) bookFlatDto: BookFlatDto, @Req() request: Request): Promise<any> {

        const user = request['user'];
        const result = await this.userService.bookFlat(i18n, bookFlatDto, user);
        return { message: i18n.t(`test.flat.flatBookingSuccess`), result };
    }


    @Get('booking-details')
    async bookingDetails(@I18n() i18n: I18nContext, @Query('propertyId') propertyId: string, @Query('flatId') flatId: string): Promise<any> {

        const result = await this.userService.bookingDetails(i18n, propertyId, flatId);
        return { messsage: i18n.t(`test.booking.bookingDetailsSuccess`), result };
    }


    @Get('property-details')
    async propertyDetails(@I18n() i18n: I18nContext, @Query('propertyId') propertyId: string, @Req() request: Request): Promise<any> {

        const user = request['user'];
        const result = await this.userService.propertyDetails(i18n, propertyId, user.sub);
        return { message: i18n.t(`test.property.propertyDetailsSuccess`), result };

    }


    @Get('payment')
    async payment(@Req() request: Request, @Body() paymentDto: PaymentDto) {
        const user = request['user']
        const { propertyId, price, currency } = paymentDto;
        return this.userService.payment(user.email, propertyId, price, currency );
    }

    @Get('pay/success/checkout/session')
    paymentSuccess(@Res({ passthrough: true }) res) {

        return this.userService.paymentSuccess(res);
    }
}


