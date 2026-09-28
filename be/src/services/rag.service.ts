import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import {
  generateEmbedding,
  generateChatAnswer,
  ChatHistoryMessage,
  RagContextArticle,
} from './gemini.service';
import { dispatchLeadNotification } from './notification.service';

/**
 * Tính Cosine Similarity giữa 2 vector số học
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  if (vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Tìm kiếm bài viết trong kho tri thức dựa trên vector embedding + từ khóa (Hybrid Search)
 */
export async function searchRelevantArticles(query: string, limit = 4): Promise<RagContextArticle[]> {
  try {
    const articles = await prisma.aiKnowledgeArticle.findMany({
      where: { isActive: true },
    });

    if (articles.length === 0) {
      return [];
    }

    const queryVec = await generateEmbedding(query);
    const queryLower = query.toLowerCase();
    const queryTokens = queryLower.split(/\s+/).filter((t) => t.length > 1);

    const scoredArticles = articles.map((art) => {
      let vectorScore = 0;
      if (art.embedding && art.embedding.length > 0) {
        vectorScore = cosineSimilarity(queryVec, art.embedding);
      }

      // Keyword matching score
      let keywordScore = 0;
      const titleLower = art.title.toLowerCase();
      const contentLower = art.content.toLowerCase();
      const tags = (art.tags || []).map((t) => t.toLowerCase());

      for (const token of queryTokens) {
        if (titleLower.includes(token)) keywordScore += 0.3;
        if (tags.some((tag) => tag.includes(token))) keywordScore += 0.25;
        if (contentLower.includes(token)) keywordScore += 0.1;
      }

      // Chuẩn hóa điểm hybrid
      const finalScore = vectorScore * 0.65 + Math.min(keywordScore, 1) * 0.35;

      return {
        article: art,
        score: finalScore,
      };
    });

    // Sắp xếp điểm giảm dần
    scoredArticles.sort((a, b) => b.score - a.score);

    return scoredArticles.slice(0, limit).map((item) => ({
      title: item.article.title,
      category: item.article.category,
      content: item.article.content,
      metadata: item.article.metadata,
    }));
  } catch (error) {
    logger.error({ error }, 'Failed to search knowledge base');
    return [];
  }
}

/**
 * Xử lý phiên chat tư vấn khách hàng tự động với RAG + Lead Capture
 */
export async function handleCustomerChat(params: {
  sessionId: string;
  message: string;
}): Promise<{
  sessionId: string;
  answer: string;
  hasLead: boolean;
  suggestions?: string[];
}> {
  const { sessionId, message } = params;

  // 1. Đảm bảo session tồn tại
  await prisma.aiChatSession.upsert({
    where: { sessionId },
    update: { updatedAt: new Date() },
    create: { sessionId },
  });

  // 2. Lưu tin nhắn người dùng
  await prisma.aiChatMessage.create({
    data: {
      sessionId,
      role: 'user',
      content: message,
    },
  });

  // 3. Lấy 8 tin nhắn gần nhất để làm ngữ cảnh hội thoại đa lượt
  const recentDbMessages = await prisma.aiChatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
    take: 8,
  });

  // Đảo ngược lại theo thứ tự thời gian tăng dần
  const history: ChatHistoryMessage[] = recentDbMessages
    .reverse()
    .slice(0, -1) // Bỏ tin nhắn vừa thêm vào (vì nó sẽ được truyền làm userMessage)
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  // 4. Tìm kiếm tri thức liên quan từ DB qua RAG
  const contextArticles = await searchRelevantArticles(message, 4);

  // 5. Tạo câu trả lời từ AI
  const { answer, extractedLead } = await generateChatAnswer({
    userMessage: message,
    contextArticles,
    history,
  });

  // 6. Lưu câu trả lời của AI vào DB
  await prisma.aiChatMessage.create({
    data: {
      sessionId,
      role: 'assistant',
      content: answer,
    },
  });

  // 7. Nếu phát hiện khách để lại SĐT -> Lưu Lead và bắn thông báo Telegram
  let hasLead = false;
  if (extractedLead?.phone) {
    hasLead = true;
    try {
      await prisma.aiLead.upsert({
        where: { sessionId },
        update: {
          customerName: extractedLead.name || undefined,
          customerPhone: extractedLead.phone,
          demandNote: extractedLead.demand || message,
          updatedAt: new Date(),
        },
        create: {
          sessionId,
          customerName: extractedLead.name || null,
          customerPhone: extractedLead.phone,
          demandNote: extractedLead.demand || message,
        },
      });

      // Gửi thông báo Telegram ngầm không chặn luồng trả lời
      dispatchLeadNotification({
        customerName: extractedLead.name,
        phone: extractedLead.phone,
        demand: extractedLead.demand || message,
        sessionId,
      }).catch((err) => {
        logger.error({ err }, 'Error dispatching lead notification to Telegram');
      });
    } catch (leadError) {
      logger.error({ leadError }, 'Failed to save captured lead to database');
    }
  }

  // 8. Đề xuất câu hỏi tiếp theo dựa trên nội dung
  const suggestions = generateDynamicSuggestions(message, answer);

  return {
    sessionId,
    answer,
    hasLead,
    suggestions,
  };
}

function generateDynamicSuggestions(query: string, _answer: string): string[] {
  const lower = query.toLowerCase();
  if (lower.includes('giá') || lower.includes('bao nhiêu')) {
    return ['Các tính năng của gói VIP?', 'Xem các mẫu thiệp có sẵn', 'Cách thanh toán kích hoạt'];
  }
  if (lower.includes('mẫu') || lower.includes('thiệp cưới')) {
    return ['Gói VIP có ưu đãi gì?', 'Thiệp có nhạc nền và bản đồ không?', 'Tôi muốn thiết kế mẫu riêng'];
  }
  return ['Bảng giá các gói thiệp', 'Khám phá các mẫu thiệp đẹp', 'Hộp mừng cưới nhận tiền thế nào?'];
}
