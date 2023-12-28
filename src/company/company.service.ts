import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SortingType } from 'src/common/Enums';
import { Utils } from 'src/common/Utils';
import { customPagination } from 'src/common/pagination/custom.pagination';
import { Equal, Not, Repository } from 'typeorm';
import * as XLSX from 'xlsx';
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

    const { company_name: name, company_cnpj } = createCompanyDto

    const company_is_registered = await this.findByName(name.toLocaleUpperCase())

    if (company_is_registered) {
      throw new BadRequestException(`A empresa ${name} já está cadastrada!`)
    }

    const current_company = this.companyRepository.create(createCompanyDto)
    current_company.is_active = true
    current_company.company_name = name.toLocaleUpperCase()

    if (company_cnpj) {
      const result_cnpj = Utils.getInstance().validateCNPJ(company_cnpj)
      if (result_cnpj.status || (name.toUpperCase() === process.env.DEFAULT_COMPANY)) {
        current_company.company_cnpj = result_cnpj.cnpj
      } else {
        throw new BadGatewayException(`Cnpj Inválido: ${company_cnpj}`)
      }
    }

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

    if (company_cnpj) {
      queryBuilder.andWhere(`company.company_cnpj = :cnpj`, {
        cnpj: company_cnpj.replace(/[^\d]+/g, '')
      });
    }

    if (current_orderBy == SortingType.DATE) {
      queryBuilder.orderBy('company.create_at', `${current_sort === 'DESC' ? 'DESC' : 'ASC'}`);
    } else {
      queryBuilder.orderBy('company.company_name', `${current_sort === 'DESC' ? 'DESC' : 'ASC'}`);
    }

    const res = await queryBuilder.getMany()

    return customPagination(res, current_page, current_limit, filter)
  }

  async findById(id: string) {
    return this.companyRepository.findOne({
      where: {
        company_id: id,
        is_active: Not(Equal(false)),
      }
    })
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {


    const isRegistered = await this.findById(id)

    if (!isRegistered) {
      throw new NotFoundException(`Empresa não encontrada!`)
    }

    const { company_name, company_cnpj } = updateCompanyDto

    const current_company = await this.companyRepository.preload({
      company_id: id,
      ...updateCompanyDto
    })

    if (company_name) {
      current_company.company_name = company_name.toLocaleUpperCase()
    }

    if (company_cnpj) {
      const result_cnpj = Utils.getInstance().validateCNPJ(company_cnpj)
      if (result_cnpj.status || (company_name.toUpperCase() === process.env.DEFAULT_COMPANY)) {
        current_company.company_cnpj = result_cnpj.cnpj
      } else {
        throw new BadGatewayException(`Cnpj Inválido: ${company_cnpj}`)
      }
    }

    return this.companyRepository.save(current_company)
  }


  async changeStatus(id: string) {


    const company_is_registered = await this.companyRepository.findOne({
      where: {
        company_id: id
      }
    })

    if (!company_is_registered) {
      throw new NotFoundException(`Empresa não encontrada!`)
    }

    const { is_active: status } = company_is_registered

    company_is_registered.is_active = status ? false : true

    return this.companyRepository.save(company_is_registered)
  }



  async delete(id: string) {

    const company_is_registered = await this.companyRepository.findOne({
      where: {
        company_id: id
      }
    })

    if (!company_is_registered) {
      throw new NotFoundException(`Empresa não encontrada!`)
    }

    await this.companyRepository.remove(company_is_registered)

  }


  async processExcel(file: Express.Multer.File): Promise<any> {


    const workbook = XLSX.readFile(file.path);
    const sheetNames = workbook.SheetNames;
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);

    for (let item of data) {

      const current_name = item['company_name']
      const current_cnpj = item['company_cnpj']
      const current_responsible = item['company_responsible']

      const current_company: CreateCompanyDto = {
        company_name: current_name,
        company_cnpj: current_cnpj,
        company_responsible: current_responsible
      }


      await this.create(current_company)


    }


    return {
      data,
      status: 'Empresas importadas com sucesso!'
    }


  }



}
