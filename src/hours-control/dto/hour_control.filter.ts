import { ApiProperty } from "@nestjs/swagger";
import { FilterPagination } from "src/common/filter.pagination";



export class HourControlFilter extends FilterPagination {

    @ApiProperty()
    user_name: string

}