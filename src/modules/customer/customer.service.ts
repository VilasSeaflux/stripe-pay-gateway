import { Customer } from "@entities";
import { getLogger, getRepo } from "@helpers";
import { AppError, CreateCustomerInput, fail, ok, Result } from "@types";
import { stripe } from "configs/stripe";
import { mapStripeError } from "helpers/stripe-error.helper";

const logger = getLogger();
export class CustomerService {
  async createCustomer(input: CreateCustomerInput): Promise<
    Result<{
      customerId: string;
      stripeCustomerId: string;
    }>
  > {
    const { email, metadata, name } = input;
    const TCustomers = await getRepo(Customer);

    // ── Idempotency check: return existing customer instead of duplicating
    const existing = await TCustomers.findOne({ where: { email } });
    if (existing) {
      logger.info("Returning existing customer", {
        customerId: existing.id,
      });
      return ok({ customerId: existing.id, stripeCustomerId: existing.stripeCustomerId });
    }

    // ── Create in Stripe FIRST, then write to your DB
    // If DB write fails after Stripe succeeds, you can recover via stripe.customers.list({ email })
    // If you wrote locally first and Stripe failed, you have a phantom record with no Stripe counterpart
    try {
      const stripeCustomer = await stripe.customers.create({ email, name, metadata }, { idempotencyKey: `customer_create_${email}` });

      const customer = await TCustomers.create({
        email,
        name,
        stripeCustomerId: stripeCustomer.id,
      });
      logger.info("Customer created", { customerId: customer.id, stripeCustomerId: stripeCustomer.id });
      return ok({
        customerId: customer.id,
        stripeCustomerId: stripeCustomer.id,
      });
    } catch (err) {
      logger.error("Customer creationg failed", { email, error: err });
      return fail(mapStripeError(err));
    }
  }
  async getCustomerWithPaymentMethods(customerId: string): Promise<
    Result<{
      id: string;
      email: string;
      paymentMethods: Array<{ id: string; last4?: string; brand?: string; expMonth?: number; expYear?: number }>;
    }>
  > {
    const TCustomer = await getRepo(Customer);
    const customer = await TCustomer.findOne({ where: { id: customerId } });
    if (!customer) {
      return fail(new AppError("CUSTOMER_NOT_FOUND", `Customer ${customerId} not found`, 404));
    }

    try {
      // Payment method details live in Stripe — never in your DB
      // Stripe is the single source of truth for card data
      const pms = await stripe.paymentMethods.list({
        customer: customer.stripeCustomerId,
        type: "card",
      });

      return ok({
        id: customer.id,
        email: customer.email,
        paymentMethods: pms.data.map(pm => ({
          id: pm.id,
          last4: pm.card?.last4,
          brand: pm.card?.brand,
          expMonth: pm.card?.exp_month,
          expYear: pm.card?.exp_year,
        })),
      });
    } catch (err) {
      return fail(mapStripeError(err));
    }
  }
}

export const customerService = new CustomerService();
