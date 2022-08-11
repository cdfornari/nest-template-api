import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ){}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBException(error)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const {limit=10, offset=0} = paginationDto;
    return await this.productRepository.find({
      skip: offset,
      take: limit
    });
  }

  async findOne(searchTerm: string) {
    let product: Product;
    if(isUUID(searchTerm)) 
      product = await this.productRepository.findOneBy({id:searchTerm});
    else{
      const query = this.productRepository.createQueryBuilder();
      product = await query
      .where('title =:searchTerm or slug =:searchTerm', {searchTerm})
      .getOne()
    }
    if(!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    if(updateProductDto.title && !updateProductDto.slug){
      updateProductDto.slug = updateProductDto.title
      .replaceAll(' ', '_')
      .replaceAll("'", '')
      .toLowerCase();
    }
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto
    })
    if(!product) throw new NotFoundException('Product not found');
    try {
      await this.productRepository.save(product);
      return product;
    }catch(error) {
      this.handleDBException(error)
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handleDBException(error: any) {
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error)
    throw new InternalServerErrorException('unexpected error');
  }

}
