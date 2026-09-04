import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const keywordSource = path.resolve(root, "../upload/Markdown ที่วาง (1).md");
const articleDir = path.join(root, "articles");
const assetDir = path.join(root, "assets");
const registryPath = path.join(root, "articles.json");
const campaignPath = path.join(root, "x-keywords-300.json");
const hubPath = path.join(root, "x-keywords-300.html");
const siteBase = "https://rn473147-del.github.io/downloader-x-guides";
const productBase = "https://downloader-x.com";
const standardVersion = "2026-09-x-keywords-v1";
const date = "2026-09-04";

const supportedLocales = [
  "en", "th", "es", "ja", "id", "zh", "ko", "vi", "fil", "hi",
  "ar", "fa", "fr", "de", "it", "pt", "ru", "tr", "ms", "nl",
];

const rtlLocales = new Set(["ar", "fa"]);

const headlineSuffix = {
  en: "A Practical Downloader-X Guide", th: "คู่มือ Downloader-X ฉบับใช้งานจริง", es: "Guía práctica de Downloader-X", ja: "Downloader-X 実用ガイド", id: "Panduan praktis Downloader-X",
  zh: "Downloader-X 实用指南", ko: "Downloader-X 실전 가이드", vi: "Hướng dẫn Downloader-X thực tế", fil: "Praktikal na gabay sa Downloader-X", hi: "Downloader-X की व्यावहारिक गाइड",
  ar: "دليل Downloader-X العملي", fa: "راهنمای عملی Downloader-X", fr: "Guide pratique Downloader-X", de: "Praktischer Downloader-X-Leitfaden", it: "Guida pratica Downloader-X",
  pt: "Guia prático do Downloader-X", ru: "Практическое руководство Downloader-X", tr: "Pratik Downloader-X rehberi", ms: "Panduan praktikal Downloader-X", nl: "Praktische Downloader-X-handleiding",
};

const addedKeywords = {
  fa: [
    "دانلود آنلاین ویدیو از X",
    "دانلود ویدیوی توییتر با مرورگر",
    "ذخیره ویدیوی X بدون افزونه",
    "چگونه ویدیوی توییتر دانلود کنیم",
    "دانلود گیف توییتر",
    "دانلود ویدیو از برنامه X",
    "تبدیل ویدیوی توییتر به mp4",
    "ذخیره کلیپ X در گالری",
    "دانلود ویدیوی خصوصی توییتر",
    "دانلود ویدیوی توییتر با کیفیت 1080p",
    "دانلود صدای Twitter Spaces",
    "بهترین دانلودر آنلاین ویدیوی توییتر",
    "تبدیل لینک توییتر به mp4",
    "سایت امن دانلود ویدیوی توییتر",
    "دانلود رسانه X بدون برنامه",
  ],
  nl: [
    "online x-video downloaden",
    "twitter video's downloaden in chrome",
    "x video opslaan zonder extensie",
    "hoe download je video's van twitter",
    "twitter-gif online opslaan",
    "video downloaden vanuit de x app",
    "twitter naar mp4 converter",
    "x clips opslaan in filmrol",
    "privé twitter video downloaden",
    "twitter video downloaden in hd 1080p",
    "twitter spaces audio downloaden",
    "beste online twitter video downloader",
    "twitter link naar mp4 converteren",
    "veilige website voor twitter video download",
    "x media downloaden zonder app",
  ],
};

const sourceSlugs = {
  en: "how-to-download-x-twitter-videos-hd-any-device",
  th: "download-x-twitter-video-hd-all-devices-th",
  es: "descargar-videos-x-twitter-hd-cualquier-dispositivo",
  ja: "x-twitter-video-hd-download-any-device-ja",
  id: "download-video-x-twitter-hd-semua-perangkat",
  zh: "x-twitter-video-hd-download-any-device-zh",
  ko: "x-twitter-video-hd-download-any-device-ko",
  vi: "tai-video-x-twitter-hd-moi-thiet-bi",
  fil: "download-x-twitter-video-hd-anumang-device-fil",
  hi: "x-twitter-video-hd-download-sabhi-device-hi",
  ar: "download-x-twitter-video-hd-any-device-ar",
  fa: "download-x-twitter-video-hd-any-device-fa",
  fr: "telecharger-videos-x-twitter-hd-tout-appareil",
  de: "x-twitter-videos-hd-auf-jedem-geraet-herunterladen",
  it: "scaricare-video-x-twitter-hd-qualsiasi-dispositivo",
  pt: "baixar-videos-x-twitter-hd-qualquer-dispositivo",
  ru: "skachat-video-x-twitter-hd-na-lyubom-ustroystve",
  tr: "x-twitter-videolari-hd-her-cihazda-indir",
  ms: "muat-turun-video-x-twitter-hd-semua-peranti",
  nl: "x-twitter-videos-hd-op-elk-apparaat-downloaden",
};

