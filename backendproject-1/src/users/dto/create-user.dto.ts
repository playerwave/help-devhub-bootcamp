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

// export class CreateUserDto {
//   @ApiProperty({
//     description: 'อีเมลสำหรับเข้าสู่ระบบ',
//     example: 'user@example.com',
//   })
//   @IsEmail()
//   login: string;

//   @ApiProperty({
//     description: 'รหัสผ่าน (ต้องมีความยาว 8-32 ตัวอักษร)',
//     example: 'StrongPass123!',
//     minLength: 8,
//     maxLength: 32,
//   })
//   @IsNotEmpty()
//   @Length(8, 32)
//   password: string;

//   @ApiProperty({
//     description: 'เพศของผู้ใช้',
//     example: 'male',
//     enum: ['male', 'female'],
//   })
//   @IsNotEmpty()
//   @IsIn(['male', 'female'])
//   gender: 'male' | 'female';

//   @ApiProperty({
//     description: 'อายุของผู้ใช้ (ค่าต้องอยู่ระหว่าง 1 ถึง 120 ปี)',
//     example: 25,
//     minimum: 1,
//     maximum: 120,
//   })
//   @Transform(({ value }) => Number(value))
//   @IsNumber()
//   @Min(1)
//   @Max(120)
//   age: number;

//   @ApiProperty({
//     description: 'ชุด id ของผู้ใช้',
//     example: [1, 2],
//   })
//   @Transform(
//     ({ value }) => {
//       if (Array.isArray(value)) {
//         return value.map((v) => Number(v));
//       }
//       if (typeof value === 'string') {
//         return value.split(',').map((v) => Number(v.trim()));
//       }
//       throw new BadRequestException('roleIds must be an array of numbers');
//     },
//     { toClassOnly: true },
//   ) // ✅ ใส่ใน property ที่ต้องใช้เท่านั้น
//   @IsArray()
//   @ArrayMinSize(1)
//   @IsInt({ each: true })
//   roleIds: number[];

//   @ApiProperty({
//     description: 'ID ของสาขาที่ผู้ใช้จะสังกัด',
//     example: 1,
//   })
//   @IsOptional() // optional สำหรับกรณีที่ผู้ใช้ไม่เลือกสาขา
//   @Transform(({ value }) => Number(value))
//   @IsInt()
//   branchId?: number; // กรณีที่ผู้ใช้จะไม่เลือกสาขาก็สามารถปล่อยเป็น undefined

//   @ApiProperty({
//     description: 'URL ของรูปภาพผู้ใช้',
//     example: '/images/user.jpg',
//   })
//   @IsOptional() // optional สำหรับกรณีที่ผู้ใช้ไม่อัปโหลดรูป
//   imageUrl?: string; // กรณีที่ผู้ใช้ไม่อัปโหลดรูป ก็ไม่ต้องบันทึก

//   @ApiProperty({
//     type: 'string',
//     format: 'binary',
//     description: 'รูปภาพผู้ใช้',
//     required: false,
//   })
//   @IsOptional()
//   file?: string; // ใช้สำหรับการอัปโหลดไฟล์
// }
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
    description: 'ชุด id ของผู้ใช้',
    example: [1, 2],
  })
  @Transform(
    ({ value }) => {
      if (Array.isArray(value)) {
        return value.map((v) => Number(v));
      }
      if (typeof value === 'string') {
        return value.split(',').map((v) => Number(v.trim()));
      }
      throw new BadRequestException('roleIds must be an array of numbers');
    },
    { toClassOnly: true },
  )
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  roleIds: number[];

  @ApiProperty({
    description: 'ID ของสาขาที่ผู้ใช้จะสังกัด',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  branchId?: number;

  @ApiProperty({
    description: 'URL ของรูปภาพผู้ใช้',
    example: '/images/user.jpg',
  })
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'รูปภาพผู้ใช้',
    required: false,
  })
  @IsOptional()
  file?: string;
}
