import { UserEntity } from "src/user/entities/user.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";




@Entity('PROFILE')
export class ProfileEntity {

    @PrimaryGeneratedColumn()
    profile_id: number

    @Column()
    profile_name: string

    @OneToOne(() => UserEntity, (user) => user.profile)
    users: UserEntity[];

}