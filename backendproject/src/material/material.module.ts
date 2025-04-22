import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { MaterialPurchaseHistory } from './entities/material-purchase-history.entity';
import { MaterialPurchaseController } from './material-purchase.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Material, MaterialPurchaseHistory])],
  controllers: [MaterialController, MaterialPurchaseController],
  providers: [MaterialService],
})
export class MaterialModule {}
