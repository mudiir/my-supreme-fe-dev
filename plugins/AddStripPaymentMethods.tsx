import type { PaymentMethodContextProviderProps, PaymentModule } from '@graphcommerce/magento-cart-payment-method';
import { PaymentMethodPlaceOrderNoop } from '@graphcommerce/magento-cart-payment-method/PaymentMethodPlaceOrderNoop/PaymentMethodPlaceOrderNoop';
import type { PluginConfig, PluginProps } from '@graphcommerce/next-config';
import { PaymentMethodOptions } from '../components/PaymentMethodOptions';



export const config: PluginConfig = {
  type: 'component',
  module: '@graphcommerce/magento-cart-payment-method',
}



export const stripe_payments: PaymentModule = {
  PaymentOptions: PaymentMethodOptions,
  PaymentPlaceOrder: PaymentMethodPlaceOrderNoop,
}


export function PaymentMethodContextProvider(
  props: PluginProps<PaymentMethodContextProviderProps>,
) {
  const { modules, Prev, ...rest } = props
  return <Prev {...rest} modules={{ ...modules, stripe_payments }} />
}