const interfaceCopy = {
  en: { guide: "Practical X guide", quick: "Quick answer", steps: "Three steps with Downloader-X", focus: "What this search means", checks: "Checks that prevent a wrong result", faq: "Frequently asked questions", related: "Related X guides", cta: "Open Downloader-X", final: "Use the exact public post link", note: "Public posts only. Formats and quality depend on the real options returned by the source." },
  th: { guide: "คู่มือ X ฉบับใช้งานจริง", quick: "คำตอบแบบสั้น", steps: "3 ขั้นตอนด้วย Downloader-X", focus: "คำค้นหานี้หมายถึงอะไร", checks: "จุดตรวจที่ช่วยป้องกันผลลัพธ์ผิด", faq: "คำถามที่พบบ่อย", related: "คู่มือ X ที่เกี่ยวข้อง", cta: "เปิด Downloader-X", final: "ใช้ลิงก์โพสต์สาธารณะที่ถูกต้อง", note: "รองรับเฉพาะโพสต์สาธารณะ รูปแบบและคุณภาพขึ้นอยู่กับตัวเลือกจริงจากต้นทาง" },
  es: { guide: "Guía práctica de X", quick: "Respuesta rápida", steps: "Tres pasos con Downloader-X", focus: "Qué significa esta búsqueda", checks: "Comprobaciones para evitar un resultado incorrecto", faq: "Preguntas frecuentes", related: "Guías relacionadas de X", cta: "Abrir Downloader-X", final: "Usa el enlace exacto de la publicación pública", note: "Solo publicaciones públicas. El formato y la calidad dependen de las opciones reales de la fuente." },
  ja: { guide: "X 実用ガイド", quick: "要点", steps: "Downloader-X を使う3つの手順", focus: "この検索語が意味すること", checks: "誤った結果を防ぐ確認事項", faq: "よくある質問", related: "関連する X ガイド", cta: "Downloader-X を開く", final: "正確な公開投稿リンクを使用する", note: "公開投稿のみが対象です。形式と画質は配信元が実際に返す選択肢によって決まります。" },
  id: { guide: "Panduan praktis X", quick: "Jawaban singkat", steps: "Tiga langkah dengan Downloader-X", focus: "Arti pencarian ini", checks: "Pemeriksaan agar hasil tidak keliru", faq: "Pertanyaan umum", related: "Panduan X terkait", cta: "Buka Downloader-X", final: "Gunakan tautan postingan publik yang tepat", note: "Hanya postingan publik. Format dan kualitas mengikuti pilihan nyata yang diberikan sumber." },
  zh: { guide: "X 实用指南", quick: "快速解答", steps: "使用 Downloader-X 的三个步骤", focus: "这个搜索词真正代表什么", checks: "避免错误结果的检查方法", faq: "常见问题", related: "相关 X 指南", cta: "打开 Downloader-X", final: "使用准确的公开帖子链接", note: "仅支持公开帖子。格式和清晰度取决于来源实际返回的选项。" },
  ko: { guide: "X 실전 가이드", quick: "빠른 답변", steps: "Downloader-X 사용 3단계", focus: "이 검색어의 실제 의미", checks: "잘못된 결과를 막는 확인 사항", faq: "자주 묻는 질문", related: "관련 X 가이드", cta: "Downloader-X 열기", final: "정확한 공개 게시물 링크 사용", note: "공개 게시물만 지원합니다. 형식과 화질은 원본에서 실제로 제공되는 옵션에 따라 달라집니다." },
  vi: { guide: "Hướng dẫn X thực tế", quick: "Trả lời nhanh", steps: "Ba bước với Downloader-X", focus: "Ý nghĩa thực tế của từ khóa", checks: "Các bước kiểm tra để tránh kết quả sai", faq: "Câu hỏi thường gặp", related: "Hướng dẫn X liên quan", cta: "Mở Downloader-X", final: "Dùng đúng liên kết bài đăng công khai", note: "Chỉ hỗ trợ bài đăng công khai. Định dạng và chất lượng phụ thuộc vào lựa chọn thực tế từ nguồn." },
  fil: { guide: "Praktikal na gabay sa X", quick: "Mabilis na sagot", steps: "Tatlong hakbang gamit ang Downloader-X", focus: "Ano ang ibig sabihin ng paghahanap", checks: "Mga pagsusuring pumipigil sa maling resulta", faq: "Mga madalas itanong", related: "Kaugnay na gabay sa X", cta: "Buksan ang Downloader-X", final: "Gamitin ang eksaktong link ng pampublikong post", note: "Pampublikong post lamang. Nakabatay ang format at kalidad sa aktuwal na opsyon mula sa source." },
  hi: { guide: "X की व्यावहारिक गाइड", quick: "संक्षिप्त उत्तर", steps: "Downloader-X के साथ तीन चरण", focus: "इस खोज का सही अर्थ", checks: "गलत परिणाम से बचने की जाँच", faq: "अक्सर पूछे जाने वाले प्रश्न", related: "संबंधित X गाइड", cta: "Downloader-X खोलें", final: "सही सार्वजनिक पोस्ट लिंक इस्तेमाल करें", note: "केवल सार्वजनिक पोस्ट। फ़ॉर्मेट और गुणवत्ता स्रोत से मिले वास्तविक विकल्पों पर निर्भर हैं।" },
  ar: { guide: "دليل عملي لمنصة X", quick: "إجابة سريعة", steps: "ثلاث خطوات باستخدام Downloader-X", focus: "ما الذي يعنيه هذا البحث", checks: "فحوص تمنع النتيجة الخاطئة", faq: "الأسئلة الشائعة", related: "أدلة X ذات صلة", cta: "افتح Downloader-X", final: "استخدم رابط المنشور العام الصحيح", note: "للمنشورات العامة فقط. تعتمد الصيغة والجودة على الخيارات الفعلية التي يعيدها المصدر." },
  fa: { guide: "راهنمای عملی X", quick: "پاسخ کوتاه", steps: "سه مرحله با Downloader-X", focus: "معنای واقعی این جستجو", checks: "بررسی‌هایی برای جلوگیری از نتیجه نادرست", faq: "پرسش‌های متداول", related: "راهنماهای مرتبط X", cta: "باز کردن Downloader-X", final: "از پیوند دقیق پست عمومی استفاده کنید", note: "فقط پست‌های عمومی. قالب و کیفیت به گزینه‌های واقعی منبع بستگی دارد." },
  fr: { guide: "Guide pratique de X", quick: "Réponse rapide", steps: "Trois étapes avec Downloader-X", focus: "Ce que signifie cette recherche", checks: "Vérifications pour éviter un mauvais résultat", faq: "Questions fréquentes", related: "Guides X associés", cta: "Ouvrir Downloader-X", final: "Utilisez le lien exact de la publication publique", note: "Publications publiques uniquement. Le format et la qualité dépendent des options réellement fournies par la source." },
  de: { guide: "Praktischer X-Leitfaden", quick: "Kurzantwort", steps: "Drei Schritte mit Downloader-X", focus: "Was diese Suche bedeutet", checks: "Prüfungen gegen falsche Ergebnisse", faq: "Häufig gestellte Fragen", related: "Verwandte X-Anleitungen", cta: "Downloader-X öffnen", final: "Den exakten Link des öffentlichen Beitrags verwenden", note: "Nur öffentliche Beiträge. Format und Qualität hängen von den tatsächlich verfügbaren Quelloptionen ab." },
  it: { guide: "Guida pratica per X", quick: "Risposta rapida", steps: "Tre passaggi con Downloader-X", focus: "Cosa significa questa ricerca", checks: "Controlli per evitare risultati errati", faq: "Domande frequenti", related: "Guide X correlate", cta: "Apri Downloader-X", final: "Usa il link esatto del post pubblico", note: "Solo post pubblici. Formato e qualità dipendono dalle opzioni realmente fornite dalla fonte." },
  pt: { guide: "Guia prático do X", quick: "Resposta rápida", steps: "Três passos com o Downloader-X", focus: "O que esta pesquisa significa", checks: "Verificações para evitar resultados errados", faq: "Perguntas frequentes", related: "Guias relacionados do X", cta: "Abrir o Downloader-X", final: "Use o link exato da publicação pública", note: "Somente publicações públicas. Formato e qualidade dependem das opções reais fornecidas pela fonte." },
  ru: { guide: "Практическое руководство по X", quick: "Краткий ответ", steps: "Три шага с Downloader-X", focus: "Что означает этот запрос", checks: "Проверки, предотвращающие неверный результат", faq: "Частые вопросы", related: "Связанные руководства по X", cta: "Открыть Downloader-X", final: "Используйте точную ссылку на публичный пост", note: "Только публичные публикации. Формат и качество зависят от реальных вариантов, доступных в источнике." },
  tr: { guide: "Pratik X rehberi", quick: "Kısa cevap", steps: "Downloader-X ile üç adım", focus: "Bu aramanın gerçek anlamı", checks: "Yanlış sonucu önleyen kontroller", faq: "Sık sorulan sorular", related: "İlgili X rehberleri", cta: "Downloader-X'i aç", final: "Doğru herkese açık gönderi bağlantısını kullanın", note: "Yalnızca herkese açık gönderiler. Biçim ve kalite, kaynağın gerçekten sunduğu seçeneklere bağlıdır." },
  ms: { guide: "Panduan praktikal X", quick: "Jawapan ringkas", steps: "Tiga langkah dengan Downloader-X", focus: "Maksud sebenar carian ini", checks: "Semakan untuk mengelakkan hasil yang salah", faq: "Soalan lazim", related: "Panduan X berkaitan", cta: "Buka Downloader-X", final: "Gunakan pautan tepat siaran awam", note: "Siaran awam sahaja. Format dan kualiti bergantung pada pilihan sebenar daripada sumber." },
  nl: { guide: "Praktische X-handleiding", quick: "Kort antwoord", steps: "Drie stappen met Downloader-X", focus: "Wat deze zoekopdracht betekent", checks: "Controles die een verkeerd resultaat voorkomen", faq: "Veelgestelde vragen", related: "Gerelateerde X-handleidingen", cta: "Downloader-X openen", final: "Gebruik de exacte link van het openbare bericht", note: "Alleen openbare berichten. Formaat en kwaliteit hangen af van de opties die de bron werkelijk aanbiedt." },
};

