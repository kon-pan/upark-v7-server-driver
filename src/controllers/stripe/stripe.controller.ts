import { Request, Response } from 'express';
import { DateTime } from 'luxon';
import { Stripe } from 'stripe';
import db from '../../db/db.config';

const stripe = new Stripe(`${process.env.STRIPE_SK_TEST_KEY}`, {
  apiVersion: '2020-08-27',
});

export const createPaymentIntent = async (req: Request, res: Response) => {
  const cost = req.body.cost;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: cost * 100,
    currency: 'eur',
    payment_method_types: ['card'],
  });

  // if (paymentIntent.status === 'succeeded') {
  //   // Add successfull transaction to our own database
  //   try {
  //     await db.query(
  //       `
  //     INSERT INTO earnings(amount, datetime) VALUES($1, $2)
  //     `,
  //       [cost * 100, DateTime.now().toUTC().toISO()]
  //     );
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
};
