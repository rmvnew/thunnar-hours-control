import { UserEntity } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity('COMPANY')
export class Company {

    @PrimaryGeneratedColumn('uuid')
    company_id: string

    @Column()
    company_name: string

    @Column({ unique: true })
    company_cnpj: string

    @Column()
    company_responsible: string

    @CreateDateColumn()
    create_at: string

    @UpdateDateColumn()
    update_at: string

    @Column()
    is_active: boolean

    @ManyToMany(() => UserEntity, user => user.companys)
    users: UserEntity[];



}
