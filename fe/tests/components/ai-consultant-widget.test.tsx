import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AiConsultantWidget } from '@/components/ai/AiConsultantWidget';
import { ApiClient } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  ApiClient: {
    request: vi.fn(),
  },
}));

describe('AiConsultantWidget Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders trigger button properly', () => {
    render(<AiConsultantWidget />);
    const triggerBtn = screen.getByLabelText(/Mở khung chat AI tư vấn/i);
    expect(triggerBtn).toBeInTheDocument();
  });

  it('opens chat window on click', async () => {
    render(<AiConsultantWidget />);
    const triggerBtn = screen.getByLabelText(/Mở khung chat AI tư vấn/i);
    fireEvent.click(triggerBtn);

    expect(await screen.findByText(/Trợ Lý AI WebsiteThiep/i)).toBeInTheDocument();
    expect(await screen.findByPlaceholderText(/Hỏi bảng giá, mẫu thiệp, tính năng.../i)).toBeInTheDocument();
  });

  it('sends message and displays AI answer with lead badge when returned', async () => {
    (ApiClient.request as any).mockResolvedValueOnce({
      success: true,
      data: {
        sessionId: 'test_session',
        answer: 'Gói VIP có giá 399.000đ trọn đời kèm Hộp mừng cưới VietQR.',
        hasLead: true,
        suggestions: ['Xem mẫu thiệp'],
      },
    });

    render(<AiConsultantWidget />);
    const triggerBtn = screen.getByLabelText(/Mở khung chat AI tư vấn/i);
    fireEvent.click(triggerBtn);

    const pill = await screen.findByText(/💎 Bảng giá các gói thiệp/i);
    fireEvent.click(pill);

    expect(await screen.findByText(/Gói VIP có giá 399.000đ trọn đời/i)).toBeInTheDocument();
    expect(await screen.findByText(/Đã lưu thông tin liên hệ!/i)).toBeInTheDocument();
  });
});
