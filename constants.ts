import { Language, CEFRLevel, StoryStyle, AppLanguage } from './types';

export const LANGUAGES: Language[] = [
  "Bulgarian", "Croatian", "Czech", "Danish", "Dutch", "English",
  "Estonian", "Finnish", "French", "German", "Greek", "Hungarian",
  "Irish", "Italian", "Latvian", "Lithuanian", "Maltese", "Polish",
  "Portuguese", "Romanian", "Slovak", "Slovenian", "Spanish", "Swedish"
];

export const APP_LANGUAGES: AppLanguage[] = ["English", "Finnish", "Vietnamese"];

export const LANGUAGE_LABELS: Record<AppLanguage, Record<Language, string>> = {
  English: {
    "Bulgarian": "Bulgarian", "Croatian": "Croatian", "Czech": "Czech", "Danish": "Danish", 
    "Dutch": "Dutch", "English": "English", "Estonian": "Estonian", "Finnish": "Finnish", 
    "French": "French", "German": "German", "Greek": "Greek", "Hungarian": "Hungarian", 
    "Irish": "Irish", "Italian": "Italian", "Latvian": "Latvian", "Lithuanian": "Lithuanian", 
    "Maltese": "Maltese", "Polish": "Polish", "Portuguese": "Portuguese", "Romanian": "Romanian", 
    "Slovak": "Slovak", "Slovenian": "Slovenian", "Spanish": "Spanish", "Swedish": "Swedish"
  },
  Finnish: {
    "Bulgarian": "Bulgaria", "Croatian": "Kroatia", "Czech": "Tšekki", "Danish": "Tanska", 
    "Dutch": "Hollanti", "English": "Englanti", "Estonian": "Viro", "Finnish": "Suomi", 
    "French": "Ranska", "German": "Saksa", "Greek": "Kreikka", "Hungarian": "Unkari", 
    "Irish": "Iiri", "Italian": "Italia", "Latvian": "Latvia", "Lithuanian": "Liettua", 
    "Maltese": "Malta", "Polish": "Puola", "Portuguese": "Portugali", "Romanian": "Romania", 
    "Slovak": "Slovakia", "Slovenian": "Slovenia", "Spanish": "Espanja", "Swedish": "Ruotsi"
  },
  Vietnamese: {
    "Bulgarian": "Tiếng Bungari", "Croatian": "Tiếng Croatia", "Czech": "Tiếng Séc", "Danish": "Tiếng Đan Mạch", 
    "Dutch": "Tiếng Hà Lan", "English": "Tiếng Anh", "Estonian": "Tiếng Estonia", "Finnish": "Tiếng Phần Lan", 
    "French": "Tiếng Pháp", "German": "Tiếng Đức", "Greek": "Tiếng Hy Lạp", "Hungarian": "Tiếng Hungary", 
    "Irish": "Tiếng Ireland", "Italian": "Tiếng Ý", "Latvian": "Tiếng Latvia", "Lithuanian": "Tiếng Litva", 
    "Maltese": "Tiếng Malta", "Polish": "Tiếng Ba Lan", "Portuguese": "Tiếng Bồ Đào Nha", "Romanian": "Tiếng Rumani", 
    "Slovak": "Tiếng Slovak", "Slovenian": "Tiếng Slovenia", "Spanish": "Tiếng Tây Ban Nha", "Swedish": "Tiếng Thụy Điển"
  }
};

// Gradient classes based on flag colors (approximate)
export const LANGUAGE_THEMES: Record<Language, string> = {
  "Bulgarian": "from-green-600 to-red-600",
  "Croatian": "from-red-600 to-blue-700",
  "Czech": "from-blue-700 to-red-600",
  "Danish": "from-red-600 to-red-800",
  "Dutch": "from-red-600 to-blue-700",
  "English": "from-red-600 to-blue-800",
  "Estonian": "from-blue-600 to-gray-800",
  "Finnish": "from-blue-600 to-blue-400",
  "French": "from-blue-700 to-red-600",
  "German": "from-gray-900 to-yellow-600",
  "Greek": "from-blue-500 to-blue-700",
  "Hungarian": "from-red-600 to-green-700",
  "Irish": "from-green-600 to-orange-500",
  "Italian": "from-green-600 to-red-600",
  "Latvian": "from-red-900 to-red-700",
  "Lithuanian": "from-yellow-500 to-green-700",
  "Maltese": "from-red-600 to-gray-300",
  "Polish": "from-red-600 to-red-400",
  "Portuguese": "from-green-600 to-red-600",
  "Romanian": "from-blue-700 to-yellow-500",
  "Slovak": "from-blue-700 to-red-600",
  "Slovenian": "from-blue-600 to-red-600",
  "Spanish": "from-red-600 to-yellow-500",
  "Swedish": "from-blue-600 to-yellow-400"
};

export const LEVELS: CEFRLevel[] = [
  "A1.1", "A1.2", "A1.3",
  "A2.1", "A2.2",
  "B1.1", "B1.2",
  "B2.1", "B2.2",
  "C1-C2"
];

