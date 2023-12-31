import { ApiProperty } from '@nestjs/swagger';

export class CreateUserByUploadDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    file: Express.Multer.File;

    @ApiProperty({ type: 'string' })
    company_id: string;
}
