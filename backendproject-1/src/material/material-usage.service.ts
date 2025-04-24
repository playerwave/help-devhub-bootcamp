import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsOrderValue } from 'typeorm';
import { MaterialUsage } from './entities/material-usage.entity';
import { Material } from './entities/material.entity';

@Injectable()
export class MaterialUsageService {
  constructor(
    @InjectRepository(MaterialUsage)
    private usageRepo: Repository<MaterialUsage>,
    @InjectRepository(Material)
    private materialRepo: Repository<Material>,
  ) {}

  async createUsage(data: {
    materialId: number;
    quantityUsed: number;
    note?: string;
  }) {
    const material = await this.materialRepo.findOneByOrFail({
      id: data.materialId,
    });

    // ✅ ตรวจสอบว่าเหลือพอไหม
    if (material.quantityPerUnit < data.quantityUsed) {
      throw new BadRequestException('วัตถุดิบคงเหลือไม่เพียงพอ');
    }

    // ✅ หักจำนวนจากคงเหลือ
    material.quantityPerUnit -= data.quantityUsed;
    await this.materialRepo.save(material);

    const usage = this.usageRepo.create({
      material,
      quantityUsed: data.quantityUsed,
      note: data.note,
    });

    return this.usageRepo.save(usage);
  }

  async findUsage(materialId?: number) {
    return this.usageRepo.find({
      ...(materialId ? { where: { material: { id: materialId } } } : {}),
      relations: ['material'],
      order: { usedAt: 'DESC' as FindOptionsOrderValue },
    });
  }
}
