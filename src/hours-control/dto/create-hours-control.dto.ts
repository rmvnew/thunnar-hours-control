import { ApiProperty } from "@nestjs/swagger";


export class CreateHoursControlDto {


    @ApiProperty()
    hours_control_morning_entrance: Date | null;

    @ApiProperty()
    hours_control_morning_departure: Date | null;

    @ApiProperty()
    hours_control_afternoon_entrance: Date | null;

    @ApiProperty()
    hours_control_afternoon_departure: Date | null;

    @ApiProperty()
    hours_control_extra_entrance: Date | null;

    @ApiProperty()
    hours_control_extra_exit: Date | null;

    @ApiProperty()
    delay: string;

    @ApiProperty()
    lack: string;

    @ApiProperty()
    to_compensate: string;

    @ApiProperty()
    user_id: string


}
