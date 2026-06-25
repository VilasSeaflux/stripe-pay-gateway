import { AppError, AppErrorCode } from "@types";
import Stripe from "stripe";

export function mapStripeError(err: unknown): AppError {
  if (!(err instanceof Stripe.errors.StripeError)) {
    return new AppError("INTERNAL_ERROR", err instanceof Error ? err.message : "Unexpected error", 500);
  }

  switch (err.type) {
    case "StripeCardError": {
      const declineCodeMap: Record<string, { code: AppErrorCode; message: string }> = {
        insufficientFunds: {
          code: "INSUFFICIENT_FUNDS",
          message: "Your card has insufficient funds.",
        },
        cardDeclined: {
          code: "CARD_DECLINED",
          message: "Your card was declined. Please try a different card.",
        },
        expiredCard: {
          code: "INVALID_CARD",
          message: "Your card has expired.",
        },
        incorrectCvc: {
          code: "INVALID_CARD",
          message: "Your card security code is incorrect.",
        },
      };

      const mapped = err.code ? declineCodeMap[err.code] : undefined;

      return new AppError(mapped?.code ?? "CARD_DECLINED", mapped?.message ?? err.message, 402, {
        stripeCode: err.code,
      });
    }

    case "StripeInvalidRequestError":
      return new AppError("VALIDATION_ERROR", err.message, 400, { param: err.param });

    case "StripeAuthenticationError":
      return new AppError("INTERNAL_ERROR", "Payment service configuration error", 500);

    case "StripeRateLimitError":
      return new AppError("INTERNAL_ERROR", "Payment service temporarily unavailable. Please retry.", 429);

    case "StripeConnectionError":
    case "StripeAPIError":
      // Network issue or Stripe outage — card NOT charged
      return new AppError("INTERNAL_ERROR", "Payment service temporarily unavailable. Your card has not been charged.", 503);

    default:
      return new AppError("INTERNAL_ERROR", "An unexpected payment error occurred", 500);
  }
}
