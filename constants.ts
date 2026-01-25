
import { Language, CEFRLevel, StoryStyle, AppLanguage } from './types';

export const LANGUAGES: Language[] = [
  "Bulgarian", "Chinese", "Croatian", "Czech", "Danish", "Dutch", "English",
  "Estonian", "Finnish", "French", "German", "Greek", "Hungarian",
  "Irish", "Italian", "Japanese", "Korean", "Latvian", "Lithuanian", "Maltese", "Polish",
  "Portuguese", "Romanian", "Slovak", "Slovenian", "Spanish", "Swedish", "Vietnamese"
];

export const APP_LANGUAGES: AppLanguage[] = ["English", "Finnish", "Vietnamese"];

export const LANGUAGE_LABELS: Record<AppLanguage, Record<Language, string>> = {
  English: {
    "Bulgarian": "Bulgarian", "Chinese": "Chinese", "Croatian": "Croatian", "Czech": "Czech", "Danish": "Danish", 
    "Dutch": "Dutch", "English": "English", "Estonian": "Estonian", "Finnish": "Finnish", 
    "French": "French", "German": "German", "Greek": "Greek", "Hungarian": "Hungarian", 
    "Irish": "Irish", "Italian": "Italian", "Japanese": "Japanese", "Korean": "Korean", "Latvian": "Latvian", "Lithuanian": "Lithuanian", 
    "Maltese": "Maltese", "Polish": "Polish", "Portuguese": "Portuguese", "Romanian": "Romanian", 
    "Slovak": "Slovak", "Slovenian": "Slovenia", "Spanish": "Spanish", "Swedish": "Swedish", "Vietnamese": "Vietnamese"
  },
  Finnish: {
    "Bulgarian": "Bulgaria", "Chinese": "Kiina", "Croatian": "Kroatia", "Czech": "Tšekki", "Danish": "Tanska", 
    "Dutch": "Hollanti", "English": "Englanti", "Estonian": "Viro", "Finnish": "Suomi", 
    "French": "Ranska", "German": "Saksa", "Greek": "Kreikka", "Hungarian": "Unkari", 
    "Irish": "Iiri", "Italian": "Italia", "Japanese": "Japani", "Korean": "Korea", "Latvian": "Latvia", "Lithuanian": "Liettua", 
    "Maltese": "Malta", "Polish": "Puola", "Portuguese": "Portugali", "Romanian": "Romania", 
    "Slovak": "Slovakia", "Slovenian": "Slovenia", "Spanish": "Espanja", "Swedish": "Ruotsi", "Vietnamese": "Vietnam"
  },
  Vietnamese: {
    "Bulgarian": "Bungari", "Chinese": "Trung", "Croatian": "Croatia", "Czech": "Séc", "Danish": "Đan Mạch", 
    "Dutch": "Hà Lan", "English": "Anh", "Estonian": "Estonia", "Finnish": "Phần Lan", 
    "French": "Pháp", "German": "Đức", "Greek": "Hy Lạp", "Hungarian": "Hungary", 
    "Irish": "Ireland", "Italian": "Ý", "Japanese": "Nhật", "Korean": "Hàn", "Latvian": "Latvia", "Lithuanian": "Litva", 
    "Maltese": "Malta", "Polish": "Ba Lan", "Portuguese": "Bồ Đào Nha", "Romanian": "Rumani", 
    "Slovak": "Slovak", "Slovenian": "Slovenia", "Spanish": "Tây Ban Nha", "Swedish": "Thụy Điển", "Vietnamese": "Việt"
  }
};

