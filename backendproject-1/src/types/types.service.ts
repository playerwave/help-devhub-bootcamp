import { Injectable } from '@nestjs/common';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Type } from './entities/type.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TypesService {
  constructor(
    @InjectRepository(Type)
    private readonly typesRepository: Repository<Type>,
  ) {}

  create(createTypeDto: CreateTypeDto) {
    return this.typesRepository.save(createTypeDto);
  }

  findAll() {
    return this.typesRepository.find();
  }

  findOne(id: number) {
    return this.typesRepository.findOneOrFail({ where: { id: id } });
  }

  update(id: number, updateTypeDto: UpdateTypeDto) {
    return this.typesRepository.update(id, updateTypeDto);
  }

  remove(id: number) {
    return this.typesRepository.softDelete(id);
  }
}
