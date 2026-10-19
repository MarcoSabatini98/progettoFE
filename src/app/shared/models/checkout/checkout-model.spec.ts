import { describe, expect, it } from 'vitest';

import { CheckoutInterface } from './checkout-model';

describe('CheckoutInterface', () => {
  it('accetta un checkout avviato', () => {
    const checkout: CheckoutInterface = {
      pagamento_id: 7,
      uuid: '6f1c2b1e-0000-4000-8000-000000000007',
      importo: 60,
      url: 'https://checkout.example.com/sessione',
    };

    expect(checkout.url).toMatch(/^https:/);
  });
});
