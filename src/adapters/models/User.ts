import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export type UserRole = "admin" | "staff" | "student";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @Column({
    type: "enum",
    enum: ["admin", "staff", "student"],
    default: "student",
  })
  role!: UserRole;

  @Column()
  department!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  otp?: string;

  @Column({ type: "timestamp", nullable: true })
  otpExpires?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
