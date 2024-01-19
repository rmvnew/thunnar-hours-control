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



        //^ Profile 
        //~ Start register 

        let currentProfile = null

        const profiles = ['ADMIN', 'USER', 'MANAGER', 'OWNER']

        for (let prof of profiles) {

            const profileHaveData = await this.profileService.haveProfile(prof)

            if (!profileHaveData) {

                const profile: CreateProfileDto = {
                    profile_name: prof
                }

                const res = await this.profileService.create(profile)

                if (res.profile_name === 'ADMIN') {
                    currentProfile = res
                }

            } else {

                if (profileHaveData.profile_name === 'ADMIN') {
                    currentProfile = profileHaveData
                }
            }
        }


        //~ End register

        //? #######| ** |####### 

        //^ Company 
        //~ Start register 

        let list_companies = []

        const haveCompany = await this.companyService.haveCompany(process.env.DEFAULT_COMPANY)



        let current_company: Company = null

        if (!haveCompany) {

            const company: CreateCompanyDto = {
                company_cnpj: '00.000.000/000-00',
                company_name: process.env.DEFAULT_COMPANY,
                company_responsible: 'rmv'
            }

            current_company = await this.companyService.create(company)

            list_companies.push(current_company.company_id)


        } else {

            list_companies.push(haveCompany.company_id)


        }

        //~ End register 

        //^ Users 
        //~ Start register 


        const users = [
            {
                name: process.env.DEFAULT_USER_NAME,
                email: process.env.DEFAULT_USER_EMAIL,
                date_of_birth: '01/01/1970'
            }, {
                name: 'sysadmin',
                email: 'sysadmin@email.com',
                date_of_birth: '01/01/1970'
            }
        ]




        users.forEach(async data => {

            const userHaveData = await this.userService.haveUser(data.name.toUpperCase())

            if (!userHaveData) {

                const user: CreateUserDto = {
                    user_name: data.name.toUpperCase(),
                    user_email: data.email,
                    user_password: process.env.DEFAULT_USER_PASS,
                    user_profile_id: currentProfile.profile_id,
                    user_date_of_birth: data.date_of_birth,
                    company_ids: list_companies

                }

                this.userService.create(user)

            }



        })


        //~ End register





    }
}