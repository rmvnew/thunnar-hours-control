import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Length, Validate } from 'class-validator';
import { IsValidAgeConstraint } from './isValidAgeConstraint';

export class CreateUserDto {

    @ApiProperty()
    @Length(5, 50, { message: 'O Nome deve ter entre 5 e 50 caracteres.' })
    user_name: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'O email não pode estar vazio.' })
    user_email: string;

    @ApiProperty()
    @Length(5, 15, { message: 'A senha deve ter entre 5 e 15 caracteres.' })
    user_password?: string;

    @ApiProperty()
    user_profile_id: number;

    @ApiProperty()
    @Validate(IsValidAgeConstraint, { message: 'A idade deve estar entre 4 e 100 anos.' }) // Use o novo validador aqui
    user_date_of_birth: string;

    @IsOptional()
    user_crp?: string;

    @ApiProperty()
    company_id: string



}
