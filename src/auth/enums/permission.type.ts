import { ProfileValue } from "src/common/Enums";

let AccessProfile = {
    ADMIN: ProfileValue.ADMIN_VALUE,
    USER: ProfileValue.USER_VALUE,
    MANAGER: ProfileValue.MANAGER_VALUE,
    OWNER: ProfileValue.OWNER_VALUE,

    ADMIN_USER: [
        ProfileValue.ADMIN_VALUE,
        ProfileValue.USER_VALUE
    ],
    ADMIN_MANAGER: [
        ProfileValue.ADMIN_VALUE,
        ProfileValue.MANAGER_VALUE
    ],
    ADMIN_OWNER: [
        ProfileValue.ADMIN_VALUE,
        ProfileValue.OWNER_VALUE
    ],
    USER_MANAGER: [
        ProfileValue.USER_VALUE,
        ProfileValue.MANAGER_VALUE
    ],
    USER_OWNER: [
        ProfileValue.USER_VALUE,
        ProfileValue.OWNER_VALUE
    ],
    MANAGER_OWNER: [
        ProfileValue.MANAGER_VALUE,
        ProfileValue.OWNER_VALUE
    ],
    ADMIN_USER_MANAGER: [
        ProfileValue.ADMIN_VALUE,
        ProfileValue.USER_VALUE,
        ProfileValue.MANAGER_VALUE
    ],
    ADMIN_USER_OWNER: [
        ProfileValue.ADMIN_VALUE,
        ProfileValue.USER_VALUE,
        ProfileValue.OWNER_VALUE
    ],
    ADMIN_MANAGER_OWNER: [
        ProfileValue.ADMIN_VALUE,
        ProfileValue.MANAGER_VALUE,
        ProfileValue.OWNER_VALUE
    ],
    USER_MANAGER_OWNER: [
        ProfileValue.USER_VALUE,
        ProfileValue.MANAGER_VALUE,
        ProfileValue.OWNER_VALUE
    ],
    ADMIN_USER_MANAGER_OWNER: [
        ProfileValue.ADMIN_VALUE,
        ProfileValue.USER_VALUE,
        ProfileValue.MANAGER_VALUE,
        ProfileValue.OWNER_VALUE
    ],
    // Continue adicionando outras combinações conforme necessário
};

export default AccessProfile;
