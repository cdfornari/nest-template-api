import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateOrderDto {

    @IsArray()
    @IsString({ each: true })
    @MinLength(1)
    productIds: string[];

}