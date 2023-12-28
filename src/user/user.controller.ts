import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Pagination } from 'nestjs-typeorm-paginate';
import AccessProfile from 'src/auth/enums/permission.type';
import { CompanyGuard } from 'src/auth/shared/guards/employeeCompany.guard';
import { PermissionGuard } from 'src/auth/shared/guards/permission.guard';
import { PublicRoute } from 'src/common/decorators/public_route.decorator';
import { RecoverInterface } from 'src/common/interfaces/recover.interface';
import { RequestWithUser } from 'src/common/interfaces/user.request.interface';
import { getUserPath } from 'src/common/routes.path';
import { FilterUser } from './dto/Filter.user';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';


@Controller('user')
@ApiTags('User')
@ApiBearerAuth()

// @ApiExcludeEndpoint()

export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @UseGuards(PermissionGuard(AccessProfile.ADMIN_MANAGER_OWNER))
  @ApiOperation({
    summary: 'Criar um usuário.',
    description: `# Esta rota adiciona um novo usuário.
    Tipo: Autenticada. 
    Acesso: [Administrador]` })

  @ApiBody({
    description: '## Schema padrão para criar usuário.',
    type: CreateUserDto
  })
  async create(
    @Body() createUserDto: CreateUserDto
  ): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }



  // @Get()
  // @UseGuards(PermissionGuard(AccessProfile.ADMIN))

  // @ApiOperation({
  //   summary: 'Buscar todos usuários.',
  //   description: `# Esta rota busca todos usuários.
  //   Tipo: Autenticada. 
  //   Acesso: [Administrador]` })

  // @ApiQuery({
  //   name: 'page',
  //   required: false,
  //   description: `### Número da Página. 
  //   Define o número da página de resultados a ser retornada. 
  //   Utilize este parâmetro para navegar através das páginas de resultados. 
  //   O número da página deve ser um inteiro positivo.`,
  // })

  // @ApiQuery({
  //   name: 'limit',
  //   required: false,
  //   description: `### Limite de Itens por Página. 
  //   Especifica o número máximo de itens a serem exibidos em uma única página. 
  //   Utilize este parâmetro para limitar a quantidade de dados retornados, 
  //   facilitando a visualização e a navegação.`,
  // })

  // @ApiQuery({
  //   name: 'sort',
  //   required: false,
  //   description: `### Direção da Ordenação. 
  //   Determina a direção da ordenação dos resultados. 
  //   Aceita os valores 'ASC' para ordenação crescente e 'DESC' para decrescente. 
  //   Este parâmetro é geralmente combinado com o 'orderBy' para definir 
  //   a ordem dos resultados de forma eficaz.`,
  // })

  // @ApiQuery({
  //   name: 'orderBy',
  //   required: false,
  //   description: `### Campo de Ordenação. 
  //   Especifica o atributo pelo qual os resultados devem ser ordenados.`,
  // })
  // @ApiQuery({ name: 'user_name', required: false, description: '### Este é um filtro opcional!' })
  // async findAllAdmin(

  //   @Query() filter: FilterUser
  // ): Promise<Pagination<UserEntity>> {

  //   filter.route = getUserPath();
  //   return this.userService.findAllAdmin(filter);
  // }




  @Get('/all')
  @UseGuards(CompanyGuard, PermissionGuard(AccessProfile.ADMIN_MANAGER_OWNER))

  @ApiOperation({
    summary: 'Buscar todos usuários.',
    description: `# Esta rota busca todos usuários.
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
  @ApiQuery({ name: 'user_name', required: false, description: '### Este é um filtro opcional!' })
  async findAll(
    @Req() req: RequestWithUser,
    @Query() filter: FilterUser
  ): Promise<Pagination<UserEntity>> {



    filter.route = getUserPath();
    return this.userService.findAll(req, filter);
  }


  @Post('/resetPass')
  @PublicRoute()
  @ApiOperation({
    summary: 'Definir nova senha para o usuário.',
    description: `# Esta rota redefine a senha do usuário.
    Tipo: Publica. 
    Acesso: [Livre]` })
  @ApiQuery({ name: 'code', description: '### Código especial, com duração de cinco minutos obtido através do email.' })
  @ApiQuery({ name: 'password', description: '### Nova senha. ' })
  @ApiQuery({ name: 'email', description: '### E-mail do usuário que está resetando a senha ' })
  async resetPassword(
    @Query('code') code: number,
    @Query('password') password: string,
    @Query('email') email: string,
  ) {

    const recover: RecoverInterface = {
      email: email,
      code: code,
      password: password
    }

    return this.userService.resetPassword(recover)
  }


  @Post('/recover-code')
  @PublicRoute()
  @ApiOperation({
    summary: 'Enviar código para redefinir a senha.',
    description: `# Esta rota dispara o email que contém o código para redefinição de senha.
    Tipo: Publica. 
    Acesso: [Livre]` })
  @ApiQuery({ name: 'email', description: '### E-mail do usuário que está resetando a senha. ' })
  async recoverCode(
    @Query('email') email: string
  ) {

    return this.userService.recoverCode(email)

  }


  @Get('/userEmail')
  @UseGuards(CompanyGuard, PermissionGuard(AccessProfile.ADMIN_MANAGER_OWNER))
  @ApiOperation({
    summary: 'Buscar usuário por email.',
    description: `# Esta rota busca um usuário pelo email.
    Tipo: Autenticada. 
    Acesso: [Todos]` })
  @ApiParam({ name: 'email', description: '### E-mail de cadastro do usuário. ' })
  async getUserByEmail(
    @Req() req: RequestWithUser,
    @Query('email') email: string
  ) {

    return this.userService.findUserByEmail(req, email)
  }



  /**
 
  params iten 
 
   */


  @Get(':id')
  @UseGuards(CompanyGuard, PermissionGuard(AccessProfile.ADMIN))
  @ApiOperation({
    summary: 'Buscar usuário por Id.',
    description: `# Esta rota busca um usuário pelo Id.
    Tipo: Autenticada. 
    Acesso: [Administrador]` })
  @ApiParam({ name: 'id', description: 'Id do usuário. ' })
  async findById(
    @Req() req: RequestWithUser,
    @Param('id') id: string
  ): Promise<UserResponseDto> {
    return this.userService.findById(req, id);
  }



  @Put(':id')
  @UseGuards(CompanyGuard, PermissionGuard(AccessProfile.ADMIN))
  @ApiOperation({
    summary: 'Atualizar um usuário.',
    description: `# Esta rota atualiza um usuário pelo Id.
    Tipo: Autenticada. 
    Acesso: [Administrador]` })
  @ApiParam({ name: 'id', description: 'Id do usuário. ' })
  @ApiBody({
    description: '## Schema padrão para atualizar um usuário. ',
    type: UpdateUserDto
  })
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    return this.userService.update(req, id, updateUserDto);
  }



  @Delete(':id')
  @UseGuards(CompanyGuard, PermissionGuard(AccessProfile.ADMIN))
  @ApiOperation({
    summary: 'Deletar usuário.',
    description: `# Esta rota deleta um usuário.
    Tipo: Autenticada. 
    Acesso: [Administrador]` })
  @ApiParam({ name: 'id', description: '### Id do usuário. ' })
  async delete(
    @Req() req: RequestWithUser,
    @Param('id') id: string
  ) {
    return this.userService.deleteUser(req, id)
  }


  @Patch('/status/:id')
  @UseGuards(CompanyGuard, PermissionGuard(AccessProfile.ADMIN))
  @ApiOperation({
    summary: 'Mudar status de um usuário.',
    description: `# Esta rota habilita e desabilita um usuário pelo Id.
    Tipo: Autenticada. 
    Acesso: [Administrador]` })
  @ApiParam({ name: 'id', description: '### Id do usuário. ' })
  async changeStatus(
    @Req() req: RequestWithUser,
    @Param('id') id: string
  ): Promise<UserEntity> {
    return this.userService.changeStatus(req, id);
  }



}
