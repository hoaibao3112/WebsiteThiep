import dotenv from 'dotenv';
dotenv.config();

import { seedAiKnowledge } from '../src/services/ai-seed.service';
import { prisma } from '../src/lib/prisma';

seedAiKnowledge()
  .then(async () => {
    await prisma.$disconnect();
    console.log('🎉 Hoàn tất nạp kho tri thức AI RAG!');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
