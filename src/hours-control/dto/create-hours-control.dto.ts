import { ApiProperty } from "@nestjs/swagger";


export class CreateHoursControlDto {


    @ApiProperty({ required: false })
    hours_control_morning_entrance?: string | null;

    @ApiProperty({ required: false })
    hours_control_morning_departure?: string | null;

    @ApiProperty({ required: false })
    hours_control_afternoon_entrance?: string | null;

    @ApiProperty({ required: false })
    hours_control_afternoon_departure?: string | null;

    @ApiProperty({ required: false })
    hours_control_extra_entrance?: string | null;

    @ApiProperty({ required: false })
    hours_control_extra_exit?: string | null;

    @ApiProperty({ required: false })
    delay?: string;

    @ApiProperty({ required: false })
    lack?: string;

    @ApiProperty({ required: false })
    to_compensate?: string;

    @ApiProperty({ required: true })
    user_id: string


}
