import { Controller, Post, Body, UseGuards, Req, Get, Param, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { CreateWorkerDto } from './dto/create-worker-dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreatePropertyDto } from './dto/create-property.dto';
import { HireWorkerDto } from './dto/hire-worker.dto';
import { MaterialCostDto } from './dto/material-cost.dto';
import { AddAttendanceDto } from './dto/add-attendance.dto';
import { AddFlatDto } from './dto/add-flat.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';




@ApiTags('Admin')           // group swagger api's
@ApiBearerAuth()           // swagger (for taking token)
@Roles(Role.Admin)
@UseGuards(AuthGuard, RolesGuard)
@Controller('admin')           // This decorator defines a controller class with the base route path '/admin'. All routes defined within this controller will be prefixed with '/admin'.
export class AdminController {
  constructor(private readonly adminService: AdminService) { }           


  @Post('addproperty')
  async addProperty(@Body(new ValidationPipe) createPropertyDto: CreatePropertyDto, @Req() request: Request): Promise<any> {
    const user = request['user'];
    this.adminService.addProperty(createPropertyDto, user.sub);
    return { message: 'Property added successfully' };
  }

  
  @Get('activeconstructions')
  async activeConstructions(@Req() request: Request): Promise<any> {
    const user = request['user'];
    const activeConstructions = await this.adminService.activeConstructions(user.sub);
    return { message: 'active constructions properties', properties: activeConstructions };
  }


  @Post('hire/:propertyId')
  async hireworker(@Param('propertyId') propertyId: string, @Body(new ValidationPipe) hireWorkerDto: HireWorkerDto, @Req() request: Request): Promise<any> {
    const user = request['user'];
    const property = await this.adminService.hireWorker(propertyId, hireWorkerDto, user.sub);
    return { message: 'Worker hire successfully', updatedProperty: property };
  }

  
  @Get('workerlist/:propertyId')
  async workerList(@Param('propertyId') propertyId: string, @Req() request: Request): Promise<any> {
    const workerList = await this.adminService.workerList(propertyId);
    return { message: 'list of all worker on given property', list: workerList };
  }


  @Post('manage-expense/:propertyId')
  async manageExpense(@Param('propertyId') propertyId: string, @Body(new ValidationPipe) materailCostDto: MaterialCostDto): Promise<any> {
    const result = await this.adminService.addMaterialCost(propertyId, materailCostDto);
    return { message: 'Material expense added successfully', result };
  }


  @Get('allproperty')
  async getAllProperty(@Req() request: Request): Promise<any> {
    const user = request['user'];
    const result = await this.adminService.getAllProperty(user.sub);
    return { message: 'List of all Properties', result };
  }



  @Get('property-details/:propertyId')
  async PropertyDetails(@Param('propertyId') propertyId: string, @Req() request: Request): Promise<any> {
    const user = request['user'];
    const result = await this.adminService.propertyDetails(propertyId, user.sub);
    return { message: 'Properties Details', result };
  }

  @Post('addworker')
  async addWorker(@Body(new ValidationPipe) createWorkerDto: CreateWorkerDto, @Req() request: Request): Promise<any> {
    const user = request['user'];
    this.adminService.addWorker(createWorkerDto, user.sub);
    return { message: 'Worker added successfully' };
  }



  @Post('addflat/:propertyId')
  async addFlat(@Body(new ValidationPipe) addFlatDto: AddFlatDto, @Param('propertyId') propertId: string): Promise<any> {
    const result = await this.adminService.addFlat(addFlatDto, propertId);
    return { message: 'Flat added successfully', result };
  }


  @Post('add-attendance/:workerId')
  async addAttendance(@Body(new ValidationPipe) addAttendanceDto: AddAttendanceDto, @Param('workerId') workerId: string, @Req() request: Request): Promise<any> {
    const user = request['user'];
    const result = await this.adminService.addAttendance(addAttendanceDto, workerId, user.sub);
    return { message: 'Attendance added successfully', result };
  }


  @Get('find-attendance/:propertyId/:date')
  async findAttendance(@Param('propertyId') propertyId: string, @Param('date') date: string): Promise<any> {
    console.log(propertyId, date);
    const result = await this.adminService.findAttendance(propertyId, date);
    return { message: 'Attendance of given property', result };
  }


  @Get('weather/:city')
  async getWeather(@Param('city') city: string): Promise<any> {
    const weatherData = await this.adminService.getWeather(city);
    return weatherData;
  }


}
