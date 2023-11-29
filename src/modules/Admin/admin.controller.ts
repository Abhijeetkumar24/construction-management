import { Controller, Post, Body, UseGuards, Req, Get, Param, Query, UploadedFile, UseInterceptors, ConflictException, HttpException, HttpStatus, Put, Logger } from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { CreateWorkerDto } from './dto/create-worker-dto';
import { AuthGuard } from '../../guards/auth.guard';
import { CreatePropertyDto } from './dto/create-property.dto';
import { HireWorkerDto } from './dto/hire-worker.dto';
import { MaterialCostDto } from './dto/material-cost.dto';
import { AddAttendanceDto } from './dto/add-attendance.dto';
import { AddFlatDto } from './dto/add-flat.dto';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '../../interfaces/enum';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ErrorsInterceptor } from 'src/interceptor/error.handler.interceptor';
import { I18n, I18nContext } from 'nestjs-i18n';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { UpdateAdminDto } from '../auth/dto/update.admin.dto';



@ApiTags('Admin')           // group swagger api's
@ApiBearerAuth()           // swagger (for taking token)
@Roles(Role.Admin)
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(ErrorsInterceptor)
@Controller('admin')           // This decorator defines a controller class with the base route path '/admin'. All routes defined within this controller will be prefixed with '/admin'.
export class AdminController {

  private readonly logger = new Logger('AdminController');
  
  constructor(private readonly adminService: AdminService) { }


  @Post('addproperty')
  async addProperty(@I18n() i18n: I18nContext, @Body(new ValidationPipe) createPropertyDto: CreatePropertyDto, @Req() request: Request): Promise<any> {
    const user = request['user'];

    await this.adminService.addProperty(createPropertyDto, user.sub, i18n);
    return { message: i18n.t('test.PropertyAddedSuccessfully') };

  }


  @Put('updateproperty/:propertyId')
  async updateProperty(@I18n() i18n: I18nContext, @Body(new ValidationPipe) updatePropertyDto: UpdatePropertyDto, @Param('propertyId') propertyId: string): Promise<any> {

    await this.adminService.updateProperty(updatePropertyDto, propertyId, i18n);
    return { message: i18n.t('test.PropertyUpdatedSuccessfully') };

  }


  @Put('update-admin')
  async updateAdmin(@Body(new ValidationPipe) updateAdminDto: UpdateAdminDto, @Req() request: Request,@I18n() i18n: I18nContext) {
      const user = request['user']
      const result = await this.adminService.updateAdmin(updateAdminDto, user.sub);
      return { message: i18n.t('test.AdminUpdatedSuccessfully'), result };
  }

  @Get('activeconstructions')
  async activeConstructions(@I18n() i18n: I18nContext, @Req() request: Request): Promise<any> {

    const user = request['user'];
    const activeConstructions = await this.adminService.activeConstructions(user.sub, i18n);
    return { message: i18n.t('test.ActiveConstructionProperties'), properties: activeConstructions };

  }


  @Post('hire/:propertyId')
  async hireworker(@I18n() i18n: I18nContext, @Param('propertyId') propertyId: string, @Body(new ValidationPipe) hireWorkerDto: HireWorkerDto, @Req() request: Request): Promise<any> {

    const user = request['user'];
    const property = await this.adminService.hireWorker(propertyId, hireWorkerDto, user.sub, i18n);
    return { message: i18n.t('test.WorkerHiredSuccessfully'), updatedProperty: property };

  }


  @Get('workerlist/:propertyId')
  async workerList(@Param('propertyId') propertyId: string, @Req() request: Request, @I18n() i18n: I18nContext): Promise<any> {

    const workerList = await this.adminService.workerList(propertyId, i18n);
    return { message: i18n.t('test.ListOfAllWorkersOnTheGivenProperty'), list: workerList };

  }


  @Post('manage-expense/:propertyId')
  async manageExpense(@Param('propertyId') propertyId: string, @Body(new ValidationPipe) materialCostDto: MaterialCostDto, @I18n() i18n: I18nContext): Promise<any> {

    const result = await this.adminService.addMaterialCost(propertyId, materialCostDto, i18n);
    return { message: i18n.t('test.MaterialExpenseAddedSuccessfully'), result };

  }

  @Get('allproperty')
  async getAllProperty(@Req() request: Request, @I18n() i18n: I18nContext): Promise<any> {

    const user = request['user'];
    const result = await this.adminService.getAllProperty(user.sub, i18n);
    return { message: i18n.t('test.ListOfAllProperties'), result };

  }


  @Get('property-details/:propertyId')
  async PropertyDetails(@Param('propertyId') propertyId: string, @Req() request: Request, @I18n() i18n: I18nContext): Promise<any> {

    const user = request['user'];
    const result = await this.adminService.propertyDetails(propertyId, user.sub, i18n);
    return { message: i18n.t('test.PropertyDetails'), result };

  }


  @Post('addworker')
  async addWorker(@Body(new ValidationPipe) createWorkerDto: CreateWorkerDto, @Req() request: Request, @I18n() i18n: I18nContext): Promise<any> {
    const user = request['user'];

    await this.adminService.addWorker(createWorkerDto, user.sub, i18n);
    return { message: i18n.t('test.WorkerAddedSuccessfully') };

  }


  @Post('addflat/:propertyId')
  async addFlat(@Body(new ValidationPipe) addFlatDto: AddFlatDto, @Param('propertyId') propertyId: string, @I18n() i18n: I18nContext): Promise<any> {

    const result = await this.adminService.addFlat(addFlatDto, propertyId, i18n);
    return { message: i18n.t('test.FlatAddedSuccessfully'), result }

  }


  @Post('add-attendance/:workerId')
  async addAttendance(@Body(new ValidationPipe) addAttendanceDto: AddAttendanceDto, @Param('workerId') workerId: string, @Req() request: Request, @I18n() i18n: I18nContext): Promise<any> {

    const user = request['user'];
    const result = await this.adminService.addAttendance(addAttendanceDto, workerId, user.sub, i18n);
    return { message: i18n.t('test.AttendanceAddedSuccessfully'), result };

  }


  @Get('find-attendance/:propertyId/:date')
  async findAttendance(@Param('propertyId') propertyId: string, @Param('date') date: string, @I18n() i18n: I18nContext): Promise<any> {

    const result = await this.adminService.findAttendance(propertyId, date, i18n);
    return { message: i18n.t('test.AttendanceOfTheGivenProperty'), result };

  }


  @Get('weather/:city')
  async getWeather(@Param('city') city: string, @I18n() i18n: I18nContext): Promise<any> {

    const weatherData = await this.adminService.getWeather(city, i18n);
    return weatherData;

  }





}
