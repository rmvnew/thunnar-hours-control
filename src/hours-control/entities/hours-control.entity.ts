import { UserEntity } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('HOURS_CONTROL')
export class HoursControl {

    @PrimaryGeneratedColumn('uuid')
    hours_control_id: string;

    @Column({ type: 'timestamp', nullable: true })
    hours_control_morning_entrance: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    hours_control_morning_departure: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    hours_control_afternoon_entrance: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    hours_control_afternoon_departure: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    hours_control_extra_entrance: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    hours_control_extra_exit: Date | null;

    @Column({ type: 'time' })
    delay: string;

    @Column({ type: 'time' })
    lack: string;

    @Column({ type: 'time' })
    to_compensate: string;

    @CreateDateColumn()
    create_at: Date;

    @UpdateDateColumn()
    update_at: Date;

    @ManyToOne(() => UserEntity, user => user.hours_control)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity
}
