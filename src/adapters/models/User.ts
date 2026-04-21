import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

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
  registerNumber?: string;

  @Column({ nullable: true })
  semester?: string;



  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
