"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Globe,
  Lock,
  Crown,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Plus,
  X,
  ArrowLeft,
  Link2,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import {
  DomainListResponse,
  CustomDomainItem,
  DnsRecordGuidance,
  CreateCustomDomainResponse,
} from "@/types/domain.types";

interface SimpleCardItem {
  id: string;
  slug: string;
  cardCategory: string;
  status: string;
  template?: { name?: string };
}

export default function DomainsPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Data states
  const [loading, setLoading] = useState(true);
  const [domainData, setDomainData] = useState<DomainListResponse | null>(null);
  const [cards, setCards] = useState<SimpleCardItem[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("");

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modal: Update Slug
  const [isSlugModalOpen, setIsSlugModalOpen] = useState(false);
  const [slugCardId, setSlugCardId] = useState("");
  const [slugValue, setSlugValue] = useState("");
  const [slugSaving, setSlugSaving] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  // Modal: Connect Custom Domain
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectDomain, setConnectDomain] = useState("");
  const [connectCardId, setConnectCardId] = useState("");
  const [connectSaving, setConnectSaving] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Modal: DNS Guidance
  const [isDnsGuideOpen, setIsDnsGuideOpen] = useState(false);
  const [activeGuideDomain, setActiveGuideDomain] = useState<CustomDomainItem | null>(null);
  const [activeDnsRecords, setActiveDnsRecords] = useState<DnsRecordGuidance[]>([]);

  // Action states
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deleteConfirmDomain, setDeleteConfirmDomain] = useState<CustomDomainItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [domainsRes, cardsRes] = await Promise.all([
        ApiClient.request<DomainListResponse>("/domains"),
        ApiClient.request<SimpleCardItem[]>("/cards/my-cards"),
      ]);

      if (domainsRes.success && domainsRes.data) {
        setDomainData(domainsRes.data);
      }

      if (cardsRes.success && Array.isArray(cardsRes.data)) {
        setCards(cardsRes.data);
        if (cardsRes.data.length > 0 && !selectedCardId) {
          setSelectedCardId(cardsRes.data[0].id);
        }
      }
    } catch (err: unknown) {
      console.error("[DomainsPage] Fetch error:", err);
      showToast("Không thể tải dữ liệu tên miền. Vui lòng tải lại trang.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast("Đã sao chép vào bộ nhớ tạm!");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Selected card for default URL preview
  const currentCard = useMemo(() => {
    return cards.find((c) => c.id === selectedCardId) || cards[0] || null;
  }, [cards, selectedCardId]);

  const defaultPlatformDomain = domainData?.defaultDomain.host || "websitethiep.com";
  const defaultFullUrl = currentCard
    ? `https://${defaultPlatformDomain}/s/${currentCard.slug}`
    : `https://${defaultPlatformDomain}/s/`;

  const isVipEntitled = Boolean(domainData?.capabilities.allowCustomDomain);

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------

  // Open slug modal
  const openSlugModal = () => {
    if (!currentCard) {
      showToast("Vui lòng tạo thiệp cưới trước khi đổi đường dẫn");
      return;
    }
    setSlugCardId(currentCard.id);
    setSlugValue(currentCard.slug);
    setSlugError(null);
    setIsSlugModalOpen(true);
  };

  // Submit slug change
  const handleSaveSlug = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = slugValue.trim().toLowerCase();

    if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
      setSlugError("Đường dẫn chỉ được chứa chữ cái thường không dấu, số và dấu gạch ngang.");
      return;
    }
    if (cleanSlug.length < 3 || cleanSlug.length > 60) {
      setSlugError("Đường dẫn phải có độ dài từ 3 đến 60 ký tự.");
      return;
    }

    setSlugSaving(true);
    setSlugError(null);
    try {
      const res = await ApiClient.request<{ id: string; slug: string }>(`/cards/${slugCardId}/slug`, {
        method: "PATCH",
        body: JSON.stringify({ slug: cleanSlug }),
      });

      if (res.success && res.data) {
        showToast("Đã cập nhật đường dẫn thiệp thành công!");
        setIsSlugModalOpen(false);
        // Cập nhật state cards
        setCards((prev) =>
          prev.map((c) => (c.id === slugCardId ? { ...c, slug: res.data!.slug } : c))
        );
        fetchData();
      } else {
        setSlugError(res.error || "Không thể cập nhật đường dẫn. Vui lòng thử lại.");
      }
    } catch (err: any) {
      setSlugError(err.message || "Lỗi kết nối máy chủ");
    } finally {
      setSlugSaving(false);
    }
  };

  // Open connect domain modal
  const openConnectModal = () => {
    if (!isVipEntitled) {
      router.push("/dashboard/billing?plan=VIP");
      return;
    }
    setConnectDomain("");
    setConnectCardId(cards[0]?.id || "");
    setConnectError(null);
    setIsConnectModalOpen(true);
  };

  // Submit connect domain
  const handleConnectDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDomain = connectDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

    if (!cleanDomain || cleanDomain.length < 3) {
      setConnectError("Vui lòng nhập tên miền hợp lệ.");
      return;
    }
    if (!connectCardId) {
      setConnectError("Vui lòng chọn thiệp cần kết nối.");
      return;
    }

    setConnectSaving(true);
    setConnectError(null);
    try {
      const res = await ApiClient.request<CreateCustomDomainResponse>("/domains", {
        method: "POST",
        body: JSON.stringify({
          cardId: connectCardId,
          domain: cleanDomain,
        }),
      });

      if (res.success && res.data) {
        showToast("Đã thêm tên miền thành công! Vui lòng cấu hình DNS.");
        setIsConnectModalOpen(false);
        // Mở ngay modal hướng dẫn DNS cho domain vừa tạo
        setActiveGuideDomain(res.data.domain);
        setActiveDnsRecords(res.data.dnsRecords || []);
        setIsDnsGuideOpen(true);
        fetchData();
      } else {
        setConnectError(res.error || "Không thể kết nối tên miền. Vui lòng kiểm tra lại.");
      }
    } catch (err: any) {
      setConnectError(err.message || "Lỗi máy chủ khi đăng ký tên miền");
    } finally {
      setConnectSaving(false);
    }
  };

  // Verify domain DNS
  const handleVerifyDomain = async (domain: CustomDomainItem) => {
    setVerifyingId(domain.id);
    try {
      const res = await ApiClient.request<CustomDomainItem>(`/domains/${domain.id}/verify`, {
        method: "POST",
      });

      if (res.success && res.data) {
        if (res.data.status === "ACTIVE") {
          showToast(`Tên miền ${domain.domain} đã kích hoạt thành công!`);
        } else {
          showToast(`Chưa nhận diện bản ghi DNS của ${domain.domain}. Vui lòng thử lại sau vài phút.`);
        }
        fetchData();
      } else {
        showToast(res.error || "Kiểm tra kết nối thất bại");
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi khi kiểm tra DNS");
    } finally {
      setVerifyingId(null);
    }
  };

  // Open DNS guidance modal for an existing domain
  const openDnsGuide = (domain: CustomDomainItem) => {
    setActiveGuideDomain(domain);
    setActiveDnsRecords([
      {
        type: "CNAME",
        name: "@ (hoặc www)",
        value: domain.targetValue || "cname.vercel-dns.com",
        description: "Bản ghi chính để trỏ tên miền về máy chủ thiệp cưới",
      },
      ...(domain.verificationTxt
        ? [
            {
              type: "TXT",
              name: "_wst-verify",
              value: domain.verificationTxt,
              description: "Bản ghi xác minh quyền sở hữu tên miền (tùy chọn)",
            },
          ]
        : []),
    ]);
    setIsDnsGuideOpen(true);
  };

  // Confirm delete domain
  const handleDeleteDomain = async () => {
    if (!deleteConfirmDomain) return;
    setIsDeleting(true);
    try {
      const res = await ApiClient.request(`/domains/${deleteConfirmDomain.id}`, {
        method: "DELETE",
      });
      if (res.success) {
        showToast(`Đã gỡ tên miền ${deleteConfirmDomain.domain} thành công`);
        setDeleteConfirmDomain(null);
        fetchData();
      } else {
        showToast(res.error || "Không thể gỡ tên miền");
      }
    } catch (err: any) {
      showToast(err.message || "Lỗi khi gỡ tên miền");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B2118] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* TOP BAR / BREADCRUMB */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#EADDCB]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#8E7E70]">
              <Link
                href="/dashboard/cards"
                className="hover:text-[#2B2118] flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Bảng điều khiển</span>
              </Link>
              <span>/</span>
              <span className="font-semibold text-[#8C6239]">Tên miền</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#2B2118] tracking-tight">
                Tên miền
              </h1>
              {domainData?.capabilities.planName && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EADDCB] text-[#5C4D40] uppercase tracking-wider">
                  Gói {domainData.capabilities.planName}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#7A6B5D]">
              Quản lý tên miền mặc định và kết nối tên miền riêng cho thiệp cưới của bạn.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 rounded-xl border border-[#E2D5C3] bg-white hover:bg-[#F3ECE2] text-[#5C4D40] transition cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#8C6239]" : ""}`} />
            </button>
            <Link
              href="/dashboard/cards"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-[#E2D5C3] hover:bg-[#F3ECE2] text-[#2B2118] transition"
            >
              Xem danh sách thiệp
            </Link>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading && !domainData && (
          <div className="space-y-6 animate-pulse">
            <div className="h-44 bg-white rounded-3xl border border-[#EADDCB]/60" />
            <div className="h-64 bg-white rounded-3xl border border-[#EADDCB]/60" />
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 1: TÊN MIỀN MẶC ĐỊNH (DEFAULT DOMAIN & SLUG)       */}
        {/* ========================================================= */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADDCB] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#F3ECE2] flex items-center justify-center text-[#8C6239]">
                  <Link2 className="w-4 h-4" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-serif text-[#2B2118]">
                  Tên miền mặc định
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                  Mặc định hệ thống
                </span>
              </div>
              <p className="text-xs text-[#7A6B5D]">
                Đường dẫn miễn phí do hệ thống cung cấp theo cấu trúc:{" "}
                <code className="text-[#8C6239] font-mono">
                  {defaultPlatformDomain}/s/[slug-thiệp]
                </code>
              </p>
            </div>

            {/* CARD SELECTOR IF MULTIPLE CARDS */}
            {cards.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8E7E70] shrink-0">Chọn thiệp:</span>
                <select
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF7F2] border border-[#E2D5C3] text-[#2B2118] focus:outline-hidden focus:ring-2 focus:ring-[#8C6239]"
                >
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.template?.name || "Thiệp cưới"} (/{c.slug})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* URL DISPLAY BOX */}
          {currentCard ? (
            <div className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#EADDCB] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <span className="text-[11px] font-semibold text-[#8E7E70] uppercase tracking-wider block">
                  Đường dẫn hiện tại của thiệp
                </span>
                <div className="flex items-center gap-2 font-mono text-xs sm:text-sm text-[#2B2118] break-all">
                  <Globe className="w-4 h-4 shrink-0 text-[#8C6239]" />
                  <span className="font-semibold">{defaultFullUrl}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopy(defaultFullUrl, "default-url")}
                  className="px-3 py-2 rounded-xl text-xs font-medium bg-white hover:bg-[#F3ECE2] border border-[#E2D5C3] text-[#5C4D40] flex items-center gap-1.5 transition cursor-pointer"
                  title="Sao chép liên kết"
                >
                  {copiedKey === "default-url" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>

                <a
                  href={`/thiep/${currentCard.slug}?preview=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-xs font-medium bg-white hover:bg-[#F3ECE2] border border-[#E2D5C3] text-[#5C4D40] transition"
                  title="Xem thử thiệp"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={openSlugModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#8C6239] hover:bg-[#734f2d] text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <span>Đổi đường dẫn</span>
                  <span className="text-amber-200">›</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#FAF7F2] rounded-2xl p-6 text-center text-[#7A6B5D] text-xs space-y-2">
              <p>Bạn chưa tạo thiệp cưới nào trên tài khoản.</p>
              <Link
                href="/dashboard/cards"
                className="inline-flex items-center gap-1 text-[#8C6239] font-bold hover:underline"
              >
                <span>Tạo thiệp mới ngay</span>
                <span>→</span>
              </Link>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: TÊN MIỀN RIÊNG (CUSTOM DOMAIN)                 */}
        {/* ========================================================= */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EADDCB] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Globe className="w-4 h-4" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-serif text-[#2B2118]">
                  Tên miền riêng
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 uppercase tracking-wider flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-600" />
                  VIP
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#7A6B5D] max-w-2xl">
                Sử dụng tên miền riêng của bạn (VD:{" "}
                <strong className="text-[#2B2118]">damcuoilongngoc.com</strong> hoặc{" "}
                <strong className="text-[#2B2118]">wedding.longngoc.vn</strong>) giúp thiệp cưới
                chuyên nghiệp, sang trọng và độc nhất. Tự động cấp chứng chỉ bảo mật SSL (HTTPS) miễn phí.
              </p>
            </div>

            {/* BUTTON CREATE DOMAIN */}
            {isVipEntitled && (
              <button
                onClick={openConnectModal}
                className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-[#8C6239] hover:bg-[#734f2d] text-white flex items-center justify-center gap-2 transition cursor-pointer shadow-xs shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Kết nối tên miền</span>
              </button>
            )}
          </div>

          {/* ======================================================= */}
          {/* STATE A: NOT VIP -> ELEGANT GOLD LOCKED STATE           */}
          {/* ======================================================= */}
          {!isVipEntitled && (
            <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-linear-to-b from-amber-50/70 to-[#FAF7F2] p-6 sm:p-8 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold font-serif text-[#2B2118]">
                  Tính năng kết nối tên miền riêng dành cho gói VIP
                </h3>
                <p className="text-xs text-[#7A6B5D] leading-relaxed">
                  Gói dịch vụ hiện tại ({domainData?.capabilities.planName || "Miễn phí"}) chưa hỗ
                  trợ tên miền riêng. Nâng cấp lên gói VIP để mở khóa kết nối không giới hạn tên miền
                  và lưu trữ thiệp trọn đời.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/dashboard/billing?plan=VIP"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-linear-to-r from-amber-600 to-[#8C6239] hover:from-amber-700 hover:to-[#734f2d] text-white shadow-md transition cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-amber-200" />
                  <span>Nâng cấp gói VIP ngay</span>
                </Link>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* STATE B: VIP BUT EMPTY DOMAINS                          */}
          {/* ======================================================= */}
          {isVipEntitled && domainData?.domains.length === 0 && (
            <div className="rounded-2xl border border-[#EADDCB] bg-[#FAF7F2] p-8 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-white border border-[#E2D5C3] flex items-center justify-center text-[#8C6239]">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#2B2118]">
                Bạn chưa kết nối tên miền riêng nào
              </h3>
              <p className="text-xs text-[#7A6B5D] max-w-md mx-auto">
                Nếu bạn đã mua tên miền tại các nhà cung cấp như PA Vietnam, Mắt Bão, Cloudflare,
                GoDaddy... hãy bấm nút bên dưới để kết nối vào thiệp cưới.
              </p>
              <div className="pt-2">
                <button
                  onClick={openConnectModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#8C6239] text-white hover:bg-[#734f2d] transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm tên miền đầu tiên</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* STATE C: VIP WITH CONNECTED DOMAINS LIST                */}
          {/* ======================================================= */}
          {isVipEntitled && domainData && domainData.domains.length > 0 && (
            <div className="space-y-4">
              {domainData.domains.map((dom) => {
                const isActive = dom.status === "ACTIVE";
                const isVerifying = verifyingId === dom.id;

                return (
                  <div
                    key={dom.id}
                    className="rounded-2xl p-5 border border-[#EADDCB] bg-[#FAF7F2] hover:bg-white transition space-y-4 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* DOMAIN INFO */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-base font-bold text-[#2B2118]">
                            {dom.domain}
                          </span>
                          {/* STATUS BADGE */}
                          {isActive ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Đang hoạt động
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Chờ cấu hình DNS
                            </span>
                          )}

                          {/* SSL BADGE */}
                          {dom.sslStatus === "ISSUED" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              HTTPS Bảo Mật
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600">
                              SSL Đang chuẩn bị
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#7A6B5D]">
                          Gắn với thiệp:{" "}
                          <strong className="text-[#2B2118]">
                            {dom.card?.template?.name || "Thiệp cưới"} (/{dom.card?.slug})
                          </strong>
                        </p>

                        {dom.errorMessage && !isActive && (
                          <p className="text-xs text-rose-600 flex items-center gap-1 pt-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{dom.errorMessage}</span>
                          </p>
                        )}
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                        <button
                          onClick={() => handleVerifyDomain(dom)}
                          disabled={isVerifying}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#F3ECE2] border border-[#E2D5C3] text-[#2B2118] flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin text-[#8C6239]" : ""}`}
                          />
                          <span>{isVerifying ? "Đang kiểm tra..." : "Kiểm tra kết nối"}</span>
                        </button>

                        <button
                          onClick={() => openDnsGuide(dom)}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#F3ECE2] border border-[#E2D5C3] text-[#8C6239] flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Hướng dẫn trỏ DNS</span>
                        </button>

                        {isActive && (
                          <a
                            href={`https://${dom.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white hover:bg-[#F3ECE2] border border-[#E2D5C3] text-[#5C4D40] transition"
                            title="Mở trang thiệp qua tên miền riêng"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          onClick={() => setDeleteConfirmDomain(dom)}
                          className="p-2 rounded-xl bg-white hover:bg-rose-50 border border-[#E2D5C3] text-stone-400 hover:text-rose-600 transition cursor-pointer"
                          title="Gỡ tên miền này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* =========================================================== */}
      {/* MODAL 1: ĐỔI ĐƯỜNG DẪN THIỆP (SLUG)                         */}
      {/* =========================================================== */}
      {isSlugModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#EADDCB] space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADDCB]">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold font-serif text-[#2B2118]">
                  Đổi đường dẫn thiệp cưới
                </h3>
                <p className="text-xs text-[#7A6B5D]">
                  Tùy biến đuôi liên kết theo tên của cô dâu & chú rể.
                </p>
              </div>
              <button
                onClick={() => setIsSlugModalOpen(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlug} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5C4D40] block">
                  Đường dẫn mới:
                </label>
                <div className="flex items-center rounded-xl border border-[#E2D5C3] bg-[#FAF7F2] overflow-hidden focus-within:ring-2 focus-within:ring-[#8C6239] focus-within:border-transparent">
                  <span className="px-3 text-xs text-[#8E7E70] select-none font-mono">
                    {defaultPlatformDomain}/s/
                  </span>
                  <input
                    type="text"
                    value={slugValue}
                    onChange={(e) => setSlugValue(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                    placeholder="long-ngoc"
                    className="flex-1 py-2.5 pr-3 text-xs sm:text-sm font-mono text-[#2B2118] bg-transparent focus:outline-hidden"
                    required
                  />
                </div>
                <p className="text-[11px] text-[#8E7E70]">
                  Chỉ dùng chữ thường, số và dấu gạch ngang (VD: <code className="text-[#8C6239]">hoanglong-baongoc</code>).
                </p>
              </div>

              {slugError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{slugError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSlugModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7A6B5D] hover:bg-[#F3ECE2] transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={slugSaving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#8C6239] hover:bg-[#734f2d] text-white flex items-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {slugSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{slugSaving ? "Đang lưu..." : "Lưu thay đổi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================== */}
      {/* MODAL 2: KẾT NỐI TÊN MIỀN RIÊNG                              */}
      {/* =========================================================== */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-[#EADDCB] space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADDCB]">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold font-serif text-[#2B2118]">
                  Kết nối tên miền riêng
                </h3>
                <p className="text-xs text-[#7A6B5D]">
                  Gắn tên miền của bạn vào thiệp cưới để khách mời truy cập trực tiếp.
                </p>
              </div>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConnectDomain} className="space-y-4">
              {/* CHỌN THIỆP */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5C4D40] block">
                  Chọn thiệp cưới cần kết nối:
                </label>
                <select
                  value={connectCardId}
                  onChange={(e) => setConnectCardId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-[#FAF7F2] border border-[#E2D5C3] text-[#2B2118] focus:ring-2 focus:ring-[#8C6239] focus:outline-hidden"
                  required
                >
                  {cards.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.template?.name || "Thiệp cưới"} (/{c.slug})
                    </option>
                  ))}
                </select>
              </div>

              {/* TÊN MIỀN */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5C4D40] block">
                  Tên miền của bạn:
                </label>
                <div className="flex items-center rounded-xl border border-[#E2D5C3] bg-[#FAF7F2] overflow-hidden focus-within:ring-2 focus-within:ring-[#8C6239] focus-within:border-transparent">
                  <span className="px-3 text-xs text-[#8E7E70] select-none font-mono">https://</span>
                  <input
                    type="text"
                    value={connectDomain}
                    onChange={(e) => setConnectDomain(e.target.value)}
                    placeholder="damcuoilongngoc.com"
                    className="flex-1 py-2.5 pr-3 text-xs sm:text-sm font-mono text-[#2B2118] bg-transparent focus:outline-hidden"
                    required
                  />
                </div>
                <p className="text-[11px] text-[#8E7E70]">
                  Hỗ trợ cả tên miền gốc (VD: <code className="text-[#8C6239]">longngoc.wedding</code>) hoặc tên miền phụ (VD: <code className="text-[#8C6239]">damcuoi.longngoc.vn</code>).
                </p>
              </div>

              {connectError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{connectError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7A6B5D] hover:bg-[#F3ECE2] transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={connectSaving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#8C6239] hover:bg-[#734f2d] text-white flex items-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {connectSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{connectSaving ? "Đang kiểm tra..." : "Xác nhận kết nối"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================== */}
      {/* MODAL 3: HƯỚNG DẪN CẤU HÌNH DNS                              */}
      {/* =========================================================== */}
      {isDnsGuideOpen && activeGuideDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-[#EADDCB] space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADDCB]">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold font-serif text-[#2B2118]">
                    Hướng dẫn trỏ DNS tên miền
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F3ECE2] text-[#8C6239] font-mono">
                    {activeGuideDomain.domain}
                  </span>
                </div>
                <p className="text-xs text-[#7A6B5D]">
                  Cấu hình các bản ghi bên dưới tại trang quản trị nhà đăng ký tên miền của bạn.
                </p>
              </div>
              <button
                onClick={() => setIsDnsGuideOpen(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* DNS RECORDS TABLE */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#5C4D40] block">
                Các bản ghi DNS cần thêm:
              </span>

              <div className="space-y-2.5">
                {activeDnsRecords.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EADDCB] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#8C6239] text-white">
                          {rec.type}
                        </span>
                        <span className="text-xs font-semibold text-[#2B2118]">
                          Tên (Host): <code className="font-mono text-[#8C6239]">{rec.name}</code>
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(rec.value, `dns-rec-${idx}`)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-[#E2D5C3] text-[#5C4D40] hover:bg-[#F3ECE2] flex items-center gap-1 transition cursor-pointer"
                      >
                        {copiedKey === `dns-rec-${idx}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-white rounded-xl p-2.5 border border-[#E2D5C3] font-mono text-xs text-[#2B2118] break-all">
                      {rec.value}
                    </div>

                    <p className="text-[11px] text-[#8E7E70]">{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* STEP BY STEP GUIDANCE */}
            <div className="rounded-2xl p-4 bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs text-amber-950">
              <span className="font-bold flex items-center gap-1 text-amber-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                3 bước hoàn tất kết nối:
              </span>
              <ol className="list-decimal pl-4 space-y-1 text-[#5C4D40]">
                <li>
                  Đăng nhập vào trang quản trị tên miền nơi bạn đã mua (PA Vietnam, Mắt Bão, Nhân Hòa, Cloudflare, GoDaddy, Namecheap...).
                </li>
                <li>
                  Vào mục <strong>Quản lý DNS (DNS Records)</strong> và thêm bản ghi <strong>CNAME</strong> theo giá trị ở bảng trên.
                </li>
                <li>
                  Lưu bản ghi, sau đó quay lại đây và bấm nút <strong>"Kiểm tra kết nối"</strong>.
                </li>
              </ol>
              <p className="text-[11px] text-amber-800 pt-1">
                ⚡ Thời gian DNS cập nhật thường mất từ 1 - 15 phút (tối đa 24h tùy nhà cung cấp mạng).
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleVerifyDomain(activeGuideDomain);
                  setIsDnsGuideOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#8C6239] hover:bg-[#734f2d] text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Kiểm tra kết nối ngay</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDnsGuideOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7A6B5D] hover:bg-[#F3ECE2] transition"
              >
                Đã hiểu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================== */}
      {/* MODAL 4: CONFIRM DELETE DOMAIN                              */}
      {/* =========================================================== */}
      {deleteConfirmDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#EADDCB] space-y-4 animate-scaleUp text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold font-serif text-[#2B2118]">
                Xác nhận gỡ tên miền?
              </h3>
              <p className="text-xs text-[#7A6B5D] leading-relaxed">
                Tên miền <strong className="font-mono text-[#2B2118]">{deleteConfirmDomain.domain}</strong> sẽ bị gỡ khỏi thiệp cưới. Bạn có thể kết nối lại bất kỳ lúc nào.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmDomain(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7A6B5D] hover:bg-[#F3ECE2] transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteDomain}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isDeleting ? "Đang gỡ..." : "Xác nhận gỡ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2B2118] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-slideUp text-xs sm:text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
