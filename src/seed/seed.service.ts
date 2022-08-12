import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService
  ) {}

  async execute() {
    await this.productsService.deleteAll();
    await this.insertSeedProducts();
    return 'Seed data inserted';
  }

  private async insertSeedProducts() {
    const products = initialData.products;
    const insertPromises = products.map(product => this.productsService.create(product));
    await Promise.all(insertPromises);
  }

}
