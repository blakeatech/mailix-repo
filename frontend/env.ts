import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("Missing NEXT_PUBLIC_STRIPE_PUBLIC_KEY environment variable");
}

export const config = {
  stripePublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string,
  apiUrl: process.env.NEXT_PUBLIC_API_URL as string,
};