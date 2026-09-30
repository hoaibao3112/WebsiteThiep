import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { AiConsultantWidget } from '@/components/ai/AiConsultantWidget';
import { DemoTemplateActionBar } from '@/components/card/DemoTemplateActionBar';

let mockPathname = '/';
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/api', () => ({
  ApiClient: {
    request: vi.fn(),
  },
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
  }),
}));

describe('Invite Mode & Demo UI Suppression Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/';
    mockSearchParams = new URLSearchParams();
  });

  describe('AiConsultantWidget', () => {
    it('shows on homepage for unauthenticated visitors', () => {
      mockPathname = '/';
      render(<AiConsultantWidget />);
      expect(screen.getByLabelText(/Mở khung chat AI tư vấn/i)).toBeInTheDocument();
    });

    it('shows on demo template preview when not in invite mode', () => {
      mockPathname = '/thiep/wedding-cinematic-editorial';
      mockSearchParams = new URLSearchParams();
      render(<AiConsultantWidget />);
      expect(screen.getByLabelText(/Mở khung chat AI tư vấn/i)).toBeInTheDocument();
    });

    it('hides when viewing an invitation sent to relatives (?invite=1)', () => {
      mockPathname = '/thiep/wedding-cinematic-editorial';
      mockSearchParams = new URLSearchParams('invite=1');
      const { container } = render(<AiConsultantWidget />);
      expect(container).toBeEmptyDOMElement();
    });

    it('hides when viewing a guest-specific invitation (?g=GUEST123)', () => {
      mockPathname = '/thiep/wedding-cinematic-editorial';
      mockSearchParams = new URLSearchParams('g=GUEST123');
      const { container } = render(<AiConsultantWidget />);
      expect(container).toBeEmptyDOMElement();
    });

    it('hides when viewing a non-demo real user card', () => {
      mockPathname = '/thiep/dam-cuoi-minh-khoi-ngoc-han';
      mockSearchParams = new URLSearchParams();
      const { container } = render(<AiConsultantWidget />);
      expect(container).toBeEmptyDOMElement();
    });

    it('hides on dashboard pages', () => {
      mockPathname = '/dashboard/cards';
      const { container } = render(<AiConsultantWidget />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('DemoTemplateActionBar', () => {
    it('renders on demo template preview for unauthenticated visitors', () => {
      mockPathname = '/thiep/wedding-cinematic-editorial';
      mockSearchParams = new URLSearchParams();
      render(
        <DemoTemplateActionBar
          templateSlug="wedding-cinematic-editorial"
          templateName="Vogue Wedding Story"
        />
      );
      expect(screen.getByText(/Tùy Chỉnh Mẫu Này/i)).toBeInTheDocument();
      expect(screen.getByText(/Mẫu Khác/i)).toBeInTheDocument();
    });

    it('hides when viewing an invitation sent to relatives (?invite=1)', () => {
      mockPathname = '/thiep/wedding-cinematic-editorial';
      mockSearchParams = new URLSearchParams('invite=1');
      const { container } = render(
        <DemoTemplateActionBar
          templateSlug="wedding-cinematic-editorial"
          templateName="Vogue Wedding Story"
        />
      );
      expect(container).toBeEmptyDOMElement();
    });

    it('hides when viewing with guest parameter (?g=XYZ)', () => {
      mockPathname = '/thiep/wedding-cinematic-editorial';
      mockSearchParams = new URLSearchParams('g=G-ABC');
      const { container } = render(
        <DemoTemplateActionBar
          templateSlug="wedding-cinematic-editorial"
          templateName="Vogue Wedding Story"
        />
      );
      expect(container).toBeEmptyDOMElement();
    });
  });
});
