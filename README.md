# Trạm Kết Nối Số: Tri Ân Người Dẫn Lối
### Lớp 12 Toán 2 - Trường THPT Chuyên Sơn La (Kỷ niệm Ngày Nhà giáo Việt Nam 20/11)

Sản phẩm số tương tác chào mừng ngày Nhà giáo Việt Nam 20/11 của tập thể học sinh Lớp 12 Toán 2, bao gồm:
- **Phần 1: Lời tựa & Thư ngỏ** tri ân Thầy Cô.
- **Phần 2: Thầy trò Chuyên Sơn La** (Khoảnh khắc lớp học, ngoại khóa của 12 Toán 2).
- **Phần 3: Bức tranh Infographic Tri Ân Thầy Cô** (Thiết kế số hóa nghệ thuật).
- **Phần 4: Hòm thư số kết nối các thế hệ** (Hòm thư trực tuyến, biểu mẫu mở Google Forms, Padlet Board và trợ lý AI Gemini 3.8 Flash).
- **Chế độ xem kép:** Trang thông tin tương tác (Landing Page) & Bản tin số lật trang (E-magazine 3D Flipbook).
- **Mã QR đóng khung in A4/A5** treo tại Bảng tin phụ / Góc tri ân lớp học.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local)

1. **Cài đặt thư viện:**
   ```bash
   npm install
   ```

2. **Cấu hình biến môi trường:**
   Tạo file `.env` từ `.env.example`:
   ```bash
   GEMINI_API_KEY="your_gemini_api_key_here"
   PORT=3000
   ```

3. **Chạy máy chủ phát triển:**
   ```bash
   npm run dev
   ```
   Mở trình duyệt tại: `http://localhost:3000`

4. **Build đóng gói sản phẩm:**
   ```bash
   npm run build
   ```

---

## 🌐 Hướng Dẫn Đưa Lên GitHub & Triển Khai Lên Mạng (Hosting)

### Bước 1: Đẩy mã nguồn lên GitHub
1. Tạo một repository mới trên [GitHub](https://github.com/new) (ví dụ: `tri-an-12-toan-2`).
2. Mở Terminal tại thư mục dự án và chạy các lệnh:
   ```bash
   git init
   git add .
   git commit -m "Khởi tạo website Tri ân 20/11 Lớp 12 Toán 2"
   git branch -M main
   git remote add origin https://github.com/<USERNAME-CUA-BAN>/tri-an-12-toan-2.git
   git push -u origin main
   ```

### Bước 2: Đưa lên mạng miễn phí (Deploy)
Dự án có cả backend Express (cho Chatbot AI và Hòm thư số) và frontend React:
- **Cách 1: Render.com (Khuyên dùng)**
  1. Đăng nhập [Render.com](https://render.com) bằng GitHub.
  2. Chọn **New Web Service** -> Chọn repository vừa push.
  3. Cấu hình:
     - **Build Command:** `npm install && npm run build`
     - **Start Command:** `npm start`
     - Thêm **Environment Variable**: `GEMINI_API_KEY`
- **Cách 2: Vercel**
  1. Đăng nhập [Vercel](https://vercel.com) và Import Git Repository.
  2. Thêm biến môi trường `GEMINI_API_KEY`.
