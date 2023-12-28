import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import AccessProfile from 'src/auth/enums/permission.type';
import { PermissionGuard } from 'src/auth/shared/guards/permission.guard';
import { getCompanies } from 'src/common/routes.path';
import { CompanyService } from './company.service';
import { CompanyFilter } from './dto/company.filter';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('company')
@ApiTags('Company')
@ApiBearerAuth()


export class CompanyController {
  constructor(private readonly companyService: CompanyService) { }

  @Post()
  @UseGuards(PermissionGuard(AccessProfile.ADMIN))
  @ApiOperation({
    summary: 'Criar Empresa.',
    description: `# Esta rota adiciona uma nova Empresa.
    Tipo: Autenticada. 
    Acesso: [Administrador]` })

  @ApiBody({
    description: '## Schema padrão para criar uma empresa.',
    type: CreateCompanyDto
  })
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  @UseGuards(PermissionGuard(AccessProfile.ADMIN))

  @ApiOperation({
    summary: 'Buscar todas empresas.',
    description: `# Esta rota busca todas empresas.
    Tipo: Autenticada. 
    Acesso: [Administrador]` })

  @ApiQuery({
    name: 'page',
    required: false,
    description: `### Número da Página. 
    Define o número da página de resultados a ser retornada. 
    Utilize este parâmetro para navegar através das páginas de resultados. 
    O número da página deve ser um inteiro positivo.`,
  })

  @ApiQuery({
    name: 'limit',
    required: false,
    description: `### Limite de Itens por Página. 
    Especifica o número máximo de itens a serem exibidos em uma única página. 
    Utilize este parâmetro para limitar a quantidade de dados retornados, 
    facilitando a visualização e a navegação.`,
  })

  @ApiQuery({
    name: 'sort',
    required: false,
    description: `### Direção da Ordenação. 
    Determina a direção da ordenação dos resultados. 
    Aceita os valores 'ASC' para ordenação crescente e 'DESC' para decrescente. 
    Este parâmetro é geralmente combinado com o 'orderBy' para definir 
    a ordem dos resultados de forma eficaz.`,
  })

  @ApiQuery({
    name: 'orderBy',
    required: false,
    description: `### Campo de Ordenação. 
    Especifica o atributo pelo qual os resultados devem ser ordenados.`,
  })

  @ApiQuery({ name: 'company_name', required: false, description: '### Este é um filtro opcional!' })
  @ApiQuery({ name: 'company_cnpj', required: false, description: '### Este é um filtro opcional!' })
  async findAll(
    @Query() filter: CompanyFilter
  ) {
    filter.route = getCompanies()
    return this.companyService.findAll(filter);
  }



  @Post('excel')
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcelFile(@UploadedFile() file: Express.Multer.File) {
    return this.companyService.processExcel(file);
  }


  @Get(':id')
  @UseGuards(PermissionGuard(AccessProfile.ADMIN))
  @ApiOperation({
    summary: 'Buscar empresa por Id.',
    description: `# Esta rota busca uma empresa por Id.
    Tipo: Autenticada. 
    Acesso: [Administrador]` })
  @ApiParam({
    name: 'id',
    required: true,
    description: `#### ID do Registro.
      Este parâmetro é obrigatório e deve ser fornecido na URL da requisição. 
      Ele identifica unicamente o registro a ser encontrado. 
      Forneça o ID do registro que você deseja consultar.`,
  })
  async findById(@Param('id') id: string) {
    return this.companyService.findById(id);
  }

  @Put(':id')
  @UseGuards(PermissionGuard(AccessProfile.ADMIN))
  @ApiOperation({
    summary: 'Atualizar Empresa.',
    description: `# Esta rota atualiza uma empresa.
    Tipo: Autenticada. 
    Acesso: [Administrador]`,
  })
  @ApiBody({
    description: '## Schema padrão para atualizar uma empresa.',
    type: UpdateCompanyDto,
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: `#### ID do Registro para Atualização.
    Este parâmetro é obrigatório e deve ser fornecido na URL da requisição. 
    Ele identifica unicamente o registro que será atualizado. 
    Forneça o ID do registro específico que você deseja atualizar. 
    A identificação correta garante que as alterações sejam aplicadas ao registro apropriado.`,
  })
  async update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(id, updateCompanyDto);
  }

  @Patch(':id')
  @UseGuards(PermissionGuard(AccessProfile.ADMIN))
  @ApiOperation({
    summary: 'Mudar status de uma empresa.',
    description: `# Esta rota muda o status de uma empresa.
    Tipo: Autenticada. 
    Acesso: [Administrador]`,
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: `#### ID do Registro para Atualização.
    Este parâmetro é obrigatório e deve ser fornecido na URL da requisição. 
    Ele identifica unicamente o registro que será atualizado. 
    Forneça o ID do registro específico que você deseja atualizar. 
    A identificação correta garante que as alterações sejam aplicadas ao registro apropriado.`,
  })
  async changeStatus(@Param('id') id: string) {
    return this.companyService.changeStatus(id);
  }


  @Delete(':id')
  @UseGuards(PermissionGuard(AccessProfile.ADMIN))
  @ApiOperation({
    summary: 'Deletar uma empresa.',
    description: `# Esta rota deleta uma empresa.
    Tipo: Autenticada. 
    Acesso: [Administrador]`,
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: `#### ID do Registro para Atualização.
    Este parâmetro é obrigatório e deve ser fornecido na URL da requisição. 
    Ele identifica unicamente o registro que será atualizado. 
    Forneça o ID do registro específico que você deseja atualizar. 
    A identificação correta garante que as alterações sejam aplicadas ao registro apropriado.`,
  })

  async delete(@Param('id') id: string) {
    this.companyService.delete(id)
  }

}
