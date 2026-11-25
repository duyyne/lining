import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PaymentMethod } from '../payment.enum';

export class PaymentDto {
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsNotEmpty()
  @IsString()
  cardToken: string;
}
