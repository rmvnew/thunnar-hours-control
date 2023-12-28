import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { endOfDay, startOfDay } from 'date-fns';
import { CustomDate } from 'src/common/custom.date';
import { RequestWithUser } from 'src/common/interfaces/user.request.interface';
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

  async create(req: RequestWithUser, createHoursControlDto: CreateHoursControlDto) {


    const { user_id, hours_control_morning_entrance } = createHoursControlDto

    const current_hour_control = this.houerControlRepository.create(createHoursControlDto)

    current_hour_control.hours_control_morning_entrance = hours_control_morning_entrance
    current_hour_control.hours_control_morning_departure = null
    current_hour_control.hours_control_afternoon_entrance = null
    current_hour_control.hours_control_afternoon_departure = null
    current_hour_control.hours_control_extra_entrance = null
    current_hour_control.hours_control_extra_exit = null
    current_hour_control.lack = null
    current_hour_control.delay = null
    current_hour_control.to_compensate = null

    const user = await this.userService.findById(req, user_id)
    current_hour_control.user = user


    return this.houerControlRepository.save(current_hour_control)
  }

  async pointRecord(req: RequestWithUser, id: string) {

    const user_is_registered = await this.userService.findById(req, id)

    if (!user_is_registered) {
      throw new BadRequestException(`Usuário não existe`)
    }

    const today = new Date();
    //^ Isso irá pegar apenas a parte da data
    const dateAsString = today.toISOString().split('T')[0];


    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    const have_todays_record = await this.houerControlRepository.createQueryBuilder('hour')
      .leftJoinAndSelect('hour.user', 'user')
      .where('user.user_id = :userId', { userId: id })
      .andWhere('hour.create_at BETWEEN :startOfDay AND :endOfDay', {
        startOfDay: startOfToday,
        endOfDay: endOfToday
      })
      .getOne();


    if (!have_todays_record) {

      const hours_control: CreateHoursControlDto = {
        hours_control_morning_entrance: CustomDate.getInstance().newAmDate(),
        user_id: id
      }
      const today = await this.create(req, hours_control)


    } else {

      //^ Já tem hora agora temos que verificar o que já está registrado 
      const {
        hours_control_morning_departure,
        hours_control_afternoon_entrance,
        hours_control_afternoon_departure,
        hours_control_extra_entrance,
        hours_control_extra_exit
      } = have_todays_record

      if (!hours_control_morning_departure) {
        //~ Se não tiver saida da manhã vamos registrar 
        have_todays_record.hours_control_morning_departure = CustomDate.getInstance().newAmDate()
      } else if (!hours_control_afternoon_entrance) {
        //~ Se não tiver entrada da tarde vamos registrar 
        have_todays_record.hours_control_afternoon_entrance = CustomDate.getInstance().newAmDate()
      } else if (!hours_control_afternoon_departure) {
        //~ Se não tiver saida da tarde vamos registrar 
        have_todays_record.hours_control_afternoon_departure = CustomDate.getInstance().newAmDate()
      } else if (!hours_control_extra_entrance) {
        //~ Se não tiver entrada da extra vamos registrar 
        have_todays_record.hours_control_extra_entrance = CustomDate.getInstance().newAmDate()
      } else if (!hours_control_extra_exit) {
        //~ Se não tiver saida da extra vamos registrar 
        have_todays_record.hours_control_extra_exit = CustomDate.getInstance().newAmDate()
      } else {
        console.log(have_todays_record);
        return null
      }

      await this.houerControlRepository.save(have_todays_record)


    }



  }

  async findAll() {

    const current_hours_control = this.houerControlRepository.createQueryBuilder('hour')

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
