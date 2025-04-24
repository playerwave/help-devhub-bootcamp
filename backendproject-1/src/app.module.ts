import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { TypesModule } from './types/types.module';
import { Type } from './types/entities/type.entity';
import { RolesModule } from './roles/roles.module';
import { Role } from './roles/entities/role.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/orderItem.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MaterialModule } from './material/material.module';
import { CheckinoutModule } from './checkinout/checkinout.module';
import { AuthModule } from './auth/auth.module';
import { Material } from './material/entities/material.entity';
import { Receipt } from './receipts/entities/receipt.entity';
import { ReceiptItem } from './receipts/entities/receiptItem.entity';
import { ReceiptsModule } from './receipts/receipts.module';
import { PaymentModule } from './payment/payment.module';
import { Payment } from './payment/entities/payment.entity';
import { MaterialUsage } from './material/entities/material-usage.entity';
import { MaterialUsageModule } from './material/material-usage.module';
import { Checkinout } from './checkinout/entities/checkinout.entity';
import { Customer } from './customer/entities/customer.entity';
import { CustomerModule } from './customer/customer.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { LoyaltyPointHistory } from './loyalty/entities/loyalty-point-history.entity';
import { Branch } from './branch/entities/branch.entity';
import { MaterialPurchaseHistory } from './material/entities/material-purchase-history.entity';
import { BranchModule } from './branch/branch.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads/users'),
      serveRoot: '/users-images',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads/products'),
      serveRoot: '/products-images',
    }),

    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'mydb.sqlite',
      entities: [
        User,
        Product,
        Type,
        Role,
        Order,
        OrderItem,
        Material,
        MaterialUsage,
        MaterialPurchaseHistory,
        Receipt,
        ReceiptItem,
        Payment,
        Checkinout,
        Customer,
        LoyaltyPointHistory,
        Branch,
      ],
      synchronize: true,
    }),
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   host: 'localhost',
    //   port: 3306,
    //   username: 'chanon',
    //   password: '12341234',
    //   database: 'db_devhub',
    //   entities: [
    //     User,
    //     Product,
    //     Type,
    //     Role,
    //     Order,
    //     OrderItem,
    //     Material,
    //     MaterialUsage,
    //     Receipt,
    //     ReceiptItem,
    //     Payment,
    //     Checkinout,
    //     Customer,
    //   ],
    //   synchronize: true,
    // }),
    UsersModule,
    ProductsModule,
    ReceiptsModule,
    TypesModule,
    RolesModule,
    OrdersModule,
    MaterialModule,
    MaterialUsageModule,
    CheckinoutModule,
    AuthModule,
    PaymentModule,
    CustomerModule,
    LoyaltyModule,
    BranchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
