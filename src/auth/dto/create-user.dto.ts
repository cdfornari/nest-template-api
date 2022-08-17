import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {

    @IsString()
    @IsEmail()
    @ApiProperty({
        description: 'User email',
        nullable: false,
        uniqueItems: true,
        example: 'example@user.com'
    })
    email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(40)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    @ApiProperty({
        description: 'user password',
        nullable: false,
        minLength: 6,
        maxLength: 40,
        example: 'P4ssW0Rd'
    })
    password: string;

    @IsString()
    @MinLength(1)
    @MaxLength(40)
    @ApiProperty({
        description: 'user full name',
        nullable: false,
        minLength: 1,
        maxLength: 40,
        example: 'Name Surname'
    })
    fullName: string;
    
}