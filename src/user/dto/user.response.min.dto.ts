import { Expose } from "class-transformer"


export class UserResponseMinDto {

    @Expose()
    user_id: string

    @Expose()
    user_name: string

    @Expose()
    user_email: string

    @Expose()
    user_status: boolean

    @Expose()
    user_profile_name: string

    @Expose()
    create_at: Date

    @Expose()
    update_at: Date


}