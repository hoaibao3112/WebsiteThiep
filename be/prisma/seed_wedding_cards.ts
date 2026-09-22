import { PrismaClient, CardCategory, CardStatus, OpeningEffect, FallingEffect } from "@prisma/client";

const prisma = new PrismaClient();

const WEDDING_CARDS_DATA = [
  // 01. Á ĐÔNG CUNG ĐÌNH HOÀNG GIA
  {
    slug: "wedding-heritage-crimson-gold",
    templateSlug: "wedding-heritage-crimson-gold",
    openingEffect: "WAX_SEAL" as OpeningEffect,
    fallingEffect: "PETAL" as FallingEffect,
    musicUrl: "/music/le-duong.mp3",
    isAutoPlay: true,
    primaryColor: "#8B1E2D",
    fontFamily: "Playfair Display",
    greetingMessage: "“Trăm năm tình viên mãn — Bạc đầu nghĩa phu thê” Trân trọng kính mời quý khách đến chung vui lễ thành hôn cùng gia đình chúng tôi!",
    categoryData: {
      cardCategory: "WEDDING",
      heroSubtitle: "TRÂN TRỌNG BÁO HỶ",
      invitationTitle: "LỄ THÀNH HÔN & VU QUY",
      coverPhotoUrl: "/images/demo/templates/t01-heritage/cover.jpg",
      greeting: "“Trăm năm tình viên mãn — Bạc đầu nghĩa phu thê”",
      groom: {
        fullName: "Nguyễn Minh Khôi",
        shortName: "Minh Khôi",
        birthOrder: "Trưởng nam",
        avatarUrl: "/images/demo/templates/t01-heritage/groom.jpg",
        parents: { fatherName: "Nguyễn Văn Hùng", motherName: "Trần Thị Mai" },
        story: "Chàng trai ấm áp, luôn trân trọng gia đình và những giá trị truyền thống.",
      },
      bride: {
        fullName: "Lê Ngọc Hân",
        shortName: "Ngọc Hân",
        birthOrder: "Út nữ",
        avatarUrl: "/images/demo/templates/t01-heritage/bride.jpg",
        parents: { fatherName: "Lê Quốc Bảo", motherName: "Phạm Thu Cúc" },
        story: "Cô gái dịu dàng, nết na, yêu nét đẹp Á Đông và sự gắn kết gia đình.",
      },
      loveStory: [
        { title: "Chạm Ánh Mắt", date: "2021", description: "Lần đầu gặp gỡ tại hội hoa xuân phố cổ Hà Nội." },
        { title: "Gắn Kết Yêu Thương", date: "2024", description: "Cùng nhau vượt qua nhiều thăng trầm để trọn vẹn bên nhau." },
        { title: "Trọn Đời Chung Đôi", date: "2026", description: "Chính thức nên duyên vợ chồng trước sự chứng kiến của hai họ." },
      ],
    },
    events: [
      {
        eventName: "Lễ Vu Quy (Nhà Gái)",
        eventDate: new Date("2026-11-20T08:30:00Z"),
        lunarDate: "Ngày 12 Tháng 10 Năm Bính Ngọ",
        venueName: "Tư Gia Nhà Gái",
        address: "Số 88 Phố Huế, Phường Hàng Bài, Hoàn Kiếm, Hà Nội",
        mapUrl: "https://maps.google.com",
      },
      {
        eventName: "Lễ Thành Hôn & Tiệc Cưới",
        eventDate: new Date("2026-11-20T17:30:00Z"),
        lunarDate: "Ngày 12 Tháng 10 Năm Bính Ngọ",
        venueName: "Trung Tâm Tiệc Cưới Hoàng Gia",
        address: "Số 194 Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận, TP. HCM",
        mapUrl: "https://maps.google.com",
      },
    ],
    photos: [
      { url: "/images/demo/templates/t01-heritage/gallery-1.jpg", caption: "Khoảnh khắc hoàng gia trọn vẹn", isCover: true },
      { url: "/images/demo/templates/t01-heritage/gallery-2.jpg", caption: "Ánh nhìn trao nhau trọn lời ước nguyện" },
      { url: "/images/demo/templates/t01-heritage/gallery-3.jpg", caption: "Nụ cười hạnh phúc ngày trọng đại" },
      { url: "/images/demo/templates/t01-heritage/gallery-4.jpg", caption: "Vương miện pha lê và váy cưới lộng lẫy" },
      { url: "/images/demo/templates/t01-heritage/gallery-5.jpg", caption: "Nguyện ước trăm năm gắn bó" },
      { url: "/images/demo/templates/t01-heritage/gallery-6.jpg", caption: "Hạnh phúc tròn đầy ngày chung đôi" },
    ],
    bankingPrimary: { bankCode: "MB", accountNumber: "9999888899", accountName: "NGUYEN MINH KHOI" },
    bankingSecondary: { bankCode: "VCB", accountNumber: "8888999988", accountName: "LE NGOC HAN" },
  },

  // 02. TẠP CHÍ HÀN QUỐC EDITORIAL
  {
    slug: "wedding-modern-editorial-magazine",
    templateSlug: "wedding-modern-editorial-magazine",
    openingEffect: "NONE" as OpeningEffect,
    fallingEffect: "PETAL" as FallingEffect,
    musicUrl: "/music/until-i-found-you.mp3",
    isAutoPlay: true,
    primaryColor: "#543A2C",
    fontFamily: "Inter",
    greetingMessage: "“Chúng ta đã cùng nhau đi qua nhiều thăng trầm để nhận ra rằng được ở bên nhau là điều quý giá nhất... Hôm nay chúng mình chính thức gọi nhau hai tiếng Vợ - Chồng.”",
    categoryData: {
      cardCategory: "WEDDING",
      heroSubtitle: "MODERN EDITORIAL WEDDING",
      invitationTitle: "THIỆP MỜI THÀNH HÔN",
      coverPhotoUrl: "/images/demo/templates/t02-magazine/cover.jpg",
      greeting: "“Một hành trình mới của chúng mình bắt đầu từ hôm nay”",
      groom: {
        fullName: "Phạm Công Vinh",
        shortName: "Công Vinh",
        birthOrder: "Trưởng nam",
        avatarUrl: "/images/demo/templates/t02-magazine/groom.jpg",
        parents: { fatherName: "Phạm Minh Toàn", motherName: "Lại Thị Tám" },
        story: "Kiến trúc sư trẻ, say mê thiết kế và luôn là chỗ dựa vững chắc.",
      },
      bride: {
        fullName: "Nguyễn Hải Yến",
        shortName: "Hải Yến",
        birthOrder: "Út nữ",
        avatarUrl: "/images/demo/templates/t02-magazine/bride.jpg",
        parents: { fatherName: "Nguyễn Tiến Minh", motherName: "Hoàng Cẩm Vân" },
        story: "Biên tập viên thời trang thanh lịch, yêu sự lãng mạn tinh tế.",
      },
      loveStory: [
        { title: "First Meeting", date: "2020", description: "Buổi chiều thu bên quán cà phê nhỏ phố cổ." },
        { title: "Proposal in Da Lat", date: "2023", description: "Dưới ánh hoàng hôn đồi thông, em đã mỉm cười gật đầu." },
        { title: "The Wedding Day", date: "2026", description: "Cùng viết tiếp chương đẹp nhất của thanh xuân." },
      ],
    },
    events: [
      {
        eventName: "Lễ Cưới & Tiệc Mừng",
        eventDate: new Date("2026-12-18T18:00:00Z"),
        lunarDate: "Ngày 10 Tháng 11 Năm Bính Ngọ",
        venueName: "Park Hyatt Saigon",
        address: "2 Lam Sơn Square, Bến Nghé, Quận 1, TP. HCM",
        mapUrl: "https://maps.google.com",
      },
    ],
    photos: [
      { url: "/images/demo/templates/t02-magazine/gallery-1.jpg", caption: "Save the Date - Bắt đầu hành trình mới", isCover: true },
      { url: "/images/demo/templates/t02-magazine/gallery-2.jpg", caption: "Hương hoa hồng trắng tinh khôi" },
      { url: "/images/demo/templates/t02-magazine/gallery-3.jpg", caption: "Phong cách tối giản hiện đại" },
      { url: "/images/demo/templates/t02-magazine/gallery-4.jpg", caption: "Ánh mắt ngọt ngào của tình yêu" },
      { url: "/images/demo/templates/t02-magazine/gallery-5.jpg", caption: "Khoảnh khắc tự nhiên đầy cảm xúc" },
      { url: "/images/demo/templates/t02-magazine/gallery-6.jpg", caption: "Gắn kết yêu thương mãi mãi" },
    ],
    bankingPrimary: { bankCode: "TCB", accountNumber: "19033338888", accountName: "PHAM CONG VINH" },
    bankingSecondary: { bankCode: "VCB", accountNumber: "00710009999", accountName: "NGUYEN HAI YEN" },
  },

  // 03. SWEET PINK LÃNG MẠN
  {
    slug: "wedding-sweet-editorial-romance",
    templateSlug: "wedding-sweet-editorial-romance",
    openingEffect: "WAX_SEAL" as OpeningEffect,
    fallingEffect: "HEART" as FallingEffect,
    musicUrl: "/music/i-do.mp3",
    isAutoPlay: true,
    primaryColor: "#B84A39",
    fontFamily: "Great Vibes",
    greetingMessage: "“Em là mảnh ghép hoàn hảo nhất cuộc đời anh. Cảm ơn em vì đã đến, đã yêu và chọn anh cùng đi hết đoạn đường phía trước.”",
    categoryData: {
      cardCategory: "WEDDING",
      heroSubtitle: "SWEET ROMANCE MOMENTS",
      invitationTitle: "LỄ THÀNH HÔN",
      coverPhotoUrl: "/images/demo/templates/t03-sweet-pink/cover.jpg",
      greeting: "“Hạnh phúc giản đơn là mỗi sớm mai thức dậy đều nhìn thấy nụ cười của em”",
      groom: {
        fullName: "Phạm Quốc Huy",
        shortName: "Quốc Huy",
        birthOrder: "Thứ nam",
        avatarUrl: "/images/demo/templates/t03-sweet-pink/groom.jpg",
        parents: { fatherName: "Phạm Quốc Hùng", motherName: "Lâm Mộng Điệp" },
        story: "Chàng trai yêu thể thao, chu đáo và luôn mang đến tiếng cười.",
      },
      bride: {
        fullName: "Nguyễn Mai Anh",
        shortName: "Mai Anh",
        birthOrder: "Trưởng nữ",
        avatarUrl: "/images/demo/templates/t03-sweet-pink/bride.jpg",
        parents: { fatherName: "Nguyễn Hải Long", motherName: "Đỗ Bích Ngọc" },
        story: "Cô gái ngọt ngào, thích làm bánh và ngắm hoàng hôn.",
      },
      loveStory: [
        { title: "Gặp Gỡ Bất Ngờ", date: "2022", description: "Lớp học làm gốm cuối tuần đưa hai trái tim xích lại gần nhau." },
        { title: "Những Chuyến Đi Xa", date: "2024", description: "Khám phá thế giới rộng lớn nhưng điểm đến cuối cùng vẫn là em." },
        { title: "Yes, I Do", date: "2026", description: "Khoảnh khắc trao nhẫn dưới ánh nến lung linh." },
      ],
    },
    events: [
      {
        eventName: "Tiệc Cưới Thân Mật",
        eventDate: new Date("2026-10-05T18:30:00Z"),
        lunarDate: "Ngày 25 Tháng 8 Năm Bính Ngọ",
        venueName: "GEM Center - Grand Ballroom",
        address: "Số 8 Nguyễn Bỉnh Khiêm, Đa Kao, Quận 1, TP. HCM",
        mapUrl: "https://maps.google.com",
      },
    ],
    photos: [
      { url: "/images/demo/templates/t03-sweet-pink/gallery-1.jpg", caption: "Tình yêu ngọt ngào tựa cánh hoa", isCover: true },
      { url: "/images/demo/templates/t03-sweet-pink/gallery-2.jpg", caption: "Nụ cười rạng rỡ của cô dâu" },
      { url: "/images/demo/templates/t03-sweet-pink/gallery-3.jpg", caption: "Bên anh là bình yên lớn nhất" },
      { url: "/images/demo/templates/t03-sweet-pink/gallery-4.jpg", caption: "Ánh sáng dịu dàng buổi hẹn ước" },
      { url: "/images/demo/templates/t03-sweet-pink/gallery-5.jpg", caption: "Từng phút giây đều ngập tràn yêu thương" },
      { url: "/images/demo/templates/t03-sweet-pink/gallery-6.jpg", caption: "Trăm năm nắm tay cùng bước tiếp" },
    ],
    bankingPrimary: { bankCode: "ACB", accountNumber: "12345678", accountName: "PHAM QUOC HUY" },
    bankingSecondary: { bankCode: "MB", accountNumber: "87654321", accountName: "NGUYEN MAI ANH" },
  },

  // 04. QUÝ TỘC ĐỎ RƯỢU MARSALA
  {
    slug: "wedding-crimson-wine-marsala",
    templateSlug: "wedding-crimson-wine-marsala",
    openingEffect: "WAX_SEAL" as OpeningEffect,
    fallingEffect: "PETAL" as FallingEffect,
    musicUrl: "/music/beautiful-in-white.mp3",
    isAutoPlay: true,
    primaryColor: "#6B1724",
    fontFamily: "Playfair Display",
    greetingMessage: "“Tình yêu giống như rượu vang hảo hạng — càng qua thời gian, hương vị càng nồng nàn và say đắm.”",
    categoryData: {
      cardCategory: "WEDDING",
      heroSubtitle: "NOBLE MARSALA CELEBRATION",
      invitationTitle: "DẠ TIỆC THÀNH HÔN",
      coverPhotoUrl: "/images/demo/templates/t04-marsala/cover.jpg",
      greeting: "“Kính mời quý vị cùng chúng tôi nâng ly chúc mừng khởi đầu mới”",
      groom: {
        fullName: "Nguyễn Minh",
        shortName: "Nguyễn Minh",
        birthOrder: "Trưởng nam",
        avatarUrl: "/images/demo/templates/t04-marsala/groom.jpg",
        parents: { fatherName: "Nguyễn Văn Thái", motherName: "Phan Thị Hồng" },
        story: "Doanh nhân trẻ đĩnh đạc, bản lĩnh và hết mực yêu thương bạn đời.",
      },
      bride: {
        fullName: "Bùi Phương",
        shortName: "Bùi Phương",
        birthOrder: "Thứ nữ",
        avatarUrl: "/images/demo/templates/t04-marsala/bride.jpg",
        parents: { fatherName: "Bùi Quang Dũng", motherName: "Trần Minh Châu" },
        story: "Người phụ nữ thanh lịch, quý phái, luôn lan tỏa năng lượng tích cực.",
      },
      loveStory: [
        { title: "Duyên Định Kỳ Diệu", date: "2021", description: "Gặp nhau trong một buổi dạ tiệc gây quỹ cuối năm." },
        { title: "Đồng Điệu Tâm Hồn", date: "2023", description: "Cùng chung lý tưởng sống và niềm say mê văn hóa nghệ thuật." },
        { title: "Lời Thề Nguyện Vĩnh Cửu", date: "2026", description: "Gắn kết bên nhau trọn kiếp nhân sinh." },
      ],
    },
    events: [
      {
        eventName: "Dạ Tiệc Thành Hôn",
        eventDate: new Date("2026-11-28T18:00:00Z"),
        lunarDate: "Ngày 20 Tháng 10 Năm Bính Ngọ",
        venueName: "The Reverie Saigon - Grand Ballroom",
        address: "22-36 Nguyễn Huệ, Bến Nghé, Quận 1, TP. HCM",
        mapUrl: "https://maps.google.com",
      },
    ],
    photos: [
      { url: "/images/demo/templates/t04-marsala/gallery-1.jpg", caption: "Dạ tiệc rượu vang quý phái", isCover: true },
      { url: "/images/demo/templates/t04-marsala/gallery-2.jpg", caption: "Nâng ly chúc mừng ngày thành đôi" },
      { url: "/images/demo/templates/t04-marsala/gallery-3.jpg", caption: "Thanh lịch và quyến rũ bên tháp sâm panh" },
      { url: "/images/demo/templates/t04-marsala/gallery-4.jpg", caption: "Khoảnh khắc lãng mạn dưới ánh nến" },
      { url: "/images/demo/templates/t04-marsala/gallery-5.jpg", caption: "Trao nhau lời thề ước trăm năm" },
      { url: "/images/demo/templates/t04-marsala/gallery-6.jpg", caption: "Đêm tiệc tình yêu thăng hoa" },
    ],
    bankingPrimary: { bankCode: "VCB", accountNumber: "9988776655", accountName: "NGUYEN MINH" },
    bankingSecondary: { bankCode: "TCB", accountNumber: "19034567890", accountName: "BUI PHUONG" },
  },

  // 05. RUSTIC XANH RÊU THIÊN NHIÊN
  {
    slug: "wedding-forest-green-botanical",
    templateSlug: "wedding-forest-green-botanical",
    openingEffect: "GATE_OPEN" as OpeningEffect,
    fallingEffect: "PETAL" as FallingEffect,
    musicUrl: "/music/a-thousand-years.mp3",
    isAutoPlay: true,
    primaryColor: "#3D4A34",
    fontFamily: "Outfit",
    greetingMessage: "“Chúng mình chọn một góc rừng xanh mát, nơi gió ngàn thì thầm hát tình ca, để cùng trao nhau lời hẹn ước trọn đời.”",
    categoryData: {
      cardCategory: "WEDDING",
      heroSubtitle: "BOTANICAL RUSTIC CEREMONY",
      invitationTitle: "LỄ CƯỚI NGOÀI TRỜI",
      coverPhotoUrl: "/images/demo/templates/t05-forest/cover.jpg",
      greeting: "“Về với thiên nhiên, lắng nghe trái tim chung nhịp đập”",
      groom: {
        fullName: "Tuấn Minh",
        shortName: "Tuấn Minh",
        birthOrder: "Trưởng nam",
        avatarUrl: "/images/demo/templates/t05-forest/groom.jpg",
        parents: { fatherName: "Lê Tuấn Khang", motherName: "Ngô Mỹ Lệ" },
        story: "Chàng trai yêu thiên nhiên, nhiếp ảnh gia tự do mang tâm hồn mộc mạc.",
      },
      bride: {
        fullName: "Mai Lan",
        shortName: "Mai Lan",
        birthOrder: "Út nữ",
        avatarUrl: "/images/demo/templates/t05-forest/bride.jpg",
        parents: { fatherName: "Vũ Hoàng Sơn", motherName: "Trịnh Thúy Nga" },
        story: "Nhà thiết kế cảnh quan xanh, yêu hoa cỏ và những điều tự nhiên.",
      },
      loveStory: [
        { title: "Chuyến Trekking Tình Cờ", date: "2021", description: "Băng qua cung đường Tà Năng cùng một ánh mắt dõi theo." },
        { title: "Đêm Lửa Trại Đồi Thông", date: "2023", description: "Dưới bầu trời ngàn sao, hai bàn tay khẽ đan vào nhau." },
        { title: "Hẹn Ước Rừng Xanh", date: "2026", description: "Lời thề nguyền bền vững như những rặng thông già." },
      ],
    },
    events: [
      {
        eventName: "Hôn Lễ Ngoài Trời & Tiệc Nướng BBQ",
        eventDate: new Date("2026-12-05T15:30:00Z"),
        lunarDate: "Ngày 27 Tháng 10 Năm Bính Ngọ",
        venueName: "Ana Mandara Villas Dalat Resort",
        address: "Đường Lê Lai, Phường 5, TP. Đà Lạt, Lâm Đồng",
        mapUrl: "https://maps.google.com",
      },
    ],
    photos: [
      { url: "/images/demo/templates/t05-forest/gallery-1.jpg", caption: "Giữa thiên nhiên hoa cỏ reo vui", isCover: true },
      { url: "/images/demo/templates/t05-forest/gallery-2.jpg", caption: "Nụ cười hạnh phúc dưới bóng thông reo" },
      { url: "/images/demo/templates/t05-forest/gallery-3.jpg", caption: "Chất mộc mạc và chân thành" },
      { url: "/images/demo/templates/t05-forest/gallery-4.jpg", caption: "Cùng nhau đi dạo buổi sớm mai" },
      { url: "/images/demo/templates/t05-forest/gallery-5.jpg", caption: "Bình yên bên triền đồi xanh mát" },
      { url: "/images/demo/templates/t05-forest/gallery-6.jpg", caption: "Hẹn ước trăm năm trọn đời yêu thương" },
    ],
    bankingPrimary: { bankCode: "MB", accountNumber: "0399998888", accountName: "LE TUAN MINH" },
    bankingSecondary: { bankCode: "BIDV", accountNumber: "6868686868", accountName: "VU MAI LAN" },
  },

  // 06. HOA SEN THANH KHIẾT BÁO HỶ THUẦN VIỆT
  {
    slug: "wedding-pure-lotus-heritage",
    templateSlug: "wedding-pure-lotus-heritage",
    openingEffect: "WAX_SEAL" as OpeningEffect,
    fallingEffect: "PETAL" as FallingEffect,
    musicUrl: "/music/le-duong.mp3",
    isAutoPlay: true,
    primaryColor: "#3B5E43",
    fontFamily: "Playfair Display",
    greetingMessage: "“Gió đưa cành trúc la đà — Duyên ta kết tóc trọn đời bên nhau. Trân trọng kính mời quý bà con cô bác đến dự lễ báo hỷ của đôi trẻ.”",
    categoryData: {
      cardCategory: "WEDDING",
      heroSubtitle: "TRÂN TRỌNG BÁO HỶ",
      invitationTitle: "LỄ THÀNH HÔN & VU QUY",
      coverPhotoUrl: "/images/demo/templates/t06-lotus/cover.jpg",
      greeting: "“Hoa sen thanh khiết — Tình nghĩa phu thê vẹn tròn”",
      groom: {
        fullName: "Đức Hiển",
        shortName: "Đức Hiển",
        birthOrder: "Trưởng nam",
        avatarUrl: "/images/demo/templates/t06-lotus/groom.jpg",
        parents: { fatherName: "Trần Đức Trọng", motherName: "Lê Kim Oanh" },
        story: "Giảng viên mỹ thuật truyền thống, điềm đạm, yêu văn hóa cố đô.",
      },
      bride: {
        fullName: "Minh Hằng",
        shortName: "Minh Hằng",
        birthOrder: "Trưởng nữ",
        avatarUrl: "/images/demo/templates/t06-lotus/bride.jpg",
        parents: { fatherName: "Đỗ Quốc Toản", motherName: "Bùi Thanh Trúc" },
        story: "Nghệ nhân thêu tay truyền thống, đoan trang, nhu mì và sâu sắc.",
      },
      loveStory: [
        { title: "Duyên Kỳ Phố Cổ", date: "2020", description: "Chạm mặt dưới cơn mưa rào bên mái ngói chùa Cầu Hội An." },
        { title: "Gửi Trao Tâm Tình", date: "2023", description: "Những lá thư tay nắn nót gói trọn thương nhớ cách xa." },
        { title: "Trăm Năm Tơ Hồng", date: "2026", description: "Chính thức nên duyên vợ chồng trước bàn thờ gia tiên." },
      ],
    },
    events: [
      {
        eventName: "Lễ Gia Tiên & Rước Dâu",
        eventDate: new Date("2026-11-15T09:00:00Z"),
        lunarDate: "Ngày 07 Tháng 10 Năm Bính Ngọ",
        venueName: "Tư Gia Họ Nhà Trai",
        address: "Số 45 Đường Chi Lăng, TP. Huế, Thừa Thiên Huế",
        mapUrl: "https://maps.google.com",
      },
    ],
    photos: [
      { url: "/images/demo/templates/t06-lotus/gallery-1.jpg", caption: "Hương sen thanh khiết nét duyên quê", isCover: true },
      { url: "/images/demo/templates/t06-lotus/gallery-2.jpg", caption: "Tà áo dài lụa hồng thướt tha" },
      { url: "/images/demo/templates/t06-lotus/gallery-3.jpg", caption: "Nụ cười dịu dàng bên quạt giấy cổ truyền" },
      { url: "/images/demo/templates/t06-lotus/gallery-4.jpg", caption: "Gia tiên lễ bái vẹn tình phu thê" },
      { url: "/images/demo/templates/t06-lotus/gallery-5.jpg", caption: "Ánh mắt trao nhau đong đầy tình nghĩa" },
      { url: "/images/demo/templates/t06-lotus/gallery-6.jpg", caption: "Trăm năm son sắt nghĩa tào khang" },
    ],
    bankingPrimary: { bankCode: "VCB", accountNumber: "0123456789", accountName: "TRAN DUC HIEN" },
    bankingSecondary: { bankCode: "AGRI", accountNumber: "45002058989", accountName: "DO MINH HANG" },
  },

  // 07. ĐIỆN ẢNH LOOKBOOK TẠP CHÍ VOGUE
  {
    slug: "wedding-cinematic-editorial",
    templateSlug: "wedding-cinematic-editorial",
    openingEffect: "NONE" as OpeningEffect,
    fallingEffect: "NONE" as FallingEffect,
    musicUrl: "/music/beautiful-in-white.mp3",
    isAutoPlay: true,
    primaryColor: "#1C1C1C",
    fontFamily: "Cinzel",
    greetingMessage: "“Cuộc đời mỗi người như một cuốn phim dài. Và anh may mắn nhất khi có em là nhân vật chính trong tất cả những khung hình đẹp đẽ nhất.”",
    categoryData: {
      cardCategory: "WEDDING",
      heroSubtitle: "A VOGUE WEDDING STORY",
      invitationTitle: "PREMIERE OF LOVE",
      coverPhotoUrl: "/images/demo/templates/t07-cinematic/cover.jpg",
      greeting: "“Our story in 35mm — Timeless, bold and forever”",
      groom: {
        fullName: "Lâm Đình Khoa",
        shortName: "Đình Khoa",
        birthOrder: "Trưởng nam",
        avatarUrl: "/images/demo/templates/t07-cinematic/groom.jpg",
        parents: { fatherName: "Lâm Vĩnh Phát", motherName: "Trương Mỹ Lan" },
        story: "Đạo diễn hình ảnh tài hoa, cá tính và tràn đầy cảm hứng nghệ thuật.",
      },
      bride: {
        fullName: "Vũ Bảo Trân",
        shortName: "Bảo Trân",
        birthOrder: "Trưởng nữ",
        avatarUrl: "/images/demo/templates/t07-cinematic/bride.jpg",
        parents: { fatherName: "Vũ Trí Dũng", motherName: "Phan Ánh Nguyệt" },
        story: "Người mẫu ảnh tự do quyến rũ, luôn biến hóa và tỏa sáng rực rỡ.",
      },
      loveStory: [
        { title: "The First Scene", date: "2020", description: "Lần chạm máy quay đầu tiên sau ống kính trường quay phim ngắn." },
        { title: "Behind The Scenes", date: "2023", description: "Những buổi đêm muộn dựng phim cùng cốc cà phê ấm và tiếng cười." },
        { title: "The Masterpiece", date: "2026", description: "Thước phim trọn đời mở màn bằng hai chiếc nhẫn kim cương." },
      ],
    },
    events: [
      {
        eventName: "The Wedding Premiere & After Party",
        eventDate: new Date("2027-02-08T18:00:00Z"),
        lunarDate: "Ngày 02 Tháng Giêng Năm Đinh Mùi",
        venueName: "JW Marriott Hotel Hanoi - Grand Ballroom",
        address: "Số 8 Đỗ Đức Dục, Mễ Trì, Nam Từ Liêm, Hà Nội",
        mapUrl: "https://maps.google.com",
      },
    ],
    photos: [
      { url: "/images/demo/templates/t07-cinematic/gallery-1.jpg", caption: "Thước phim điện ảnh trên xe mui trần cổ", isCover: true },
      { url: "/images/demo/templates/t07-cinematic/gallery-2.jpg", caption: "Khoảnh khắc kiêu kỳ đầy chất Vogue" },
      { url: "/images/demo/templates/t07-cinematic/gallery-3.jpg", caption: "Nụ cười rạng rỡ giữa phố thị" },
      { url: "/images/demo/templates/t07-cinematic/gallery-4.jpg", caption: "Tình yêu phóng khoáng và tự do" },
      { url: "/images/demo/templates/t07-cinematic/gallery-5.jpg", caption: "Những góc máy nghệ thuật độc bản" },
      { url: "/images/demo/templates/t07-cinematic/gallery-6.jpg", caption: "Ghi dấu tình yêu đậm chất cinematic" },
    ],
    bankingPrimary: { bankCode: "VPB", accountNumber: "8888999900", accountName: "LAM DINH KHOA" },
    bankingSecondary: { bankCode: "MB", accountNumber: "1111222233", accountName: "VU BAO TRAN" },
  },

  // 08. SUỐI NGUỒN HỒ NƯỚC THIÊN NHIÊN
  {
    slug: "wedding-alpine-lake-romance",
    templateSlug: "wedding-alpine-lake-romance",
    openingEffect: "WAX_SEAL" as OpeningEffect,
    fallingEffect: "SNOW" as FallingEffect,
    musicUrl: "/music/a-thousand-years.mp3",
    isAutoPlay: true,
    primaryColor: "#2B6B6D",
    fontFamily: "Playfair Display",
    greetingMessage: "“Tình yêu của chúng ta tĩnh lặng và sâu lắng như mặt hồ ban mai, nhưng cũng bất tận và dạt dào như dòng suối nguồn.”",
    categoryData: {
      cardCategory: "WEDDING",
      heroSubtitle: "ALPINE LAKE SERENITY",
      invitationTitle: "LỄ KẾT HÔN",
      coverPhotoUrl: "/images/demo/templates/t08-alpine/cover.jpg",
      greeting: "“Bên hồ nước trong lành — Chúng mình chọn thuộc về nhau”",
      groom: {
        fullName: "Nguyễn Dương",
        shortName: "Nguyễn Dương",
        birthOrder: "Trưởng nam",
        avatarUrl: "/images/demo/templates/t08-alpine/groom.jpg",
        parents: { fatherName: "Nguyễn Đại Dương", motherName: "Lê Tuyết Mai" },
        story: "Chàng trai điềm tĩnh, ấm áp, điểm tựa vững chãi của gia đình.",
      },
      bride: {
        fullName: "Khánh Thy",
        shortName: "Khánh Thy",
        birthOrder: "Út nữ",
        avatarUrl: "/images/demo/templates/t08-alpine/bride.jpg",
        parents: { fatherName: "Lý Khánh An", motherName: "Trần Thục Uyên" },
        story: "Cô gái trong trẻo, yêu sự bình dị và ánh nắng buổi ban mai.",
      },
      loveStory: [
        { title: "Buổi Sớm Bên Hồ", date: "2021", description: "Lần đầu gặp gỡ khi cùng chạy bộ quanh hồ Tây buổi sớm sương mờ." },
        { title: "Thấu Hiểu Không Lời", date: "2024", description: "Chỉ cần một ánh mắt, cả hai đều biết đối phương đang nghĩ gì." },
        { title: "Về Chung Một Nhà", date: "2026", description: "Xây dựng tổ ấm yên bình cạnh mặt hồ phẳng lặng." },
      ],
    },
    events: [
      {
        eventName: "Lễ Thành Hôn & Tiệc Cưới Bên Hồ",
        eventDate: new Date("2026-12-22T17:00:00Z"),
        lunarDate: "Ngày 14 Tháng 11 Năm Bính Ngọ",
        venueName: "InterContinental Hanoi Westlake",
        address: "05 Từ Hoa, Quảng An, Tây Hồ, Hà Nội",
        mapUrl: "https://maps.google.com",
      },
    ],
    photos: [
      { url: "/images/demo/templates/t08-alpine/gallery-1.jpg", caption: "Nắm tay nhau giữa hoàng hôn hồ nước", isCover: true },
      { url: "/images/demo/templates/t08-alpine/gallery-2.jpg", caption: "Khoảnh khắc ngọt ngào ngập tràn ánh nắng" },
      { url: "/images/demo/templates/t08-alpine/gallery-3.jpg", caption: "Váy cưới bồng bềnh trong làn gió nhẹ" },
      { url: "/images/demo/templates/t08-alpine/gallery-4.jpg", caption: "Ánh mắt hướng về tương lai cùng anh" },
      { url: "/images/demo/templates/t08-alpine/gallery-5.jpg", caption: "Hồ nước phẳng lặng chứng giám lời thề" },
      { url: "/images/demo/templates/t08-alpine/gallery-6.jpg", caption: "Hành trình hạnh phúc bắt đầu từ đây" },
    ],
    bankingPrimary: { bankCode: "MB", accountNumber: "9988112233", accountName: "NGUYEN DUONG" },
    bankingSecondary: { bankCode: "VCB", accountNumber: "04510008888", accountName: "LY KHANH THY" },
  },

  // 09. LONG PHỤNG SUM VẦY ĐỎ ĐÔ
  {
    slug: "wedding-imperial-dragon-crimson",
    templateSlug: "wedding-imperial-dragon-crimson",
    openingEffect: "WAX_SEAL" as OpeningEffect,
    fallingEffect: "PETAL" as FallingEffect,
    musicUrl: "/music/le-duong.mp3",
    isAutoPlay: true,
    primaryColor: "#6E1719",
    fontFamily: "Playfair Display",
    greetingMessage: "“Long Phụng sum vầy — Trăm năm kết tóc — Loan phụng hòa minh. Hân hạnh đón tiếp quý khách đến chúc phúc cho lễ cưới của chúng tôi.”",
    categoryData: {
      cardCategory: "WEDDING",
      heroSubtitle: "ĐẠI LỄ TÂN HÔN",
      invitationTitle: "LỄ THÀNH HÔN HOÀNG TRIỀU",
      coverPhotoUrl: "/images/demo/templates/t09-dragon/cover.jpg",
      greeting: "“Long Phụng Hòa Minh — Trăm Năm Hạnh Phúc”",
      groom: {
        fullName: "Nguyễn Anh Tuấn",
        shortName: "Anh Tuấn",
        birthOrder: "Trưởng nam",
        avatarUrl: "/images/demo/templates/t09-dragon/groom.jpg",
        parents: { fatherName: "Nguyễn Thế Hùng", motherName: "Hoàng Thị Lan" },
        story: "Chàng trai chí khí, đĩnh đạc, luôn là niềm tự hào của dòng tộc.",
      },
      bride: {
        fullName: "Huỳnh Thu Trang",
        shortName: "Thu Trang",
        birthOrder: "Trưởng nữ",
        avatarUrl: "/images/demo/templates/t09-dragon/bride.jpg",
        parents: { fatherName: "Huỳnh Văn Bảy", motherName: "Lê Thị Thảo" },
        story: "Người con gái đức hạnh, thông tuệ và chu đáo mọi việc.",
      },
      loveStory: [
        { title: "Định Mệnh Giao Thoa", date: "2020", description: "Mối lương duyên được hai bên gia đình vun đắp và đồng thuận." },
        { title: "Tâm Đầu Ý Hợp", date: "2023", description: "Càng gắn bó càng nhận ra sự đồng điệu sâu sắc trong từng suy nghĩ." },
        { title: "Đại Lễ Giao Bôi", date: "2026", description: "Lễ cưới hoành tráng rạng rỡ gia phong hai họ." },
      ],
    },
    events: [
      {
        eventName: "Đại Lễ Tân Hôn & Tiệc Mừng Gia Tộc",
        eventDate: new Date("2026-11-08T18:00:00Z"),
        lunarDate: "Ngày 29 Tháng 9 Năm Bính Ngọ",
        venueName: "Trung Tâm Hội Nghị White Palace",
        address: "194 Hoàng Văn Thụ, Phường 9, Phú Nhuận, TP. HCM",
        mapUrl: "https://maps.google.com",
      },
    ],
    photos: [
      { url: "/images/demo/templates/t09-dragon/gallery-1.jpg", caption: "Sải bước kiêu hãnh giữa kiến trúc hoàng gia", isCover: true },
      { url: "/images/demo/templates/t09-dragon/gallery-2.jpg", caption: "Ánh nắng ban mai rọi sáng đường đôi" },
      { url: "/images/demo/templates/t09-dragon/gallery-3.jpg", caption: "Thần thái quý phái ngày đại lễ" },
      { url: "/images/demo/templates/t09-dragon/gallery-4.jpg", caption: "Những khoảnh khắc tự nhiên đầy quyến rũ" },
      { url: "/images/demo/templates/t09-dragon/gallery-5.jpg", caption: "Tình yêu vững bền như thành trì kiên cố" },
      { url: "/images/demo/templates/t09-dragon/gallery-6.jpg", caption: "Long Phượng sum vầy trọn vẹn trăm năm" },
    ],
    bankingPrimary: { bankCode: "MB", accountNumber: "6666888899", accountName: "NGUYEN ANH TUAN" },
    bankingSecondary: { bankCode: "ACB", accountNumber: "9999888877", accountName: "HUYNH THU TRANG" },
  },
];

