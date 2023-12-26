import { ApiProperty } from "@nestjs/swagger";


export class CreateEmployeeConfigDto {

    @ApiProperty({ required: true })
    user_id: string

    @ApiProperty({ required: true })
    company_id: string

    @ApiProperty({ required: true })
    employee_config_morning_entrance: string | null;

    @ApiProperty({ required: true })
    employee_config_morning_departure: string | null;

    @ApiProperty({ required: true })
    employee_config_afternoon_entrance: string | null;

    @ApiProperty({ required: true })
    employee_config_afternoon_departure: string | null;

    @ApiProperty({ required: true })
    work_Monday: boolean | null

    @ApiProperty({ required: true })
    work_Tuesday: boolean | null

    @ApiProperty({ required: true })
    work_Wednesday: boolean | null

    @ApiProperty({ required: true })
    work_Thursday: boolean | null

    @ApiProperty({ required: true })
    work_Friday: boolean | null

    @ApiProperty({ required: true })
    work_Saturday: boolean | null

    @ApiProperty({ required: true })
    work_Sunday: boolean | null

}
