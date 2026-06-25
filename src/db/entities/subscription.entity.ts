import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Customer } from "./customer.entity";
import { SubscriptionStatus } from "./enum";

@Entity("subscriptions")
@Index(["customerId"])
@Index(["stripeSubscriptionId"])
@Index(["status"])
export class Subscription {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  customerId: string;

  @ManyToOne(
    () => Customer,
    customer => customer.subscriptions,
    {
      nullable: false,
      onDelete: "RESTRICT",
    },
  )
  @JoinColumn({ name: "customerId" })
  customer: Customer;

  @Column({
    unique: true,
  })
  stripeSubscriptionId: string;

  @Column()
  stripePriceId: string;

  @Column()
  stripeProductId: string;

  @Column({
    type: "enum",
    enum: SubscriptionStatus,
  })
  status: SubscriptionStatus;

  @Column({
    type: "timestamp with time zone",
  })
  currentPeriodStart: Date;

  @Column({
    type: "timestamp with time zone",
  })
  currentPeriodEnd: Date;

  @Column({
    default: false,
  })
  cancelAtPeriodEnd: boolean;

  @Column({
    nullable: true,
    type: "timestamp with time zone",
  })
  canceledAt?: Date;

  @Column({
    nullable: true,
    type: "timestamp with time zone",
  })
  trialStart?: Date;

  @Column({
    nullable: true,
    type: "timestamp with time zone",
  })
  trialEnd?: Date;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
