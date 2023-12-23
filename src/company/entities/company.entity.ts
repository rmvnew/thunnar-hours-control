import { UserEntity } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity('COMPANY')
export class Company {

    @PrimaryGeneratedColumn('uuid')
    company_id: string

    @Column()
    company_name: string

    @Column()
    company_cnpj: string

    @Column()
    company_responsible: string

    @CreateDateColumn()
    create_at: Date

    @UpdateDateColumn()
    update_at: Date

    @Column()
    is_active: boolean

    @OneToMany(() => UserEntity, user => user.company)
    users: UserEntity[];

}
