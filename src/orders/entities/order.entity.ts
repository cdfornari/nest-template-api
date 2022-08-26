import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/auth/entities/user.entity';
import { Product } from 'src/products/entities/product.entity';

@Entity({ name: 'orders' })
export class Order{

    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({
        example: '5e9f8f8f-8f8f-8f8f-8f8f-8f8f8f8f8f8f',
        description: 'Order ID',
        uniqueItems: true
    })
    id: string;

    @Column('text', {default: 'pending'})
    status: string;

    @ManyToOne(
        () => User, 
        user => user.orders,
        {eager: true}
    )
    @ApiProperty({type: ()=> User})
    user: User;

    @ManyToMany(
        () => Product,
        {eager: true}
    )
    @ApiProperty({type: ()=> Product})
    products: Product[];

}