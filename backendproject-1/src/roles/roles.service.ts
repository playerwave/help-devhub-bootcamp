import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly typesRepository: Repository<Role>,
  ) {}
  create(createTypeDto: CreateRoleDto) {
    return this.typesRepository.save(createTypeDto);
  }

  findAll() {
    return this.typesRepository.find();
  }

  findOne(id: number) {
    return this.typesRepository.findOneOrFail({ where: { id: id } });
  }

  update(id: number, updateTypeDto: UpdateRoleDto) {
    return this.typesRepository.update(id, updateTypeDto);
  }

  remove(id: number) {
    return this.typesRepository.softDelete(id);
  }
}
