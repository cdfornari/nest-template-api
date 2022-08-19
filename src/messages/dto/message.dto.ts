import { IsString, MinLength } from 'class-validator';

export class MessageDto {
    @IsString()
    @MinLength(1)
    message: string
}