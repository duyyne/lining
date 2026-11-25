import { Injectable } from '@nestjs/common';
import { PaymentMethod } from './payment.enum';
import { randomUUID } from 'crypto';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type ChargeResult =
  | { success: true; transactionRef: string }
  | { success: false; message: string };

@Injectable()
export class FakePaymentGateway {
  async charge(
    _amount: number,
    _method: PaymentMethod,
    cardToken: string,
  ): Promise<ChargeResult> {
    await delay(500);

    if (cardToken === 'tok_fail') {
      return { success: false, message: 'Thanh toán thất bại' };
    }

    return { success: true, transactionRef: randomUUID() };
  }
}
