import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/orderItem.entity';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { LoyaltyPointHistory } from 'src/loyalty/entities/loyalty-point-history.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(LoyaltyPointHistory)
    private readonly pointHistoryRepo: Repository<LoyaltyPointHistory>,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: number) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });

    const order = new Order();
    order.user = user;
    order.total = 0;
    order.qty = 0;
    order.orderItems = [];

    let customer: Customer | null = null;

    // ✅ ผูกลูกค้า
    if (createOrderDto.customerId) {
      customer = await this.customerRepository.findOne({
        where: { id: createOrderDto.customerId },
      });
      if (customer) {
        order.customer = customer;
      }
    }

    // ✅ เพิ่มสินค้าใน order
    for (const oi of createOrderDto.orderItems) {
      const product = await this.productsRepository.findOneByOrFail({
        id: oi.productId,
      });

      const orderItem = this.orderItemsRepository.create({
        product,
        name: product.name,
        price: product.price,
        qty: oi.qty,
        total: product.price * oi.qty,
        isFree: false,
      });

      const savedItem = await this.orderItemsRepository.save(orderItem);
      order.orderItems.push(savedItem);
      order.total += savedItem.total;
      order.qty += savedItem.qty;
    }

    // ✅ บันทึก order ก่อนเพิ่มแก้วฟรี
    let savedOrder = await this.ordersRepository.save(order);

    // ✅ แลกแต้มเพื่อฟรี 1 แก้ว
    let redeemedPoints = 0;
    let earnedPoints = order.qty;

    if (customer && createOrderDto.usePoints) {
      const POINTS_REQUIRED = 10;
      const MAX_REDEEM_PRICE = 80;

      if (customer.points >= POINTS_REQUIRED) {
        redeemedPoints = POINTS_REQUIRED;
        customer.points -= POINTS_REQUIRED;

        // ✅ บันทึกประวัติการใช้แต้ม
        const redeemHistory = this.pointHistoryRepo.create({
          customer,
          order: savedOrder,
          points: -POINTS_REQUIRED,
          description: 'Redeemed for 1 free drink',
        });
        await this.pointHistoryRepo.save(redeemHistory);

        // ✅ เลือกสินค้าที่จะแลกฟรี
        let freeProduct: Product | null = null;

        if (createOrderDto.freeProductId) {
          freeProduct = await this.productsRepository.findOneBy({
            id: createOrderDto.freeProductId,
          });
        } else {
          const [lowestPriceProduct] = await this.productsRepository.find({
            order: { price: 'ASC' },
            take: 1,
          });
          freeProduct = lowestPriceProduct;
        }

        // ✅ เช็คราคาสินค้าว่าเกินกำหนดหรือไม่
        if (freeProduct) {
          if (freeProduct.price > MAX_REDEEM_PRICE) {
            throw new Error(
              `ไม่สามารถแลก "${freeProduct.name}" ได้ เพราะราคาสูงเกิน ${MAX_REDEEM_PRICE} บาท`,
            );
          }

          const freeItem = this.orderItemsRepository.create({
            product: freeProduct,
            name: freeProduct.name + ' (Free)',
            price: 0,
            qty: 1,
            total: 0,
            isFree: true,
          });

          const savedFreeItem = await this.orderItemsRepository.save(freeItem);
          savedOrder.orderItems.push(savedFreeItem);
          savedOrder.qty += 1;

          earnedPoints -= 1; // ✅ ไม่ให้แต้มจากแก้วฟรี
        }
      }
    }

    // ✅ คำนวณยอดใหม่รวมทั้งหมด
    savedOrder.total = savedOrder.orderItems.reduce(
      (sum, item) => sum + item.total,
      0,
    ); // คำนวณยอดรวม
    savedOrder = await this.ordersRepository.save(savedOrder);

    // ✅ สะสมแต้ม
    if (customer) {
      customer.points += earnedPoints;

      const pointHistory = this.pointHistoryRepo.create({
        customer,
        order: savedOrder,
        points: earnedPoints,
        description: `Earned from buying ${earnedPoints} cup(s)`,
      });

      await this.customerRepository.save(customer);
      await this.pointHistoryRepo.save(pointHistory);
    }

    return savedOrder;
  }

  async findAll() {
    return this.ordersRepository.find({
      relations: {
        user: true,
        orderItems: true,
        customer: true,
        pointHistories: true,
      },
    });
  }

  async findOne(id: number) {
    return this.ordersRepository.findOneOrFail({
      where: { id },
      relations: {
        user: true,
        orderItems: true,
        customer: true,
        pointHistories: true,
      },
    });
  }

  async remove(id: number) {
    return this.ordersRepository.delete(id);
  }
}
