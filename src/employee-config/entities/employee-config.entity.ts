import { UserEntity } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('EMPLOYEE_CONFIG')
export class EmployeeConfig {

    @PrimaryGeneratedColumn('uuid')
    employee_config_id: string

    @Column({ type: 'time', nullable: false })
    employee_config_morning_entrance: string;

    @Column({ type: 'time', nullable: false })
    employee_config_morning_departure: string;

    @Column({ type: 'time', nullable: false })
    employee_config_afternoon_entrance: string;

    @Column({ type: 'time', nullable: false })
    employee_config_afternoon_departure: string;

    @Column({ nullable: false })
    work_Monday: boolean

    @Column({ nullable: false })
    work_Tuesday: boolean

    @Column({ nullable: false })
    work_Wednesday: boolean

    @Column({ nullable: false })
    work_Thursday: boolean

    @Column({ nullable: false })
    work_Friday: boolean

    @Column({ nullable: false })
    work_Saturday: boolean

    @Column({ nullable: false })
    work_Sunday: boolean

    @CreateDateColumn()
    create_at: string

    @UpdateDateColumn()
    update_at: string

    @Column()
    is_active: boolean

    @OneToOne(() => UserEntity, user => user.employee_config)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity

}
