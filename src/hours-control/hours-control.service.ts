import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateHoursControlDto } from './dto/create-hours-control.dto';
import { UpdateHoursControlDto } from './dto/update-hours-control.dto';
import { HoursControl } from './entities/hours-control.entity';

@Injectable()
export class HoursControlService {

  constructor(
    @InjectRepository(HoursControl)
    private readonly houerControlRepository: Repository<HoursControl>,
    private readonly userService: UserService
  ) { }

  async create(createHoursControlDto: CreateHoursControlDto) {


    const { user_id } = createHoursControlDto

    const current_hour_control = this.houerControlRepository.create(createHoursControlDto)
    current_hour_control.hours_control_morning_entrance = new Date()
    current_hour_control.hours_control_morning_departure = null
    current_hour_control.hours_control_afternoon_entrance = null
    current_hour_control.hours_control_afternoon_departure = null
    current_hour_control.hours_control_extra_entrance = null
    current_hour_control.hours_control_extra_exit = null
    current_hour_control.lack = null
    current_hour_control.delay = null
    current_hour_control.to_compensate = null

    const user = await this.userService.findById(user_id)
    current_hour_control.user = user


    return this.houerControlRepository.save(current_hour_control)
  }

  async findAll() {
    return `This action returns all hoursControl`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} hoursControl`;
  }

  async update(id: number, updateHoursControlDto: UpdateHoursControlDto) {
    return `This action updates a #${id} hoursControl`;
  }

  async remove(id: number) {
    return `This action removes a #${id} hoursControl`;
  }
}
