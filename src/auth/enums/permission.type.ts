import { ProfileValue } from "src/common/Enums";

let AccessProfile = {

    ADMIN: ProfileValue.ADMIN_VALUE,
    USER: ProfileValue.USER_VALUE,

    ADMIN_USER: [
        ProfileValue.ADMIN_VALUE,
        ProfileValue.USER_VALUE
    ],

}
export default AccessProfile;