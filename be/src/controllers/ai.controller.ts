import { Request, Response } from 'express';
import { handleCustomerChat } from '../services/rag.service';
import { seedAiKnowledge } from '../services/ai-seed.service';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';

export class AiController {
  /**
   * POST /api/ai/chat
   * Nhận tin nhắn từ khách hàng và trả về câu trả lời RAG tư vấn
   */
  static async chat(req: Request, res: Response): Promise<void> {
    try {
      const { message, sessionId } = req.body;
      const finalSessionId = sessionId && typeof sessionId === 'string' && sessionId.trim() !== ''
        ? sessionId.trim()
        : `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const result = await handleCustomerChat({
        sessionId: finalSessionId,
        message: message.trim(),
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error({ error }, 'AiController.chat error');
      res.status(500).json({
        success: false,
        message: 'Không thể xử lý tin nhắn lúc này. Vui lòng thử lại sau giây lát!',
      });
    }
  }

  /**
   * GET /api/ai/leads
   * Lấy danh sách khách hàng tiềm năng AI đã thu thập (Cho Admin Dashboard)
   */
  static async getLeads(_req: Request, res: Response): Promise<void> {
    try {
      const leads = await prisma.aiLead.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          session: {
            include: {
              messages: {
                orderBy: { createdAt: 'asc' },
                take: 15,
              },
            },
          },
        },
      });

      res.status(200).json({
        success: true,
        data: leads,
      });
    } catch (error) {
      logger.error({ error }, 'AiController.getLeads error');
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tải danh sách khách hàng tiềm năng.',
      });
    }
  }

  /**
   * POST /api/ai/seed
   * Kích hoạt nạp / đồng bộ lại dữ liệu tri thức RAG
   */
  static async seedKnowledge(_req: Request, res: Response): Promise<void> {
    try {
      await seedAiKnowledge();
      res.status(200).json({
        success: true,
        message: 'Đã nạp kho tri thức AI RAG thành công!',
      });
    } catch (error) {
      logger.error({ error }, 'AiController.seedKnowledge error');
      res.status(500).json({
        success: false,
        message: 'Lỗi khi nạp dữ liệu tri thức AI.',
      });
    }
  }

  /**
   * GET /api/ai/knowledge
   * Danh sách bài viết tri thức hiện tại
   */
  static async getKnowledge(_req: Request, res: Response): Promise<void> {
    try {
      const articles = await prisma.aiKnowledgeArticle.findMany({
        where: { isActive: true },
        select: {
          id: true,
          category: true,
          title: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      res.status(200).json({
        success: true,
        data: articles,
      });
    } catch (error) {
      logger.error({ error }, 'AiController.getKnowledge error');
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách tri thức.',
      });
    }
  }
}
