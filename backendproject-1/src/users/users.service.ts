import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Branch } from 'src/branch/entities/branch.entity';
import * as bcrypt from 'bcrypt';
import { validate } from 'class-validator';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async findOneByLogin(login: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { login },
      relations: ['roles', 'branch'], // เพิ่มการโหลดข้อมูล roles และ branch
    });
    console.log('Password from DB:', user?.password);
    if (!user) {
      throw new NotFoundException(`User with login ${login} not found`);
    }

    return user;
  }

  async create(
    createUserDto: CreateUserDto & { imageUrl: string },
  ): Promise<User> {
    const errors = await validate(createUserDto);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.toString()}`);
    }

    const saltOrRounds = 10;
    const password = createUserDto.password;
    const hash = await bcrypt.hash(password, saltOrRounds);
    createUserDto.password = hash;

    // สร้าง newUser
    const newUser = this.usersRepository.create(createUserDto);

    // เชื่อมโยง roles
    if (createUserDto.roleIds) {
      newUser.roles = await this.rolesRepository.findBy({
        id: In(createUserDto.roleIds),
      });
    }

    // เชื่อมโยง branch
    if (createUserDto.branchId) {
      const branch = await this.branchRepository.findOne({
        where: { id: createUserDto.branchId },
      });
      if (!branch) {
        throw new Error(`Branch with ID ${createUserDto.branchId} not found`);
      }
      newUser.branch = branch;
      newUser.branchId = branch.id; // 👈 เพิ่มบรรทัดนี้ เพื่อให้แน่ใจว่า column branchId ถูกบันทึกจริง ๆ
    }

    console.log('user service(newUser): ', newUser);

    return await this.usersRepository.save(newUser);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto & { imageUrl: string },
  ): Promise<User> {
    const user = await this.usersRepository.findOneOrFail({
      where: { id },
      relations: ['roles', 'branch'],
    });

    user.roles = []; // clear old roles
    await this.usersRepository.save(user);

    if (updateUserDto.roleIds) {
      user.roles = await this.rolesRepository.findBy({
        id: In(updateUserDto.roleIds),
      });
    }

    const saltOrRounds = 10;
    if (updateUserDto.password) {
      const password = updateUserDto.password;
      const hash = await bcrypt.hash(password, saltOrRounds);
      updateUserDto.password = hash;
    }

    // แก้ไข branchId ตามที่ได้รับ
    if (updateUserDto.branchId) {
      const branch = await this.branchRepository.findOne({
        where: { id: updateUserDto.branchId }, // แก้ไขเช่นกัน
      });
      if (!branch) {
        throw new Error(`Branch with ID ${updateUserDto.branchId} not found`);
      }
      user.branch = branch;
    }

    const updateUser = { ...user, ...updateUserDto };
    return await this.usersRepository.save(updateUser);
  }

  async findByBranch(branchId: number): Promise<User[]> {
    return this.usersRepository.find({ where: { branchId } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return this.usersRepository.findOneOrFail({
      where: { id },
      relations: ['roles', 'branch'],
    });
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.usersRepository.remove(user);
  }
}
