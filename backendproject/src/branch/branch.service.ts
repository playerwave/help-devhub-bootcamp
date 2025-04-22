import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  create(dto: CreateBranchDto) {
    const branch = this.branchRepo.create(dto);
    return this.branchRepo.save(branch);
  }

  findAll() {
    return this.branchRepo.find();
  }

  findOne(id: number) {
    return this.branchRepo.findOneBy({ id });
  }

  async update(id: number, dto: UpdateBranchDto) {
    const branch = await this.branchRepo.findOneBy({ id });
    if (!branch) throw new NotFoundException('Branch not found');
    Object.assign(branch, dto);
    return this.branchRepo.save(branch);
  }

  async remove(id: number) {
    const branch = await this.branchRepo.findOneBy({ id });
    if (!branch) throw new NotFoundException('Branch not found');
    return this.branchRepo.remove(branch);
  }
}
