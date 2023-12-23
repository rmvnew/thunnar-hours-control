import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    return 'This action adds a new company';
  }

  async findAll() {
    return `This action returns all company`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} company`;
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    return `This action updates a #${id} company`;
  }

  async remove(id: number) {
    return `This action removes a #${id} company`;
  }
}
