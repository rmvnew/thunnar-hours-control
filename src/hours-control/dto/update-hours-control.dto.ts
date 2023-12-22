import { PartialType } from '@nestjs/swagger';
import { CreateHoursControlDto } from './create-hours-control.dto';

export class UpdateHoursControlDto extends PartialType(CreateHoursControlDto) {}
