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

  async checkIn(createDto: CreateCheckinoutDto) {
    const date = moment().add(7, 'hours').toDate();

    const checkin = this.checkinRepo.create({
      userId: createDto.userId,
      checkInTime: date,
      updatedAt: date,
    });

    return await this.checkinRepo.save(checkin);
  }

  async checkOut(id: string) {
    const checkin = await this.checkinRepo.findOneBy({ id });
    if (!checkin) throw new NotFoundException('Check-in not found');

    checkin.checkOutTime = moment().add(7, 'hours').toDate();
    checkin.updatedAt = checkin.checkOutTime;
    return await this.checkinRepo.save(checkin);
  }

  // ฟังก์ชันกรองข้อมูลตามช่วงเวลา (timestamp)
  async findAll(start?: string, end?: string) {
    const queryBuilder = this.checkinRepo.createQueryBuilder('checkinout');

    // ตรวจสอบวันที่เริ่มต้น
    if (start) {
      queryBuilder.andWhere('checkinout.checkInTime >= :start', {
        start: new Date(start),
      });
    }

    // ตรวจสอบวันที่สิ้นสุด
    if (end) {
      queryBuilder.andWhere('checkinout.checkInTime <= :end', {
        end: new Date(end),
      });
    }

    return await queryBuilder
      .orderBy('checkinout.checkInTime', 'DESC')
      .getMany();
  }

  async getStatus(userId: string) {
    return await this.checkinRepo.find({
      where: { userId },
      order: { checkInTime: 'DESC' },
    });
  }
}
