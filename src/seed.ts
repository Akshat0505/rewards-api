import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseSeeder } from './database/seeds/database.seeder';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const seeder = app.get(DatabaseSeeder);
    await seeder.seed();
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await app.close();
  }
}

seed(); 