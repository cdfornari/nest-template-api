import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {

    @IsOptional()
    @Type(() => Number)
    @IsPositive()
    @ApiProperty({
        default: 10,
        description: 'Number of items'
    })
    limit?: number;

    @IsOptional()
    @Type(() => Number)
    @Min(0)
    @ApiProperty({
        default: 0,
        description: 'Items to skip'
    })
    offset?: number;
}