export const LEVEL_DESCRIPTIONS: Record<AppLanguage, Record<CEFRLevel, string>> = {
  English: {
    "A1.1": "A1.1 - Absolute Beginner (Basic words)",
    "A1.2": "A1.2 - Beginner (Simple sentences)",
    "A1.3": "A1.3 - Elementary (Daily routines)",
    "A2.1": "A2.1 - High Elementary (Socializing)",
    "A2.2": "A2.2 - Pre-Intermediate (Short stories)",
    "B1.1": "B1.1 - Intermediate (Conversational)",
    "B1.2": "B1.2 - High Intermediate (Opinions)",
    "B2.1": "B2.1 - Upper Intermediate (Complex ideas)",
    "B2.2": "B2.2 - Pre-Advanced (Fluency)",
    "C1-C2": "C1-C2 - Advanced/Mastery (Native-like)"
  },
  Finnish: {
    "A1.1": "A1.1 - Aivan alkeet (Perussanat)",
    "A1.2": "A1.2 - Alkeet (Yksinkertaiset lauseet)",
    "A1.3": "A1.3 - Perustaso (Päivittäiset rutiinit)",
    "A2.1": "A2.1 - Perustason jatko (Sosiaalinen kanssakäyminen)",
    "A2.2": "A2.2 - Esikeskitaso (Lyhyet tarinat)",
    "B1.1": "B1.1 - Keskitaso (Keskustelu)",
    "B1.2": "B1.2 - Keskitason jatko (Mielipiteet)",
    "B2.1": "B2.1 - Ylempi keskitaso (Monimutkaiset ideat)",
    "B2.2": "B2.2 - Edistynyt (Sujuvuus)",
    "C1-C2": "C1-C2 - Mestari (Natiivitaso)"
  },
  Vietnamese: {
    "A1.1": "A1.1 - Mới bắt đầu (Từ cơ bản)",
    "A1.2": "A1.2 - Sơ cấp (Câu đơn giản)",
    "A1.3": "A1.3 - Sơ cấp nâng cao (Thói quen hàng ngày)",
    "A2.1": "A2.1 - Sơ trung cấp (Giao tiếp xã hội)",
    "A2.2": "A2.2 - Tiền trung cấp (Truyện ngắn)",
    "B1.1": "B1.1 - Trung cấp (Hội thoại)",
    "B1.2": "B1.2 - Trung cao cấp (Ý kiến)",
    "B2.1": "B2.1 - Cao cấp (Ý tưởng phức tạp)",
    "B2.2": "B2.2 - Tiền thành thạo (Lưu loát)",
    "C1-C2": "C1-C2 - Thành thạo (Như người bản xứ)"
  }
};

export const STORY_STYLES: StoryStyle[] = [
  "Standard",
  "Funny",
  "Serious",
  "Bedtime Story",
  "Thriller",
  "Sci-Fi",
  "Fantasy",
  "Mystery",
  "Dialogue-heavy"
];

export const STORY_STYLE_LABELS: Record<AppLanguage, Record<StoryStyle, string>> = {
  English: {
    "Standard": "Standard",
    "Funny": "Funny",
    "Serious": "Serious",
    "Bedtime Story": "Bedtime Story",
    "Thriller": "Thriller",
    "Sci-Fi": "Sci-Fi",
    "Fantasy": "Fantasy",
    "Mystery": "Mystery",
    "Dialogue-heavy": "Dialogue-heavy"
  },
  Finnish: {
    "Standard": "Tavallinen",
    "Funny": "Hauska",
    "Serious": "Vakava",
    "Bedtime Story": "Iltasatu",
    "Thriller": "Jännitys",
    "Sci-Fi": "Scifi",
    "Fantasy": "Fantasia",
    "Mystery": "Mysteeri",
    "Dialogue-heavy": "Keskustelupainotteinen"
  },
  Vietnamese: {
    "Standard": "Tiêu chuẩn",
    "Funny": "Hài hước",
    "Serious": "Nghiêm túc",
    "Bedtime Story": "Truyện kể bé nghe",
    "Thriller": "Giật gân",
    "Sci-Fi": "Khoa học viễn tưởng",
    "Fantasy": "Giả tưởng",
    "Mystery": "Bí ẩn",
    "Dialogue-heavy": "Nhiều đối thoại"
  }
};

export const SUGGESTED_TOPICS: Record<AppLanguage, string[]> = {
  English: [
    "Banking", "Clothes", "Coffee", "Cooking", "Culture", 
    "Daily Routine", "Directions", "Doctor", "Emergencies", "Family", 
    "Friends", "Gym", "Hobbies", "Holidays", "Home", 
    "Hotel", "Movies", "Nature", "Pets", "Pharmacy", 
    "Relatives", "Restaurant", "School", "Shopping", "Studies", 
    "Tech Support", "Tickets", "Transport", "Travel", "Weather", 
    "Work"
  ],
  Finnish: [
    "Apteekki", "Elokuvat", "Harrastukset", "Hotelli", "Hätätilanteet", 
    "Kahvi", "Koti", "Koulu", "Kulttuuri", "Kuntosali", 
    "Lemmikit", "Liikenne", "Liput", "Lomat", "Luonto", 
    "Lääkäri", "Matkustus", "Opiskelu", "Ostokset", "Pankkiasiat", 
    "Perhe", "Päivärutiinit", "Ravintola", "Reittiohjeet", "Ruoanlaitto", 
    "Sukulaiset", "Sää", "Tekninen tuki", "Työ", "Vaatteet", 
    "Ystävät"
  ],
  Vietnamese: [
    "Bác sĩ", "Bạn bè", "Cà phê", "Chỉ đường", "Công việc", 
    "Du lịch", "Gia đình", "Giao thông", "Hiệu thuốc", "Họ hàng", 
    "Học tập", "Hỗ trợ kỹ thuật", "Khách sạn", "Kỳ nghỉ", "Mua sắm", 
    "Nấu ăn", "Ngân hàng", "Nhà cửa", "Nhà hàng", "Phim ảnh", 
    "Phòng tập gym", "Quần áo", "Sở thích", "Thiên nhiên", "Thói quen hàng ngày", 
    "Thời tiết", "Thú cưng", "Tình huống khẩn cấp", "Trường học", "Văn hóa", 
    "Vé"
  ]
};