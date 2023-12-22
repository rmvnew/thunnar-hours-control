import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HoursControlService } from './hours-control.service';
import { CreateHoursControlDto } from './dto/create-hours-control.dto';
import { UpdateHoursControlDto } from './dto/update-hours-control.dto';

@Controller('hours-control')
export class HoursControlController {
  constructor(private readonly hoursControlService: HoursControlService) {}

  @Post()
  create(@Body() createHoursControlDto: CreateHoursControlDto) {
    return this.hoursControlService.create(createHoursControlDto);
  }

  @Get()
  findAll() {
    return this.hoursControlService.findAll();
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
