import { NestFactory } from "@nestjs/core";
import { AppModule } from "./src/app.module";
import { PrismaService } from "./src/prisma/prisma.service";
import * as argon2 from "argon2";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  
  try {
    const passwordHash = await argon2.hash("admin123");
    const admin = await prisma.adminUser.upsert({
      where: { email: "admin@fastuc.uz" },
      update: { passwordHash },
      create: {
        email: "admin@fastuc.uz",
        passwordHash,
        role: "SUPERADMIN",
        isActive: true,
        totpSecret: "", // Added required field
      },
    });
    console.log("Admin user created successfully!");
    console.log("Email: admin@fastuc.uz");
    console.log("Password: admin123");
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await app.close();
  }
}
bootstrap();