const restrictedIntentNotes = {
  en: { private: "Downloader-X cannot access private or protected X posts. Use only public posts you own or have permission to save; never try to bypass account privacy.", spaces: "Downloader-X does not extract or download X Spaces audio. Use X's official options and keep only recordings you are authorized to use.", mp3: "Downloader-X does not convert X posts or Spaces into MP3. This guide explains that limitation and points to safer official options.", watermark: "Downloader-X does not remove embedded watermarks or ownership marks. Save only available public media and preserve creator attribution." },
  th: { private: "Downloader-X ไม่สามารถเข้าถึงโพสต์ X ที่เป็นส่วนตัวหรือถูกป้องกันได้ ใช้เฉพาะโพสต์สาธารณะที่คุณเป็นเจ้าของหรือได้รับอนุญาต และห้ามพยายามข้ามการตั้งค่าความเป็นส่วนตัว", spaces: "Downloader-X ไม่รองรับการแยกหรือดาวน์โหลดเสียงจาก X Spaces โปรดใช้ตัวเลือกอย่างเป็นทางการของ X และเก็บเฉพาะเสียงที่คุณได้รับอนุญาตให้ใช้", mp3: "Downloader-X ไม่รองรับการแปลงโพสต์ X หรือ Spaces เป็น MP3 คู่มือนี้อธิบายข้อจำกัดและชี้ไปยังตัวเลือกอย่างเป็นทางการที่ปลอดภัยกว่า", watermark: "Downloader-X ไม่ลบลายน้ำหรือเครื่องหมายเจ้าของที่ฝังอยู่ในสื่อ ให้บันทึกเฉพาะสื่อสาธารณะที่มีให้และคงเครดิตของผู้สร้างไว้" },
  es: { private: "Downloader-X no puede acceder a publicaciones privadas o protegidas de X. Usa solo publicaciones públicas propias o autorizadas y nunca intentes eludir la privacidad de una cuenta.", spaces: "Downloader-X no extrae ni descarga audio de X Spaces. Usa las opciones oficiales de X y conserva únicamente grabaciones para las que tengas autorización.", mp3: "Downloader-X no convierte publicaciones ni Spaces de X a MP3. Esta guía explica el límite y orienta hacia opciones oficiales más seguras.", watermark: "Downloader-X no elimina marcas de agua ni señales de autoría incrustadas. Guarda solo medios públicos disponibles y conserva la atribución del creador." },
  ja: { private: "Downloader-X は非公開または保護された X 投稿にはアクセスできません。自分が所有する、または保存許可を得た公開投稿だけを使用し、非公開設定を回避しないでください。", spaces: "Downloader-X は X Spaces の音声抽出やダウンロードには対応していません。X の公式機能を使い、権利のある録音だけを保存してください。", mp3: "Downloader-X は X 投稿や Spaces を MP3 に変換しません。このガイドでは制限と、より安全な公式手段を説明します。", watermark: "Downloader-X は埋め込まれた透かしや所有者表示を削除しません。利用できる公開メディアだけを保存し、作成者の表示を維持してください。" },
  id: { private: "Downloader-X tidak dapat mengakses postingan X yang privat atau dilindungi. Gunakan hanya postingan publik milik Anda atau yang diizinkan, dan jangan mencoba melewati privasi akun.", spaces: "Downloader-X tidak mengekstrak atau mengunduh audio X Spaces. Gunakan opsi resmi X dan simpan hanya rekaman yang boleh Anda gunakan.", mp3: "Downloader-X tidak mengubah postingan X atau Spaces menjadi MP3. Panduan ini menjelaskan batasan tersebut dan pilihan resmi yang lebih aman.", watermark: "Downloader-X tidak menghapus watermark atau tanda kepemilikan yang tertanam. Simpan hanya media publik yang tersedia dan pertahankan atribusi kreator." },
  zh: { private: "Downloader-X 无法访问私密或受保护的 X 帖子。请只使用自己拥有或已获授权的公开帖子，不要尝试绕过账户隐私设置。", spaces: "Downloader-X 不提取或下载 X Spaces 音频。请使用 X 的官方选项，并且只保留你有权使用的录音。", mp3: "Downloader-X 不会把 X 帖子或 Spaces 转换成 MP3。本指南说明这一限制，并介绍更安全的官方选项。", watermark: "Downloader-X 不会移除媒体中已有的水印或所有权标记。请只保存可用的公开媒体，并保留创作者署名。" },
  ko: { private: "Downloader-X는 비공개 또는 보호된 X 게시물에 접근할 수 없습니다. 본인 소유이거나 저장 허가를 받은 공개 게시물만 사용하고 계정 공개 범위를 우회하지 마세요.", spaces: "Downloader-X는 X Spaces 오디오를 추출하거나 다운로드하지 않습니다. X의 공식 기능을 사용하고 권한이 있는 녹음만 보관하세요.", mp3: "Downloader-X는 X 게시물이나 Spaces를 MP3로 변환하지 않습니다. 이 가이드는 해당 제한과 더 안전한 공식 방법을 설명합니다.", watermark: "Downloader-X는 미디어에 포함된 워터마크나 소유권 표시를 제거하지 않습니다. 제공되는 공개 미디어만 저장하고 제작자 표시를 유지하세요." },
  vi: { private: "Downloader-X không thể truy cập bài đăng X riêng tư hoặc được bảo vệ. Chỉ dùng bài đăng công khai do bạn sở hữu hoặc được phép lưu, và không tìm cách vượt cài đặt quyền riêng tư.", spaces: "Downloader-X không trích xuất hay tải âm thanh X Spaces. Hãy dùng tùy chọn chính thức của X và chỉ lưu bản ghi mà bạn được phép sử dụng.", mp3: "Downloader-X không chuyển bài đăng X hoặc Spaces sang MP3. Hướng dẫn này giải thích giới hạn đó và các lựa chọn chính thức an toàn hơn.", watermark: "Downloader-X không xóa watermark hoặc dấu sở hữu đã được nhúng. Chỉ lưu nội dung công khai có sẵn và giữ nguyên ghi nhận tác giả." },
  fil: { private: "Hindi naa-access ng Downloader-X ang pribado o protektadong X post. Gumamit lamang ng pampublikong post na pag-aari mo o may pahintulot kang i-save, at huwag lampasan ang privacy ng account.", spaces: "Hindi kumukuha o nagda-download ang Downloader-X ng audio mula sa X Spaces. Gamitin ang opisyal na opsyon ng X at itago lamang ang recording na awtorisado mong gamitin.", mp3: "Hindi kino-convert ng Downloader-X sa MP3 ang X post o Spaces. Ipinapaliwanag ng gabay na ito ang limitasyon at mas ligtas na opisyal na opsyon.", watermark: "Hindi inaalis ng Downloader-X ang naka-embed na watermark o marka ng pagmamay-ari. Mag-save lamang ng available na pampublikong media at panatilihin ang attribution." },
  hi: { private: "Downloader-X निजी या सुरक्षित X पोस्ट तक पहुँच नहीं सकता। केवल अपनी या अनुमति वाली सार्वजनिक पोस्ट इस्तेमाल करें और अकाउंट की गोपनीयता को बायपास न करें।", spaces: "Downloader-X X Spaces का ऑडियो निकालता या डाउनलोड नहीं करता। X के आधिकारिक विकल्प इस्तेमाल करें और केवल अधिकृत रिकॉर्डिंग ही रखें।", mp3: "Downloader-X X पोस्ट या Spaces को MP3 में नहीं बदलता। यह गाइड इस सीमा और अधिक सुरक्षित आधिकारिक विकल्पों को समझाती है।", watermark: "Downloader-X मीडिया में मौजूद वॉटरमार्क या स्वामित्व चिह्न नहीं हटाता। केवल उपलब्ध सार्वजनिक मीडिया सेव करें और निर्माता का श्रेय बनाए रखें।" },
  ar: { private: "لا يستطيع Downloader-X الوصول إلى منشورات X الخاصة أو المحمية. استخدم فقط المنشورات العامة التي تملكها أو لديك إذن بحفظها، ولا تحاول تجاوز خصوصية الحساب.", spaces: "لا يستخرج Downloader-X صوت X Spaces ولا ينزله. استخدم خيارات X الرسمية واحتفظ فقط بالتسجيلات المصرح لك باستخدامها.", mp3: "لا يحول Downloader-X منشورات X أو Spaces إلى MP3. يوضح هذا الدليل هذا القيد والخيارات الرسمية الأكثر أمانًا.", watermark: "لا يزيل Downloader-X العلامات المائية أو علامات الملكية المضمنة. احفظ الوسائط العامة المتاحة فقط وحافظ على نسبة العمل إلى صاحبه." },
  fa: { private: "Downloader-X نمی‌تواند به پست‌های خصوصی یا محافظت‌شده X دسترسی پیدا کند. فقط از پست عمومی متعلق به خودتان یا دارای اجازه استفاده کنید و حریم خصوصی حساب را دور نزنید.", spaces: "Downloader-X صدای X Spaces را استخراج یا دانلود نمی‌کند. از گزینه‌های رسمی X استفاده کنید و فقط ضبط‌هایی را نگه دارید که اجازه استفاده از آن‌ها را دارید.", mp3: "Downloader-X پست‌های X یا Spaces را به MP3 تبدیل نمی‌کند. این راهنما محدودیت و گزینه‌های رسمی امن‌تر را توضیح می‌دهد.", watermark: "Downloader-X واترمارک یا نشانه مالکیت تعبیه‌شده را حذف نمی‌کند. فقط رسانه عمومی موجود را ذخیره و نام سازنده را حفظ کنید." },
  fr: { private: "Downloader-X ne peut pas accéder aux publications X privées ou protégées. Utilisez uniquement une publication publique qui vous appartient ou que vous êtes autorisé à enregistrer, sans contourner la confidentialité du compte.", spaces: "Downloader-X n'extrait ni ne télécharge l'audio de X Spaces. Utilisez les options officielles de X et conservez seulement les enregistrements que vous êtes autorisé à utiliser.", mp3: "Downloader-X ne convertit pas les publications X ni les Spaces en MP3. Ce guide explique cette limite et présente des options officielles plus sûres.", watermark: "Downloader-X ne supprime pas les filigranes ni les marques de propriété intégrées. Enregistrez uniquement les médias publics disponibles et conservez l'attribution du créateur." },
  de: { private: "Downloader-X kann nicht auf private oder geschützte X-Beiträge zugreifen. Verwende nur öffentliche Beiträge, die dir gehören oder für die du eine Erlaubnis hast, und umgehe niemals den Kontoschutz.", spaces: "Downloader-X extrahiert oder lädt kein Audio aus X Spaces herunter. Nutze die offiziellen X-Optionen und bewahre nur autorisierte Aufnahmen auf.", mp3: "Downloader-X wandelt X-Beiträge oder Spaces nicht in MP3 um. Dieser Leitfaden erklärt die Einschränkung und sicherere offizielle Möglichkeiten.", watermark: "Downloader-X entfernt keine eingebetteten Wasserzeichen oder Eigentumskennzeichen. Speichere nur verfügbare öffentliche Medien und erhalte die Urheberangabe." },
  it: { private: "Downloader-X non può accedere ai post X privati o protetti. Usa solo post pubblici di tua proprietà o che hai il permesso di salvare e non aggirare la privacy dell'account.", spaces: "Downloader-X non estrae né scarica l'audio di X Spaces. Usa le opzioni ufficiali di X e conserva solo registrazioni che sei autorizzato a utilizzare.", mp3: "Downloader-X non converte i post X o gli Spaces in MP3. Questa guida spiega il limite e indica opzioni ufficiali più sicure.", watermark: "Downloader-X non rimuove filigrane o segni di proprietà incorporati. Salva solo i contenuti pubblici disponibili e conserva l'attribuzione al creatore." },
  pt: { private: "O Downloader-X não acessa publicações privadas ou protegidas do X. Use apenas publicações públicas próprias ou autorizadas e nunca tente contornar a privacidade da conta.", spaces: "O Downloader-X não extrai nem baixa áudio do X Spaces. Use as opções oficiais do X e mantenha somente gravações que você tem autorização para usar.", mp3: "O Downloader-X não converte publicações do X ou Spaces para MP3. Este guia explica essa limitação e opções oficiais mais seguras.", watermark: "O Downloader-X não remove marcas-d'água nem sinais de propriedade incorporados. Salve apenas mídias públicas disponíveis e preserve a atribuição do criador." },
  ru: { private: "Downloader-X не получает доступ к приватным или защищённым публикациям X. Используйте только собственные или разрешённые публичные посты и не пытайтесь обходить настройки конфиденциальности.", spaces: "Downloader-X не извлекает и не скачивает аудио X Spaces. Используйте официальные функции X и сохраняйте только те записи, на которые у вас есть разрешение.", mp3: "Downloader-X не преобразует публикации X или Spaces в MP3. В руководстве объясняется это ограничение и более безопасные официальные варианты.", watermark: "Downloader-X не удаляет встроенные водяные знаки или отметки владельца. Сохраняйте только доступные публичные материалы и указывайте автора." },
  tr: { private: "Downloader-X özel veya korumalı X gönderilerine erişemez. Yalnızca size ait ya da kaydetme izniniz olan herkese açık gönderileri kullanın; hesap gizliliğini aşmaya çalışmayın.", spaces: "Downloader-X, X Spaces sesini çıkarmaz veya indirmez. X'in resmî seçeneklerini kullanın ve yalnızca kullanma yetkiniz olan kayıtları saklayın.", mp3: "Downloader-X, X gönderilerini veya Spaces içeriklerini MP3'e dönüştürmez. Bu rehber sınırlamayı ve daha güvenli resmî seçenekleri açıklar.", watermark: "Downloader-X gömülü filigranları veya sahiplik işaretlerini kaldırmaz. Yalnızca sunulan herkese açık medyayı kaydedin ve üretici atfını koruyun." },
  ms: { private: "Downloader-X tidak boleh mengakses siaran X yang peribadi atau dilindungi. Gunakan hanya siaran awam milik anda atau yang dibenarkan untuk disimpan, dan jangan cuba memintas privasi akaun.", spaces: "Downloader-X tidak mengekstrak atau memuat turun audio X Spaces. Gunakan pilihan rasmi X dan simpan hanya rakaman yang anda dibenarkan untuk gunakan.", mp3: "Downloader-X tidak menukar siaran X atau Spaces kepada MP3. Panduan ini menerangkan had tersebut dan pilihan rasmi yang lebih selamat.", watermark: "Downloader-X tidak membuang tera air atau tanda pemilikan terbenam. Simpan hanya media awam yang tersedia dan kekalkan atribusi pencipta." },
  nl: { private: "Downloader-X heeft geen toegang tot privé- of afgeschermde X-berichten. Gebruik alleen openbare berichten die van jou zijn of die je mag opslaan en omzeil nooit accountprivacy.", spaces: "Downloader-X extraheert of downloadt geen audio van X Spaces. Gebruik de officiële opties van X en bewaar alleen opnamen waarvoor je toestemming hebt.", mp3: "Downloader-X zet X-berichten of Spaces niet om naar MP3. Deze handleiding legt die beperking uit en wijst op veiligere officiële opties.", watermark: "Downloader-X verwijdert geen ingebouwde watermerken of eigendomsmarkeringen. Sla alleen beschikbare openbare media op en behoud de naamsvermelding van de maker." },
};

