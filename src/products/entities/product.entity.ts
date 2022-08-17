import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/auth/entities/user.entity';
import { ProductImage } from './product-image.entity';

@Entity({ name: 'products' })
export class Product {

    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({
        example: '5e9f8f8f-8f8f-8f8f-8f8f-8f8f8f8f8f8f',
        description: 'Product ID',
        uniqueItems: true
    })
    id: string;

    @Column('text',{
        unique: true
    })
    @ApiProperty({
        example: 'T-Shirt',
        description: 'Product Title',
        uniqueItems: true
    })
    title: string;

    @Column({
        type: 'text',
        nullable: true
    })
    @ApiProperty({
        example: 'Lorem Ipsum',
        description: 'Product Description',
        default: null
    })
    description: string;

    @Column('float',{
        default: 0
    })
    @ApiProperty({
        example: 100,
        description: 'Product Price'
    })
    price: number;

    @Column('text',{
        unique: true
    })
    @ApiProperty({
        example: 't_shirt',
        description: 'Product Slug',
        uniqueItems: true
    })
    slug: string;

    @Column('int',{
        default: 0
    })
    @ApiProperty({
        example: 0,
        description: 'Product Quantity'
    })
    stock: number;

    @Column('text',{
        array: true
    })
    @ApiProperty({
        example: ['S', 'M', 'L', 'XL'],
        description: 'Product Sizes'
    })
    sizes: string[];

    @Column('text')
    @ApiProperty({
        example: 'men',
        description: 'Product gender'
    })
    gender: string;

    @Column('text',{
        array: true,
        default: []
    })
    @ApiProperty({
        example: ['shirt','black','top'],
        description: 'Product Tags'
    })
    tags: string[];

    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        {cascade: true, eager: true}
    )
    @ApiProperty()
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        (user) => user.product,
        {eager: true}
    )
    user: User

    @BeforeInsert()
    @BeforeUpdate()
    checkSlug() {
        if(!this.slug) this.slug = this.title;  
        this.slug = this.slug
        .replaceAll(' ', '_')
        .replaceAll("'", '')
        .toLowerCase();
    }

}