import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { endOfDay, startOfDay } from 'date-fns';
import * as moment from 'moment-timezone';
import { SortingType } from 'src/common/Enums';
import { CustomDate } from 'src/common/custom.date';
import { RequestWithUser } from 'src/common/interfaces/user.request.interface';
import { customPagination } from 'src/common/pagination/custom.pagination';
import { EmployeeConfigService } from 'src/employee-config/employee-config.service';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateHoursControlDto } from './dto/create-hours-control.dto';
import { HourControlFilter } from './dto/hour_control.filter';
import { UpdateHoursControlDto } from './dto/update-hours-control.dto';
import { HoursControl } from './entities/hours-control.entity';

@Injectable()
export class HoursControlService {

  constructor(
    @InjectRepository(HoursControl)
    private readonly houerControlRepository: Repository<HoursControl>,
    private readonly userService: UserService,
    private readonly employeeConfigService: EmployeeConfigService
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


    const res = await this.houerControlRepository.save(current_hour_control)



    await this.checkDelay(res)

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

  async findAll(req: RequestWithUser, filter: HourControlFilter) {


    const { user_name, page, limit, orderBy, sort } = filter

    let current_orderBy = 'DATE'
    let current_page = 1
    let current_sort = 'DESC'
    let current_limit = 10

    if (orderBy) {
      current_orderBy = orderBy
    }

    if (page) {
      current_page = page
    }

    if (sort) {
      current_sort = sort
    }

    if (limit) {
      current_limit = limit
    }

    let config = this.houerControlRepository.createQueryBuilder('hour')
      .leftJoinAndSelect('hour.user', 'user')
      .leftJoinAndSelect('user.companys', 'company')

    const ids = req.user.company_ids

    console.log(ids);


    if (req.user.profile !== 1) {

      config = config.andWhere('company.company_id IN (:...ids)', { ids })
    }

    const queryBuilder = await config
      .select([

        'hour.hours_control_id',
        'hour.hours_control_morning_entrance',
        'hour.hours_control_morning_departure',
        'hour.hours_control_afternoon_entrance',
        'hour.hours_control_afternoon_departure',
        'hour.hours_control_extra_entrance',
        'hour.hours_control_extra_exit',
        'hour.delay',
        'hour.lack',
        'hour.to_compensate',
        'hour.create_at',
        'hour.update_at',
        'user.user_id',
        'user.user_name',
        'company.company_id',
        'company.company_name',

      ]).addSelect('user')


    if (user_name) {
      queryBuilder.andWhere(`user.user_name LIKE :name`, {
        name: `%${user_name}%`
      });
    }


    if (current_orderBy == SortingType.DATE) {
      queryBuilder.orderBy('hour.create_at', `${current_sort === 'DESC' ? 'DESC' : 'ASC'}`);
    } else {
      queryBuilder.orderBy('user.user_name', `${current_sort === 'DESC' ? 'DESC' : 'ASC'}`);
    }

    const res = await queryBuilder.getMany()

    return customPagination(res, current_page, current_limit, filter)
  }



  async checkLunchHour() {

    const startOfDay = moment().tz('America/Manaus').startOf('day').toISOString();
    const endOfDay = moment().tz('America/Manaus').endOf('day').toISOString();

    const allRegistersToday = await this.houerControlRepository.createQueryBuilder('hour')
      .leftJoinAndSelect('hour.user', 'user')
      .leftJoinAndSelect('user.companys', 'company')
      .select([
        'hour.hours_control_id',
        'hour.hours_control_morning_entrance',
        'hour.hours_control_morning_departure',
        'hour.hours_control_afternoon_entrance',
        'hour.hours_control_afternoon_departure',
        'user.user_id',
        'user.user_name',
        'company.company_id',
        'company.company_name',
      ])
      .where('hour.create_at >= :startOfDay', { startOfDay })
      .andWhere('hour.create_at <= :endOfDay', { endOfDay })
      .getMany()




    const usersPromises = allRegistersToday.map(async (data: any) => {


      const current_user_id = data.user.user_id
      const current_user_name = data.user.user_name
      const current_company_id = data.user.companys[0].company_id



      const config = await this.employeeConfigService.getUserWithConfig(current_company_id, current_user_id)

      // console.log(config);


      return {
        company_id: current_company_id,
        user_id: current_user_id,
        user_name: current_user_name
      }

    })

    const user = await Promise.all(usersPromises)




    //~ pegar a config para cada um e verificar a hora


    return user




  }

  async checkDelay(res: HoursControl) {

    //^ Aqui vamos verificar se an entrada o funcionário teve atraso. 

    //~ Aqui é a hora que o colaborador bateu 
    const entrance_hour = res.hours_control_morning_entrance

    //~ Aqui é a hora que o colaborador deve bater 
    const entrance_base = res.user.employee_config.employee_config_morning_entrance

    let baseDate = new Date();

    //~ quebrando a string com a hora da batida 
    let partsEntranceHour = entrance_hour.split(":");
    //~ gerando uma nova data com a batida do colaborador 
    let dateEntranceHour = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), Number(partsEntranceHour[0]), Number(partsEntranceHour[1]));

    //~ quebrando a string com a hora que ele deve bater
    let partsEntranceBase = entrance_base.split(":");
    //~ gerando uma nova data com a hora que ele deve bater
    let dateEntranceBase = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), Number(partsEntranceBase[0]), Number(partsEntranceBase[1]), Number(partsEntranceBase[2]));

    // Calculate the difference in milliseconds
    let difference = Number(dateEntranceHour) - Number(dateEntranceBase);

    // Convert the difference to minutes
    let differenceInMinutes = difference / (1000 * 60);


    if (differenceInMinutes > 1) {

      let hours = Math.floor(differenceInMinutes / 60);
      let minutes = Math.abs(differenceInMinutes % 60);

      const current_hours = `${hours}`.padStart(2, '0')
      const current_minuts = `${minutes}`.padStart(2, '0')

      res.delay_minuts = differenceInMinutes
      res.delay = `${current_hours}:${current_minuts}`

      await this.houerControlRepository.save(res)

    }

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


