import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductImage } from './entities/product-image.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource
  ){}

  async create(createProductDto: CreateProductDto) {
    const {images = [], ...productDetails} = createProductDto;
    try {
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(url => this.productImageRepository.create({url}))
      });
      await this.productRepository.save(product);
      return {...product, images};
    } catch (error) {
      this.handleDBException(error)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const {limit=10, offset=0} = paginationDto;
    const products = await this.productRepository.find({
      skip: offset,
      take: limit,
      relations: {
        images: true
      }
    });
    return products.map(({images,...rest}) => ({
      ...rest, 
      images: images.map(image => image.url)
    }));
  }

  async findOne(searchTerm: string) {
    let product: Product;
    if(isUUID(searchTerm)) 
      product = await this.productRepository.findOneBy({id:searchTerm});
    else{
      const query = this.productRepository.createQueryBuilder('product');
      product = await query
      .where('title =:searchTerm or slug =:searchTerm', {searchTerm})
      .leftJoinAndSelect('product.images', 'images')
      .getOne()
    }
    if(!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findOnePlain(term: string) {
    const {images=[],...rest} = await this.findOne(term);
    return {
      ...rest,
      images: images.map(image => image.url)
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    if(updateProductDto.title && !updateProductDto.slug){
      updateProductDto.slug = updateProductDto.title
      .replaceAll(' ', '_')
      .replaceAll("'", '')
      .toLowerCase();
    }

    const {images,...rest} = updateProductDto;
    const product = await this.productRepository.preload({id,...rest})
    if(!product) throw new NotFoundException('Product not found');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if(images){
        await queryRunner.manager.delete(ProductImage, {product: {id}});
        product.images = images.map(url => this.productImageRepository.create({url}));
      }else{

      }
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return this.findOnePlain(id);
    }catch(error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
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

  async deleteAll(){
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBException(error)
    } 
  }

}