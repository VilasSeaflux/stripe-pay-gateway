import { envValidator } from "@helpers";
import Stripe from "stripe";

const env = envValidator();
export const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2026-05-27.dahlia",
  maxNetworkRetries: 3,
  timeout: 30_0000,
});
