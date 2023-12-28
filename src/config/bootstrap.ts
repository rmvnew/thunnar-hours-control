import { Injectable } from '@nestjs/common';
import { CompanyService } from 'src/company/company.service';
import { CreateCompanyDto } from 'src/company/dto/create-company.dto';
import { Company } from 'src/company/entities/company.entity';
import { CreateProfileDto } from 'src/profile/dto/create-profile.dto';
import { ProfileService } from 'src/profile/profile.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';


@Injectable()
export class Bootstrap {
    constructor(
        private readonly userService: UserService,
        private readonly profileService: ProfileService,
        private readonly companyService: CompanyService


    ) { }

    async onApplicationBootstrap() {


        const userHaveData = await this.userService.haveAdmin('sysadmin')

        const haveCompany = await this.companyService.haveCompany(process.env.DEFAULT_COMPANY)


        let currentProfile = null

        const profiles = ['ADMIN', 'USER', 'MANAGER', 'OWNER']

        for (let prof of profiles) {

            const profileHaveData = await this.profileService.haveProfile(prof)

            if (!profileHaveData) {

                const profile: CreateProfileDto = {
                    profile_name: prof
                }

                if (profile.profile_name === 'ADMIN') {
                    currentProfile = profile
                }

                await this.profileService.create(profile)

            } else {

                if (profileHaveData.profile_name === 'ADMIN') {
                    currentProfile = profileHaveData
                }
            }
        }

        let current_company: Company = null

        if (!haveCompany) {

            const company: CreateCompanyDto = {
                company_cnpj: '00.000.000/000-00',
                company_name: process.env.DEFAULT_COMPANY,
                company_responsible: 'rmv'
            }

            current_company = await this.companyService.create(company)



        }


        if (!userHaveData) {

            let list_companies = []
            list_companies.push(current_company)

            setTimeout(() => {

                const user: CreateUserDto = {
                    user_name: 'sysadmin',
                    user_email: 'sysadmin@email.com',
                    user_password: process.env.SYSADMIN_PASS,
                    user_profile_id: currentProfile.profile_id,
                    user_date_of_birth: '01/01/1970',
                    company_ids: list_companies
                }



                this.userService.create(user)
            }, 2000);

        }


    }
}