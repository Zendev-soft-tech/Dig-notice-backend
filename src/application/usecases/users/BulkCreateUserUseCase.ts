import { IUserRepository } from "../../../application/interfaces/IUserRepository";
import { User } from "../../../adapters/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendWelcomeInvite } from "../../../infrastructure/emailService";

export class BulkCreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(usersData: Partial<User>[]) {
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const userData of usersData) {
      try {
        // Generate secure temporary password if not provided
        const tempPassword = userData.password || crypto.randomBytes(5).toString("hex"); // 10 chars hex
        
        // Hash the password for storage
        userData.password = await bcrypt.hash(tempPassword, 10);

        const result = await this.userRepository.create(userData);

        // Send welcome email for admin, staff and students
        if (result.role === "admin" || result.role === "staff" || result.role === "student") {
          try {
            await sendWelcomeInvite(result.email, result.name, tempPassword);
          } catch (emailError: any) {
            console.error(`Failed to send email to ${result.email}:`, emailError);
            // We usually wouldn't fail the user creation if email fails, but it's good to log.
          }
        }

        results.successful++;
      } catch (error: any) {
        let errorMessage = "Unknown error";
        if (error.code === '23505' || "QueryFailedError" === error.name) {
             errorMessage = `Duplicate entry error for ${userData.username || userData.email}`;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        console.error(`Bulk upload failed for user ${userData.username}:`, errorMessage);
        results.failed++;
        results.errors.push(`Failed to create ${userData.username}: ${errorMessage}`);
      }
    }

    return results;
  }
}
