import { payment } from '../entity/payment.entity';

export const paymentProviders = [
  {
    provide: 'PAYMENT_REPOSITORY',
    useValue: payment,
  },
];