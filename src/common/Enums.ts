export enum VerifyCredentials {
    verify_email = 'email',
    verify_password = 'password'
}

export enum SqlType {
    SQL = 'SQL',
    NORMAL = 'NORMAL'
}

export enum RegisterPointType {
    MORNING_ENTRANCE = 'MORNING_ENTRANCE',
    MORNING_DEPARTURE = 'MORNING_DEPARTURE',
    AFTERNOON_ENTRANCE = 'AFTERNOON_ENTRANCE',
    AFTERNOON_DEPARTURE = 'AFTERNOON_DEPARTURE',
    EXTRA_ENTRANCE = 'EXTRA_ENTRANCE',
    EXTRA_DEPARTURE = 'EXTRA_DEPARTURE'
}


export enum SumType {
    MORNING = 'MORNING',
    AFTERNOON = 'AFTERNOON'
}

export enum SortingType {
    ID = 'ID',
    NAME = 'NAME',
    DATE = 'DATE',
    NUMBER = 'NUMBER',
    FIRST_DATE = 'FIRST_DATE',
    LAST_DATE = 'LAST_DATE'
}


export enum ValidType {
    NO_SPACE = 'NO_SPACE',
    NO_MANY_SPACE = 'NO_MANY_SPACE',
    IS_STRING = 'IS_STRING',
    IS_NUMBER = 'IS_NUMBER',
    IS_NUMBER_FLOAT = 'IS_NUMBER_FLOAT',
    NO_SPECIAL_CHARACTER = 'NO_SPECIAL_CHARACTER',
    IS_EMAIL = 'IS_EMAIL',
    DATE = 'DATE',
    DATE_BR = 'DATE_BR',
    SIMPLE_HOUR = 'SIMPLE_HOUR',

}

export enum ObjectSize {
    INTEGER = 2147483646,
    DEFAULT_DAYS = 35
}

export enum ProfileValue {
    ADMIN_VALUE = 1,
    USER_VALUE = 2,
    MANAGER_VALUE = 3,
    OWNER_VALUE = 4


}

export enum ProfileType {
    ADMINISTRATOR = 'ADMINISTRATOR',
    USER = 'USER'
}

export enum UserType {
    PATIENT = 'patient',
    PSYCHOLOGIST = 'psychologist',
    ATTENDANT = 'attendant'
}


export enum UserGenderType {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    NON_BINARY = 'NON_BINARY',
    OTHER = 'OTHER'
}


