import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateCheckinoutDto {
  @ApiProperty({ example: true, description: 'Check-out now' })
  @IsOptional()
  autoCheckOut?: boolean;
}
