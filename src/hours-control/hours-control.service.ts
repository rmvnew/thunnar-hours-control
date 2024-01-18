import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { endOfDay, startOfDay } from 'date-fns';
import * as moment from 'moment-timezone';
import { RegisterPointType, SortingType, SumType } from 'src/common/Enums';
import { CustomDate } from 'src/common/custom.date';
import { RequestWithUser } from 'src/common/interfaces/user.request.interface';
import { customPagination } from 'src/common/pagination/custom.pagination';
import { EmployeeConfigService } from 'src/employee-config/employee-config.service';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateHoursControlDto } from './dto/create-hours-control.dto';
import { HourControlFilter } from './dto/hour_control.filter';
import { PointRegisterDto } from './dto/point-register.dto';
import { UpdateHoursControlDto } from './dto/update-hours-control.dto';
import { HoursControl } from './entities/hours-control.entity';

@Injectable()
export class HoursControlService {


  private readonly logger = new Logger(HoursControlService.name)

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

  async pointRecord(req: RequestWithUser, dto: PointRegisterDto) {

    try {

      const { user_id, point_type } = dto

      const user_is_registered = await this.userService.findById(req, user_id)

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
        .leftJoinAndSelect('user.companys', 'company')
        .where('user.user_id = :userId', { userId: user_id })
        .andWhere('hour.create_at BETWEEN :startOfDay AND :endOfDay', {
          startOfDay: startOfToday,
          endOfDay: endOfToday
        })
        .getOne();



      if (!have_todays_record) {

        const hours_control: CreateHoursControlDto = {
          hours_control_morning_entrance: CustomDate.getInstance().newAmDate(),
          user_id: user_id
        }
        return await this.create(req, hours_control)


      } else {


        const {
          hours_control_morning_entrance,
          hours_control_morning_departure,
          hours_control_afternoon_entrance,
          hours_control_afternoon_departure,
          hours_control_extra_entrance,
          hours_control_extra_exit
        } = have_todays_record


        if (point_type === RegisterPointType.MORNING_DEPARTURE) {

          //^ Se não tiver saida da manhã vamos registrar 
          if (!hours_control_morning_departure) {
            have_todays_record.hours_control_morning_departure = CustomDate.getInstance().newAmDate()
          } else {

            return {
              status: 'Saida da manhã já foi registrada'
            }

          }

        } else if (point_type === RegisterPointType.AFTERNOON_ENTRANCE) {

          //^ Se não tiver entrada da tarde vamos registrar 
          if (!hours_control_afternoon_entrance) {
            have_todays_record.hours_control_afternoon_entrance = CustomDate.getInstance().newAmDate()
          } else {

            return {
              status: 'Entrada da tarde já foi registrada'
            }

          }

        } else if (point_type === RegisterPointType.AFTERNOON_DEPARTURE) {

          const morning_status = !hours_control_morning_entrance ||
            !hours_control_morning_departure

          if (morning_status) {

            throw new BadRequestException(`Entrada ou saida da manhã não encontrada!`)

          } else {

            //^ Se não tiver saida da tarde vamos registrar 

            if (!hours_control_afternoon_departure) {

              this.checkDeparture(have_todays_record)

              const current_departure = `${CustomDate.getInstance().newAmDate()}:00`

              have_todays_record.hours_control_afternoon_departure = current_departure


            }
            // else {




            //   return {

            //     status: 'Saida da tarde já foi registrada'

            //   }

            // }

          }

        } else if (point_type === RegisterPointType.EXTRA_ENTRANCE) {

          //^ Se não tiver entrada da extra vamos registrar 

          if (!hours_control_extra_entrance) {
            have_todays_record.hours_control_extra_entrance = CustomDate.getInstance().newAmDate()
          } else {

            return {
              status: 'Entrada da extra já foi registrada'
            }

          }

        } else if (point_type === RegisterPointType.EXTRA_DEPARTURE) {

          //^ Se não tiver saida da extra vamos registrar 
          if (!hours_control_extra_exit) {
            have_todays_record.hours_control_extra_exit = CustomDate.getInstance().newAmDate()
          } else {

            return {
              status: 'Saida da extra já foi registrada'
            }

          }

        } else {

          this.logger.log('Entrada da manhã já foi registrada!');

          return {
            status: 'Entrada da manhã já foi registrada!'
          }

        }

        const current_today = await this.houerControlRepository.save(have_todays_record)


        await this.sumResult(current_today)


        return current_today

      }

    } catch (error) {
      this.logger.error(`point register error: ${error.message}`, error.stack);
      throw error
    }



  }





