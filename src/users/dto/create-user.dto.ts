import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Full name of the user' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unique email address of the user' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'Unique phone number in international format (e.g., +380000000000)',
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Birth date in ISO format (e.g., 1990-01-01)' })
  @IsNotEmpty()
  @IsDateString()
  birthDate: Date;
}
