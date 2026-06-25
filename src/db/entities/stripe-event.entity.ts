import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from "typeorm";
import { StripeEventStatus } from "./enum";

@Entity("stripe_events")
@Index(["type"])
@Index(["status"])
export class StripeEvent {
  // Stripe evt_xxxxx
  @PrimaryColumn()
  id: string;

  @Column()
  type: string;

  @Column({
    type: "enum",
    enum: StripeEventStatus,
    default: StripeEventStatus.PENDING,
  })
  status: StripeEventStatus;

  @Column({
    type: "jsonb",
  })
  payload: Record<string, any>;

  @Column({
    nullable: true,
    type: "text",
  })
  error?: string;

  @Column({
    nullable: true,
    type: "timestamp with time zone",
  })
  processedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
