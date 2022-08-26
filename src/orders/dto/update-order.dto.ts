import { IsIn, IsString } from 'class-validator';

export class UpdateOrderDto {

    @IsString()
    @IsIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    status: string;
    
}