import { payment } from './payment.entity';

export const paymentProviders = [
  {
    provide: 'PAYMENT_REPOSITORY',
    useValue: payment,
  },
];