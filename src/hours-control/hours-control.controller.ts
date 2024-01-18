import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import AccessProfile from 'src/auth/enums/permission.type';
import { CompanyGuard } from 'src/auth/shared/guards/employeeCompany.guard';
import { PermissionGuard } from 'src/auth/shared/guards/permission.guard';
import { RegisterPointType } from 'src/common/Enums';
import { RequestWithUser } from 'src/common/interfaces/user.request.interface';
import { CreateHoursControlDto } from './dto/create-hours-control.dto';
import { HourControlFilter } from './dto/hour_control.filter';
import { PointRegisterDto } from './dto/point-register.dto';
import { UpdateHoursControlDto } from './dto/update-hours-control.dto';
import { HoursControlService } from './hours-control.service';

@Controller('hours-control')
@ApiTags('Hours Control')
@ApiBearerAuth()

export class HoursControlController {
  constructor(private readonly hoursControlService: HoursControlService) { }

  @Post()
  @UseGuards(CompanyGuard, PermissionGuard(AccessProfile.ADMIN_USER))
  create(
    @Req() req: RequestWithUser,
    @Body() createHoursControlDto: CreateHoursControlDto
  ) {
    return this.hoursControlService.create(req, createHoursControlDto);
  }


  @Get()
  @UseGuards(CompanyGuard, PermissionGuard(AccessProfile.ADMIN_USER_MANAGER_OWNER))
  findAll(
    @Req() req: RequestWithUser,
    @Query() filter: HourControlFilter
  ) {
    return this.hoursControlService.findAll(req, filter);
  }

  @Post('/point')
  @ApiQuery({ name: 'point_type', enum: RegisterPointType })
  @UseGuards(CompanyGuard, PermissionGuard(AccessProfile.ADMIN_USER_MANAGER_OWNER))
  async pointRegister(
    @Req() req: RequestWithUser,
    @Query('point_type') point_type: RegisterPointType,
    @Query('user_id') user_id: string,
  ) {

    const dto: PointRegisterDto = {
      point_type,
      user_id
    }

    return this.hoursControlService.pointRecord(req, dto)

  }

  @Get('/lunch-hour')
  @UseGuards(CompanyGuard, PermissionGuard(AccessProfile.ADMIN_USER_MANAGER_OWNER))
  lunchHour(

  ) {
    this.hoursControlService.checkLunchHour();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hoursControlService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHoursControlDto: UpdateHoursControlDto) {
    return this.hoursControlService.update(+id, updateHoursControlDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hoursControlService.remove(+id);
  }

}
