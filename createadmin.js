// مثال سكريبت Node.js لإنشاء Admin (يمكن تشغيله مرة واحدة)
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function createAdmin() {
  const hashed = await bcrypt.hash("jomaa406043380", 12);
  await prisma.user.create({
    data: {
      name: "luffy",
      email: "de000@gmail.com",
      password: hashed,
      phone: "0597529501",
      nationalId: "406043388",
      dateOfBirth: new Date(),
      governorate: "KHAN_YUNIS",
      role: "ADMIN",
    },
  });
  console.log("Admin Created");
}
createAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
