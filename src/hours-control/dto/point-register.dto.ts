import { ApiProperty } from "@nestjs/swagger";
import { RegisterPointType } from "src/common/Enums";




export class PointRegisterDto {

    @ApiProperty({ required: true })
    user_id: string


    @ApiProperty({ required: true, enum: RegisterPointType })
    point_type: RegisterPointType

}