function noticeFor(locale, profile) {
  return restrictedIntentNotes[locale]?.[profile.reason] || interfaceCopy[locale].note;
}

const profileOrders = {
  core: ["public", "copy", "process", "quality", "devices", "verify", "audit", "trouble", "security", "organization", "checklist"],
  browser: ["copy", "process", "devices", "security", "trouble", "verify", "organization", "public", "audit", "quality", "checklist"],
  howto: ["public", "copy", "process", "quality", "devices", "verify", "trouble", "security", "audit", "organization", "checklist"],
  gif: ["public", "copy", "process", "verify", "quality", "trouble", "audit", "security", "devices", "organization", "checklist"],
  image: ["public", "copy", "audit", "quality", "verify", "security", "devices", "trouble", "organization", "process", "checklist"],
  mp4: ["copy", "process", "quality", "verify", "devices", "trouble", "security", "public", "audit", "organization", "checklist"],
  device: ["public", "copy", "devices", "process", "verify", "organization", "trouble", "security", "quality", "audit", "checklist"],
  private: ["public", "security", "audit", "verify", "trouble", "copy", "process", "quality", "devices", "organization", "checklist"],
  audio: ["public", "security", "audit", "verify", "trouble", "copy", "process", "quality", "devices", "organization", "checklist"],
  quality: ["quality", "verify", "devices", "audit", "trouble", "security", "public", "copy", "process", "organization", "checklist"],
  safety: ["security", "public", "audit", "verify", "trouble", "copy", "process", "quality", "devices", "organization", "checklist"],
};

const groupAliases = {
  public: ["public", "public-link"],
  copy: ["copy", "copy-link"],
  process: ["process", "use-tool"],
  quality: ["quality", "quality-audit"],
  devices: ["devices"],
  verify: ["verify"],
  audit: ["audit", "source-audit", "rights"],
  trouble: ["trouble", "troubleshooting"],
  security: ["security"],
  organization: ["organization", "repeatable-workflow", "comparison"],
  checklist: ["checklist"],
};

function resolveGroupEntries(source, semanticId) {
  return (groupAliases[semanticId] || [semanticId])
    .map((id) => [id, source.groups[id]])
    .filter(([, group]) => group?.blocks.length);
}

