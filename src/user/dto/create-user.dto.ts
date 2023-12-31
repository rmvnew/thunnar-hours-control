import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

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
    user_date_of_birth: string;

    @ApiProperty()
    company_ids: string[]



}
