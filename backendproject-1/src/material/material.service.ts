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
        name: createMaterialDto.name.toLowerCase(),
      },
    });

    if (existing) {
      // ✅ เพิ่มจำนวนคงเหลือ
      existing.quantityPerUnit += createMaterialDto.quantityPerUnit ?? 0;

      // ✅ บันทึกประวัติการซื้อ
      await this.recordPurchase(
        existing.id,
        createMaterialDto.quantityPerUnit,
        'เพิ่มจำนวนวัสดุที่มีอยู่',
      );

      return this.materialRepository.save(existing);
    }

    // ✅ ถ้ายังไม่มีวัสดุชื่อนี้ สร้างใหม่
    const newMaterial = this.materialRepository.create(createMaterialDto);
    const savedMaterial = await this.materialRepository.save(newMaterial);

    // ✅ บันทึกประวัติการซื้อ
    await this.recordPurchase(
      savedMaterial.id,
      savedMaterial.quantityPerUnit,
      'เพิ่มวัสดุใหม่',
    );

    return savedMaterial;
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
