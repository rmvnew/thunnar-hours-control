import { Expose } from "class-transformer"
import { AddressResponseDto } from "src/address/dto/address.response.dto"
import { UserGenderType } from "src/common/Enums"


export class UserResponseDto {

    @Expose()
    user_id: string

    @Expose()
    user_name: string

    @Expose()
    user_email: string

    @Expose()
    user_phone: string

    @Expose()
    user_genre?: UserGenderType

    @Expose()
    user_rg?: string

    @Expose()
    user_cpf?: string

    @Expose()
    user_status: boolean

    @Expose()
    user_date_of_birth: string

    @Expose()
    user_enrollment: string

    @Expose()
    user_profile_id: number

    @Expose()
    address: AddressResponseDto

    @Expose()
    create_at: Date

    @Expose()
    update_at: Date


}