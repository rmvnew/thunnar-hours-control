import { ApiProperty } from "@nestjs/swagger";
import { FilterPagination } from "src/common/filter.pagination";





export class CompanyFilter extends FilterPagination {

    @ApiProperty()
    company_name: string

    @ApiProperty()
    company_cnpj: string

}