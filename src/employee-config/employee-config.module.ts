import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { EmployeeConfigController } from './employee-config.controller';
import { EmployeeConfigService } from './employee-config.service';
import { EmployeeConfig } from './entities/employee-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeConfig]),
    UserModule
  ],
  controllers: [EmployeeConfigController],
  providers: [EmployeeConfigService],
  exports: [EmployeeConfigService]
})
export class EmployeeConfigModule { }
