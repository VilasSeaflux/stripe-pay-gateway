import { UserEntity } from "@entities";
import { Request, Response } from "express";

export interface Me {
  id: number;
}

export interface DecodedIdToken {
  iss: string; // Issuer
  nbf: number; // Not Before time (Unix timestamp)
  aud: string; // Audience
  sub: string; // Subject identifier
  hd: string; // Hosted domain
  email: string; // Email address
  azp: string; // Authorized party
  name: string; // Full name
  iat: number; // Issued At time (Unix timestamp)
  exp: number; // Expiration time (Unix timestamp)
  jti: string; // JWT ID
}

export interface TRequest<T = any> extends Request {
  me?: UserEntity;
  dto?: T;
  files: any;
  t: (key: string, opts?: any) => string;
  pager: {
    page: number;
    limit: number;
  };
}

export interface TResponse extends Response {}

// ── Result type ──────────────────────────────────────────────
export type AppErrorCode =
  | "STRIPE_ERROR"
  | "CARD_DECLINED"
  | "INSUFFICIENT_FUNDS"
  | "INVALID_CARD"
  | "CUSTOMER_NOT_FOUND"
  | "ORDER_NOT_FOUND"
  | "DUPLICATE_PAYMENT"
  | "WEBHOOK_SIGNATURE_INVALID"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export type Result<T, E = AppError> = { success: true; data: T } | { success: false; error: E };

export const ok = <T>(data: T): Result<T> => ({
  success: true,
  data,
});

export const fail = <E = AppError>(error: E): Result<never, E> => ({
  success: false,
  error,
});

export interface CreatePaymentIntentInput {
  amountInCents: number; // Always cents — enforce this in the type name
  currency: string;
  customerId: string; // Your internal ID
  description?: string;
  metadata?: Record<string, string>;
  idempotencyKey?: string;
}

export interface CreatePaymentIntentOutput {
  clientSecret: string; // Goes to the frontend for Stripe.js
  paymentIntentId: string; // Stripe's pi_xxxxx
  orderId: string; // Your internal order ID
}

export interface RefundPaymentInput {
  orderId: string;
  amountInCents?: number; // Omit for full refund
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
}

export interface CreateCustomerInput {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}
