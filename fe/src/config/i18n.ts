export type SupportedLanguage = "vi" | "en" | "zh";

export const DICTIONARY = {
  vi: {
    // Navigation
    homeNavCollections: "COLLECTIONS",
    homeNavCustom: "CUSTOM",
    homeNavRsvp: "RSVP",
    homeNavGallery: "GALLERY",
    homeNavConcierge: "CONCIERGE",
    homeCreateBtn: "CREATE",

    // Hero Section
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
    homeNavCollections: "COLLECTIONS",
    homeNavCustom: "CUSTOM",
    homeNavRsvp: "RSVP",
    homeNavGallery: "GALLERY",
    homeNavConcierge: "CONCIERGE",
    homeCreateBtn: "CREATE",

    // Hero Section
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
    homeNavCollections: "精选模板",
    homeNavCustom: "定制设计",
    homeNavRsvp: "出席回执",
    homeNavGallery: "相册展示",
    homeNavConcierge: "专属顾问",
    homeCreateBtn: "立即制作",

    // Hero Section
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