export const LANGUAGE_THEMES: Record<Language, string> = {
  "Bulgarian": "from-green-600 to-red-600",
  "Chinese": "from-red-600 to-yellow-500",
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
  "Japanese": "from-red-700 to-red-500",
  "Korean": "from-red-600 to-blue-600",
  "Latvian": "from-red-900 to-red-700",
  "Lithuanian": "from-yellow-500 to-green-700",
  "Maltese": "from-red-600 to-gray-300",
  "Polish": "from-red-600 to-red-400",
  "Portuguese": "from-green-600 to-red-600",
  "Romanian": "from-blue-700 to-yellow-500",
  "Slovak": "from-blue-700 to-red-600",
  "Slovenian": "from-blue-600 to-red-600",
  "Spanish": "from-red-600 to-yellow-500",
  "Swedish": "from-blue-600 to-yellow-400",
  "Vietnamese": "from-red-700 to-yellow-500"
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
    "A1.1": "A1.1 - Absolute Beginner",
    "A1.2": "A1.2 - Beginner",
    "A1.3": "A1.3 - Elementary",
    "A2.1": "A2.1 - High Elementary",
    "A2.2": "A2.2 - Pre-Intermediate",
    "B1.1": "B1.1 - Intermediate",
    "B1.2": "B1.2 - High Intermediate",
    "B2.1": "B2.1 - Upper Intermediate",
    "B2.2": "B2.2 - Pre-Advanced",
    "C1-C2": "C1-C2 - Advanced/Mastery"
  },
  Finnish: {
    "A1.1": "A1.1 - Aivan alkeet",
    "A1.2": "A1.2 - Alkeet",
    "A1.3": "A1.3 - Perustaso",
    "A2.1": "A2.1 - Perustason jatko",
    "A2.2": "A2.2 - Esikeskitaso",
    "B1.1": "B1.1 - Keskitaso",
    "B1.2": "B1.2 - Keskitason jatko",
    "B2.1": "B2.1 - Ylempi keskitaso",
    "B2.2": "B2.2 - Edistynyt",
    "C1-C2": "C1-C2 - Mestari"
  },
  Vietnamese: {
    "A1.1": "A1.1 - Mới bắt đầu",
    "A1.2": "A1.2 - Sơ cấp",
    "A1.3": "A1.3 - Sơ cấp nâng cao",
    "A2.1": "A2.1 - Sơ trung cấp",
    "A2.2": "A2.2 - Tiền trung cấp",
    "B1.1": "B1.1 - Trung cấp",
    "B1.2": "B1.2 - Trung cấp nâng cao",
    "B2.1": "B2.1 - Trên trung cấp",
    "B2.2": "B2.2 - Tiền cao cấp",
    "C1-C2": "C1-C2 - Cao cấp / Thành thạo"
  }
};

export const STORY_STYLES: StoryStyle[] = [
  "Adventure",
  "Bedtime", 
  "Biography",
  "Dialogue", 
  "Diary",
  "Fantasy", 
  "Funny", 
  "History",
  "Mystery", 
  "News",
  "Romance",
  "Sci-Fi", 
  "Serious", 
  "Standard", 
  "Thriller"
];

export const STORY_STYLE_LABELS: Record<AppLanguage, Record<StoryStyle, string>> = {
  English: { 
    "Adventure": "Adventure",
    "Bedtime": "Bedtime", 
    "Biography": "Biography",
    "Dialogue": "Dialogue", 
    "Diary": "Diary",
    "Fantasy": "Fantasy", 
    "Funny": "Funny", 
    "History": "History",
    "Mystery": "Mystery", 
    "News": "News/Article",
    "Romance": "Romance",
    "Sci-Fi": "Sci-Fi", 
    "Serious": "Serious", 
    "Standard": "Standard", 
    "Thriller": "Thriller" 
  },
  Finnish: { 
    "Adventure": "Seikkailu",
    "Bedtime": "Iltasatu", 
    "Biography": "Elämäkerta",
    "Dialogue": "Keskustelu", 
    "Diary": "Päiväkirja",
    "Fantasy": "Fantasia", 
    "Funny": "Hauska", 
    "History": "Historia",
    "Mystery": "Mysteeri", 
    "News": "Uutinen",
    "Romance": "Romantiikka",
    "Sci-Fi": "Scifi", 
    "Serious": "Vakava", 
    "Standard": "Tavallinen", 
    "Thriller": "Jännitys" 
  },
  Vietnamese: { 
    "Adventure": "Phiêu lưu",
    "Bedtime": "Truyện kể bé nghe", 
    "Biography": "Tiểu sử",
    "Dialogue": "Đối thoại", 
    "Diary": "Nhật ký",
    "Fantasy": "Giả tưởng", 
    "Funny": "Hài hước", 
    "History": "Lịch sử",
    "Mystery": "Trinh thám", 
    "News": "Tin tức",
    "Romance": "Lãng mạn",
    "Sci-Fi": "Khoa học viễn tưởng", 
    "Serious": "Chính kịch", 
    "Standard": "Tiêu chuẩn", 
    "Thriller": "Giật gân" 
  }
};

