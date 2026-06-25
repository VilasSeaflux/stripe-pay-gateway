import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Order } from "./order.entity";
import { Subscription } from "./subscription.entity";

@Entity("customers")
export class Customer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    unique: true,
  })
  email: string;

  @Index()
  @Column({
    unique: true,
  })
  stripeCustomerId: string;

  @Column({
    nullable: true,
  })
  name?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => Order,
    order => order.customer,
  )
  orders: Order[];

  @OneToMany(
    () => Subscription,
    subscription => subscription.customer,
  )
  subscriptions: Subscription[];
}
