import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateLoyaltyDto {
  @ApiProperty()
  @IsNumber()
  customerId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  orderId?: number;

  @ApiProperty()
  @IsNumber()
  points: number;

  @ApiProperty({ enum: ['earned', 'used'] })
  @IsEnum(['earned', 'used'])
  type: 'earned' | 'used';

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;
}
