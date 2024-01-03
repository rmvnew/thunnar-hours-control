import { UserEntity } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('HOURS_CONTROL')
export class HoursControl {

    @PrimaryGeneratedColumn('uuid')
    hours_control_id: string;

    @Column({ type: 'time', nullable: true })
    hours_control_morning_entrance: string | null;

    @Column({ type: 'time', nullable: true })
    hours_control_morning_departure: string | null;

    @Column({ type: 'time', nullable: true })
    hours_control_afternoon_entrance: string | null;

    @Column({ type: 'time', nullable: true })
    hours_control_afternoon_departure: string | null;

    @Column({ type: 'time', nullable: true })
    hours_control_extra_entrance: string | null;

    @Column({ type: 'time', nullable: true })
    hours_control_extra_exit: string | null;

    @Column({ type: 'time', nullable: true })
    delay: string;

    @Column({ nullable: true })
    delay_minuts: number;

    @Column({ type: 'time', nullable: true })
    lack: string;

    @Column({ type: 'time', nullable: true })
    to_compensate: string;

    @CreateDateColumn()
    create_at: Date;

    @UpdateDateColumn()
    update_at: Date;

    @ManyToOne(() => UserEntity, user => user.hours_control)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity
}
