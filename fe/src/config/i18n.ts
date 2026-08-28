export type SupportedLanguage = "vi" | "en" | "zh";

export const DICTIONARY = {
  vi: {
    // Navigation
    homeNavCollections: "MẪU THIỆP",
    homeNavJournal: "CẨM NANG",
    homeNavPricing: "BẢNG GIÁ",
    homeNavConcierge: "LIÊN HỆ",
    homeCreateBtn: "TẠO THIỆP",

    // Common Footer
    footerPrivacy: "Chính Sách Bảo Mật",
    footerTerms: "Điều Khoản Dịch Vụ",
    footerSustainability: "Phát Triển Bền Vững",
    footerAccessibility: "Khả Năng Tiếp Cận",
    footerCopyright: "© 2024 CardVite Event Studio. Bảo lưu mọi quyền.",

    // Hero Section (Home)
    homeTagWedding: "WEDDING",
    homeTagGala: "GALA",
    homeHeroTitle1: "Trao thiệp trang",
    homeHeroTitle2: "trọng —",
    homeHeroTitleEm1: "Chạm vạn cảm xúc",
    homeHeroTitle3: "chỉ trong",
    homeHeroTitleEm2: "5 phút.",

    // Simulator Form
    homeFieldCoupleName: "Tên Cô Dâu & Chú Rể",
    homeFieldEffect: "Hiệu Ứng Thiệp",
    homeEffectWaxSeal: "Wax Seal",
    homeEffectFlowerGate: "Flower Gate",
    homeEffectGiftBox: "Gift Box",
    homeBtnPreview: "TẠO BẢN XEM TRƯỚC",

    // Phone Mockup
    homePhoneInvited: "YOU ARE INVITED",
    homePhoneDate: "September 14th, 2024",
    homePhoneVenue: "Villa Balbiano, Lake Como",
    homePhoneRsvp: "RSVP",

    // Bento Grid: Trải Nghiệm Thượng Lưu Số
    homeSectionExperienceTitle: "Trải Nghiệm",
    homeSectionExperienceEm: "Thượng Lưu",
    homeSectionExperienceSuffix: "Số",
    homeSectionExperienceSub:
      "Kết hợp nghệ thuật thiệp giấy truyền thống với công nghệ hiện đại, mang đến trải nghiệm hoàn hảo cho ngày trọng đại.",

    // 3D Carousel & 3-Step Process (Home)
    homeCarouselTitle1: "Mẫu thiệp cưới online",
    homeCarouselTitleEm: "đẹp nhất",
    homeCarouselSub: "Khám phá những mẫu thiệp cưới được thiết kế tinh tế và hiện đại.",
    homeViewAllTemplates: "Xem tất cả mẫu thiệp",
    homeStepsTitle1: "Tạo thiệp cưới online",
    homeStepsTitleEm: "trong 10 phút",
    homeStep1Title: "Chọn mẫu",
    homeStep1Desc: "Duyệt kho thiệp và chọn mẫu yêu thích phù hợp phong cách.",
    homeStep2Title: "Điền thông tin",
    homeStep2Desc: "Cập nhật tên, ngày giờ, địa điểm, ảnh và nhạc nền của bạn.",
    homeStep3Title: "Gửi thiệp",
    homeStep3Desc: "Nhận link thiệp cưới và gửi đến quan khách ngay lập tức.",
    homeStepsBtn: "Bắt đầu tạo thiệp",

    homeCard1Title: "Thiệp Gửi Đích Danh Từng Khách Mời",
    homeCard1Desc:
      "Cá nhân hóa từng lời mời với tên khách được in trang trọng, tạo cảm giác được trân trọng tuyệt đối.",

    homeCard2Title: "Quản Lý RSVP & Chốt Bàn",
    homeCard2Desc:
      "Tự động hóa việc xác nhận tham dự và sắp xếp chỗ ngồi thông minh.",

    homeCard3Title: "Hộp Mừng Cưới VietQR",
    homeCard3Desc:
      "Tích hợp mã QR thanh toán tinh tế, tiện lợi cho khách mời từ xa.",

    homeCard4Title: "Mini–Game Tương Tác",
    homeCard4Desc:
      "Gắn kết khách mời trước sự kiện với các trò chơi nhỏ thú vị.",

    homeCard5Title: "Album Ảnh 3D & Nhạc",
    homeCard5Desc:
      "Trình diễn bộ ảnh cưới ấn tượng trên nền nhạc yêu thích.",

    homeCard6Title: "Đa Ngôn Ngữ Toàn Cầu",
    homeCard6Desc:
      "Tự động dịch nội dung thiệp dựa trên ngôn ngữ trình duyệt của khách mời, xóa nhòa khoảng cách địa lý.",

    // Interactive Animation Modules
    homeMusicTitle: "Kho Nhạc Nền Tuyển Chọn",
    homeMusicSub: "Âm nhạc chạm đến trái tim. Nghe thử các giai điệu lãng mạn bất hủ dành cho ngày cưới.",
    homeMusicNowPlaying: "Đang phát",
    homeWaxStudioTitle: "Trải Nghiệm Đóng Dấu Sáp 3D",
    homeWaxStudioSub: "Chọn màu sáp hoàng gia và chạm để phong ấn bức thư tình của bạn.",
    homeWaxColorGold: "Hoàng Kim",
    homeWaxColorWine: "Đỏ Rượu Vang",
    homeWaxColorEmerald: "Xanh Emerald",
    homeWaxColorRose: "Hồng Thạch Anh",
    homeWaxTapPrompt: "Chạm vào con dấu để dập sáp",
    homeWishesTitle: "Bức Tường Lời Chúc Thời Gian Thực",
    homeWishesSub: "Hàng ngàn lời chúc phúc ấm áp đang được gửi đến các cặp đôi mỗi ngày.",
    homeWishInputPlaceholder: "Nhập lời chúc thử nghiệm của bạn...",
    homeSendWishBtn: "Thả Tim Lời Chúc",
    homeQrTitle: "Hộp Mừng Cưới Thông Minh VietQR",
    homeQrSub: "Mô phỏng trải nghiệm mừng cưới tinh tế, tự động xác nhận số tiền.",
    homeQrSelectAmount: "Chọn số tiền mừng:",
    homeQrScanHint: "Mã VietQR tự động điền nội dung chuyển khoản",
    homeQrSuccessToast: "Xác nhận đã nhận mừng cưới thành công! 🎉",

    // Mời đích danh & RSVP Tracker
    homeNamedTitle1: "Mời đích danh từng khách,",
    homeNamedTitleEm: "biết ai sẽ đến",
    homeNamedSub: "Mỗi khách nhận một tấm thiệp để đúng tên mình, bấm một nút để báo có đến hay không — bạn khỏi phải nhắn tin hỏi từng người.",
    homeNamedFeat1Title: "Thiệp để đúng tên từng khách",
    homeNamedFeat1Desc: "Ai mở thiệp cũng thấy tên mình trên đó — như được viết tay riêng, người lớn tuổi cũng thấy được trân trọng.",
    homeNamedFeat2Title: "Khách báo tham dự chỉ một nút bấm",
    homeNamedFeat2Desc: "Bấm «Tôi sẽ đến» ngay trên thiệp, ghi luôn đi mấy người — không cần cài gì, không cần tài khoản.",
    homeNamedFeat3Title: "Bạn biết ngay ai đến, ai bận",
    homeNamedFeat3Desc: "Mở một trang là thấy đầy đủ: bao nhiêu người đến, ai chưa trả lời — khỏi ghi chép sổ tay hay dò tin nhắn.",
    homeNamedFeat4Title: "Chốt bàn với nhà hàng dễ dàng",
    homeNamedFeat4Desc: "Dồn danh sách khách một lần là có thiệp cho từng người; gần ngày cưới tải file tổng xuống đưa nhà hàng đặt tiệc.",

    // Hỗ trợ Đa Ngôn Ngữ Song Ngữ
    homeBilingualTitle1: "Hỗ trợ",
    homeBilingualTitleEm: "Đa Ngôn Ngữ",
    homeBilingualSub: "Thiệp cưới của bạn sẵn sàng cho khách mời quốc tế với khả năng hiển thị song ngữ linh hoạt.",
    homeBilingualFeat1: "Thiệp hiển thị song song hai ngôn ngữ",
    homeBilingualFeat2: "Hỗ trợ hiển thị song song nội dung",
    homeBilingualFeat3: "Có sẵn bản dịch mẫu chuyên nghiệp",
    homeBilingualFeat4: "Tùy chỉnh bản dịch dễ dàng",
    homeBilingualBtn: "Tạo thiệp ngay",

    // Cảm hứng từ những cặp đôi
    homeCouplesTitle1: "Cảm hứng từ những",
    homeCouplesTitleEm: "cặp đôi",
    homeCouplesSub: "Hơn 15.000 cặp đôi đã trao gửi yêu thương và tạo nên ngày cưới hoàn hảo cùng CardVite.",

    // -------------------------------------------------------------
    // COLLECTIONS PAGE (/collections)
    // -------------------------------------------------------------
    collectionsBadge: "• BỘ SƯU TẬP CAO CẤP •",
    collectionsTitle: "Kho Mẫu Thiệp Đa Danh Mục.",
    collectionsDesc:
      "Khám phá hàng trăm thiết kế thiệp cưới, đầy tháng, sinh nhật và sự kiện độc quyền. Được chế tác với sự tinh tế trong từng pixel, tối giản nhưng đậm chất nghệ thuật, hoàn hảo để lưu giữ khoảnh khắc của bạn.",
    filterAll: "Tất Cả",
    filterWedding: "Đám Cưới",
    filterNewborn: "Đầy Tháng & Thôi Nôi",
    filterBirthday: "Sinh Nhật",
    filterEvent: "Sự Kiện",
    stylePrefix: "PHONG CÁCH:",
    styleAll: "Tất Cả Phong Cách",
    badgeNew: "MỚI",
    useTemplateBtn: "Dùng Mẫu Này",
    viewMoreTemplates: "XEM THÊM 240+ MẪU",
    faqHeading: "Câu Hỏi Thường Gặp",
    faqSubheading: "GIẢI ĐÁP THẮC MẮC",
    ctaBannerTitle: "Sẵn sàng tạo tấm thiệp độc bản của bạn?",
    ctaBannerBtn: "BẮT ĐẦU THIẾT KẾ",

    // -------------------------------------------------------------
    // PRICING PAGE (/pricing)
    // -------------------------------------------------------------
    pricingBadge: "• BẢNG GIÁ DỊCH VỤ •",
    pricingTitle: "Chọn Gói Dịch Vụ Phù Hợp.",
    pricingDesc:
      "Minh bạch, rõ ràng và đẳng cấp. Chọn gói dịch vụ phù hợp nhất để biến sự kiện của bạn thành trải nghiệm số hoàn hảo.",
    planFreeTitle: "DÙNG THỬ",
    planFreePrice: "0đ",
    planFreeDesc: "Trải nghiệm các tính năng cơ bản của thiệp mời số.",
    planFreeFeat1: "Mẫu thiệp cơ bản",
    planFreeFeat2: "Tùy chỉnh thông tin cơ bản",
    planFreeFeat3: "Thời gian sử dụng giới hạn",
    btnStartFree: "BẮT ĐẦU MIỄN PHÍ",

    planBasicTitle: "TIÊU CHUẨN",
    planBasicPrice: "199.000đ",
    planBasicDesc: "Tối ưu cho đám cưới và sự kiện cá nhân với các tiện ích nâng cao.",
    planBasicFeat1: "Nhạc nền MP3 tự chọn",
    planBasicFeat2: "Tích hợp VietQR mừng cưới",
    planBasicFeat3: "Link riêng cho từng khách (Individual links)",
    planBasicFeat4: "Lưu trữ vĩnh viễn (Permanent access)",
    btnSelectBasic: "CHỌN TIÊU CHUẨN",

    planVipTitle: "VIP HOÀNG GIA",
    planVipPrice: "249.000đ",
    planVipPopular: "★ PHỔ BIẾN NHẤT",
    planVipDesc: "Trải nghiệm sang trọng tuyệt đối, thiết kế tinh xảo không tì vết.",
    planVipFeat1: "Mọi tính năng của Tiêu Chuẩn",
    planVipFeat2: "Hiệu ứng 3D sáp niêm phong (Wax seal)",
    planVipFeat3: "Không có logo CardVite (White-label)",
    planVipFeat4: "Xuất danh sách khách mời ra Excel",
    planVipFeat5: "Hỗ trợ ưu tiên 24/7",
    btnUpgradeVip: "NÂNG CẤP VIP",

    // -------------------------------------------------------------
    // JOURNAL / BLOG PAGE (/journal)
    // -------------------------------------------------------------
    journalBadge: "• CARDVITE JOURNAL •",
    journalTitle: "Cẩm Nang & Cảm Hứng Tổ Chức Tiệc",
    journalDesc:
      "Khám phá xu hướng thiết kế thiệp mời mới nhất, nghệ thuật viết lời mời tinh tế và cẩm nang toàn diện cho những sự kiện trọng đại của bạn.",
    tagAll: "Tất Cả",
    tagWeddingTrend: "Xu Hướng Cưới",
    tagNewbornCeremony: "Nghi Thức Thôi Nôi",
    tagInviteEtiquette: "Lời Mời Chuẩn",
    tagCompare: "So Sánh Thiệp Số",
    readArticleBtn: "ĐỌC BÀI VIẾT",

    // -------------------------------------------------------------
    // CONCIERGE / CONTACT PAGE (/concierge)
    // -------------------------------------------------------------
    conciergeBadge: "• CARDVITE CONCIERGE •",
    conciergeTitle: "Đăng Ký Thuê Thiết Kế Riêng.",
    conciergeDesc:
      "Chuyên viên thiết kế của chúng tôi sẽ liên hệ lại với bạn trong vòng 15 phút làm việc để bắt đầu hiện thực hóa ý tưởng cho sự kiện của bạn.",
    zaloSupport: "ZALO HỖ TRỢ",
    hotlineSupport: "HOTLINE (24/7)",
    emailSupport: "EMAIL",
    studioSupport: "CREATIVE STUDIO",
    studioAddress: "Tầng 12, The Landmark, Quận 1, TP. Hồ Chí Minh",
    reqFormTitle: "Thông Tin Yêu Cầu",
    fieldFullName: "Họ & Tên",
    fieldPhone: "Số Điện Thoại (Zalo)",
    fieldEmail: "Email",
    fieldServicePackage: "Gói Dịch Vụ",
    fieldFavoriteTemplate: "Mẫu Thiệp Yêu Thích (Tùy chọn)",
    fieldNotes: "Ghi Chú Đặc Biệt / Ý Tưởng Của Bạn",
    fieldNotesPlaceholder: "Hãy mô tả ngắn gọn về sự kiện hoặc phong cách bạn mong muốn...",
    btnSubmitConcierge: "GỬI ĐĂNG KÝ THUÊ THIỆP",
    conciergeSuccessTitle: "Đã Gửi Yêu Cầu Thành Công!",
    conciergeSuccessDesc: "Chuyên viên CardVite sẽ liên hệ với bạn qua Zalo/SĐT trong vòng 15 phút.",

    // Envelope & Opening
    openCard: "Mở Thiệp",
    tapToOpen: "Chạm vào con dấu để mở",
    cordiallyInvites: "Trân trọng kính mời",
    invitationTo: "Kính gửi",
    saveTheDate: "Save The Date",
    invitationLetter: "Thư Mời Thành Hôn",

    // Couple & Bio
    groom: "Chú Rể",
    bride: "Cô Dâu",
    father: "Bố",
    mother: "Mẹ",
    weddingOf: "Lễ Cưới Của",

    // Countdown & Calendar
    countdownTitle: "Đếm ngược ngày trọng đại",
    days: "Ngày",
    hours: "Giờ",
    minutes: "Phút",
    seconds: "Giây",
    addToCalendar: "Thêm vào Google Calendar",

    // Events & Location
    eventsTitle: "Sự Kiện Trọng Đại",
    time: "Thời gian",
    venue: "Địa điểm",
    openMap: "Chỉ đường trên Google Maps",
    lunarDatePrefix: "Tức",

    // Gallery
    galleryTitle: "Album Khoảnh Khắc",

    // RSVP Form
    rsvpTitle: "Xác Nhận Tham Dự (RSVP)",
    rsvpSubtitle: "Vui lòng phản hồi sớm để chúng mình chuẩn bị chu đáo nhất nhé.",
    fullName: "Họ và tên của bạn",
    phone: "Số điện thoại (tùy chọn)",
    attendingQuestion: "Bạn sẽ tham dự chứ?",
    willAttend: "Sẽ tham dự",
    willDecline: "Bận không đến",
    guestCountLabel: "Số người tham dự",
    people: "người",
    dietaryNotes: "Lời nhắn / Ăn chay / Yêu cầu đặc biệt",
    submitRsvp: "Gửi Xác Nhận Ngay",
    submitting: "Đang gửi phản hồi...",
    rsvpSuccessTitle: "Xác nhận thành công!",
    rsvpSuccessDesc: "Cảm ơn bạn đã phản hồi. Sự hiện diện của bạn là niềm vinh hạnh của chúng mình!",
    btnRsvp: "Xác Nhận Tham Dự",

    // Gift & Banking
    giftTitle: "Hộp Mừng Cưới / Gửi Quà",
    giftSubtitle: "Món quà của bạn là lời chúc phúc quý giá nhất dành cho chúng mình.",
    groomGiftTab: "Mừng Chú Rể",
    brideGiftTab: "Mừng Cô Dâu",
    bank: "Ngân hàng",
    accountHolder: "Chủ tài khoản",
    accountNumber: "Số tài khoản",
    copySuccess: "Đã sao chép",
    btnGift: "Mừng Cưới",

    // Wishes & Guestbook
    guestbookTitle: "Sổ Lưu Bút & Lời Chúc",
    guestbookSubtitle: "Hãy để lại những lời chúc phúc ngọt ngào nhất dành cho chúng mình nhé!",
    yourName: "Tên của bạn *",
    relationship: "Mối quan hệ (VD: Bạn thân)",
    writeWish: "Viết lời chúc của bạn ở đây...",
    sendWish: "Gửi Lời Chúc",
    wishSuccess: "Cảm ơn lời chúc tuyệt vời của bạn! ❤️",
    emptyWishes: "Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc nhé! ✨",

    // Newborn
    babyTitle: "Thông Tin Thiên Thần Nhỏ",
    birthDate: "Ngày sinh",
    weight: "Cân nặng",
    height: "Chiều cao",
    fullMonthCeremony: "Lễ Đầy Tháng",
    oneYearCeremony: "Lễ Thôi Nôi (1 Tuổi)",
    announcementOnly: "Báo Tin Vui Chào Đời",
    babyGiftTab: "Quà Tặng Cho Bé",
    bocDoGameTitle: "Mini-Game Dự Đoán Thôi Nôi",
    bocDoQuestion: "Bé Sẽ Bốc Gì?",
    bocDoSubtitle: "Hãy chọn 1 món đồ bạn nghĩ bé sẽ bốc trong nghi thức thôi nôi nhé!",
    votes: "lượt",

    // Birthday
    birthdayTitle: "Happy Birthday Party",
    turningAge: "Tuổi mới",
    celebrant: "Chủ nhân bữa tiệc",
    birthdayGiftTab: "Gửi Quà Sinh Nhật",
  },

  en: {
    // Navigation
    homeNavCollections: "TEMPLATES",
    homeNavJournal: "JOURNAL",
    homeNavPricing: "PRICING",
    homeNavConcierge: "CONCIERGE",
    homeCreateBtn: "CREATE",

    // Common Footer
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Service",
    footerSustainability: "Sustainability",
    footerAccessibility: "Accessibility",
    footerCopyright: "© 2024 CardVite Event Studio. All rights reserved.",

    // Hero Section (Home)
    homeTagWedding: "WEDDING",
    homeTagGala: "GALA",
    homeHeroTitle1: "Delivering elegant",
    homeHeroTitle2: "invitations —",
    homeHeroTitleEm1: "Touching millions of hearts",
    homeHeroTitle3: "in just",
    homeHeroTitleEm2: "5 minutes.",

    // Simulator Form
    homeFieldCoupleName: "Bride & Groom Names",
    homeFieldEffect: "Invitation Effect",
    homeEffectWaxSeal: "Wax Seal",
    homeEffectFlowerGate: "Flower Gate",
    homeEffectGiftBox: "Gift Box",
    homeBtnPreview: "GENERATE PREVIEW",

    // Phone Mockup
    homePhoneInvited: "YOU ARE INVITED",
    homePhoneDate: "September 14th, 2024",
    homePhoneVenue: "Villa Balbiano, Lake Como",
    homePhoneRsvp: "RSVP",

    // Bento Grid: Trải Nghiệm Thượng Lưu Số
    homeSectionExperienceTitle: "A Modern",
    homeSectionExperienceEm: "Luxury",
    homeSectionExperienceSuffix: "Experience",
    homeSectionExperienceSub:
      "Blending traditional paper invitation artistry with modern technology, crafting the ultimate experience for your special day.",

    // 3D Carousel & 3-Step Process (Home)
    homeCarouselTitle1: "Most Beautiful Online",
    homeCarouselTitleEm: "Wedding Cards",
    homeCarouselSub: "Discover exquisitely crafted modern wedding invitations.",
    homeViewAllTemplates: "View All Templates",
    homeStepsTitle1: "Create Your Digital Invitation",
    homeStepsTitleEm: "in 10 minutes",
    homeStep1Title: "Choose a Design",
    homeStep1Desc: "Browse our curated repository and select a style that fits you.",
    homeStep2Title: "Fill in Details",
    homeStep2Desc: "Customize couple names, schedules, locations, gallery & music.",
    homeStep3Title: "Send Out Cards",
    homeStep3Desc: "Generate individual links and share instantly with guests.",
    homeStepsBtn: "Start Creating Now",

    homeCard1Title: "Personalized Guest Invitations",
    homeCard1Desc:
      "Every guest receives an exclusive personal link with their name elegantly rendered, inspiring deep heartfelt appreciation.",

    homeCard2Title: "RSVP Tracking & Seating Planner",
    homeCard2Desc:
      "Automate attendance confirmations and seamlessly organize table seating arrangements.",

    homeCard3Title: "Smart VietQR Registry Box",
    homeCard3Desc:
      "Integrated seamless QR banking registry, convenient for distant family and friends.",

    homeCard4Title: "Interactive Mini–Games",
    homeCard4Desc:
      "Engage your guests ahead of the big day with delightful guessing and party games.",

    homeCard5Title: "3D Photo Gallery & Music",
    homeCard5Desc:
      "Showcase your breathtaking wedding portraits set against your favorite background soundtrack.",

    homeCard6Title: "Global Multi-Language Support",
    homeCard6Desc:
      "Automatically translates the invitation based on each international guest's browser language, erasing borders.",

    // Interactive Animation Modules
    homeMusicTitle: "Curated Soundtrack Studio",
    homeMusicSub: "Melodies that touch the soul. Preview timeless romantic wedding soundtracks.",
    homeMusicNowPlaying: "Now playing",
    homeWaxStudioTitle: "3D Wax Seal Experience Studio",
    homeWaxStudioSub: "Select a royal wax shade and tap to seal your bespoke love letter.",
    homeWaxColorGold: "Royal Gold",
    homeWaxColorWine: "Vintage Wine",
    homeWaxColorEmerald: "Emerald Leaf",
    homeWaxColorRose: "Rose Quartz",
    homeWaxTapPrompt: "Tap the seal to stamp the envelope",
    homeWishesTitle: "Real-Time Floating Wishes Wall",
    homeWishesSub: "Thousands of heartfelt blessings delivered to happy couples every day.",
    homeWishInputPlaceholder: "Type your trial blessing message...",
    homeSendWishBtn: "Send Love Blessing",
    homeQrTitle: "Smart VietQR Registry Box",
    homeQrSub: "Simulate a frictionless, elegant banking gift experience with auto-confirmation.",
    homeQrSelectAmount: "Select gift amount:",
    homeQrScanHint: "Dynamic VietQR automatically fills account and message",
    homeQrSuccessToast: "Wedding gift confirmed received successfully! 🎉",

    // Mời đích danh & RSVP Tracker
    homeNamedTitle1: "Personalized Invitations,",
    homeNamedTitleEm: "Know Who Will Come",
    homeNamedSub: "Each guest receives an invitation addressed to them personally with a 1-click RSVP response — no more endless texting to check attendance.",
    homeNamedFeat1Title: "Personalized with each guest's name",
    homeNamedFeat1Desc: "Every guest sees their name prominently rendered — giving a thoughtful, handcrafted touch that elders deeply appreciate.",
    homeNamedFeat2Title: "One-click RSVP confirmation",
    homeNamedFeat2Desc: "Guests simply tap «I will attend» and choose guest count — no app downloads, no registrations required.",
    homeNamedFeat3Title: "Know instantly who attends and who declines",
    homeNamedFeat3Desc: "A single dashboard displays full stats: total attendees, declines, and pending replies.",
    homeNamedFeat4Title: "Effortless banquet table seating planning",
    homeNamedFeat4Desc: "Consolidate your guest list once, then download a comprehensive summary spreadsheet for your venue catering.",

    // Hỗ trợ Đa Ngôn Ngữ Song Ngữ
    homeBilingualTitle1: "Dual",
    homeBilingualTitleEm: "Multi-Language",
    homeBilingualSub: "Your digital wedding invitation is ready for global guests with flexible bilingual side-by-side display.",
    homeBilingualFeat1: "Simultaneous dual-language display",
    homeBilingualFeat2: "Parallel side-by-side content rendering",
    homeBilingualFeat3: "Professional pre-translated templates",
    homeBilingualFeat4: "Easy translation customization",
    homeBilingualBtn: "Create Invitation Now",

    // Cảm hứng từ những cặp đôi
    homeCouplesTitle1: "Inspiration from our",
    homeCouplesTitleEm: "Happy Couples",
    homeCouplesSub: "Over 15,000 couples have celebrated their unforgettable wedding journey with CardVite.",

    // -------------------------------------------------------------
    // COLLECTIONS PAGE (/collections)
    // -------------------------------------------------------------
    collectionsBadge: "• EXCLUSIVE REPOSITORY •",
    collectionsTitle: "Multi-Category Template Gallery.",
    collectionsDesc:
      "Explore hundreds of exclusive online invitation designs for Weddings, Baby Celebrations, Birthdays, and Corporate Galas. Pixel-perfect, minimalist yet deeply artistic.",
    filterAll: "All Templates",
    filterWedding: "Wedding",
    filterNewborn: "Baby & Full Month",
    filterBirthday: "Birthday",
    filterEvent: "Events & Gala",
    stylePrefix: "STYLE:",
    styleAll: "All Styles",
    badgeNew: "NEW",
    useTemplateBtn: "Use Template",
    viewMoreTemplates: "LOAD 240+ MORE TEMPLATES",
    faqHeading: "Frequently Asked Questions",
    faqSubheading: "ANSWERS & GUIDANCE",
    ctaBannerTitle: "Ready to design your bespoke invitation?",
    ctaBannerBtn: "START DESIGNING NOW",

    // -------------------------------------------------------------
    // PRICING PAGE (/pricing)
    // -------------------------------------------------------------
    pricingBadge: "• SERVICE TIERS •",
    pricingTitle: "Select The Perfect Plan.",
    pricingDesc:
      "Transparent, straightforward, and premium. Choose the ideal plan to elevate your event into a seamless digital journey.",
    planFreeTitle: "TRIAL",
    planFreePrice: "$0",
    planFreeDesc: "Experience the core features of digital invitations with zero commitment.",
    planFreeFeat1: "Access standard templates",
    planFreeFeat2: "Basic content customization",
    planFreeFeat3: "Limited duration access",
    btnStartFree: "START FREE",

    planBasicTitle: "STANDARD",
    planBasicPrice: "$9.90",
    planBasicDesc: "Tailored for intimate weddings and celebrations with essential perks.",
    planBasicFeat1: "Custom MP3 soundtrack",
    planBasicFeat2: "QR banking gift registry",
    planBasicFeat3: "Personalized guest links (G-XXXX)",
    planBasicFeat4: "Permanent lifetime access",
    btnSelectBasic: "CHOOSE STANDARD",

    planVipTitle: "ROYAL VIP",
    planVipPrice: "$14.90",
    planVipPopular: "★ MOST POPULAR",
    planVipDesc: "Flawless luxury experience, exquisite craftsmanship with zero compromises.",
    planVipFeat1: "All Standard Tier features",
    planVipFeat2: "3D Wax Seal opening effect",
    planVipFeat3: "100% White-label (No CardVite badge)",
    planVipFeat4: "Export RSVP guest lists to Excel",
    planVipFeat5: "24/7 Priority VIP Concierge",
    btnUpgradeVip: "UPGRADE TO VIP",

    // -------------------------------------------------------------
    // JOURNAL / BLOG PAGE (/journal)
    // -------------------------------------------------------------
    journalBadge: "• CARDVITE JOURNAL •",
    journalTitle: "Event Guides & Inspirations",
    journalDesc:
      "Discover the latest invitation trends, nuanced etiquette tips, and comprehensive guides for your landmark celebrations.",
    tagAll: "All Posts",
    tagWeddingTrend: "Wedding Trends",
    tagNewbornCeremony: "Baby Ceremonies",
    tagInviteEtiquette: "Invitation Etiquette",
    tagCompare: "Digital vs Paper",
    readArticleBtn: "READ ARTICLE",

    // -------------------------------------------------------------
    // CONCIERGE / CONTACT PAGE (/concierge)
    // -------------------------------------------------------------
    conciergeBadge: "• CARDVITE CONCIERGE •",
    conciergeTitle: "Request Bespoke Studio Design.",
    conciergeDesc:
      "Our bespoke design consultants will reach out to you within 15 business minutes to bring your dream event vision to life.",
    zaloSupport: "ZALO SUPPORT",
    hotlineSupport: "HOTLINE (24/7)",
    emailSupport: "EMAIL",
    studioSupport: "CREATIVE STUDIO",
    studioAddress: "Level 12, The Landmark, District 1, Ho Chi Minh City",
    reqFormTitle: "Inquiry Details",
    fieldFullName: "Full Name",
    fieldPhone: "Phone Number (Zalo/WhatsApp)",
    fieldEmail: "Email",
    fieldServicePackage: "Service Package",
    fieldFavoriteTemplate: "Preferred Template (Optional)",
    fieldNotes: "Special Notes / Custom Ideas",
    fieldNotesPlaceholder: "Briefly describe your vision, dates, soundtrack, or custom color scheme...",
    btnSubmitConcierge: "SUBMIT INQUIRY",
    conciergeSuccessTitle: "Inquiry Submitted Successfully!",
    conciergeSuccessDesc: "A CardVite design specialist will contact you via WhatsApp/Zalo within 15 minutes.",

    // Envelope & Opening
    openCard: "Open Invitation",
    tapToOpen: "Tap the wax seal to open",
    cordiallyInvites: "Cordially Invites",
    invitationTo: "Dear",
    saveTheDate: "Save The Date",
    invitationLetter: "Wedding Invitation",

    // Couple & Bio
    groom: "Groom",
    bride: "Bride",
    father: "Father",
    mother: "Mother",
    weddingOf: "The Wedding Of",

    // Countdown & Calendar
    countdownTitle: "Countdown to the big day",
    days: "Days",
    hours: "Hours",
    minutes: "Mins",
    seconds: "Secs",
    addToCalendar: "Add to Google Calendar",

    // Events & Location
    eventsTitle: "Wedding Ceremonies",
    time: "Time",
    venue: "Venue",
    openMap: "Get Directions on Google Maps",
    lunarDatePrefix: "Lunar",

    // Gallery
    galleryTitle: "Photo Gallery",

    // RSVP Form
    rsvpTitle: "RSVP Confirmation",
    rsvpSubtitle: "Please let us know if you can join us by confirming below.",
    fullName: "Your Full Name",
    phone: "Phone Number (optional)",
    attendingQuestion: "Will you be attending?",
    willAttend: "Accept with Pleasure",
    willDecline: "Declines with Regret",
    guestCountLabel: "Number of Guests",
    people: "guests",
    dietaryNotes: "Dietary restrictions or sweet wishes",
    submitRsvp: "Send RSVP",
    submitting: "Submitting...",
    rsvpSuccessTitle: "RSVP Received!",
    rsvpSuccessDesc: "Thank you for confirming. We look forward to celebrating together!",
    btnRsvp: "RSVP Confirmation",

    // Gift & Banking
    giftTitle: "Wedding Gift & Registry",
    giftSubtitle: "Your presence is our present. Should you wish to honor us with a gift:",
    groomGiftTab: "Groom's Registry",
    brideGiftTab: "Bride's Registry",
    bank: "Bank",
    accountHolder: "Account Name",
    accountNumber: "Account Number",
    copySuccess: "Copied",
    btnGift: "Send Gift",

    // Wishes & Guestbook
    guestbookTitle: "Wishes & Guestbook",
    guestbookSubtitle: "Leave a warm message for the happy couple!",
    yourName: "Your Name *",
    relationship: "Relationship (e.g. Best Friend)",
    writeWish: "Write your heartfelt wishes here...",
    sendWish: "Post Wish",
    wishSuccess: "Thank you for your warm wishes! ❤️",
    emptyWishes: "No messages yet. Be the first to leave a warm wish! ✨",

    // Newborn
    babyTitle: "Little Angel Info",
    birthDate: "Date of Birth",
    weight: "Weight",
    height: "Height",
    fullMonthCeremony: "Full Month Celebration",
    oneYearCeremony: "1st Birthday Party",
    announcementOnly: "Birth Announcement",
    babyGiftTab: "Gift for Baby",
    bocDoGameTitle: "First Birthday Guessing Game",
    bocDoQuestion: "What Will Baby Pick First?",
    bocDoSubtitle: "Guess which object the baby will choose during the ceremony!",
    votes: "votes",

    // Birthday
    birthdayTitle: "Happy Birthday Party",
    turningAge: "Turning",
    celebrant: "Birthday Celebrant",
    birthdayGiftTab: "Send Birthday Gift",
  },

  zh: {
    // Navigation
    homeNavCollections: "精选模版",
    homeNavJournal: "婚礼指南",
    homeNavPricing: "服务价格",
    homeNavConcierge: "定制咨询",
    homeCreateBtn: "立即制作",

    // Common Footer
    footerPrivacy: "隐私政策",
    footerTerms: "服务条款",
    footerSustainability: "可持续发展",
    footerAccessibility: "无障碍访问",
    footerCopyright: "© 2024 CardVite 数字化宴会工作室 • 保留所有权利",

    // Hero Section (Home)
    homeTagWedding: "婚礼盛典",
    homeTagGala: "高端宴会",
    homeHeroTitle1: "传递至臻请柬 —",
    homeHeroTitle2: "",
    homeHeroTitleEm1: "触动万千心弦",
    homeHeroTitle3: "仅需",
    homeHeroTitleEm2: "5分钟。",

    // Simulator Form
    homeFieldCoupleName: "新人尊名",
    homeFieldEffect: "开帖特效",
    homeEffectWaxSeal: "火漆封蜡",
    homeEffectFlowerGate: "浪漫花门",
    homeEffectGiftBox: "奢华礼盒",
    homeBtnPreview: "生成预览效果",

    // Phone Mockup
    homePhoneInvited: "诚挚邀请您的莅临",
    homePhoneDate: "2024年9月14日",
    homePhoneVenue: "科莫湖巴尔比亚诺别墅",
    homePhoneRsvp: "回复请帖",

    // Bento Grid: Trải Nghiệm Thượng Lưu Số
    homeSectionExperienceTitle: "尽享",
    homeSectionExperienceEm: "数字化高端",
    homeSectionExperienceSuffix: "礼遇体验",
    homeSectionExperienceSub:
      "将传统纸质请柬的典雅美学与现代科技完美融合，为您的良辰吉日赋予无可替代的仪式感。",

    // 3D Carousel & 3-Step Process (Home)
    homeCarouselTitle1: "精选至臻",
    homeCarouselTitleEm: "唯美电子请柬",
    homeCarouselSub: "探索现代极简与东方美学完美交融的顶级婚礼请柬。",
    homeViewAllTemplates: "查看所有精选模版",
    homeStepsTitle1: "制作专属电子请柬",
    homeStepsTitleEm: "仅需10分钟",
    homeStep1Title: "挑选心仪模版",
    homeStep1Desc: "浏览丰富的设计模版库，选择契合您婚礼风格的唯美设计。",
    homeStep2Title: "完善请帖信息",
    homeStep2Desc: "填写新人尊名、吉日吉时、宴会地点，上传浪漫婚纱照与音乐。",
    homeStep3Title: "一键发送宾客",
    homeStep3Desc: "生成独立尊称链接，通过微信/社交软件即刻传递至亲朋好友。",
    homeStepsBtn: "立即开始制作",

    homeCard1Title: "专属实名定制请柬",
    homeCard1Desc:
      "为每位贵宾生成独立专属链接并带有尊称，彰显对宾客的至高礼遇与尊重。",

    homeCard2Title: "RSVP回执与席位智能安排",
    homeCard2Desc:
      "自动化统计宾客出席人数，轻松对接酒店与婚宴席位规划。",

    homeCard3Title: "智能电子礼金二维码",
    homeCard3Desc:
      "无缝集成安全便捷的二维码礼金通道，方便远道而来的亲友表达心意。",

    homeCard4Title: "趣味互动小游戏",
    homeCard4Desc:
      "仪式前通过精彩互动小游戏拉近与宾客的距离，增添欢乐气氛。",

    homeCard5Title: "3D动态相册与背景音乐",
    homeCard5Desc:
      "在悠扬的定制浪漫旋律中，生动呈现新人唯美婚纱大片。",

    homeCard6Title: "全球多语言无缝支持",
    homeCard6Desc:
      "根据国际宾客浏览器语言自动翻译请帖内容，跨越山海传递幸福。",

    // Interactive Animation Modules
    homeMusicTitle: "精选浪漫背景音乐工坊",
    homeMusicSub: "让旋律触动心弦。在线试听为良辰吉日定制的不朽浪漫乐章。",
    homeMusicNowPlaying: "正在播放",
    homeWaxStudioTitle: "3D火漆封蜡互动体验工坊",
    homeWaxStudioSub: "选择皇家蜡印色彩，轻触为您的请柬盖上奢华火漆封印。",
    homeWaxColorGold: "皇家鎏金",
    homeWaxColorWine: "复古勃艮第红",
    homeWaxColorEmerald: "祖母绿翡翠",
    homeWaxColorRose: "玫瑰晶粉",
    homeWaxTapPrompt: "轻触印章即可压印封蜡",
    homeWishesTitle: "实时流动祝福心愿墙",
    homeWishesSub: "每天有成千上万条真挚祝福在此汇聚，传递给每一对幸福新人。",
    homeWishInputPlaceholder: "写下您的试用祝福语...",
    homeSendWishBtn: "点赞并发送祝福",
    homeQrTitle: "智能电子礼金二维码体验",
    homeQrSub: "模拟安全优雅的电子礼金收付与自动确认体验。",
    homeQrSelectAmount: "选择礼金金额：",
    homeQrScanHint: "动态二维码自动填充转账附言与新人姓名",
    homeQrSuccessToast: "恭喜！礼金已确认成功到账！🎉",

    // Mời đích danh & RSVP Tracker
    homeNamedTitle1: "专属实名邀请，",
    homeNamedTitleEm: "实时获知出席情况",
    homeNamedSub: "每位贵宾收到带有专属尊称的独立请柬，一键回复是否出席 — 无需再逐一发消息繁琐统计。",
    homeNamedFeat1Title: "专属实名尊称请柬",
    homeNamedFeat1Desc: "宾客打开请柬即可看到专属称谓与姓名，如同亲笔书写般典雅，倍感尊崇与礼遇。",
    homeNamedFeat2Title: "一键快速回复回执",
    homeNamedFeat2Desc: "直接在请柬上点击「准时出席」并选择携带人数 — 无需下载任何软件，零门槛操作。",
    homeNamedFeat3Title: "即刻掌握出席与缺席数据",
    homeNamedFeat3Desc: "管理后台一目了然：出席总人数、请假人数及待回复名单，彻底告别纸笔统计。",
    homeNamedFeat4Title: "轻松对接酒店宴会桌位",
    homeNamedFeat4Desc: "一次性导入宾客名单，临近婚期即可一键导出汇总表格对接酒店排席。",

    // Hỗ trợ Đa Ngôn Ngữ Song Ngữ
    homeBilingualTitle1: "尊享",
    homeBilingualTitleEm: "双语及多语言支持",
    homeBilingualSub: "为国际宾客量身打造，支持优雅的双语对照与多语言智能切换。",
    homeBilingualFeat1: "请柬双语对照并列呈现",
    homeBilingualFeat2: "支持中英文等双语排版",
    homeBilingualFeat3: "内置专业地道的翻译范本",
    homeBilingualFeat4: "轻松自定义修改双语译文",
    homeBilingualBtn: "立即制作请柬",

    // Cảm hứng từ những cặp đôi
    homeCouplesTitle1: "来自幸福新人的",
    homeCouplesTitleEm: "灵感与故事",
    homeCouplesSub: "已有超过 15,000 对新人选择 CardVite 开启他们难忘的浪漫婚礼盛典。",

    // -------------------------------------------------------------
    // COLLECTIONS PAGE (/collections)
    // -------------------------------------------------------------
    collectionsBadge: "• 典藏级模板库 •",
    collectionsTitle: "全品类电子请柬精选。",
    collectionsDesc:
      "探索数百款针对婚礼、满月周岁、生日寿宴和高端晚宴的独家设计，像素级精致打磨，极简而富有艺术气息。",
    filterAll: "全部模版",
    filterWedding: "婚礼盛典",
    filterNewborn: "满月 • 周岁",
    filterBirthday: "生日派对",
    filterEvent: "企业盛典",
    stylePrefix: "设计风格：",
    styleAll: "所有风格",
    badgeNew: "最新",
    useTemplateBtn: "使用此模版",
    viewMoreTemplates: "加载更多 240+ 模版",
    faqHeading: "常见问题解答",
    faqSubheading: "答疑与指南",
    ctaBannerTitle: "准备好制作您的专属独家请帖了吗？",
    ctaBannerBtn: "立即开启定制",

    // -------------------------------------------------------------
    // PRICING PAGE (/pricing)
    // -------------------------------------------------------------
    pricingBadge: "• 服务定价方案 •",
    pricingTitle: "选择最适合您的套餐。",
    pricingDesc:
      "价格透明，无任何隐形消费。选择心仪方案，开启殿堂级数字化请柬体验。",
    planFreeTitle: "免费体验",
    planFreePrice: "¥0",
    planFreeDesc: "免费体验电子请帖的基础核心功能。",
    planFreeFeat1: "基础通用模版库",
    planFreeFeat2: "基础文本信息编辑",
    planFreeFeat3: "限时访问体验",
    btnStartFree: "免费开始使用",

    planBasicTitle: "标准典雅版",
    planBasicPrice: "¥59",
    planBasicDesc: "专为温馨婚礼与个人私享派对量身定制。",
    planBasicFeat1: "自定义上传MP3背景音乐",
    planBasicFeat2: "集成电子礼金二维码",
    planBasicFeat3: "宾客独立尊称专属链接",
    planBasicFeat4: "永久永久保存不失效",
    btnSelectBasic: "选择标准版",

    planVipTitle: "皇家尊享VIP",
    planVipPrice: "¥89",
    planVipPopular: "★ 最受青睐",
    planVipDesc: "无与伦比的奢华体验，臻美细节无懈可击。",
    planVipFeat1: "包含标准版所有权益",
    planVipFeat2: "3D火漆封蜡开帖动画特效",
    planVipFeat3: "去除CardVite品牌标识",
    planVipFeat4: "一键导出Excel宾客出席名单",
    planVipFeat5: "24/7 VIP专属客服支持",
    btnUpgradeVip: "升级至VIP",

    // -------------------------------------------------------------
    // JOURNAL / BLOG PAGE (/journal)
    // -------------------------------------------------------------
    journalBadge: "• 宴会指南与灵感 •",
    journalTitle: "筹备灵感与宴席指南",
    journalDesc:
      "探索最新请帖设计趋势、行文礼仪与全流程宴会筹备指南。",
    tagAll: "全部文章",
    tagWeddingTrend: "婚礼趋势",
    tagNewbornCeremony: "抓周礼俗",
    tagInviteEtiquette: "请帖礼仪",
    tagCompare: "电子对比纸质",
    readArticleBtn: "阅读全文",

    // -------------------------------------------------------------
    // CONCIERGE / CONTACT PAGE (/concierge)
    // -------------------------------------------------------------
    conciergeBadge: "• 专属私人顾问 •",
    conciergeTitle: "预约专属私人定制服务。",
    conciergeDesc:
      "提交您的设计意向，我们的资深视觉设计师将在15分钟内与您联系，为您定制独一无二的专属请柬。",
    zaloSupport: "在线客服",
    hotlineSupport: "客服热线 (24/7)",
    emailSupport: "官方邮箱",
    studioSupport: "设计工坊",
    studioAddress: "胡志明市第一郡地标大厦12层",
    reqFormTitle: "预约定制需求表",
    fieldFullName: "您的姓名",
    fieldPhone: "联系电话（微信/Zalo）",
    fieldEmail: "电子邮箱",
    fieldServicePackage: "意向套餐",
    fieldFavoriteTemplate: "喜爱的模版（可选）",
    fieldNotes: "特殊要求与设计灵感",
    fieldNotesPlaceholder: "简要描述您的宴会主题、日期、音乐偏好或配色要求...",
    btnSubmitConcierge: "提交定制预约",
    conciergeSuccessTitle: "预约提交成功！",
    conciergeSuccessDesc: "我们的专属顾问将在15分钟内与您取得联系，请保持通讯畅通。",

    // Envelope & Opening
    openCard: "打开请柬",
    tapToOpen: "轻触火漆印章开启",
    cordiallyInvites: "诚挚邀请",
    invitationTo: "谨呈",
    saveTheDate: "婚礼喜帖",
    invitationLetter: "百年好合 • 喜结良缘",

    // Couple & Bio
    groom: "新郎",
    bride: "新娘",
    father: "父亲",
    mother: "母亲",
    weddingOf: "婚礼盛典",

    // Countdown & Calendar
    countdownTitle: "婚礼倒计时",
    days: "天",
    hours: "时",
    minutes: "分",
    seconds: "秒",
    addToCalendar: "添加到谷歌日历",

    // Events & Location
    eventsTitle: "典礼及宴席安排",
    time: "时间",
    venue: "地点",
    openMap: "在谷歌地图中导航",
    lunarDatePrefix: "农历",

    // Gallery
    galleryTitle: "浪漫婚纱相册",

    // RSVP Form
    rsvpTitle: "出席回执确认 (RSVP)",
    rsvpSubtitle: "请告知我们您的出席情况，以便我们做最好的准备。",
    fullName: "您的尊姓大名",
    phone: "联系电话（可选）",
    attendingQuestion: "您是否能出席婚礼？",
    willAttend: "准时出席",
    willDecline: "遗憾缺席",
    guestCountLabel: "出席人数",
    people: "位",
    dietaryNotes: "饮食禁忌或美好祝福",
    submitRsvp: "提交回执",
    submitting: "正在提交...",
    rsvpSuccessTitle: "回执提交成功！",
    rsvpSuccessDesc: "感谢您的回复，您的莅临将是我们莫大的荣幸！",
    btnRsvp: "确认出席",

    // Gift & Banking
    giftTitle: "婚礼礼金与祝贺",
    giftSubtitle: "您的祝福是我们最珍贵的礼物，谨致谢忱。",
    groomGiftTab: "新郎礼金",
    brideGiftTab: "新娘礼金",
    bank: "银行名称",
    accountHolder: "账户姓名",
    accountNumber: "银行账号",
    copySuccess: "已复制账号",
    btnGift: "奉上礼金",

    // Wishes & Guestbook
    guestbookTitle: "真挚祝福与留言簿",
    guestbookSubtitle: "为新人留下最美好的祝福吧！",
    yourName: "您的姓名 *",
    relationship: "与新人关系（如：好友）",
    writeWish: "在此写下您的美好祝愿...",
    sendWish: "发送祝福",
    wishSuccess: "感谢您真挚的祝福！❤️",
    emptyWishes: "暂无留言，快来成为第一个送上祝福的人吧！✨",

    // Newborn
    babyTitle: "宝贝诞生档案",
    birthDate: "出生日期",
    weight: "出生体重",
    height: "出生身长",
    fullMonthCeremony: "弥月之喜（满月宴）",
    oneYearCeremony: "周岁之喜（抓周宴）",
    announcementOnly: "喜报弄璋 / 弄瓦之喜",
    babyGiftTab: "给宝贝的礼物",
    bocDoGameTitle: "趣味抓周预测小游戏",
    bocDoQuestion: "猜猜宝宝会抓什么？",
    bocDoSubtitle: "请选择您认为宝宝在抓周仪式上会拿起的物品！",
    votes: "票",

    // Birthday
    birthdayTitle: "生日快乐派对",
    turningAge: "迎来",
    celebrant: "寿星",
    birthdayGiftTab: "赠送生日礼物",
  },
};
