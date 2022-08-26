import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { ProductsService } from '../products/products.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class OrdersService {

  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly productsService: ProductsService
  ){}

  async create(createOrderDto: CreateOrderDto, user: User) {
    try {
      const {productIds} = createOrderDto;
      const productPromises = productIds.map(productId => this.productsService.findOne(productId));
      const products = await Promise.all(productPromises);
      const order = this.ordersRepository.create({
        user,
        products,
      })
      await this.ordersRepository.save(order);
      return {
        products,
        user
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async findAll(paginationDto?: PaginationDto) {
    const {limit=10, offset=0} = paginationDto;
    const orders = await this.ordersRepository.find({
      skip: offset,
      take: limit
    });
    return orders;
  }

  async findOne(id: string) {
    const order = await this.ordersRepository.findOneBy({id});
    if(!order) throw new NotFoundException('order not found');
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(id)
    order.status = updateOrderDto.status;
    await this.ordersRepository.save(order);
    return {
      ...order,
      status: updateOrderDto.status
    };
  }

}