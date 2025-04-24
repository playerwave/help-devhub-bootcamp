import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receipt } from './entities/receipt.entity';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { Product } from 'src/products/entities/product.entity';
import { ReceiptItem } from './entities/receiptItem.entity';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { Customer } from 'src/customer/entities/customer.entity';

@Injectable()
export class ReceiptsService {
  constructor(
    @InjectRepository(Receipt)
    private readonly receiptRepository: Repository<Receipt>,
    @InjectRepository(ReceiptItem)
    private readonly receiptItemRepository: Repository<ReceiptItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createReceiptDto: CreateReceiptDto) {
    const { totalAmount, qty, items, customerId, customerName, customerPhone } =
      createReceiptDto;

    let customer: Customer | undefined = undefined;

    // ค้นหาลูกค้าจาก customerId
    const foundCustomer = await this.customerRepository.findOneBy({
      id: customerId,
    });

    if (foundCustomer) {
      customer = foundCustomer;
    } else {
      customer = undefined; // กำหนดเป็น undefined ถ้าไม่พบลูกค้า
    }

    // ถ้ามี customerName และ customerPhone ให้แสดงใน Receipt แต่ไม่ต้องบันทึกลูกค้าในฐานข้อมูล
    const customerInfo =
      customerName && customerPhone
        ? { name: customerName, phone: customerPhone }
        : null;

    // คำนวณค่ารวมของแต่ละรายการสินค้าและบันทึก ReceiptItem
    const receiptItems = await Promise.all(
      items.map(async (item) => {
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });
        if (!product) {
          throw new Error(`ไม่พบสินค้า ID ${item.productId}`);
        }

        const receiptItem = this.receiptItemRepository.create({
          product, // ผูก ReceiptItem กับ Product
          price: item.price,
          qty: item.qty,
          total: item.price * item.qty,
          name: item.name,
        });

        return receiptItem;
      }),
    );

    // สร้างและบันทึกใบเสร็จพร้อม ReceiptItems
    const receipt = this.receiptRepository.create({
      totalAmount,
      qty,
      items: receiptItems, // แนบ receiptItems กับ receipt
      customer: customer, // เชื่อมโยงกับข้อมูลลูกค้า (ถ้ามี)
      customerName: customerInfo?.name, // เก็บ customerName
      customerPhone: customerInfo?.phone, // เก็บ customerPhone
    });

    // 1. บันทึกใบเสร็จ
    const savedReceipt = await this.receiptRepository.save(receipt);

    // 2. ผูก receiptId กับ ReceiptItem หลังจากบันทึกใบเสร็จ
    await Promise.all(
      receiptItems.map(async (item) => {
        item.receipt = savedReceipt; // ผูก receiptId กับแต่ละ item
      }),
    );

    // บันทึก ReceiptItem
    // await this.receiptItemRepository.save(receiptItems);

    return savedReceipt;
  }

  // ดึงข้อมูลทั้งหมด
  async findAll(): Promise<Receipt[]> {
    return this.receiptRepository.find({
      relations: ['items', 'items.product', 'customer'], // ดึง items และ product ของแต่ละ item มาด้วย
      order: { id: 'ASC' }, // ใส่ option นี้ถ้าอยากให้ล่าสุดอยู่บน
    });
  }

  // อัปเดตข้อมูล
  async update(
    id: number,
    updateReceiptDto: UpdateReceiptDto,
  ): Promise<Receipt | null> {
    const receipt = await this.findOne(id);
    if (!receipt) {
      throw new Error('Receipt not found'); // หากไม่พบ receipt ให้โยน error
    }

    await this.receiptRepository.update(id, updateReceiptDto);
    return this.findOne(id); // คืนค่าหลังการอัปเดต
  }

  // ลบข้อมูล
  async remove(id: number): Promise<void> {
    await this.receiptRepository.delete(id); // ลบข้อมูลตาม id
  }

  // ฟังก์ชันหา Receipt ด้วย id
  async findOne(id: number): Promise<Receipt | null> {
    return this.receiptRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'customer'], // เผื่อใน future ใช้ในหน้า detail
    });
  }
}
