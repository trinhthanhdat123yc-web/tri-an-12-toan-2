import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini client with User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System Instruction for Chuyen Son La 20/11 AI Assistant
const ASSISTANT_SYSTEM_INSTRUCTION = `Bạn là "Hoa Ban Chuyên Sơn La" - Trợ lý số thông minh của "Trạm kết nối số: Tri ân người dẫn lối", sản phẩm số kỷ niệm Ngày Nhà giáo Việt Nam 20/11 của tập thể thầy trò Trường THPT Chuyên Sơn La.
Nhiệm vụ của bạn:
1. Tư vấn, gợi ý và tinh chỉnh các lời chúc 20/11 ý nghĩa, chân thành, sâu lắng gửi tới thầy cô chủ nhiệm, thầy cô các bộ môn (Toán, Lý, Hóa, Sinh, Tin, Ngữ Văn, Lịch Sử, Địa Lý, Tiếng Anh,...).
2. Sáng tác thơ, tản văn, lời tri ân mang đậm nét hoài niệm tuổi học trò và hơi thở núi rừng Tây Bắc Sơn La (hoa ban, dốc đèo, sương mù, mái trường Chuyên Sơn La thân yêu).
3. Hỗ trợ cựu học sinh các khóa (từ khóa K1 đến K28, K30...) tìm lại ký ức, gợi mở những kỷ niệm xưa về mái trường, các thầy cô lão thành và thầy cô trẻ nhiệt huyết.
4. Tra cứu thông tin cập nhật, lịch sử, các thế hệ giáo viên và thành tích học sinh giỏi quốc gia của trường THPT Chuyên Sơn La bằng công cụ Google Search khi được hỏi.

Phong cách: Lịch thiệp, ấm áp, truyền cảm hứng, tinh tế và giàu tình nghĩa thầy trò. Ngôn ngữ hoàn toàn bằng tiếng Việt chuẩn mực.`;

// 1. Multi-turn Chat endpoint with Google Search Grounding
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!ai) {
      res.status(500).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trên hệ thống.',
        reply: 'Hệ thống chưa tìm thấy khóa kết nối AI. Vui lòng kiểm tra cài đặt Secrets.',
      });
      return;
    }

    const { messages, enableSearch = true } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Dữ liệu tin nhắn không hợp lệ.' });
      return;
    }

    // Format messages for Gemini API
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const config: any = {
      systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION,
    };

    if (enableSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config,
    });

    const reply = response.text || 'Thầy cô luôn là ngọn hải đăng soi sáng từng bước đường chúng ta đi.';
    
    // Extract search grounding metadata if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources = groundingChunks
      .filter((chunk: any) => chunk.web && chunk.web.uri)
      .map((chunk: any) => ({
        title: chunk.web.title || 'Nguồn tham khảo',
        url: chunk.web.uri,
      }));

    res.json({
      reply,
      sources: webSources,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: error.message || 'Lỗi xử lý tin nhắn.',
      reply: 'Xin lỗi bạn, lúc này đường truyền đến trợ lý gặp trục trặc nhỏ. Bạn hãy thử gửi lại nhé!',
    });
  }
});

