import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeConfigModule } from 'src/employee-config/employee-config.module';
import { UserModule } from 'src/user/user.module';
import { HoursControl } from './entities/hours-control.entity';
import { HoursControlController } from './hours-control.controller';
import { HoursControlService } from './hours-control.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HoursControl]),
    UserModule,
    EmployeeConfigModule
  ],
  controllers: [HoursControlController],
  providers: [HoursControlService]
})
export class HoursControlModule { }
