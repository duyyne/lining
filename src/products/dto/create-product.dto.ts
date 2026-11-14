import { IsEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsEmpty()
  name: string;

  @IsNumber()
  @IsEmpty()
  price: number;
}
