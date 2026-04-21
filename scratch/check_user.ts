import "reflect-metadata";
import { AppDataSource, initializeDataSource } from "../src/infrastructure/database";
import { User } from "../src/adapters/models/User";

const checkUser = async () => {
  try {
    await initializeDataSource();
    const userRepo = AppDataSource.getRepository(User);

    const email = "abu9011582@gmail.com";
    const username = "STAFF003";

    console.log(`Checking for email: ${email}`);
    const userByEmail = await userRepo.findOneBy({ email });
    if (userByEmail) {
      console.log("Found user by email:", JSON.stringify(userByEmail, null, 2));
    } else {
      console.log("No user found with this email.");
    }

    console.log(`Checking for username: ${username}`);
    const userByUsername = await userRepo.findOneBy({ username });
    if (userByUsername) {
      console.log("Found user by username:", JSON.stringify(userByUsername, null, 2));
    } else {
      console.log("No user found with this username.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error checking user:", error);
    process.exit(1);
  }
};

checkUser();
