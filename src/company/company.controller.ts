import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { getCompanies } from 'src/common/routes.path';
import { CompanyService } from './company.service';
import { CompanyFilter } from './dto/company.filter';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) { }

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  findAll(
    @Query() filter: CompanyFilter
  ) {
    filter.route = getCompanies()
    return this.companyService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyService.remove(+id);
  }
}