function parseKeywordFile() {
  const source = fs.readFileSync(keywordSource, "utf8");
  const result = {};
  let locale = null;
  for (const line of source.split(/\r?\n/u)) {
    const heading = line.match(/^\*\*[^\n]*\(([a-z-]+)\)\*\*$/iu);
    if (heading) {
      locale = heading[1].toLowerCase();
      result[locale] = [];
      continue;
    }
    const keyword = line.match(/^- `([^`]+)`/u);
    if (locale && keyword) result[locale].push(keyword[1].trim());
  }
  result.fil = result.tl.map((value) => value.replace("convert twitter link kwento sa mp4", "i-convert ang twitter link sa mp4"));
  result.zh = result["zh-cn"];
  result.ko = result.ko.map((value) => value.replace(/트위터 스[^\s]* 오디오 다운로드/u, "트위터 스페이스 오디오 다운로드"));
  result.fa = addedKeywords.fa;
  result.nl = addedKeywords.nl;
  return Object.fromEntries(supportedLocales.map((code) => [code, result[code]]));
}

function classify(keyword) {
  const value = keyword.toLocaleLowerCase();
  const has = (pattern) => pattern.test(value);
  if (has(/private|privad|privat|gizli|鍵垢|비공개|riêng tư|خاص|privé|приват|ส่วนตัว|خصوصی|pribadi|proteg|twitterdm/i)) return { id: "private", reason: "private", support: "unsupported", icon: "lock" };
  if (has(/mp3/i)) return { id: "audio", reason: "mp3", support: "unsupported", icon: "audio" };
  if (has(/spaces|space audio|スペース|مساحات|오디오|स्पेस|เสียง twitter|صوت|ses indir|音訊|音频|audio twitter|âm thanh|spasi/i)) return { id: "audio", reason: "spaces", support: "unsupported", icon: "audio" };
  if (has(/watermark|ลายน้ำ|ウォーターマーク|워터마크|水印|علامة مائية|نشان|водян|filigrane|marca d.?água|marca de agua/i)) return { id: "safety", reason: "watermark", support: "conditional", icon: "shield" };
  if (has(/gif|гиф|動圖|动图|ジフ|гифку/i)) return { id: "gif", support: "conditional", icon: "gif" };
  if (has(/photo|foto|gambar|image|รูปภาพ|ภาพทวิต|画像|写真|صور|صورة|фото|ảnh twitter|고화질 미디어/i)) return { id: "image", support: "conditional", icon: "image" };
  if (has(/mp4|convert|converter|konverter|convertir|convertitore|conversor|dönüştürücü|変換|转换|轉換|แปลง|chuyển đổi|tukar|конвертер|कनवर्टर/i)) return { id: "mp4", reason: "format", support: "conditional", icon: "file" };
  if (has(/1080|\bhd\b|high quality|alta calidad|haute qualité|hochwert|高画質|高清|고화질|คุณภาพ|kualitas|chất lượng|alta risoluzione|высоком качестве|kaliteli/i)) return { id: "quality", reason: "quality", support: "conditional", icon: "quality" };
  if (has(/iphone|camera roll|gallery|galeria|galerie|galeri|galleria|галере|ไอโฟน|苹果|蘋果|아이폰|फोन|هاتف|الجوال|telefon|celular|ponsel|thư viện/i)) return { id: "device", support: "supported", icon: "phone" };
  if (has(/android|แอนดรอยด์|アンドロイド|안드로이드|андроид/i)) return { id: "device", support: "supported", icon: "android" };
  if (has(/chrome|extension|extensi|erweiterung|extensão|extensión|ส่วนขยาย/i)) return { id: "browser", support: "supported", icon: "browser" };
  if (has(/safe|sicher|segur|sécur|ปลอดภัย|aman|selamat|безопас|安全|안전|آمن|امن|सुरक्षित/i)) return { id: "safety", support: "supported", icon: "shield" };
  if (has(/how to|como |cómo |come |wie |cara |paano |cách |kaise|方法|方法|วิธี|كيفية|چگونه|как /i)) return { id: "howto", support: "supported", icon: "steps" };
  if (has(/no app|without app|sin app|sans app|ohne app|tanpa aplikasi|ไม่มีแอ|アプリなし|별도 앱 없이|sem aplicativo|без прилож|uygulama|zonder app|بدون تطبيق|بدون برنامه/i)) return { id: "browser", support: "supported", icon: "browser" };
  return { id: "core", support: "supported", icon: "download" };
}

function stripTags(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;/gu, " ")
    .replace(/&amp;/gu, "&")
    .replace(/&lt;/gu, "<")
    .replace(/&gt;/gu, ">")
    .replace(/&#39;/gu, "'")
    .replace(/&quot;/gu, '"')
    .replace(/\s+/gu, " ")
    .trim();
}

function completeSentences(value) {
  const text = stripTags(value);
  const matches = text.match(/[^.!?。！？؟।]+[.!?。！？؟।]+/gu) || [];
  return matches.map((sentence) => sentence.trim()).filter(Boolean);
}

function asSentence(value) {
  const text = stripTags(value);
  if (!text) return "";
  return /\p{Sentence_Terminal}$/u.test(text) ? text : `${text}.`;
}

function makeMetaDescription({ keyword, guide, intentNotice, fallbacks }, maxLength = 160) {
  const lead = asSentence(`${keyword} — ${guide}`);
  if ([...lead].length > maxLength) return asSentence(keyword);

  const sentenceSources = [intentNotice, ...fallbacks];
  const sentences = [...new Set(sentenceSources.flatMap((source) => {
    const complete = completeSentences(source);
    return complete.length ? complete : [asSentence(source)].filter(Boolean);
  }))];
  let description = lead;
  for (const sentence of sentences) {
    const candidate = `${description} ${sentence}`;
    if ([...candidate].length <= maxLength) description = candidate;
    if ([...description].length >= 90) break;
  }
  return description;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/gu, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function escapeXml(value) {
  return escapeHtml(value);
}

function countWords(value, locale) {
  const text = stripTags(value);
  try {
    const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
    let count = 0;
    for (const segment of segmenter.segment(text)) if (segment.isWordLike) count += 1;
    return count;
  } catch {
    return text.split(/\s+/u).filter(Boolean).length;
  }
}

function hashInt(value) {
  return Number.parseInt(crypto.createHash("sha256").update(value).digest("hex").slice(0, 8), 16);
}

function shuffled(values, seed) {
  return values
    .map((value, index) => {
      const fingerprint = typeof value === "string" ? stripTags(value) : JSON.stringify(value);
      return { value, key: hashInt(`${seed}:${index}:${fingerprint.slice(0, 80)}`) };
    })
    .sort((a, b) => a.key - b.key)
    .map(({ value }) => value);
}

function extractSource(slug) {
  const html = fs.readFileSync(path.join(articleDir, `${slug}.html`), "utf8");
  const articleMatch = html.match(/<article[^>]*class="[^"]*dx-article[^"]*"[^>]*>([\s\S]*?)<\/article>/iu);
  if (!articleMatch) throw new Error(`Article body not found for ${slug}`);
  const body = articleMatch[1]
    .replace(/<figure[\s\S]*?<\/figure>/giu, "")
    .replace(/<div class="video-card"[\s\S]*?<\/div>/giu, "")
    .replace(/<section class="final"[\s\S]*?<\/section>/giu, "")
    .replace(/<div class="related"[\s\S]*?<\/div>/giu, "");
  const groups = {};
  const headingPattern = /<h2 id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/giu;
  const headings = [...body.matchAll(headingPattern)];
  for (let index = 0; index < headings.length; index += 1) {
    const match = headings[index];
    const start = match.index + match[0].length;
    const end = headings[index + 1]?.index ?? body.length;
    const raw = body.slice(start, end);
    let blocks = [...raw.matchAll(/<(p|li)[^>]*>([\s\S]*?)<\/\1>/giu)]
      .map((item) => stripTags(item[2]))
      .filter((item) => countWords(item, "en") >= 7);
    // The legacy source page included one paragraph describing its old video
    // asset. Campaign pages use their own SVG, so keep only the real processing
    // instruction and never carry that asset-specific claim into a new article.
    if (match[1] === "process" || match[1] === "use-tool") blocks = blocks.slice(0, 1);
    groups[match[1]] = { heading: stripTags(match[2]), blocks };
  }
  const quickMatch = body.match(/<section[^>]*class="[^"]*answer[^"]*"[^>]*>[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/iu);
  const faqMatch = body.match(/<h2 id="faq"[^>]*>[\s\S]*?<\/h2>([\s\S]*?)(?:<h2 id="related"|$)/iu);
  const faqs = faqMatch
    ? [...faqMatch[1].matchAll(/<details[^>]*>[\s\S]*?<summary[^>]*>([\s\S]*?)<\/summary>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<\/details>/giu)]
      .map((item) => ({ question: stripTags(item[1]), answer: stripTags(item[2]) }))
    : [];
  const paragraphs = Object.values(groups).flatMap((group) => group.blocks);
  return {
    quickHeading: stripTags(quickMatch?.[1] || ""),
    quickText: stripTags(quickMatch?.[2] || paragraphs[0] || ""),
    groups,
    faqs,
    paragraphs,
  };
}

function fitBlocks(source, locale, profile, seed) {
  const order = profileOrders[profile.id] || profileOrders.core;
  const sections = [];
  // The quick answer, visual, three short steps, FAQ, related links, and final CTA
  // add about 350-550 locale-aware words. A deterministic per-page budget keeps
  // the complete article inside 1,500-2,000 words without foreign-language filler.
  const localeAdjustment = { vi: -80, ko: 35, tr: 35 }[locale] || 0;
  const target = 1190 + (seed % 71) + localeAdjustment;
  let total = 0;
  const usedGroups = new Set();

  for (const semanticId of order) {
    if (total >= target) break;
    for (const [id, group] of resolveGroupEntries(source, semanticId)) {
      if (usedGroups.has(id) || total >= target) continue;
      usedGroups.add(id);
      const blocks = [];
      for (const block of group.blocks) {
        if (total >= target) break;
        const blockWords = countWords(block, locale);
        if (total > target - 100 && total + blockWords > target + 80) continue;
        blocks.push(block);
        total += blockWords;
      }
      const html = blocks.map((block) => `<p>${escapeHtml(block)}</p>`).join("");
      if (blocks.length) sections.push({ id, heading: group.heading, html });
    }
  }
  return sections;
}

function createReviewRecap(source, locale, seed, neededWords) {
  if (neededWords <= 0) return "";
  const copy = interfaceCopy[locale];
  const candidates = shuffled(source.paragraphs, `${seed}:review-recap`);
  const blocks = [];
  let total = 0;
  for (const block of candidates) {
    if (total >= neededWords) break;
    blocks.push(block);
    total += countWords(block, locale);
  }
  if (!blocks.length) return "";
  const groups = [];
  const groupSize = Math.max(2, Math.ceil(blocks.length / 3));
  for (let index = 0; index < blocks.length; index += groupSize) groups.push(blocks.slice(index, index + groupSize));
  return `<section class="review-recap"><h2>${escapeHtml(copy.checks)}</h2>${groups.map((group, index) => `<h3>${escapeHtml(copy.guide)} · ${index + 1}</h3>${group.map((block) => `<p>${escapeHtml(block)}</p>`).join("")}`).join("")}</section>`;
}

function selectFaqs(source, seed, keyword, intentNotice) {
  const values = source.faqs.length ? source.faqs : [
    { question: "Can every X post be processed?", answer: "No. The post must be public and the requested media must be available from the source." },
    { question: "Is every result 1080p?", answer: "No. Quality depends on the variants actually offered by the source." },
    { question: "Does public visibility grant reuse rights?", answer: "No. Keep the source and use only media you own or are authorized to save." },
  ];
  const ordered = [{ question: `${keyword}?`, answer: intentNotice }, ...shuffled(values, `${seed}:faq`)];
  while (ordered.length < 3) ordered.push(...values);
  return ordered.slice(0, Math.min(5, Math.max(3, ordered.length)));
}

function wrapSvgText(value, maxChars = 38, maxLines = 3) {
  const text = String(value).trim();
  const chars = [...text];
  if (!/\s/u.test(text)) {
    const lines = [];
    for (let index = 0; index < chars.length && lines.length < maxLines; index += maxChars) lines.push(chars.slice(index, index + maxChars).join(""));
    return lines;
  }
  const words = text.split(/\s+/u);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if ([...next].length > maxChars && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else line = next;
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

function iconSvg(icon) {
  const common = 'fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"';
  const icons = {
    lock: `<rect x="30" y="70" width="120" height="92" rx="18" ${common}/><path d="M55 70V48a35 35 0 0 1 70 0v22" ${common}/><circle cx="90" cy="113" r="8" fill="#fff"/>`,
    audio: `<path d="M20 105h18l13-48 20 96 20-126 18 108 15-58 13 28h23" ${common}/>`,
    gif: `<rect x="18" y="35" width="144" height="120" rx="22" ${common}/><text x="90" y="112" text-anchor="middle" fill="#fff" font-size="44" font-family="system-ui" font-weight="800">GIF</text>`,
    image: `<rect x="18" y="32" width="144" height="126" rx="20" ${common}/><circle cx="60" cy="72" r="14" ${common}/><path d="M32 140l38-40 28 27 19-18 31 31" ${common}/>`,
    file: `<path d="M45 20h65l32 32v108H45z" ${common}/><path d="M110 20v34h32" ${common}/><text x="94" y="120" text-anchor="middle" fill="#fff" font-size="30" font-family="system-ui" font-weight="800">MP4</text>`,
    quality: `<rect x="15" y="38" width="150" height="105" rx="18" ${common}/><text x="90" y="104" text-anchor="middle" fill="#fff" font-size="34" font-family="system-ui" font-weight="800">1080</text>`,
    phone: `<rect x="48" y="12" width="84" height="156" rx="22" ${common}/><path d="M80 145h20" ${common}/><path d="M72 91l18 18 33-43" ${common}/>`,
    android: `<rect x="42" y="52" width="96" height="92" rx="20" ${common}/><path d="M57 52l-13-24m79 24 13-24M64 82h1m49 0h1" ${common}/>`,
    browser: `<rect x="12" y="28" width="156" height="128" rx="18" ${common}/><path d="M12 62h156M40 45h1m22 0h1" ${common}/><path d="M60 108h60m-18-18 18 18-18 18" ${common}/>`,
    shield: `<path d="M90 15l60 24v44c0 40-24 67-60 87-36-20-60-47-60-87V39z" ${common}/><path d="M58 88l22 22 43-48" ${common}/>`,
    steps: `<circle cx="35" cy="48" r="20" ${common}/><circle cx="90" cy="90" r="20" ${common}/><circle cx="145" cy="132" r="20" ${common}/><path d="M53 59l19 15m36 28 19 15" ${common}/>`,
    download: `<path d="M90 18v96m-34-35 34 35 34-35M30 144h120" ${common}/>`,
  };
  return icons[icon] || icons.download;
}

function createSvg({ keyword, locale, index, profile }) {
  const hue = (hashInt(`${locale}:${index}:${keyword}`) % 270) + 20;
  const topicTitles = { lock: "X PRIVATE POST LIMIT", audio: "X SPACES AUDIO", gif: "X / TWITTER GIF", image: "X / TWITTER IMAGE", file: "X / TWITTER MP4", quality: "X / TWITTER HD", phone: "X / TWITTER MOBILE", android: "X / TWITTER ANDROID", browser: "X / TWITTER BROWSER", shield: "X SAFETY CHECKS", steps: "X DOWNLOAD HOW-TO", download: "X / TWITTER VIDEO" };
  const lines = wrapSvgText(topicTitles[profile.icon] || topicTitles.download, 24, 2);
  const titleLines = lines.map((line, lineIndex) => `<text x="72" y="${190 + lineIndex * 62}" fill="#fff" font-family="system-ui,sans-serif" font-size="${lineIndex ? 45 : 49}" font-weight="800">${escapeXml(line)}</text>`).join("");
  const visualLabels = { lock: "PUBLIC POSTS ONLY", audio: "NOT SUPPORTED", gif: "GIF IF AVAILABLE", image: "IMAGE IF AVAILABLE", file: "MP4 IF AVAILABLE", quality: "SOURCE QUALITY", phone: "DEVICE SAVE", android: "ANDROID SAVE", browser: "NO EXTENSION", shield: "SAFE CHECKS", steps: "3 STEPS", download: "PUBLIC LINK" };
  const visualLabel = visualLabels[profile.icon] || visualLabels.download;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" role="img" aria-labelledby="title desc" data-locale="${locale}" data-topic="${profile.id}" data-support="${profile.support}">
<title id="title">${escapeXml(keyword)}</title><desc id="desc">Original Downloader-X illustration for ${escapeXml(keyword)}.</desc>
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl(${hue} 76% 19%)"/><stop offset=".58" stop-color="hsl(${(hue + 37) % 360} 78% 38%)"/><stop offset="1" stop-color="hsl(${(hue + 76) % 360} 82% 54%)"/></linearGradient><filter id="shadow"><feDropShadow dx="0" dy="18" stdDeviation="20" flood-opacity=".25"/></filter></defs>
<rect width="1200" height="675" rx="42" fill="url(#bg)"/><circle cx="1080" cy="80" r="230" fill="#fff" opacity=".09"/><circle cx="105" cy="620" r="210" fill="#fff" opacity=".07"/>
<text x="72" y="92" fill="#dbeafe" font-family="system-ui,sans-serif" font-size="24" font-weight="750" letter-spacing="3">DOWNLOADER-X · ${locale.toUpperCase()} · ${String(index + 1).padStart(2, "0")}</text>${titleLines}
<g transform="translate(865 170)" filter="url(#shadow)"><rect width="250" height="250" rx="58" fill="#0b1220" opacity=".92"/><g transform="translate(35 34)">${iconSvg(profile.icon)}</g></g>
<g transform="translate(72 470)" font-family="system-ui,sans-serif"><rect width="740" height="110" rx="24" fill="#fff" opacity=".95"/><rect x="26" y="24" width="64" height="64" rx="18" fill="#101827"/><text x="58" y="68" text-anchor="middle" fill="#fff" font-size="35" font-weight="900">X</text><path d="M122 56h370" stroke="hsl(${(hue + 76) % 360} 82% 48%)" stroke-width="12" stroke-linecap="round"/><path d="M525 32v49m-18-18 18 18 18-18" fill="none" stroke="#111827" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><text x="575" y="68" fill="#111827" font-size="25" font-weight="800">${visualLabel}</text></g>
<text x="72" y="630" fill="#e0f2fe" font-family="system-ui,sans-serif" font-size="18">Original topic-specific illustration · X public-post workflow · Downloader-X Guides</text>
</svg>`;
}

