import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCheckinoutDto {
  @ApiProperty({ example: '12345', description: 'User ID for check-in' })
  @IsString()
  @IsNotEmpty()
  userId: string;
  timestamp: string;
}
