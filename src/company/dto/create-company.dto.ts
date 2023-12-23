import { ApiProperty } from "@nestjs/swagger"


export class CreateCompanyDto {

    @ApiProperty()
    company_name: string

    @ApiProperty()
    company_cnpj: string

    @ApiProperty()
    company_responsible: string

}
