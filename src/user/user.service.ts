import { BadGatewayException, BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
// import { faker } from '@faker-js/faker';
import { Pagination } from 'nestjs-typeorm-paginate';
import { SortingType, ValidType } from 'src/common/Enums';
import { Utils } from 'src/common/Utils';
import { CodeRecoverInterface } from 'src/common/interfaces/email.interface';
import { RecoverInterface } from 'src/common/interfaces/recover.interface';
import { RequestWithUser } from 'src/common/interfaces/user.request.interface';
import { customPagination } from 'src/common/pagination/custom.pagination';
import { Validations } from 'src/common/validations';
import { CompanyService } from 'src/company/company.service';
import { MailService } from 'src/mail/mail.service';
import { ProfileService } from 'src/profile/profile.service';
import { Repository } from 'typeorm';
import { FilterUser } from './dto/Filter.user';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {



  private readonly logger = new Logger(UserService.name)

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly profileService: ProfileService,
    private readonly mailservice: MailService,
    private readonly companyService: CompanyService


  ) { }



  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {



    try {

      const {
        user_name,
        user_profile_id: profile_id,
        user_email,
        user_password,
        user_date_of_birth,
        company_ids
      } = createUserDto



      if (company_ids.length <= 0) {
        throw new BadGatewayException(`Id da empresa não foi informado!`)
      }

      if (user_name.trim() == '' || user_name == undefined) {
        throw new BadRequestException(`O nome não pode estar vazio`)
      }

      if (user_email.trim() == '' || user_email == undefined) {
        throw new BadRequestException(`O email não pode estar vazio`)
      }

      const user = this.userRepository.create(createUserDto)

      user.user_name = user_name.toUpperCase()

      Validations.getInstance().validateWithRegex(
        user.user_name,
        ValidType.NO_MANY_SPACE,
        ValidType.NO_SPECIAL_CHARACTER,
        ValidType.IS_STRING
      )

      Validations.getInstance().validateWithRegex(
        user.user_email,
        ValidType.IS_EMAIL,
        ValidType.NO_SPACE
      )

      Validations.getInstance().verifyLength(
        user.user_name, 'Name', 5, 40
      )

      const userIsRegistered = await this.findByName(user.user_name)


      if (userIsRegistered) {
        throw new BadRequestException(`user already registered`)
      }

      const emailIsRegistered = await this.findByEmail(user.user_email)

      if (emailIsRegistered) {
        throw new BadRequestException(`email already registered`)
      }

      user.user_password = await Utils.getInstance().encryptPassword(user_password)

      const profile = await this.profileService.findById(profile_id)
      if (!profile) {
        throw new NotFoundException(`Perfil não encontrado`)
      }

      let companies = []

      for (let comp of company_ids) {


        const current_company = await this.companyService.findById(comp)


        if (!current_company) {
          throw new NotFoundException(`Empresa não encontrada!`)
        }

        companies.push(current_company)

      }



      user.profile = profile
      user.user_status = true
      user.user_first_access = true
      user.companys = companies


      console.log(user);

      const dateParts = user_date_of_birth.split("/");
      user.user_date_of_birth = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));

      const userSaved = await this.userRepository.save(user)

      const userDto: UserResponseDto = plainToClass(UserResponseDto, userSaved, {
        excludeExtraneousValues: true
      });

      return userDto

    } catch (error) {
      this.logger.error(`createUser error: ${error.message}`, error.stack);
      throw error
    }

  }

  async findAll(req: RequestWithUser, filter: FilterUser): Promise<Pagination<UserEntity>> {



    try {
      const { sort, orderBy, user_name, showActives, page, limit } = filter;





      let userQuery = this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.companys', 'company')
        .leftJoinAndSelect('user.profile', 'profile')
        .leftJoinAndSelect('user.employee_config', 'config')

      const ids = req.user.company_ids
      if (req.user.profile !== 1) {
        userQuery = userQuery.andWhere('company.company_id IN (:...ids)', { ids })
      }

      const user = await userQuery
        .select([
          'user.user_id',
          'user.user_name',
          'user.user_email',
          'user.user_status',
          'company.company_id',
          'company.company_name',
          'profile.profile_name',
        ]).addSelect('config')


      if (showActives === "true") {
        user.andWhere('user.user_status = true');
      } else if (showActives === "false") {
        user.andWhere('user.user_status = false');
      }


      if (user_name) {
        user.andWhere(`user.user_name LIKE :user_name`, {
          user_name: `%${user_name}%`
        });
      }
      if (orderBy == SortingType.DATE) {
        user.orderBy('user.create_at', `${sort === 'DESC' ? 'DESC' : 'ASC'}`);
      } else {
        user.orderBy('user.user_name', `${sort === 'DESC' ? 'DESC' : 'ASC'}`);
      }

      const res = await user.getMany()

      return customPagination(res, page, limit, filter);

    } catch (error) {
      this.logger.error(`findAll error: ${error.message}`, error.stack)
      throw error;
    }
  }

  async findByEmail(email: string) {
    try {
      return this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.profile', 'profile')
        .leftJoinAndSelect('user.companys', 'company')
        .where('user.user_email = :user_email', { user_email: email })
        .getOne()

    } catch (error) {
      this.logger.error(`findByEmail error: ${error.message}`, error.stack)
      throw error
    }
  }

  async findUserByEmail(req: RequestWithUser, email: string) {
    try {


      let userQuery = this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.profile', 'profile')
        .leftJoinAndSelect('user.companys', 'company')
        .where('user.user_email = :user_email', { user_email: email })

      const ids = req.user.company_ids
      if (req.user.profile !== 1) {
        userQuery = userQuery.andWhere('company.company_id IN (:...ids)', { ids })
      }

      const user = await userQuery
        .select([
          'user.user_id',
          'user.user_name',
          'user.user_email',
          'user.user_status',
          'profile.profile_name',
          'company.company_id',
          'company.company_name',
          'company.company_cnpj',
        ])
        .getOne();

      return user;

    } catch (error) {
      this.logger.error(`findByEmail error: ${error.message}`, error.stack)
      throw error;
    }
  }




  async findById(req: RequestWithUser, id: string): Promise<any> {

    try {



      let userQuery = await this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.profile', 'profile')
        .leftJoinAndSelect('user.companys', 'company')
        .leftJoinAndSelect('user.employee_config', 'config')

      const ids = req.user.company_ids
      if (req.user.profile !== 1) {
        userQuery = userQuery.andWhere('company.company_id IN (:...ids)', { ids })
      }

      const user = await userQuery
        .select([
          'user.user_id',
          'user.user_name',
          'user.user_email',
          'user.user_status',
          'profile.profile_name',
          'company.company_name',
          'company.company_cnpj',
          'user.create_at',
          'user.update_at',
        ])
        .addSelect('config')
        .where('user.user_id = :user_id', { user_id: id })
        .getOne()


      return user

    } catch (error) {
      this.logger.error(`findById error: ${error.message}`, error.stack)
      throw error
    }

  }


  async findByName(name: string): Promise<any> {
    try {


      return this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.profile', 'profile')
        .leftJoinAndSelect('user.companys', 'company')
        .select([
          'user.user_id',
          'user.user_name',
          'user.user_email',
          'user.user_status',
          'profile.profile_name',
          'company.company_name',
          'company.company_cnpj',
          'user.create_at',
          'user.update_at',
        ])
        .where('user.user_name = :name', { name })
        .getOne()


    } catch (error) {
      this.logger.error(`findByName error: ${error.message}`, error.stack)
      throw error
    }
  }

  async update(req: RequestWithUser, id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {

    try {

      const {
        user_name,
        user_email,
        user_profile_id: profile_id,
        user_date_of_birth,
        company_ids

      } = updateUserDto


      if ((updateUserDto as any).user_password) {
        throw new BadRequestException(`A atualização da senha não é permitida através desta rota.`);
      }

      const isRegistered = await this.findById(req, id)

      if (!isRegistered) {
        throw new NotFoundException(`User does not exist`)
      }

      const user = await this.userRepository.preload({
        user_id: id,
        ...updateUserDto
      })


      if (user_name) {

        user.user_name = user_name.toUpperCase()

        Validations.getInstance().validateWithRegex(
          user.user_name,
          ValidType.NO_MANY_SPACE,
          ValidType.NO_SPECIAL_CHARACTER,
          ValidType.IS_STRING
        )

        Validations.getInstance().verifyLength(
          user.user_name, 'Name', 5, 40)

      }

      if (user_email) {

        user.user_email = user_email

      }

      if (company_ids.length > 0) {

        let companies = []

        for (let id of company_ids) {

          const current_company = await this.companyService.findById(id)
          companies.push(current_company)
          user.companys = companies

        }

      }


      if (profile_id) {

        const profile = await this.profileService.findById(profile_id)


        if (!profile) {
          throw new NotFoundException(`Perfil não encontrado`)
        }

        user.profile = profile
      }


      const [day, month, year] = user_date_of_birth.split("/")

      user.user_date_of_birth = new Date(+year, +month - 1, +day)



      await this.userRepository.save(user)

      return this.findById(req, id)

    } catch (error) {
      this.logger.error(`updateUser error: ${error.message}`, error.stack)
      throw error
    }
  }


  async deleteUser(req: RequestWithUser, id: string) {


    const isRegistered = await this.findById(req, id)

    if (!isRegistered) {
      throw new NotFoundException(`User does not exist`)
    }

    await this.userRepository.remove(isRegistered)


  }

  async changeStatus(req: RequestWithUser, id: string) {

    try {

      const userSaved = await this.findById(req, id)

      if (!userSaved) {
        throw new NotFoundException(`User does not exist`)
      }

      const { user_status: status } = userSaved

      userSaved.user_status = status === true ? false : true

      return this.userRepository.save(userSaved)

    } catch (error) {
      this.logger.error(`changeStatus error: ${error.message}`, error.stack)
      throw error
    }
  }

  async updateRefreshToken(id: string, refresh_token: string) {

    try {

      const user = await this.userRepository.findOne({
        where: {
          user_id: id
        }
      })

      if (!user) {
        throw new NotFoundException(`user with id ${id} does not exist`)
      }

      user.user_refresh_token = refresh_token

      await this.userRepository.save(user)

    } catch (error) {
      this.logger.error(`updateRefreshToken error: ${error.message}`, error.stack)
      throw error
    }
  }

  async changeFirstAccess(id: string) {

    try {

      const userSaved = await this.userRepository.findOne({
        where: {
          user_id: id
        }
      })

      if (!userSaved) {
        throw new NotFoundException(`user with id ${id} does not exist`)
      }

      const { user_first_access: status } = userSaved

      if (status) {

        userSaved.user_first_access = false

        await this.userRepository.save(userSaved)

        return {
          Status: 'Success',
          Message: 'first access status successfully modified'
        }
      }

      return {
        Status: 'Fail',
        Message: 'This is not the first login since this user'
      }

    } catch (error) {
      this.logger.error(`changeFirstAccess error: ${error.message}`, error.stack)
      throw error
    }

  }



  async resetPassword(recover: RecoverInterface) {

    try {

      const { code, password, email } = recover

      const user = await this.userRepository.findOne({
        where: {
          user_email: email,
          user_recovery_code: code
        }
      })

      if (!user) {
        throw new BadRequestException(`O código: ${code} não é válido!`)
      }

      user.user_password = await Utils.getInstance().encryptPassword(password)
      user.user_recovery_code = null

      this.userRepository.save(user)

    } catch (error) {
      this.logger.error(`resetPass error: ${error.message}`, error.stack)
      throw error
    }
  }



  async haveAdmin(name: string) {

    try {

      const admin = await this.userRepository.findOne({
        where: {
          user_name: name.toUpperCase()
        }
      })

      if (admin) {
        return true
      } else {
        return false
      }

    } catch (error) {
      this.logger.error(`haveAdmin error: ${error.message}`, error.stack)
      throw error
    }

  }


  async recoverCode(email: string) {

    try {
      const user = await this.findByEmail(email)


      if (!user) {
        throw new NotFoundException(`O email informado é inválido!`)
      }


      const currentDate = this.getCurrentDate()




      const code = this.generateCode()

      user.user_recovery_code = code
      user.user_recovery_date = new Date()


      await this.userRepository.save(user)

      const codeRecover: CodeRecoverInterface = {
        name: user.user_name,
        code: code,
        email: user.user_email
      }



      this.mailservice.sendMail(codeRecover)

      setTimeout(async () => {
        await this.clearCode(user)
      }, 5 * 60 * 1000)


    } catch (error) {
      this.logger.error(`recoverCode error: ${error.message}`, error.stack);
      throw error
    }


  }


  getCurrentDate() {

    const currentdate = new Date()
    const day: string = String(currentdate.getDate()).padStart(2, '0')
    const month: string = String(currentdate.getMonth() + 1).padStart(2, '0')
    const year: number = currentdate.getFullYear()

    return `${year}-${month}-${day}`

  }

  async clearCode(user: UserEntity) {
    user.user_recovery_code = null
    await this.userRepository.save(user)
  }


  generateCode() {
    const minNumber = 100000;
    const maxNumber = 999999;

    const randomNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    return randomNumber
  }
















}




