import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SortingType, ValidType } from 'src/common/Enums';
import { RequestWithUser } from 'src/common/interfaces/user.request.interface';
import { customPagination } from 'src/common/pagination/custom.pagination';
import { Validations } from 'src/common/validations';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateEmployeeConfigDto } from './dto/create-employee-config.dto';
import { EmployeeFilter } from './dto/employee.filter';
import { UpdateEmployeeConfigDto } from './dto/update-employee-config.dto';
import { EmployeeConfig } from './entities/employee-config.entity';

@Injectable()
export class EmployeeConfigService {

  constructor(
    @InjectRepository(EmployeeConfig)
    private readonly employeeConfigRepository: Repository<EmployeeConfig>,
    private readonly userService: UserService

  ) { }

  async create(req: RequestWithUser, createEmployeeConfigDto: CreateEmployeeConfigDto) {

    const {
      user_id,
      company_id,
      employee_config_afternoon_departure,
      employee_config_afternoon_entrance,
      employee_config_morning_departure,
      employee_config_morning_entrance,
      work_Monday,
      work_Tuesday,
      work_Thursday,
      work_Wednesday,
      work_Friday,
      work_Saturday,
      work_Sunday
    } = createEmployeeConfigDto

    Validations.getInstance()
      .validateWithRegex(
        employee_config_morning_entrance,
        ValidType.SIMPLE_HOUR
      )

    Validations.getInstance()
      .validateWithRegex(
        employee_config_morning_departure,
        ValidType.SIMPLE_HOUR
      )

    Validations.getInstance()
      .validateWithRegex(
        employee_config_afternoon_entrance,
        ValidType.SIMPLE_HOUR
      )

    Validations.getInstance()
      .validateWithRegex(
        employee_config_afternoon_departure,
        ValidType.SIMPLE_HOUR
      )



    const config_is_registered = await this.getUserWithConfig(company_id, user_id)

    if (config_is_registered) {
      this.update(config_is_registered.employee_config_id, createEmployeeConfigDto)
    }

    const config = this.employeeConfigRepository.create(createEmployeeConfigDto)

    const user = await this.userService.findById(req, user_id)
    config.user = user
    config.work_Monday = work_Monday ? true : false
    config.work_Tuesday = work_Tuesday ? true : false
    config.work_Thursday = work_Thursday ? true : false
    config.work_Wednesday = work_Wednesday ? true : false
    config.work_Friday = work_Friday ? true : false
    config.work_Saturday = work_Saturday ? true : false
    config.work_Sunday = work_Sunday ? true : false
    config.is_active = true


    return this.employeeConfigRepository.save(config)

  }

  async findAllAdmin(req: RequestWithUser, filter: EmployeeFilter) {

    const { user_name, orderBy, sort, page, limit } = filter

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

    let config = this.employeeConfigRepository.createQueryBuilder('emp')
      .leftJoinAndSelect('emp.user', 'user')
      .leftJoinAndSelect('user.companys', 'company')
      .where('emp.is_active = true')

    const ids = req.user.company_ids



    if (req.user.profile !== 1) {
      config = config.andWhere('company.company_id IN (:...ids)', { ids })
    }

    const queryBuilder = await config
      .select([
        'emp.employee_config_morning_entrance',
        'emp.employee_config_morning_departure',
        'emp.employee_config_afternoon_entrance',
        'emp.employee_config_afternoon_departure',
        'emp.work_Monday',
        'emp.work_Tuesday',
        'emp.work_Wednesday',
        'emp.work_Thursday',
        'emp.work_Friday',
        'emp.work_Saturday',
        'emp.work_Sunday',
        'emp.create_at',
        'emp.update_at',
        'emp.is_active',
        'user.user_id',
        'user.user_name',
        'company.company_id',
        'company.company_name',

      ])




    if (user_name) {
      queryBuilder.andWhere(`user.user_name LIKE :name`, {
        name: `%${user_name}%`
      });
    }



    if (current_orderBy == SortingType.DATE) {
      queryBuilder.orderBy('emp.create_at', `${current_sort === 'DESC' ? 'DESC' : 'ASC'}`);
    } else {
      queryBuilder.orderBy('user.user_name', `${current_sort === 'DESC' ? 'DESC' : 'ASC'}`);
    }

    const res = await queryBuilder.getMany()

    return customPagination(res, current_page, current_limit, filter)

  }

