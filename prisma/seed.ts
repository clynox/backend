import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const schools = [
    { name: "School A", domain: "schoola" },
    { name: "School B", domain: "schoolb" },
    { name: "School C", domain: "schoolc" },
    { name: "School D", domain: "schoold" },
    { name: "School E", domain: "schoole" },
  ];

  for (const school of schools) {
    // First, create the school
    const createdSchool = await prisma.school.create({
      data: {
        name: school.name,
        domain: school.domain,
      },
    });

    // Then, create the teacher with the school ID
    const teacher = await prisma.teacher.create({
      data: {
        name: `Demo Teacher`,
        email: `teacher@${school.domain}.com`,
        schoolId: createdSchool.id,
      },
    });

    // Finally, create the class
    await prisma.class.create({
      data: {
        name: "Demo Class",
        schoolId: createdSchool.id,
        teacherId: teacher.id,
      },
    });

    console.log(`Created ${school.name} with ID: ${createdSchool.id}`);
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