// Dynamic topics simplified to single words or short phrases
export const LEVEL_SPECIFIC_TOPICS: Record<AppLanguage, Record<CEFRLevel, string[]>> = {
  English: {
    "A1.1": ["Greetings", "Colors", "Numbers", "Family", "Pets", "House", "Classroom", "Weekdays", "Fruits", "Body", "Objects", "Weather", "Intro", "Country", "Yes/No", "Names"],
    "A1.2": ["Routine", "Room", "Coffee", "Directions", "Hobbies", "Time", "Clothes", "Seasons", "Transport", "Friends", "Food", "Market", "Emotions", "Jobs", "Weekend", "Pet"],
    "A1.3": ["Birthday", "Holidays", "Shopping", "Menu", "School", "People", "Town", "Picnic", "Sports", "Music", "TV", "Weekend", "Holiday", "Email", "Sickness", "Apartment"],
    "A2.1": ["Travel", "Doctor", "Hotel", "Advice", "Cooking", "Bus", "Movies", "Celebrities", "Childhood", "Nature", "Tech", "Shopping", "Party", "Apologies", "Restaurant", "Weather"],
    "A2.2": ["Interview", "Problems", "Accident", "Festivals", "Education", "Media", "Health", "Recycling", "Books", "Goals", "Dating", "Rules", "Complaints", "Culture", "Directions", "Emergency"],
    "B1.1": ["Careers", "News", "Tech", "Fitness", "Travel", "University", "Art", "Society", "Climate", "Traditions", "Ads", "Personality", "Languages", "Remote Work", "Volunteers", "Rural"],
    "B1.2": ["Politics", "Economics", "Science", "Mental Health", "Globalization", "History", "Architecture", "Fashion", "Consumers", "Education", "Space", "AI", "Law", "Immigration", "Speech", "Biography"],
    "B2.1": ["Business", "Geopolitics", "Ethics", "Philosophy", "Science", "Literature", "Music", "Theatre", "Psychology", "Relations", "Energy", "Crisis", "Culture", "Journalism", "Dining", "Investing"],
    "B2.2": ["Diplomacy", "Innovation", "Criticism", "Welfare", "Urbanism", "Sociology", "Theology", "Astronomy", "Genomics", "Security", "Taxes", "Heritage", "Rhetoric", "Satire", "Mindfulness", "Leadership"],
    "C1-C2": ["Metaphysics", "Physics", "Geopolitics", "Nuance", "Irony", "Dialects", "Law", "Neuroscience", "Cosmology", "Existentialism", "Aesthetics", "Ideology", "Anthropology", "Epistemology", "Paradoxes", "Biochemistry"]
  },
  Finnish: {
    "A1.1": ["Tervehdykset", "Värit", "Numerot", "Perhe", "Lemmikit", "Koti", "Luokka", "Viikko", "Hedelmät", "Keho", "Esineet", "Sää", "Esittely", "Kotimaa", "Kyllä/Ei", "Nimet"],
    "A1.2": ["Rutiinit", "Huone", "Kahvi", "Suunnat", "Harrastukset", "Kello", "Vaatteet", "Vuodenajat", "Liikenne", "Ystävät", "Ruoka", "Tori", "Tunteet", "Ammatit", "Viikonloppu", "Lemmikki"],
    "A1.3": ["Synttärit", "Loma", "Ostokset", "Menu", "Koulu", "Ihmiset", "Kaupunki", "Piknik", "Urheilu", "Musiikki", "TV", "Viikonloppu", "Matka", "Sähköposti", "Sairaus", "Asunto"],
    "A2.1": ["Matka", "Lääkäri", "Hotelli", "Neuvot", "Kokkailu", "Bussi", "Elokuvat", "Julkkikset", "Lapsuus", "Luonto", "Teknologia", "Ostokset", "Juhlat", "Anteeksi", "Ravintola", "Sää"],
    "A2.2": ["Haastattelu", "Ongelmat", "Onnettomuus", "Festivaalit", "Koulutus", "Somettaminen", "Terveys", "Kierrätys", "Kirjat", "Tavoitteet", "Treffit", "Säännöt", "Valitus", "Kulttuuri", "Reitti", "Hätä"],
    "B1.1": ["Ura", "Uutiset", "Teknologia", "Kuntoilu", "Matkailu", "Yliopisto", "Taide", "Yhteiskunta", "Ilmasto", "Perinteet", "Mainokset", "Luonne", "Kielet", "Etätyö", "Vapaaehtoistyö", "Maaseutu"],
    "B1.2": ["Politiikka", "Talous", "Tiede", "Mielenterveys", "Globalisaatio", "Historia", "Arkkitehtuuri", "Muoti", "Kulutus", "Koulutus", "Avaruus", "Tekoäly", "Laki", "Maahanmuutto", "Sananvapaus", "Elämäkerrat"],
    "B2.1": ["Liiketoiminta", "Geopolitiikka", "Etiikka", "Filosofia", "Tiede", "Kirjallisuus", "Musiikki", "Teatteri", "Psykologia", "Suhteet", "Energia", "Kriisit", "Kulttuuri", "Journalismi", "Ruokailu", "Sijoittaminen"],
    "B2.2": ["Diplomatia", "Innovaatio", "Kritiikki", "Hyvinvointi", "Kaupungit", "Sosiologia", "Teologia", "Tähtitiede", "Genomiikka", "Tietoturva", "Verotus", "Perintö", "Retoriikka", "Satiiri", "Tietoisuus", "Johtajuus"],
    "C1-C2": ["Metafysiikka", "Kvanttifysiikka", "Geopolitiikka", "Vivahteet", "Ironia", "Murteet", "Oikeus", "Neurotiede", "Kosmologia", "Eksistentialismi", "Estetiikka", "Ideologia", "Antropologia", "Epistemologia", "Paradoksit", "Biokemia"]
  },
  Vietnamese: {
    "A1.1": ["Chào hỏi", "Màu sắc", "Số đếm", "Gia đình", "Thú cưng", "Nhà cửa", "Lớp học", "Thứ ngày", "Trái cây", "Cơ thể", "Đồ vật", "Thời tiết", "Giới thiệu", "Đất nước", "Có/Không", "Tên gọi"],
    "A1.2": ["Thói quen", "Phòng ốc", "Cà phê", "Hỏi đường", "Sở thích", "Giờ giấc", "Quần áo", "Mùa", "Giao thông", "Bạn bè", "Món ăn", "Chợ búa", "Cảm xúc", "Nghề nghiệp", "Cuối tuần", "Vật nuôi"],
    "A1.3": ["Sinh nhật", "Nghỉ hè", "Mua sắm", "Thực đơn", "Trường học", "Con người", "Thị trấn", "Dã ngoại", "Thể thao", "Âm nhạc", "TV", "Cuối tuần", "Kỳ nghỉ", "Email", "Ốm đau", "Căn hộ"],
    "A2.1": ["Du lịch", "Bác sĩ", "Khách sạn", "Lời khuyên", "Nấu ăn", "Xe buýt", "Phim ảnh", "Người nổi tiếng", "Tuổi thơ", "Thiên nhiên", "Công nghệ", "Mua sắm", "Tiệc tùng", "Xin lỗi", "Nhà hàng", "Thời tiết"],
    "A2.2": ["Phỏng vấn", "Vấn đề", "Tai nạn", "Lễ hội", "Giáo dục", "Mạng xã hội", "Sức khỏe", "Tái chế", "Sách vở", "Mục tiêu", "Hẹn hò", "Nội quy", "Khiếu nại", "Văn hóa", "Chỉ đường", "Khẩn cấp"],
    "B1.1": ["Sự nghiệp", "Tin tức", "Công nghệ", "Thể dục", "Du lịch", "Đại học", "Nghệ thuật", "Xã hội", "Khí hậu", "Truyền thống", "Quảng cáo", "Tính cách", "Ngoại ngữ", "Làm từ xa", "Tình nguyện", "Nông thôn"],
    "B1.2": ["Chính trị", "Kinh tế", "Khoa học", "Tâm lý", "Toàn cầu hóa", "Lịch sử", "Kiến trúc", "Thời trang", "Tiêu dùng", "Giáo dục", "Vũ trụ", "AI", "Pháp luật", "Nhập cư", "Ngôn luận", "Tiểu sử"],
    "B2.1": ["Kinh doanh", "Địa chính trị", "Đạo đức", "Triết học", "Khoa học", "Văn học", "Âm nhạc", "Sân khấu", "Tâm lý học", "Quan hệ", "Năng lượng", "Khủng hoảng", "Văn hóa", "Báo chí", "Ẩm thực", "Đầu tư"],
    "B2.2": ["Ngoại giao", "Đổi mới", "Phê bình", "Phúc lợi", "Đô thị", "Xã hội học", "Thần học", "Thiên văn", "Di truyền", "An ninh", "Thuế má", "Di sản", "Hùng biện", "Châm biếm", "Chánh niệm", "Lãnh đạo"],
    "C1-C2": ["Siêu hình", "Lượng tử", "Địa chính trị", "Sắc thái", "Mỉa mai", "Phương ngữ", "Luật học", "Thần kinh", "Vũ trụ", "Hiện sinh", "Mỹ học", "Tư tưởng", "Nhân học", "Nhận thức", "Nghịch lý", "Hóa sinh"]
  }
};