  async checkDeparture(have_todays_record: HoursControl) {

    const current_company_id = have_todays_record.user.companys[0].company_id
    const user_id = have_todays_record.user.user_id
    const current_config = await this.employeeConfigService
      .getUserWithConfig(current_company_id, user_id)

    const default_departured = current_config.employee_config_afternoon_entrance

    if (!have_todays_record.hours_control_afternoon_entrance) {

      have_todays_record.hours_control_afternoon_entrance = default_departured

      this.houerControlRepository.save(have_todays_record)

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


  // @Cron('0 15 * * *')
  @Cron('35 16 * * *')
  async checkLunchHour() {

    this.logger.debug(` ..::| Cron Job started |::.. `)
    this.logger.log(`\n${new Date()}\n`)

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

      const current_company_id = data.user.companys[0].company_id

      const config = await this.employeeConfigService.getUserWithConfig(current_company_id, current_user_id)

      const current_moning_entrace = data.hours_control_morning_entrance

      const current_moning_departure = data.hours_control_morning_departure

      const config_moning_departure = config.employee_config_morning_departure

      const current_now = CustomDate.getInstance().newAmDate()

      let now_parts = current_now.split(':')

      const now_hour = Number(now_parts[0])

      //^ Aqui verifico se são mais de 14 horas e se o ponto de 
      //^ entrada foi registrado e se teve saida para o almoço registrada. 
      const valid_register = (now_hour > 14) &&
        (current_moning_entrace !== null) &&
        !current_moning_departure

      if (valid_register) {

        data.hours_control_morning_departure = config_moning_departure

        await this.houerControlRepository.save(data)

        Logger.log(`morning departure auto update`)

      } else {
        Logger.warn('Fora do horario!!')
      }

    })

    const user = await Promise.all(usersPromises)

    return user

  }

  async checkDelay(res: HoursControl) {

    //^ Aqui vamos verificar se an entrada o funcionário teve atraso. 

    // //~ Aqui é a hora que o colaborador bateu 
    // const entrance_hour = res.hours_control_morning_entrance

    // //~ Aqui é a hora que o colaborador deve bater 
    // const entrance_base = res.user.employee_config.employee_config_morning_entrance

    // let baseDate = new Date();

    // //~ quebrando a string com a hora da batida 
    // let partsEntranceHour = entrance_hour.split(":");
    // //~ gerando uma nova data com a batida do colaborador 
    // let dateEntranceHour = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), Number(partsEntranceHour[0]), Number(partsEntranceHour[1]));

    // //~ quebrando a string com a hora que ele deve bater
    // let partsEntranceBase = entrance_base.split(":");
    // //~ gerando uma nova data com a hora que ele deve bater
    // let dateEntranceBase = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), Number(partsEntranceBase[0]), Number(partsEntranceBase[1]), Number(partsEntranceBase[2]));

    // // Calculate the difference in milliseconds
    // let difference = Number(dateEntranceHour) - Number(dateEntranceBase);

    // // Convert the difference to minutes
    // let differenceInMinutes = difference / (1000 * 60);


    // if (differenceInMinutes > 1) {

    //   let hours = Math.floor(differenceInMinutes / 60);
    //   let minutes = Math.abs(differenceInMinutes % 60);

    //   const current_hours = `${hours}`.padStart(2, '0')
    //   const current_minuts = `${minutes}`.padStart(2, '0')

    //   res.delay_minuts = differenceInMinutes
    //   res.delay = `${current_hours}:${current_minuts}`

    //   await this.houerControlRepository.save(res)

    // }




    //~ Aqui é a hora que o colaborador bateu 
    const entrance_hour = res.hours_control_morning_entrance

    //~ Aqui é a hora que o colaborador deve bater 
    const entrance_base = res.user.employee_config.employee_config_morning_entrance


    const differenceInMinutes = await this.calculateDifference(entrance_hour, entrance_base, SumType.MORNING)

    const minuts = differenceInMinutes.delay_minuts


    if (minuts > 1) {

      let hours = Math.floor(minuts / 60);
      let minutes = Math.abs(minuts % 60);

      const current_hours = `${hours}`.padStart(2, '0')
      const current_minuts = `${minutes}`.padStart(2, '0')

      res.delay_minuts = minuts
      res.delay = `${current_hours}:${current_minuts}`

      await this.houerControlRepository.save(res)

    }

  }

  async sumResult(current_today: HoursControl) {


    const current_company_id = current_today.user.companys[0].company_id
    const user_id = current_today.user.user_id

    const current_config = await this.employeeConfigService
      .getUserWithConfig(current_company_id, user_id)

    const current_departure = current_today.hours_control_afternoon_departure
    const default_departure = current_config.employee_config_afternoon_departure



    const differenceInMinutes = await this.calculateDifference(default_departure, current_departure, SumType.AFTERNOON)

    const minuts = differenceInMinutes.delay_minuts

    let hours = Math.floor(minuts / 60);
    let minutes = Math.abs(minuts % 60);

    const current_hours = `${hours}`.padStart(2, '0')
    const current_minuts = `${minutes}`.padStart(2, '0')

    // ~ falta ver esse calculo aqui direitinho

    if (minuts > 1) {


      await this.houerControlRepository.save(current_today)

    } else if (minuts < 0) {

      current_today.delay_minuts = minuts * (-1)
      current_today.delay = `${current_hours}:${current_minuts}`
      await this.houerControlRepository.save(current_today)

    }


  }


  async calculateDifference(first_hour: string, second_hour: string, sumType: SumType) {
    //^ Aqui vamos verificar se an entrada o funcionário teve atraso. 



    let baseDate = new Date();

    let parts_first_hour = first_hour.split(":");
    let current_first_hour = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), Number(parts_first_hour[0]), Number(parts_first_hour[1]));

    let parts_second_hour = second_hour.split(":");
    let current_second_hour = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), Number(parts_second_hour[0]), Number(parts_second_hour[1]), Number(parts_second_hour[2]));

    let difference = Number(current_first_hour) - Number(current_second_hour);

    if (sumType == SumType.AFTERNOON) {
      difference = difference * (-1)
    }

    let differenceInMinutes = difference / (1000 * 60);

    return {
      delay_minuts: differenceInMinutes
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