const css = `:root{color-scheme:light;--ink:#13233c;--muted:#52627a;--line:#dce4ed;--blue:#155eef;--soft:#eef5ff}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#f4f7fb;color:var(--ink);font:17px/1.76 Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}.sitebar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px max(20px,calc((100vw - 1040px)/2));border-bottom:1px solid var(--line);background:#fff}.sitebar a{color:var(--blue);font-weight:800;text-decoration:none}.sitebar nav{display:flex;gap:18px;flex-wrap:wrap}.page{width:min(100% - 32px,1040px);margin:36px auto 70px}.hero{padding:clamp(28px,6vw,64px);border-radius:28px;color:#fff;background:linear-gradient(135deg,#07182f,#143e78 62%,#2563eb);box-shadow:0 24px 64px rgba(20,35,60,.16)}.eyebrow{font-size:.8rem;letter-spacing:.13em;text-transform:uppercase;font-weight:850;color:#bfdbfe}.hero h1{max-width:900px;margin:.7rem 0 1rem;color:#fff;font-size:clamp(2.25rem,6vw,4rem);line-height:1.08;letter-spacing:-.04em}.hero p{max-width:800px;margin:0;color:#e7f0ff;font-size:1.15rem}.cta{display:inline-block;margin-top:1.35rem;padding:.85rem 1.15rem;border-radius:12px;background:#fff;color:#154ec2!important;font-weight:850;text-decoration:none}.article{margin-top:28px;padding:clamp(24px,5vw,58px);border:1px solid var(--line);border-radius:24px;background:#fff;box-shadow:0 18px 55px rgba(20,35,60,.07)}h2{margin:2.6rem 0 .8rem;font-size:clamp(1.5rem,3vw,2rem);line-height:1.25}p,li{color:#334155}.lead{font-size:1.14rem}.notice{margin:1.4rem 0;padding:1.2rem 1.3rem;border-left:5px solid #2563eb;border-radius:15px;background:var(--soft)}figure{margin:2rem 0;border:1px solid var(--line);border-radius:20px;overflow:hidden;background:#fff}figure img{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover}figcaption{padding:.8rem 1rem;color:#64748b;text-align:center;font-size:.88rem}.steps{counter-reset:step;list-style:none;padding:0}.steps li{position:relative;margin:.8rem 0;padding:1rem 1rem 1rem 4rem;border:1px solid var(--line);border-radius:14px;background:#fbfdff}.steps li:before{counter-increment:step;content:counter(step);position:absolute;left:1rem;top:1rem;width:2rem;height:2rem;display:grid;place-items:center;border-radius:10px;background:var(--blue);color:#fff;font-weight:900}.faq details{margin:.75rem 0;padding:1rem 1.1rem;border:1px solid var(--line);border-radius:13px}.faq summary{cursor:pointer;font-weight:800}.related{display:grid;gap:.7rem}.related a{padding:1rem;border:1px solid var(--line);border-radius:12px;text-decoration:none;font-weight:750}.final{margin-top:2.5rem;padding:2rem;border-radius:18px;background:#13233c;color:#fff;text-align:center}.final h2,.final p{color:#fff}.footer{padding:28px 20px;text-align:center;color:#64748b}@media(max-width:640px){.sitebar{align-items:flex-start;flex-direction:column}.page{width:100%;margin:0}.hero,.article{border-radius:0}.article{margin-top:0;border-left:0;border-right:0;padding:22px}.hero h1{font-size:2.15rem}}`;

