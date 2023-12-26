import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeConfigDto } from './create-employee-config.dto';

export class UpdateEmployeeConfigDto extends PartialType(CreateEmployeeConfigDto) {}
