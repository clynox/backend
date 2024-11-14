import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // First, delete all existing data in the correct order
  console.log("Cleaning up existing data...");
  await prisma.submission.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.classEnrollment.deleteMany({});
  await prisma.attendanceRecord.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.school.deleteMany({});

  console.log("Starting to seed new data...");

  const schools = [
    { name: "Delhi Public School", domain: "dps-school" },
    { name: "Kendriya Vidyalaya", domain: "kv-school" },
  ];

  const grades = ["IX", "X", "XI", "XII"];
  const sections = ["A", "B", "C"];
  const currentYear = new Date().getFullYear().toString();

  // Create Super Admin
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "admin@system.com";
  const superAdminPassword =
    process.env.SUPER_ADMIN_PASSWORD || "adminpassword";
  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: superAdminEmail,
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      schoolId: "",
      isActive: true,
    },
  });

  console.log("Created Super Admin:", superAdmin.email);

  for (const school of schools) {
    console.log(`Creating school: ${school.name}`);

    const createdSchool = await prisma.school.create({
      data: {
        name: school.name,
        domain: school.domain,
        contactEmail: `contact@${school.domain}.edu`,
        contactPhone: "+91-1234567890",
      },
    });

    // Create teachers
    for (let i = 0; i < 5; i++) {
      const teacherEmail = `teacher${i + 1}@${school.domain}.edu`;
      const hashedPassword = await bcrypt.hash("password123", 10);

      // Create user first
      const user = await prisma.user.create({
        data: {
          email: teacherEmail,
          password: hashedPassword,
          role: UserRole.TEACHER,
          schoolId: createdSchool.id,
        },
      });

      // Then create teacher profile
      await prisma.teacher.create({
        data: {
          userId: user.id,
          schoolId: createdSchool.id,
          name: `Teacher ${i + 1}`,
          employeeId: `EMP${i + 1}`,
          specialization: "Mathematics",
        },
      });
    }

    // Create classes and subjects
    const teachers = await prisma.teacher.findMany({
      where: { schoolId: createdSchool.id },
    });

    for (const grade of grades) {
      for (const section of sections) {
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];

        const class_ = await prisma.class.create({
          data: {
            name: `Class ${grade}-${section}`,
            grade,
            section,
            academicYear: currentYear,
            schoolId: createdSchool.id,
            classTeacherId: teacher.id,
          },
        });

        // Create subjects for the class
        const subjects = ["Mathematics", "Science", "English", "History"];
        for (const subjectName of subjects) {
          await prisma.subject.create({
            data: {
              name: subjectName,
              code: `${grade}${section}-${subjectName.substring(0, 3)}`,
              schoolId: createdSchool.id,
              teacherId: teacher.id,
              classId: class_.id,
            },
          });
        }
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
