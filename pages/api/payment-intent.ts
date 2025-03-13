import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';


const stripe = new Stripe(
  'sk_test_51QuF7sR0EgAvqq4txTbTZynFIypUXUrZBRvERDe8sVDqaUi2NmElbf8KNHwApduDRfHY3CboGoRilBEsKrLB7UnT00OIwF2cMH',
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { amount, currency } = req.body
      const newCustomer = await stripe.customers.create()
      const customer = newCustomer.id


    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer,
      automatic_payment_methods: { enabled: true },
    //  setup_future_usage: 'off_session',
    })

    res.status(200).json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    res.status(500).json({ error: error })
  }
}