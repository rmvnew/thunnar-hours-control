import { Expose } from "class-transformer"
import { ProfileResponseDto } from "src/profile/dto/profile.response.dto"


export class UserResponseLoginDto {

    @Expose()
    user_id: string

    @Expose()
    user_name: string

    @Expose()
    user_email: string

    @Expose()
    user_status: boolean

    @Expose()
    user_date_of_birth: string

    @Expose()
    profile: ProfileResponseDto

    @Expose()
    create_at: Date

    @Expose()
    update_at: Date


}