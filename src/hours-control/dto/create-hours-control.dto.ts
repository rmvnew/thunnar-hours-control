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
    hours_control_extra?: string | null;

    @ApiProperty({ required: false })
    hours_control_extra_minuts?: number | null;

    @ApiProperty({ required: false })
    hours_control_delay?: string;

    @ApiProperty({ required: false })
    lack?: string;

    @ApiProperty({ required: false })
    to_compensate?: string;

    @ApiProperty({ required: true })
    user_id: string


}
