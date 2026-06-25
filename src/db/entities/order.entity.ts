import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Customer } from "./customer.entity";
import { OrderStatus } from "./enum";

@Entity("orders")
@Index(["customerId"])
@Index(["stripePaymentIntentId"])
@Index(["status"])
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  customerId: string;

  @ManyToOne(
    () => Customer,
    customer => customer.orders,
    {
      nullable: false,
      onDelete: "RESTRICT",
    },
  )
  @JoinColumn({ name: "customerId" })
  customer: Customer;

  // NEVER use float for money
  @Column({
    type: "integer",
  })
  amountInCents: number;

  @Column({
    default: "usd",
  })
  currency: string;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    nullable: true,
  })
  description?: string;

  @Column({
    nullable: true,
    unique: true,
  })
  stripePaymentIntentId?: string;

  @Column({
    nullable: true,
  })
  stripeChargeId?: string;

  @Column({
    nullable: true,
  })
  receiptUrl?: string;

  // Prevents double charges on retries
  @Column({
    unique: true,
  })
  idempotencyKey: string;

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
