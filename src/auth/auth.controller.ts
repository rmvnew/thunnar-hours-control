/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, HttpCode, Post, Req, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicRoute } from 'src/common/decorators/public_route.decorator';
import { RequestWithUser } from 'src/common/interfaces/user.request.interface';
import { LoginDTO } from './dto/login.dto';
import { AuthService } from './shared/auth.service';
import { CompanyGuard } from './shared/guards/employeeCompany.guard';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './shared/guards/jwt.refresh-auth.guard';
import { LocalAuthGuard } from './shared/guards/local-auth.guard';


@ApiTags('Login')
@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService,
    ) { }


    @Post('/login')
    @PublicRoute()
    @HttpCode(200)
    @UseGuards(LocalAuthGuard)
    @ApiOperation({ description: '## Route to login - [Public]' })
    @ApiBody({
        description: '## O twoFactorCode é uma variável `opcional`. O uso desta variável é `obrigatório` apenas quando o usuário ativa a autenticação de dois fatores.',
        type: LoginDTO
    })
    async auth(@Body() auth: LoginDTO) {
        return this.authService.login(auth)
    }

    @Post('/logout')
    @ApiBearerAuth()
    @ApiExcludeEndpoint()
    @UseGuards(CompanyGuard, JwtAuthGuard)
    async logout(
        @Req() req: RequestWithUser,
        @Request() payload: any
    ) {
        return this.authService.removeRefreshToken(req, payload.user.sub);
    }

    @Post('/refresh_token')
    @ApiBearerAuth()
    @PublicRoute()
    // @ApiExcludeEndpoint()
    @UseGuards(JwtRefreshAuthGuard)
    async refreshToken(@Request() payload: any) {



        return this.authService.refreshToken(payload.user.id, payload.user.refresh_token);
    }


    @Post('/validate')
    @ApiBearerAuth()
    @ApiExcludeEndpoint()
    @UseGuards(JwtAuthGuard)
    validateToken(@Request() req): any {
        return { userId: req.user.sub, name: req.user.name };
    }




}
