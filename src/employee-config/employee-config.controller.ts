import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import AccessProfile from 'src/auth/enums/permission.type';
import { PermissionGuard } from 'src/auth/shared/guards/permission.guard';
import { CreateEmployeeConfigDto } from './dto/create-employee-config.dto';
import { EmployeeFilter } from './dto/employee.filter';
import { UpdateEmployeeConfigDto } from './dto/update-employee-config.dto';
import { EmployeeConfigService } from './employee-config.service';

@Controller('employee-config')
@ApiTags('Employee Config')
@ApiBearerAuth()

export class EmployeeConfigController {
  constructor(private readonly employeeConfigService: EmployeeConfigService) { }

  @Post()
  @UseGuards(PermissionGuard(AccessProfile.ADMIN))
  @ApiOperation({
    summary: 'Criar a configuração do funcionário.',
    description: `# Esta rota adiciona uma nova configuração para o usuário.
    Tipo: Autenticada. 
    Acesso: [Administrador]` })

  @ApiBody({
    description: '## Schema padrão para criar configuração do usuário.',
    type: CreateEmployeeConfigDto
  })
  async create(@Body() createEmployeeConfigDto: CreateEmployeeConfigDto) {
    return this.employeeConfigService.create(createEmployeeConfigDto);
  }

  @Get()
  @UseGuards(PermissionGuard(AccessProfile.ADMIN))
  @ApiOperation({
    summary: 'Buscar todas Configurações.',
    description: `# Esta rota busca todas configurações dos usuários.
    Tipo: Autenticada. 
    Acesso: [Administrador ]` })

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
  @ApiQuery({ name: 'user_name', required: false, description: '### Este é um filtro opcional!' })
  @ApiQuery({ name: 'company_id', required: true, description: '### Id da empresa.' })
  async findAll(
    @Query('company_id', ParseUUIDPipe) company_id: string,
    @Query() filter: EmployeeFilter
  ) {
    return this.employeeConfigService.findAll(company_id, filter);
  }

  @Get(':id')
  @UseGuards(PermissionGuard(AccessProfile.ADMIN))
  @ApiOperation({
    summary: 'Buscar configuração por Id.',
    description: `# Esta rota busca um usuário pelo Id.
    Tipo: Autenticada. 
    Acesso: [Administrador]` })
  @ApiParam({ name: 'id', description: 'Id da configuração. ' })
  @ApiQuery({ name: 'company_id', required: true, description: '### Id da empresa.' })
  async findOne(
    @Param('id') id: string,
    @Query('company_id', ParseUUIDPipe) company_id: string,
  ) {
    return this.employeeConfigService.findOne(company_id, id);
  }

  @Put(':id')
  @UseGuards(PermissionGuard(AccessProfile.ADMIN))
  @ApiOperation({
    summary: 'Atualizar uma configuração.',
    description: `# Esta rota atualiza a configuração usuário pelo Id.
    Tipo: Autenticada. 
    Acesso: [Administrador]` })
  @ApiParam({ name: 'id', description: 'Id da configuração. ' })
  @ApiBody({
    description: '## Schema padrão para atualizar uma configuração. ',
    type: UpdateEmployeeConfigDto
  })
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeConfigDto: UpdateEmployeeConfigDto
  ) {
    return this.employeeConfigService.update(id, updateEmployeeConfigDto);
  }

  @Delete(':id')
  @UseGuards(PermissionGuard(AccessProfile.ADMIN))
  @ApiOperation({
    summary: 'Deletar a configuração do usuário',
    description: `# Esta rota deleta a configuração de um usuário pelo Id.
    Tipo: Autenticada. 
    Acesso: [Administrador]` })
  @ApiParam({ name: 'id', description: '### Id da configuração. ' })
  @ApiQuery({ name: 'company_id', required: true, description: '### Id da empresa.' })
  async remove(
    @Query('company_id', ParseUUIDPipe) company_id: string,
    @Param('id') id: string
  ) {
    return this.employeeConfigService.remove(company_id, id);
  }
}
