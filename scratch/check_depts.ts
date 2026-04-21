import "reflect-metadata";
import { AppDataSource, initializeDataSource } from "../src/infrastructure/database";
import { User } from "../src/adapters/models/User";
import { Notice } from "../src/adapters/models/Notice";

const checkDepts = async () => {
  try {
    await initializeDataSource();
    const userRepo = AppDataSource.getRepository(User);
    const noticeRepo = AppDataSource.getRepository(Notice);

    const userDepts = await userRepo
      .createQueryBuilder("user")
      .select("DISTINCT user.department", "department")
      .getRawMany();
    
    const noticeDepts = await noticeRepo
      .createQueryBuilder("notice")
      .select("DISTINCT notice.department", "department")
      .getRawMany();

    console.log("Departments in Users table:", userDepts.map(r => r.department));
    console.log("Departments in Notices table:", noticeDepts.map(r => r.department));

    process.exit(0);
  } catch (error) {
    console.error("Error checking departments:", error);
    process.exit(1);
  }
};

checkDepts();
