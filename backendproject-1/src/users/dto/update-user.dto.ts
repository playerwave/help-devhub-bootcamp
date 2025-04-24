import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'ID ของสาขาที่ผู้ใช้จะสังกัด',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  branchId?: number;
}
