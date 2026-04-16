import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity("notices")
export class Notice {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text")
  description!: string;

  @Column()
  department!: string; // Department name or 'All'

  @Column()
  semester!: string; // Semester number or 'All'

  @Column()
  type!: string; // Notice type (e.g., Exam, Sports, Holiday)

  @Column({ type: "date" })
  expiryDate!: string;

  @Column({ nullable: true })
  pdfUrl?: string;

  @Column({ nullable: true })
  pdfFileName?: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "createdBy" })
  author!: User;

  @Column()
  createdBy!: string; // User ID of creator

  @Column()
  createdByName!: string; // Cached name for quick display

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
