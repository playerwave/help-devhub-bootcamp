import {
  IsEmail,
  IsNotEmpty,
  Length,
  IsIn,
  IsNumber,
  Min,
  Max,
  IsArray,
  ArrayMinSize,
  IsInt,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

export class CreateUserDto {
  @ApiProperty({
    description: 'อีเมลสำหรับเข้าสู่ระบบ',
    example: 'user@example.com',
  })
  @IsEmail()
  login: string;

  @ApiProperty({
    description: 'รหัสผ่าน (ต้องมีความยาว 8-32 ตัวอักษร)',
    example: 'StrongPass123!',
    minLength: 8,
    maxLength: 32,
  })
  @IsNotEmpty()
  @Length(8, 32)
  password: string;

  @ApiProperty({
    description: 'เพศของผู้ใช้',
    example: 'male',
    enum: ['male', 'female'],
  })
  @IsNotEmpty()
  @IsIn(['male', 'female'])
  gender: 'male' | 'female';

  @ApiProperty({
    description: 'อายุของผู้ใช้ (ค่าต้องอยู่ระหว่าง 1 ถึง 120 ปี)',
    example: 25,
    minimum: 1,
    maximum: 120,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  @Max(120)
  age: number;

  @ApiProperty({
    description: 'ชุด id ของ ผู้ใช้',
    example: [1, 2],
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const numbers = value.split(',').map((num) => Number(num.trim()));
      if (numbers.some(isNaN))
        throw new BadRequestException('roleIds must be an array of numbers');
      return numbers;
    }
    if (
      !Array.isArray(value) ||
      value.some((item) => typeof item !== 'number')
    ) {
      throw new BadRequestException('roleIds must be an array of numbers');
    }
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  roleIds: number[];

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'รูปภาพผู้ใช้',
    required: false,
  })
  @IsOptional()
  file?: string;
}
