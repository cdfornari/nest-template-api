import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import * as bcrypts from 'bcrypt';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute() {
    await this.cleanDB();
    const user = await this.insertSeedUser();
    await this.insertSeedProducts(user);
    return 'Seed data inserted';
  }

  private async insertSeedProducts(user: User) {
    const products = initialData.products;
    const insertPromises = products.map(product => this.productsService.create(product,user));
    await Promise.all(insertPromises);
  }

  private async insertSeedUser() {
    const user = this.userRepository.create({
      ...initialData.user,
      password: bcrypts.hashSync(initialData.user.password, 10),
    });
    await this.userRepository.save(user);
    return user
  }

  private async cleanDB() {
    await this.productsService.deleteAll();
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    await queryBuilder.delete().where({}).execute();
  }

}