// 2. Fast Wish Generator endpoint (Gợi ý lời chúc thần tốc cho Hòm thư cựu học sinh)
app.post('/api/generate-wish', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!ai) {
      res.status(500).json({ error: 'Chưa cấu hình GEMINI_API_KEY' });
      return;
    }

    const { teacherName, subject, tone, graduationYear, senderName } = req.body;

    const prompt = `Hãy viết một lời chúc tri ân 20/11 thật cảm động, sâu sắc và tinh tế.
- Người nhận: Thầy/Cô ${teacherName || 'thầy cô giáo'} (Bộ môn/Vai trò: ${subject || 'Tất cả các thầy cô'})
- Người gửi: ${senderName || 'Một cựu học sinh'} ${graduationYear ? `(Cựu học sinh khóa ${graduationYear} THPT Chuyên Sơn La)` : 'Học sinh Chuyên Sơn La'}
- Phong cách mong muốn: ${tone || 'Xúc động, chân thành, giàu kỷ niệm'}
Yêu cầu:
- Độ dài khoảng 80 - 150 từ.
- Lời văn tự nhiên, tràn đầy lòng biết ơn chân tình, có thể gợi nhắc hình ảnh bụi phấn, hoa ban, bảng đen hoặc những bài học làm người đáng giá.
- Chỉ trả về đoạn văn lời chúc, không cần tiêu đề hay lời dẫn.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Bạn là chuyên gia chắp bút những lời chúc 20/11 tri ân thầy cô sâu lắng nhất.',
      },
    });

    res.json({ wish: response.text?.trim() });
  } catch (error: any) {
    console.error('Wish generator error:', error);
    res.status(500).json({ error: error.message || 'Lỗi tạo lời chúc.' });
  }
});

// In-memory data store for live digital guestbook / comments if user wants to add real-time notes
interface GuestbookEntry {
  id: string;
  senderName: string;
  role: string; // e.g. "Cựu học sinh K18 Chuyên Toán", "Học sinh 11 Chuyên Văn"
  teacherTarget: string;
  message: string;
  year?: string;
  timestamp: string;
  likes: number;
  tags?: string[];
  avatarColor?: string;
}

let guestbookEntries: GuestbookEntry[] = [
  {
    id: '1',
    senderName: 'Nguyễn Hoàng Nam',
    role: 'Cựu học sinh K16 Chuyên Tin',
    teacherTarget: 'Thầy Nguyễn Văn Hiệp & Cô Hoàng Lan',
    message: 'Nhân ngày 20/11, từ phương xa con kính chúc quý thầy cô luôn dồi dào sức khỏe và ngập tràn niềm vui. Nhớ những ngày chạy giải thuật thâu đêm tại phòng máy Chuyên Sơn La, thầy luôn pha trà và động viên từng bạn!',
    year: 'Khóa 2014 - 2017',
    timestamp: '2026-11-08 14:30',
    likes: 42,
    tags: ['K16', 'Chuyên Tin', 'Tri Ân'],
    avatarColor: 'from-blue-500 to-indigo-600',
  },
  {
    id: '2',
    senderName: 'Lê Thu Trang',
    role: 'Cựu học sinh K20 Chuyên Văn',
    teacherTarget: 'Cô Lê Thị Mai Hương (GVCN)',
    message: 'Mùa hoa ban năm nào cũng nhắc con nhớ về những tiết học Văn chan chứa tình người của cô. Cô không chỉ dạy con cách cảm thụ tác phẩm mà còn dạy con bản lĩnh vững vàng giữa cuộc đời.',
    year: 'Khóa 2018 - 2021',
    timestamp: '2026-11-08 19:15',
    likes: 58,
    tags: ['K20', 'Chuyên Văn', 'Người mẹ thứ hai'],
    avatarColor: 'from-rose-500 to-pink-600',
  },
  {
    id: '3',
    senderName: 'Trần Minh Đức',
    role: 'Cựu học sinh K12 Chuyên Toán',
    teacherTarget: 'Tập thể Thầy Cô bộ môn Tự Nhiên',
    message: 'Dù đã ra trường hơn 10 năm và lập nghiệp tại TP.HCM, trong tim em Chuyên Sơn La vẫn là chiếc nôi tuyệt vời nhất. Kính chúc các thầy cô luôn giữ trọn ngọn lửa đam mê truyền lửa tri thức!',
    year: 'Khóa 2010 - 2013',
    timestamp: '2026-11-09 07:45',
    likes: 31,
    tags: ['K12', 'Chuyên Toán', 'Nhớ trường'],
    avatarColor: 'from-amber-500 to-orange-600',
  },
  {
    id: '4',
    senderName: 'Chi đoàn 11 Chuyên Anh',
    role: 'Học sinh đương thời Khóa 31',
    teacherTarget: 'Cô Đỗ Thanh Vân & Toàn thể Thầy Cô',
    message: 'Happy Vietnamese Teachers\' Day! We are endlessly grateful for your dedication, kindness, and inspiration. Cảm ơn thầy cô vì đã luôn tin tưởng và chắp cánh cho những ước mơ vươn ra biển lớn của chúng con!',
    year: 'Khóa 2024 - 2027',
    timestamp: '2026-11-09 09:20',
    likes: 64,
    tags: ['Khóa 31', 'Chuyên Anh', 'Happy 20/11'],
    avatarColor: 'from-emerald-500 to-teal-600',
  },
];

// Guestbook APIs
app.get('/api/guestbook', (_req: Request, res: Response) => {
  res.json(guestbookEntries);
});

app.post('/api/guestbook', (req: Request, res: Response) => {
  const { senderName, role, teacherTarget, message, year, tags } = req.body;
  if (!senderName || !message) {
    res.status(400).json({ error: 'Vui lòng nhập tên và lời chúc.' });
    return;
  }
  const colors = [
    'from-rose-500 to-pink-600',
    'from-indigo-500 to-purple-600',
    'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600',
    'from-sky-500 to-blue-600',
  ];
  const newEntry: GuestbookEntry = {
    id: Date.now().toString(),
    senderName: senderName.trim(),
    role: role?.trim() || 'Cựu học sinh Chuyên Sơn La',
    teacherTarget: teacherTarget?.trim() || 'Kính gửi toàn thể Thầy Cô giáo',
    message: message.trim(),
    year: year?.trim() || 'Cựu học sinh các khóa',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    likes: 1,
    tags: Array.isArray(tags) && tags.length > 0 ? tags : ['Cựu học sinh', '20/11', 'Tri Ân'],
    avatarColor: colors[Math.floor(Math.random() * colors.length)],
  };
  guestbookEntries.unshift(newEntry);
  res.status(201).json(newEntry);
});

app.post('/api/guestbook/:id/like', (req: Request, res: Response) => {
  const { id } = req.params;
  const entry = guestbookEntries.find((e) => e.id === id);
  if (entry) {
    entry.likes += 1;
    res.json({ success: true, likes: entry.likes });
  } else {
    res.status(404).json({ error: 'Không tìm thấy lời chúc.' });
  }
});

// Setup Vite or static serving
async function setupServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: Number(port),
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
});