function makeArticle({ locale, keyword, index, profile, source, allPagesBySlot }) {
  const copy = interfaceCopy[locale];
  const seed = hashInt(`${locale}:${index}:${keyword}`);
  const slug = `x-${profile.id}-${String(index + 1).padStart(2, "0")}-${locale}`;
  const canonical = `${productBase}/${locale}/guides/${slug}/`;
  const sourceUrl = `${siteBase}/articles/${slug}.html`;
  const imageFile = `x-keyword-${profile.id}-${String(index + 1).padStart(2, "0")}-${locale}.svg`;
  const imageUrl = `${siteBase}/assets/${imageFile}`;
  const toolUrl = `${productBase}/${locale}/download`;
  const title = `${keyword} | Downloader-X`;
  const headline = `${keyword}: ${headlineSuffix[locale]}`;
  const quickText = source.quickText;
  const intentNotice = noticeFor(locale, profile);
  const description = makeMetaDescription({
    keyword,
    guide: copy.guide,
    intentNotice,
    fallbacks: [copy.note, quickText],
  });
  const sections = fitBlocks(source, locale, profile, seed);
  const faqs = selectFaqs(source, seed, keyword, intentNotice);
  const stepSemantics = profile.support === "unsupported" ? ["public", "security", "audit"] : ["copy", "process", "verify"];
  const stepBlocks = stepSemantics
    .map((semanticId) => resolveGroupEntries(source, semanticId)[0]?.[1])
    .map((group) => group?.blocks[0])
    .filter(Boolean);
  const relatedSlots = [(index + 1) % 15, (index + 4) % 15, (index + 9) % 15];
  const related = relatedSlots.map((slot) => allPagesBySlot[slot]?.pages?.[locale]).filter(Boolean);
  const faqHtml = faqs.map((faq) => `<details><summary>${escapeHtml(faq.question)}</summary><p>${escapeHtml(faq.answer)}</p></details>`).join("");
  const contentHtml = sections.map((section) => `<section><h2 id="${escapeHtml(section.id)}">${escapeHtml(section.heading)}</h2>${section.html}</section>`).join("");
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", headline, description, inLanguage: locale, mainEntityOfPage: canonical, image: [imageUrl], author: { "@type": "Organization", name: "Downloader-X" }, publisher: { "@type": "Organization", name: "Downloader-X" }, datePublished: date, dateModified: date },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Downloader-X", item: `${productBase}/${locale}` },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${productBase}/${locale}/guides/` },
        { "@type": "ListItem", position: 3, name: keyword, item: canonical },
      ] },
      { "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
    ],
  };
  const render = (reviewRecap = "") => `<!doctype html><html lang="${locale}" dir="${rtlLocales.has(locale) ? "rtl" : "ltr"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="author" content="Downloader-X Guides"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}"><meta property="og:type" content="article"><meta property="og:title" content="${escapeHtml(headline)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${imageUrl}"><meta name="twitter:card" content="summary_large_image"><script type="application/ld+json">${JSON.stringify(schema).replace(/</gu, "\\u003c")}</script><style>${css}</style></head><body><header class="sitebar"><a href="${productBase}/${locale}">Downloader-X</a><nav><a href="${productBase}/${locale}/guides/">Guides</a><a href="${toolUrl}">${escapeHtml(copy.cta)}</a></nav></header><main class="page"><section class="hero"><div class="eyebrow">${escapeHtml(copy.guide)} · ${date}</div><h1>${escapeHtml(headline)}</h1><p>${escapeHtml(description)}</p><a class="cta" href="${toolUrl}">${escapeHtml(copy.cta)}</a></section><article class="article"><section><h2>${escapeHtml(copy.quick)}</h2><p class="lead"><strong>${escapeHtml(keyword)}</strong> — ${escapeHtml(quickText)}</p><div class="notice" data-support="${profile.support}" data-reason="${profile.reason || "public"}">${escapeHtml(intentNotice)}</div></section><figure><img src="../assets/${imageFile}" alt="${escapeHtml(keyword)}" width="1200" height="675" loading="eager" decoding="async"><figcaption>${escapeHtml(keyword)} · Downloader-X Guides</figcaption></figure><section><h2>${escapeHtml(copy.steps)}</h2><ol class="steps">${stepBlocks.map((block) => `<li>${escapeHtml(block)}</li>`).join("")}</ol></section><section><h2>${escapeHtml(copy.focus)}</h2><p><strong>${escapeHtml(keyword)}</strong>. ${escapeHtml(intentNotice)}</p></section>${contentHtml}${reviewRecap}<section class="faq"><h2>${escapeHtml(copy.faq)}</h2>${faqHtml}</section><section><h2>${escapeHtml(copy.related)}</h2><div class="related">${related.map((item) => `<a href="${item.sourceUrl}">${escapeHtml(item.keyword)}</a>`).join("")}</div></section><section class="final"><h2>${escapeHtml(copy.final)}</h2><p>${escapeHtml(intentNotice)}</p><a class="cta" href="${toolUrl}">${escapeHtml(copy.cta)}</a></section></article></main><footer class="footer">Downloader-X Guides · Public or authorized media only</footer></body></html>`;
  const articleWords = (value) => countWords(value.match(/<article class="article">([\s\S]*?)<\/article>/u)?.[1] || value, locale);
  let html = render();
  let wordCount = articleWords(html);
  if (wordCount < 1500) {
    const desired = 1540 + (seed % 61);
    html = render(createReviewRecap(source, locale, seed, desired - wordCount));
    wordCount = articleWords(html);
  }
  return { locale, keyword, index, profile, slug, canonical, sourceUrl, imageFile, imageUrl, title, description, html, wordCount, faqs };
}

function makeHub(pages) {
  const cards = pages.map((page) => `<a class="card" data-locale="${page.locale}" href="articles/${page.slug}.html"><img src="assets/${page.imageFile}" alt="${escapeHtml(page.keyword)}" width="1200" height="675" loading="lazy"><span>${page.locale.toUpperCase()} · ${page.profile.id}</span><h2>${escapeHtml(page.keyword)}</h2><p>${escapeHtml(page.description)}</p></a>`).join("");
  const filters = supportedLocales.map((locale) => `<button type="button" data-filter="${locale}">${locale.toUpperCase()}</button>`).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>300 X Keyword Guides in 20 Languages | Downloader-X</title><meta name="description" content="Browse 300 original Downloader-X guides covering 15 X and Twitter search intents in 20 supported languages."><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${siteBase}/x-keywords-300.html"><style>${css}.filters{display:flex;gap:.55rem;flex-wrap:wrap;margin:1.5rem 0}.filters button{border:1px solid var(--line);border-radius:999px;background:#fff;padding:.55rem .8rem;font-weight:800;cursor:pointer}.filters button.active{background:var(--blue);color:#fff}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.card{display:block;border:1px solid var(--line);border-radius:18px;overflow:hidden;background:#fff;color:var(--ink);text-decoration:none}.card img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover}.card span,.card h2,.card p{display:block;margin-left:18px;margin-right:18px}.card span{margin-top:14px;color:var(--blue);font-size:.78rem;font-weight:850}.card h2{margin-top:.5rem;font-size:1.15rem}.card p{margin-bottom:20px;font-size:.92rem}@media(max-width:900px){.grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:620px){.grid{grid-template-columns:1fr}}</style></head><body><header class="sitebar"><a href="${productBase}/en">Downloader-X</a><nav><a href="index.html">All guides</a><a href="${productBase}/en/download">Open tool</a></nav></header><main class="page"><section class="hero"><div class="eyebrow">Downloader-X Global SEO</div><h1>300 X keyword guides in 20 languages</h1><p>Fifteen distinct public-post, device, format, quality, troubleshooting, and safety intents for every supported locale.</p></section><div class="filters"><button type="button" class="active" data-filter="all">ALL</button>${filters}</div><section class="grid" id="grid">${cards}</section></main><footer class="footer">Downloader-X Guides · ${pages.length} campaign articles</footer><script>document.querySelector('.filters').addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;document.querySelectorAll('.filters button').forEach(item=>item.classList.toggle('active',item===button));const filter=button.dataset.filter;document.querySelectorAll('.card').forEach(card=>{card.hidden=filter!=='all'&&card.dataset.locale!==filter;});});</script></body></html>`;
}

