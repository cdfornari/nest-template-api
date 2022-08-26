import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from 'src/orders/entities/order.entity';

@Entity({name: 'users'})
export class User {

    @PrimaryGeneratedColumn('uuid')
    @ApiProperty()
    id: string;

    @Column('text',{
        unique: true
    })
    @ApiProperty()
    email: string;

    @Column('text',{
        select: false
    })
    @ApiProperty()
    password: string;

    @Column('text')
    @ApiProperty()
    fullName: string;

    @Column('bool',{
        default: true
    })
    @ApiProperty()
    isActive: boolean;

    @Column('text',{
        default: 'user'
    })
    @ApiProperty()
    role: string;

    @OneToMany(
        () => Order,
        (order) => order.user
    )
    @ApiProperty({type: ()=> Order})
    orders: Order[];

    @BeforeInsert()
    @BeforeUpdate()
    parseFields(){
        this.email = this.email.toLowerCase().trim();
    }
    
}
