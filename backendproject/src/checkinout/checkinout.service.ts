import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checkinout } from './entities/checkinout.entity';
import { CreateCheckinoutDto } from './dto/create-checkinout.dto';
import * as moment from 'moment-timezone';

@Injectable()
export class CheckinoutService {
  constructor(
    @InjectRepository(Checkinout)
    private readonly checkinRepo: Repository<Checkinout>,
  ) {}

  // async checkIn(createDto: CreateCheckinoutDto) {
  //   console.log('service: ', createDto.timestamp);

  //   const checkin = this.checkinRepo.create({
  //     userId: createDto.userId,
  //     checkInTime: new Date(createDto.timestamp), // ❌ ไม่ใช้ moment → ใช้ Date() ปกติ (UTC)
  //   });

  //   console.log(checkin.checkInTime)

  //   return await this.checkinRepo.save(checkin);
  // }
  async checkIn(createDto: CreateCheckinoutDto) {
    console.log('service: ', createDto.timestamp);

    const date = moment().add(7, 'hours').toDate();

    const checkin = this.checkinRepo.create({
      userId: createDto.userId,
      checkInTime: date,
      updatedAt: date,
    });

    console.log('แปลงแล้ว:', checkin.checkInTime);

    return await this.checkinRepo.save(checkin);
  }

  async checkOut(id: string) {
    const checkin = await this.checkinRepo.findOneBy({ id });
    if (!checkin) throw new NotFoundException('Check-in not found');

    checkin.checkOutTime = moment().add(7, 'hours').toDate(); // ❌ ไม่ใช้ moment → ใช้ Date() ปกติ (UTC)
    checkin.updatedAt = checkin.checkOutTime;
    return await this.checkinRepo.save(checkin);
  }

  async findAll() {
    return await this.checkinRepo.find({
      order: { checkInTime: 'DESC' },
    });
  }

  async getStatus(userId: string) {
    return await this.checkinRepo.find({
      where: { userId },
      order: { checkInTime: 'DESC' },
    });
  }
}
