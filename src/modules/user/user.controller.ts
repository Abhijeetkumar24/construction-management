import { Controller, Post, Body, UseGuards, Req, Param, Query, Get, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Request, query } from 'express';
import { BookFlatDto } from './dto/book-flat.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { CacheModule, CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
// import { CookiesAuthenticatedGuard } from '../auth/guards/cookies.auth.guard';


@ApiTags('User')
@ApiBearerAuth()
@Roles(Role.User)
@UseGuards(AuthGuard, RolesGuard)
// @UseInterceptors(CacheInterceptor)          if we use it then it store the result of all Get api in redis
@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) { }

    @Post('flat-booking')
    async bookFlat(@Body(new ValidationPipe) bookFlatDto: BookFlatDto, @Req() request: Request): Promise<any> {
        const user = request['user'];
        const result = await this.userService.bookFlat(bookFlatDto, user.sub);
        return { messsage: 'Flat booked successfully', result };
    }


    @Get('booking-details')
    async bookingDetails(@Query('propertyId') propertyId: string, @Query('flatId') flatId: string): Promise<any> {
        const result = await this.userService.bookingDetails(propertyId, flatId);
        return { messsage: ' Booking Details', result };
    }


    @Get('property-details')
    async propertyDetails(@Query('propertyId') propertyId: string, @Req() request: Request): Promise<any> {
        const user = request['user'];
        const result = await this.userService.propertyDetails(propertyId, user.sub);

        return { message: 'Property Details', result };
    }


    @Post('create-payment/:amount/:currency')
    async paymentIntent(@Param('amount') amount: number, @Param('currency') currency: string): Promise<any> {
        const paymentIntent = await this.userService.paymentIntent(amount, currency);
        return { clientSecret: paymentIntent.client_secret };
    }


}