async function seedCards() {
  console.log("🌱 Bắt đầu lưu trữ 9 mẫu thiệp vào Backend Database (Supabase PostgreSQL)...");

  // Lấy User và Account Admin
  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });
  if (!adminUser) throw new Error("Chưa có admin user");

  const adminAccount = await prisma.account.findFirst();
  if (!adminAccount) throw new Error("Chưa có account");

  const vipPlan = await prisma.plan.findFirst({
    where: { code: "VIP" },
  });
  if (!vipPlan) throw new Error("Chưa có gói VIP");

  console.log(`📌 Admin User: ${adminUser.email} (${adminUser.id})`);
  console.log(`📌 Account: ${adminAccount.name} (${adminAccount.id})`);
  console.log(`📌 Plan: ${vipPlan.name} (${vipPlan.id})`);

  for (const item of WEDDING_CARDS_DATA) {
    const template = await prisma.template.findUnique({
      where: { slug: item.templateSlug },
    });
    if (!template) {
      console.warn(`⚠️ Không tìm thấy template ${item.templateSlug}`);
      continue;
    }

    // Cập nhật thumbnailUrl của Template trong DB khớp với ảnh cover mới
    await prisma.template.update({
      where: { id: template.id },
      data: {
        thumbnailUrl: item.photos[0].url,
      },
    });

    // Upsert Card
    const existingCard = await prisma.card.findUnique({
      where: { slug: item.slug },
      include: { photos: true, events: true },
    });

    let cardId: string;

    if (existingCard) {
      console.log(`🔄 Cập nhật thẻ thiệp trên Backend DB: ${item.slug}`);
      const updated = await prisma.card.update({
        where: { id: existingCard.id },
        data: {
          templateId: template.id,
          status: CardStatus.ACTIVE,
          cardCategory: CardCategory.WEDDING,
          primaryColor: item.primaryColor,
          fontFamily: item.fontFamily,
          greetingMessage: item.greetingMessage,
          musicUrl: item.musicUrl,
          isAutoPlay: item.isAutoPlay,
          openingEffect: item.openingEffect,
          fallingEffect: item.fallingEffect,
          categoryData: item.categoryData as any,
          bankingPrimary: item.bankingPrimary as any,
          bankingSecondary: item.bankingSecondary as any,
        },
      });
      cardId = updated.id;

      // Xóa photos và events cũ để thêm mới chuẩn xác
      await prisma.cardPhoto.deleteMany({ where: { cardId } });
      await prisma.cardEvent.deleteMany({ where: { cardId } });
    } else {
      console.log(`✨ Tạo mới thẻ thiệp trên Backend DB: ${item.slug}`);
      const created = await prisma.card.create({
        data: {
          accountId: adminAccount.id,
          userId: adminUser.id,
          planId: vipPlan.id,
          templateId: template.id,
          slug: item.slug,
          status: CardStatus.ACTIVE,
          cardCategory: CardCategory.WEDDING,
          primaryColor: item.primaryColor,
          fontFamily: item.fontFamily,
          greetingMessage: item.greetingMessage,
          musicUrl: item.musicUrl,
          isAutoPlay: item.isAutoPlay,
          openingEffect: item.openingEffect,
          fallingEffect: item.fallingEffect,
          categoryData: item.categoryData as any,
          bankingPrimary: item.bankingPrimary as any,
          bankingSecondary: item.bankingSecondary as any,
        },
      });
      cardId = created.id;
    }

    // Thêm danh sách ảnh CardPhoto vào Backend DB
    await prisma.cardPhoto.createMany({
      data: item.photos.map((p, idx) => ({
        accountId: adminAccount.id,
        cardId,
        url: p.url,
        caption: p.caption,
        isCover: p.isCover ?? idx === 0,
        sortOrder: idx,
      })),
    });

    // Thêm danh sách sự kiện CardEvent vào Backend DB
    await prisma.cardEvent.createMany({
      data: item.events.map((e, idx) => ({
        accountId: adminAccount.id,
        cardId,
        eventName: e.eventName,
        eventDate: e.eventDate,
        lunarDate: e.lunarDate,
        venueName: e.venueName,
        address: e.address,
        mapUrl: e.mapUrl,
        sortOrder: idx,
      })),
    });

    console.log(`  ✅ Đã lưu thành công thiệp ${item.slug} (${item.photos.length} ảnh CardPhoto) vào Database!`);
  }

  console.log("🎉 Hoàn tất 100% lưu trữ 9 mẫu thiệp vào Backend PostgreSQL Database!");
}

seedCards()
  .catch((e) => {
    console.error("❌ Lỗi khi seed thẻ thiệp:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
