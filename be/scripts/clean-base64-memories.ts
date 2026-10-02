import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Bắt đầu dọn dẹp các dòng WeddingMemory có photoUrl/thumbUrl là Base64 data URL...");

  const result = await prisma.weddingMemory.deleteMany({
    where: {
      OR: [
        { photoUrl: { startsWith: "data:" } },
        { thumbUrl: { startsWith: "data:" } },
      ],
    },
  });

  console.log(`Hoàn thành: Đã xoá ${result.count} dòng chứa dữ liệu Base64 data URL trong bảng wedding_memories.`);
}

main()
  .catch((err) => {
    console.error("Lỗi khi chạy script clean-base64-memories:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
