import "reflect-metadata";
import bcrypt from "bcryptjs";
import { AppDataSource, initializeDataSource } from "../infrastructure/database";
import { User } from "../adapters/models/User";
import { Notice } from "../adapters/models/Notice";
import { Logger } from "../shared/logger";

const seedData = async () => {
  try {
    await initializeDataSource();

    const userRepo = AppDataSource.getRepository(User);
    const noticeRepo = AppDataSource.getRepository(Notice);

    Logger.info("🌱 Seeding initial data...");

    // 1. Seed Admin
    const adminData = {
      username: 'ADMIN001',
      password: 'admin123',
      name: 'Dr. Rajesh Kumar',
      role: 'admin' as const,
      department: 'Administration',
      email: 'admin@college.edu'
    };

    let admin = await userRepo.findOneBy({ username: adminData.username });
    if (!admin) {
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      admin = await userRepo.save(userRepo.create({ ...adminData, password: hashedPassword }));
      Logger.info(`✅ Admin user ${adminData.username} created`);
    }

    // 2. Seed Staff
    const staffData = {
      username: 'STAFF001',
      password: 'staff123',
      name: 'Prof. Sarah Wilson',
      role: 'staff' as const,
      department: 'Computer Science',
      email: 'sarah.cs@college.edu'
    };

    let staff = await userRepo.findOneBy({ username: staffData.username });
    if (!staff) {
      const hashedPassword = await bcrypt.hash(staffData.password, 10);
      staff = await userRepo.save(userRepo.create({ ...staffData, password: hashedPassword }));
      Logger.info(`✅ Staff user ${staffData.username} created`);
    }

    // 3. Seed Student
    const studentData = {
      username: 'STUD001',
      password: 'student123',
      name: 'John Doe',
      role: 'student' as const,
      department: 'Computer Science',
      email: 'john.doe@college.edu'
    };

    let student = await userRepo.findOneBy({ username: studentData.username });
    if (!student) {
      const hashedPassword = await bcrypt.hash(studentData.password, 10);
      student = await userRepo.save(userRepo.create({ ...studentData, password: hashedPassword }));
      Logger.info(`✅ Student user ${studentData.username} created`);
    }

    // 4. Seed Notice
    const noticeCount = await noticeRepo.count();
    if (noticeCount === 0) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      const expiryStr = expiry.toISOString().split('T')[0];

      const sampleNotice = noticeRepo.create({
        title: 'Mid-Semester Examination Schedule',
        description: 'The mid-semester examinations for all Computer Science students will begin from next Monday. Please check the detailed schedule available on the portal.',
        department: 'Computer Science',
        semester: '4',
        type: 'Exam',
        expiryDate: expiryStr,
        createdBy: admin!.id,
        createdByName: admin!.name
      });

      await noticeRepo.save(sampleNotice);
      Logger.info("✅ Sample notice created");
    }

    Logger.info("✅ Seeding process completed");
    process.exit(0);
  } catch (error) {
    Logger.error(`❌ Seeding failed: ${error}`);
    process.exit(1);
  }
};

seedData();
