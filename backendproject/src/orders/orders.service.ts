import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/orderItem.entity';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';
import { Customer } from 'src/customer/entities/customer.entity';

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
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: number) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });

    const order = new Order();
    order.user = user;
    order.total = 0;
    order.qty = 0;
    order.orderItems = [];

    // ✅ ผูก customer ถ้ามี customerId
    if (createOrderDto.customerId) {
      const customer = await this.customerRepository.findOne({
        where: { id: createOrderDto.customerId },
      });

      if (customer) {
        order.customer = customer;

        // ✅ เพิ่มแต้มสะสมให้ลูกค้า
        const pointEarned = Math.floor(order.total / 10); // เช่น ทุก 10 บาท = 1 แต้ม
        customer.points += pointEarned;
        await this.customerRepository.save(customer);
      }
    }

    // สร้าง OrderItems และคำนวณราคา
    for (const oi of createOrderDto.orderItems) {
      const product = await this.productsRepository.findOneByOrFail({
        id: oi.productId,
      });

      const orderItem = new OrderItem();
      orderItem.product = product;
      orderItem.name = product.name;
      orderItem.price = product.price;
      orderItem.qty = oi.qty;
      orderItem.total = product.price * oi.qty;

      const savedItem = await this.orderItemsRepository.save(orderItem);
      order.orderItems.push(savedItem);

      order.total += orderItem.total;
      order.qty += orderItem.qty;
    }

    await this.ordersRepository.save(order);
    return order;
  }

  async findAll() {
    return this.ordersRepository.find({
      relations: {
        user: true,
        orderItems: true,
        customer: true, // ✅ เพิ่มความสัมพันธ์ลูกค้า
      },
    });
  }

  async findOne(id: number) {
    return this.ordersRepository.findOneOrFail({
      where: { id },
      relations: {
        user: true,
        orderItems: true,
        customer: true, // ✅ เพิ่มความสัมพันธ์ลูกค้า
      },
    });
  }

  async remove(id: number) {
    return this.ordersRepository.delete(id);
  }
}
