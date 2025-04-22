import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './entities/material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialPurchaseHistory } from './entities/material-purchase-history.entity';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,

    @InjectRepository(MaterialPurchaseHistory)
    private readonly purchaseHistoryRepository: Repository<MaterialPurchaseHistory>,
  ) {}

  async findAll(): Promise<Material[]> {
    return this.materialRepository.find();
  }

  async findOne(id: number): Promise<Material> {
    const material = await this.materialRepository.findOne({ where: { id } });
    if (!material)
      throw new NotFoundException(`Material with ID ${id} not found`);
    return material;
  }

  async create(createMaterialDto: CreateMaterialDto): Promise<Material> {
    createMaterialDto.name = createMaterialDto.name.toLowerCase();
    const existing = await this.materialRepository.findOne({
      where: {
        name: createMaterialDto.name.toLowerCase(), // ต้องแน่ใจว่าเก็บใน DB แบบ lowercase ด้วย
      },
    });

    if (existing) {
      // ✅ ถ้ามีวัสดุชื่อเดียวกันแล้ว เพิ่มจำนวนคงเหลือแทน
      existing.quantityPerUnit += createMaterialDto.quantityPerUnit ?? 0;
      return this.materialRepository.save(existing);
    }

    // ✅ ถ้ายังไม่มีวัสดุชื่อนี้ สร้างใหม่
    const newMaterial = this.materialRepository.create(createMaterialDto);
    return this.materialRepository.save(newMaterial);
  }

  async update(
    id: number,
    updateMaterialDto: UpdateMaterialDto,
  ): Promise<Material> {
    await this.findOne(id);
    await this.materialRepository.update(id, updateMaterialDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.materialRepository.delete(id);
  }

  async recordPurchase(materialId: number, quantity: number, note?: string) {
    const material = await this.materialRepository.findOneByOrFail({
      id: materialId,
    });

    const history = this.purchaseHistoryRepository.create({
      material,
      quantityPurchased: quantity,
      note,
    });

    return await this.purchaseHistoryRepository.save(history);
  }

  async getPurchaseHistory(materialId?: number) {
    return this.purchaseHistoryRepository.find({
      where: materialId ? { material: { id: materialId } } : {},
      relations: ['material'],
      order: { createdAt: 'DESC' },
    });
  }
}
