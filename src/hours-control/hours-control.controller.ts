import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import AccessProfile from 'src/auth/enums/permission.type';
import { CompanyGuard } from 'src/auth/shared/guards/employeeCompany.guard';
import { PermissionGuard } from 'src/auth/shared/guards/permission.guard';
import { RequestWithUser } from 'src/common/interfaces/user.request.interface';
import { CreateHoursControlDto } from './dto/create-hours-control.dto';
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
  findAll() {
    return this.hoursControlService.findAll();
  }

  @Post('/point/:id')
  @UseGuards(CompanyGuard, PermissionGuard(AccessProfile.ADMIN_USER))
  async pointRegister(
    @Req() req: RequestWithUser,
    @Param('id') id: string
  ) {

    return this.hoursControlService.pointRecord(req, id)

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