  async getUserWithConfig(company_id: string, user_id: string) {

    const res = await this.employeeConfigRepository.createQueryBuilder('config')
      .leftJoinAndSelect('config.user', 'user')
      .leftJoinAndSelect('user.companys', 'company')
      .where('user.user_id = :user_id', { user_id })
      .andWhere('company.company_id = :company_id', { company_id })
      .select([
        'config.employee_config_morning_entrance',
        'config.employee_config_morning_departure',
        'config.employee_config_afternoon_entrance',
        'config.employee_config_afternoon_departure',
        'config.work_Monday',
        'config.work_Tuesday',
        'config.work_Wednesday',
        'config.work_Thursday',
        'config.work_Friday',
        'config.work_Saturday',
        'config.work_Sunday',
      ])
      .getOne()

    return res

  }

  async findOne(company_id: string, id: string) {
    const res = await this.employeeConfigRepository.createQueryBuilder('config')
      .leftJoinAndSelect('config.user', 'user')
      .leftJoinAndSelect('user.companys', 'company')
      .where('config.employee_config_id = :id', { id })
      .andWhere('company.company_id = :company_id', { company_id })
      .getOne()

    return res
  }

  async update(
    id: string,
    updateEmployeeConfigDto: UpdateEmployeeConfigDto
  ) {

    const {

      company_id,
      employee_config_afternoon_departure,
      employee_config_afternoon_entrance,
      employee_config_morning_departure,
      employee_config_morning_entrance,
      work_Monday,
      work_Tuesday,
      work_Thursday,
      work_Wednesday,
      work_Friday,
      work_Saturday,
      work_Sunday
    } = updateEmployeeConfigDto

    const is_registered = await this.findOne(company_id, id)

    if (!is_registered) {
      throw new NotFoundException(`Configuração não encontrada!`)
    }

    const config = await this.employeeConfigRepository.preload({
      employee_config_id: id,
      ...updateEmployeeConfigDto
    })


    if (employee_config_morning_entrance) {
      config.employee_config_morning_entrance = employee_config_morning_entrance
    }

    if (employee_config_morning_departure) {
      config.employee_config_morning_departure = employee_config_morning_departure
    }

    if (employee_config_afternoon_entrance) {
      config.employee_config_afternoon_entrance = employee_config_afternoon_entrance
    }

    if (employee_config_afternoon_departure) {
      config.employee_config_afternoon_departure = employee_config_afternoon_departure
    }

    if (work_Monday) {
      config.work_Monday = work_Monday ? true : false
    }

    if (work_Tuesday) {
      config.work_Tuesday = work_Tuesday ? true : false
    }

    if (work_Thursday) {
      config.work_Thursday = work_Thursday ? true : false
    }

    if (work_Wednesday) {
      config.work_Wednesday = work_Wednesday ? true : false
    }

    if (work_Friday) {
      config.work_Friday = work_Friday ? true : false
    }

    if (work_Saturday) {
      config.work_Saturday = work_Saturday ? true : false
    }

    if (work_Sunday) {
      config.work_Sunday = work_Sunday ? true : false
    }

    return this.employeeConfigRepository.save(config);
  }

  async remove(company_id: string, id: string) {

    const is_registered = await this.findOne(company_id, id)

    if (!is_registered) {
      throw new NotFoundException(`Configuração não encontrada!`)
    }


    return this.employeeConfigRepository.remove(is_registered);
  }
}
