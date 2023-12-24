import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SortingType } from 'src/common/Enums';
import { customPagination } from 'src/common/pagination/custom.pagination';
import { Equal, Not, Repository } from 'typeorm';
import { CompanyFilter } from './dto/company.filter';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';

@Injectable()
export class CompanyService {

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>
  ) { }

  async create(createCompanyDto: CreateCompanyDto) {

    const { company_name: name } = createCompanyDto

    const company_is_registered = await this.findByName(name.toLocaleUpperCase())

    if (company_is_registered) {
      throw new BadRequestException(`A empresa ${name} já está cadastrada!`)
    }

    const current_company = this.companyRepository.create(createCompanyDto)
    current_company.is_active = true
    current_company.company_name = name.toLocaleUpperCase()

    return this.companyRepository.save(current_company);
  }

  async findByName(name: string) {
    return this.companyRepository.findOne({
      where: {
        company_name: name,
        is_active: Not(Equal(false)),
      }
    })
  }

  async haveCompany(name: string) {
    const res = await this.companyRepository.findOne({
      where: {
        company_name: name,
        is_active: Not(Equal(false)),
      }
    })

    if (res) {
      return true
    } else {
      return false
    }
  }

  async findAll(filter: CompanyFilter) {


    const { company_cnpj, company_name, orderBy, sort, page, limit } = filter

    const queryBuilder = this.companyRepository.createQueryBuilder('company')
      .leftJoinAndSelect('company.users', 'user')
      .select([
        'company.company_id',
        'company.company_name',
        'company.company_cnpj',
        'company.create_at',
        'company.update_at',
        'company.is_active',
        'user.user_name'
      ])
      .where('company.is_active = true')


    if (company_name) {
      queryBuilder.andWhere(`company.company_name LIKE :name`, {
        name: `%${company_name}%`
      });
    }

    if (orderBy == SortingType.DATE) {
      queryBuilder.orderBy('company.create_at', `${sort === 'DESC' ? 'DESC' : 'ASC'}`);
    } else {
      queryBuilder.orderBy('company.company_name', `${sort === 'DESC' ? 'DESC' : 'ASC'}`);
    }

    const res = await queryBuilder.getMany()




    return customPagination(res, page, limit, filter)
  }

  async findById(id: string) {
    return this.companyRepository.findOne({
      where: {
        company_id: id,
        is_active: Not(Equal(false)),
      }
    })
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto) {



    return `This action updates a #${id} company`;
  }

  async remove(id: number) {
    return `This action removes a #${id} company`;
  }
}
