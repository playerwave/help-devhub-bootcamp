import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialUsage } from './entities/material-usage.entity';
import { Material } from './entities/material.entity';
import { MaterialUsageService } from './material-usage.service';
import { MaterialUsageController } from './material-usage.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MaterialUsage, Material])],
  providers: [MaterialUsageService],
  controllers: [MaterialUsageController],
})
export class MaterialUsageModule {}
