;

/* eslint-disable jsx-a11y/label-has-associated-control */
import { useCartQuery, useFormGqlMutationCart } from '@graphcommerce/magento-cart';
import { BillingPageDocument } from '@graphcommerce/magento-cart-checkout';
import type { PaymentOptionsProps } from '@graphcommerce/magento-cart-payment-method';
import { useCartLock } from '@graphcommerce/magento-cart-payment-method';
import { ErrorSnackbar, FormRow, FullPageMessage } from '@graphcommerce/next-ui';
import type { FieldValues, Path, UseControllerProps } from '@graphcommerce/react-hook-form';
import { FormProvider, useController, useFormCompose } from '@graphcommerce/react-hook-form';
import { i18n } from '@lingui/core';
import { Trans } from '@lingui/react';
import { Box, CircularProgress, TextField } from '@mui/material';
import { CardElement, Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import  { useEffect, useRef, useState } from 'react';
import { StripePaymentMethodOptionsDocument, StripePaymentMethodOptionsMutation, StripePaymentMethodOptionsMutationVariables } from '../graphql/StripePaymentMethodOptions.gql';

const stripePromise = loadStripe(
  'pk_test_51QuF7sR0EgAvqq4tRY9twiqIpr3WWTj77n1A2Th6gz7zU5dKDI6BWXdT2bEjjBl4r3acB0DLh0efLuSPAXhTaaiG00Its5nsei',
)
function convertToSubcurrency(amount: number | undefined | null, factor = 100) {
  if(amount==undefined){
    return 0;
  }
  return Math.round(amount * factor)
}
/** It sets the selected payment method on the cart. */
export function PaymentMethodOptions(props: PaymentOptionsProps) {
  const { code, step } = props
  const [clientSecret, setClientSecret] = useState('')
  const [paymentResult, setPaymentResult] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const cart = useCartQuery(BillingPageDocument)

  const [lockstate, lock, unlock] = useCartLock()
  const confirmPaymentRef = useRef<(() => Promise<any>) | null>(null);

  const form = useFormGqlMutationCart(StripePaymentMethodOptionsDocument, {
    defaultValues: { code },
    onBeforeSubmit: async (variables) => {
      setIsProcessing(true)
      try {
        if (!cart.data?.cart?.prices?.grand_total?.value) throw Error('Cart total not found')

        if (!confirmPaymentRef.current || typeof confirmPaymentRef.current !== 'function') {
          throw new Error('Payment confirmation not available')
        }
        // Call the payment confirmation function stored in the ref
        const result = await confirmPaymentRef.current()  
        if (result.error) {
          throw new Error(result.error.message)
        }
        await lock({ method: code })
        return {
          ...variables,
          code,
          stripeKey: result.paymentMethod.id,
        }
      } catch (error) {
        setIsProcessing(false)
         await unlock({})
        throw error
      }
    },
  })

  const { handleSubmit } = form
  const submit = handleSubmit(() => {})

  // useFormCompose in the parent component
  useFormCompose({
    form,
    step,
    submit,
    key: `PaymentMethodOptions_${code}`,
  })

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    if (!lockstate.justLocked && lockstate.locked) unlock({})
  }, [lockstate.justLocked, lockstate.locked, unlock])

  useEffect(() => {
      const amount = cart.data?.cart?.prices?.grand_total?.value || 0
      const currency = cart.data?.cart?.prices?.grand_total?.currency || ""
      fetch('/api/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: convertToSubcurrency(amount) , currency}),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret))
  }, [])

  const options = {
    // passing the client secret obtained from the server
    clientSecret: clientSecret,
    paymentMethodCreation: 'manual',
  }

  return (
    <form onSubmit={submit}>
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <StripePaymentElement
            isProcessing={isProcessing}
            setConfirmPaymentFn={(fn) => {
              confirmPaymentRef.current = fn
            }}
          />
        </Elements>
      )}
    </form>
  )
}
// Child component with Stripe-specific hooks
function StripePaymentElement({ isProcessing, setConfirmPaymentFn }) {
  const stripe = useStripe()
  const elements = useElements()

  // Create the payment confirmation function and pass it to the parent
  useEffect(() => {
    if (!stripe || !elements) return

    const confirmPayment = async () => {
      // Ensure form validation before proceeding
      const { error } = await elements.submit()
      if (error) {
        console.error('Form validation failed:', error)
        return
      }

      try {
        return await stripe.createPaymentMethod({
          elements
        })

      } catch (err) {
        console.error('Error creating payment method:', err)
      }
    }

    setConfirmPaymentFn(confirmPayment)
  }, [stripe, elements, setConfirmPaymentFn])

  return (
    <div>
      <PaymentElement />
      {isProcessing && <div>Processing payment...</div>}
    </div>
  )
}