import { EmployeeConfig } from 'src/employee-config/entities/employee-config.entity';
import { HoursControl } from 'src/hours-control/entities/hours-control.entity';
import { ProfileEntity } from "src/profile/entities/profile.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Company } from './../../company/entities/company.entity';

@Entity('USER')
export class UserEntity {

    @PrimaryGeneratedColumn('uuid')
    user_id: string

    @Column()
    user_name: string

    @Column()
    user_email: string

    @Column({ type: 'date' })
    user_date_of_birth: Date

    @Column({ nullable: true })
    user_recovery_code: number

    @Column({ nullable: true })
    user_attempts_to_recover: number

    @Column({ nullable: true })
    user_recovery_date: Date

    @Column({ nullable: true })
    user_password: string

    @Column()
    user_profile_id: number

    @Column()
    user_status: boolean

    @Column()
    user_first_access: boolean

    @OneToOne(() => ProfileEntity, (profile) => profile.users)
    @JoinColumn({ name: 'user_profile_id' })
    profile: ProfileEntity

    @Column({ nullable: true })
    user_refresh_token: string;

    @CreateDateColumn()
    create_at: Date

    @UpdateDateColumn()
    update_at: Date

    @OneToMany(() => HoursControl, hour => hour.user)
    hours_control: HoursControl[];

    @ManyToOne(() => Company, company => company.users)
    @JoinColumn({
        name: 'company_id'
    })
    company: Company

    @OneToOne(() => EmployeeConfig, employee => employee.user)
    employee_config: EmployeeConfig;


}