function insertHubLink(indexHtml) {
  const countedIndex = indexHtml.replace(/<span>\d+ บทความ<\/span>/u, "<span>449 บทความ</span>");
  if (countedIndex.includes("x-keywords-300.html")) return countedIndex;
  const marker = "</section><section style=\"margin-top:38px";
  const card = `<a class="card" href="x-keywords-300.html"><div class="icon">X</div><div><div class="tag">20 languages · 300 X guides</div><h3>300 X Keyword Guides</h3><p>Browse the complete multilingual X and Twitter keyword campaign with a topic-specific visual for every guide.</p></div></a>`;
  const position = countedIndex.lastIndexOf(marker);
  if (position < 0) throw new Error("Could not locate the guide-card section in index.html");
  return `${countedIndex.slice(0, position)}${card}${countedIndex.slice(position)}`;
}

function buildSourceSitemap(items) {
  const urls = [
    `<url><loc>${siteBase}/</loc></url>`,
    `<url><loc>${siteBase}/x-keywords-300.html</loc><lastmod>${date}</lastmod></url>`,
    ...items.map((item) => {
      const lastmod = /^\d{4}-\d{2}-\d{2}$/u.test(item.date || "") ? `<lastmod>${item.date}</lastmod>` : "";
      return `<url><loc>${item.sourceUrl}</loc>${lastmod}</url>`;
    }),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;
}

function buildPageSlots(keywordMap) {
  return Array.from({ length: 15 }, (_, index) => ({
    pages: Object.fromEntries(supportedLocales.map((locale) => {
      const keyword = keywordMap[locale][index];
      const profile = classify(keyword);
      const slug = `x-${profile.id}-${String(index + 1).padStart(2, "0")}-${locale}`;
      return [locale, { keyword, sourceUrl: `${siteBase}/articles/${slug}.html` }];
    })),
  }));
}

function articleMetadata(page) {
  return {
    canonical: page.canonical,
    category: "X",
    date,
    description: page.description,
    image: page.imageUrl,
    imageAlt: page.keyword,
    imageAspectRatio: "16:9",
    imageFit: "cover",
    imageHeight: 675,
    imageWidth: 1200,
    locale: page.locale,
    parentHub: `${productBase}/${page.locale}/guides/`,
    rawUrl: `https://raw.githubusercontent.com/rn473147-del/downloader-x-guides/main/articles/${page.slug}.html`,
    robots: "index,follow,max-image-preview:large",
    routeLocale: page.locale,
    schemaTypes: ["Article", "BreadcrumbList", "FAQPage"],
    size: Buffer.byteLength(page.html),
    slug: page.slug,
    sourcePath: `articles/${page.slug}.html`,
    sourceUrl: page.sourceUrl,
    standardVersion,
    title: page.keyword,
    wordCount: page.wordCount,
    primaryKeyword: page.keyword,
    intent: page.profile.id,
    toolSupport: page.profile.support,
  };
}

function main() {
  const keywordMap = parseKeywordFile();
  for (const locale of supportedLocales) {
    if (!Array.isArray(keywordMap[locale]) || keywordMap[locale].length !== 15) {
      throw new Error(`${locale} must contain exactly 15 keywords; received ${keywordMap[locale]?.length}`);
    }
  }

  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const sourceByLocale = Object.fromEntries(supportedLocales.map((locale) => [locale, extractSource(sourceSlugs[locale])]));
  const slots = buildPageSlots(keywordMap);
  const pages = [];

  for (const locale of supportedLocales) {
    for (let index = 0; index < 15; index += 1) {
      const keyword = keywordMap[locale][index];
      const profile = classify(keyword);
      const page = makeArticle({ locale, keyword, index, profile, source: sourceByLocale[locale], allPagesBySlot: slots });
      pages.push(page);
    }
  }

  for (const file of fs.readdirSync(articleDir).filter((name) => /^x-(?:core|browser|howto|gif|image|mp4|device|private|audio|quality|safety)-\d{2}-[a-z]+\.html$/u.test(name))) fs.unlinkSync(path.join(articleDir, file));
  for (const file of fs.readdirSync(assetDir).filter((name) => /^x-keyword-.*\.svg$/u.test(name))) fs.unlinkSync(path.join(assetDir, file));

  for (const page of pages) {
    fs.writeFileSync(path.join(articleDir, `${page.slug}.html`), page.html);
    fs.writeFileSync(path.join(assetDir, page.imageFile), createSvg(page));
  }

  const oldItems = registry.items.filter((item) => item.standardVersion !== standardVersion);
  const items = [...oldItems, ...pages.map(articleMetadata)].sort((a, b) => `${a.locale}:${a.slug}`.localeCompare(`${b.locale}:${b.slug}`));
  const localeCounts = Object.fromEntries(supportedLocales.map((locale) => [locale, items.filter((item) => item.locale === locale).length]));
  const updatedRegistry = { ...registry, generatedAt: new Date().toISOString(), sourceCommit: "content/x-keywords-300", standardVersion, count: items.length, localeCounts, items };
  fs.writeFileSync(registryPath, `${JSON.stringify(updatedRegistry, null, 2)}\n`);

  const campaign = {
    version: 1,
    standardVersion,
    generatedAt: new Date().toISOString(),
    count: pages.length,
    locales: supportedLocales,
    localeCounts: Object.fromEntries(supportedLocales.map((locale) => [locale, pages.filter((page) => page.locale === locale).length])),
    items: pages.map((page) => ({ locale: page.locale, keyword: page.keyword, intent: page.profile.id, toolSupport: page.profile.support, slug: page.slug, canonical: page.canonical, sourceUrl: page.sourceUrl, image: page.imageUrl, wordCount: page.wordCount })),
  };
  fs.writeFileSync(campaignPath, `${JSON.stringify(campaign, null, 2)}\n`);
  fs.writeFileSync(hubPath, makeHub(pages));
  fs.writeFileSync(path.join(root, "index.html"), insertHubLink(fs.readFileSync(path.join(root, "index.html"), "utf8")));
  fs.writeFileSync(path.join(root, "sitemap.xml"), buildSourceSitemap(items));

  process.stdout.write(`Generated ${pages.length} articles and ${pages.length} SVG images.\n`);
}

main();
