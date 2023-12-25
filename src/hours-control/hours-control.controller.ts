import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import AccessProfile from 'src/auth/enums/permission.type';
import { PermissionGuard } from 'src/auth/shared/guards/permission.guard';
import { CreateHoursControlDto } from './dto/create-hours-control.dto';
import { UpdateHoursControlDto } from './dto/update-hours-control.dto';
import { HoursControlService } from './hours-control.service';

@Controller('hours-control')
@ApiTags('Hours Control')
@ApiBearerAuth()

export class HoursControlController {
  constructor(private readonly hoursControlService: HoursControlService) { }

  @Post()
  create(@Body() createHoursControlDto: CreateHoursControlDto) {
    return this.hoursControlService.create(createHoursControlDto);
  }


  @Get()
  findAll() {
    return this.hoursControlService.findAll();
  }

  @Post('/point/:id')
  @UseGuards(PermissionGuard(AccessProfile.ADMIN_USER))
  async pointRegister(
    @Param('id') id: string
  ) {

    return this.hoursControlService.pointRecord(id)

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
