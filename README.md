# AI OVERLAY DESIGNER – PRO STUDIO v1.0
### Phần Mềm Thiết Kế & Tạo Khung Overlay Tự Động Từ Hình Ảnh AI

**AI Overlay Designer** là giải pháp phần mềm chuyên nghiệp giúp các streamer, game thủ và nhà sáng tạo nội dung tự động chuyển đổi bất kỳ hình ảnh thiết kế thô (tạo từ Midjourney, DALL-E, Stable Diffusion hoặc Photoshop) thành một bộ khung Overlay hoàn chỉnh với **nền trong suốt Alpha Channel (RGBA 32-bit)**, giữ trọn vẹn ngôn ngữ thẩm mỹ, viền chi tiết, hiệu ứng ánh sáng và độ sâu gốc.

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. Giao Diện Tối Giản Trắng Đen (Monochrome Minimalist)
- Thiết kế theo phong cách hiện đại với 2 màu chủ đạo Trắng & Đen, nền xám nhạt thanh lịch (`#ffffff` / `#f9fafb`), chữ đen đậm tương phản cao.
- Font chữ chuẩn chuyên nghiệp: Inter / SF Pro.
- Trải nghiệm người dùng trực quan, khoa học, dễ thao tác kể cả người mới bắt đầu.

### 2. Quy Trình Xử Lý AI Tự Động 5 Bước
1. **Phân Tích Hình Ảnh Gốc:** AI Vision (Gemini / GPT-4o / Local Engine) tự động bóc tách phong cách (Cyberpunk Neon, Mecha Gold, Minimalist Esports, Fantasy HUD), tỷ lệ khung, cấu trúc viền, bảng màu chủ đạo (Hex) và các thành phần (khung webcam 16:9, khung chat, thanh donate ticker).
2. **Tách Nền & Xử Lý Alpha:** Loại bỏ hoàn toàn nền thừa không thuộc thiết kế bằng mạng nơ-ron Rembg AI (U2-Net / IS-Net) kết hợp OpenCV, giữ nguyên các đường viền mảnh và hiệu ứng ánh sáng mịn mà không làm mờ hay giảm chi tiết.
3. **Tái Tạo Khung Overlay:** Bảo toàn 100% hình dạng viền góc cạnh hoặc bo tròn, độ dày, chất liệu kim loại hoặc nhựa matte của ảnh tham chiếu.
4. **Bổ Sung Hiệu Ứng Chuyên Nghiệp:** Outer Glow (quầng sáng viền neon falloff), Drop Shadow (bóng đổ 3D sâu), Metallic Bevel Sheen, Neon Vibrancy.
5. **Kiểm Tra Chất Lượng & Tối Ưu RGBA:** Tự động phát hiện răng cưa, vùng nền sót, đo lường tỷ lệ trong suốt và chấm điểm Quality Score (Grade A+).

### 3. Style Reference Memory (Bảo Lưu Phong Cách Gốc)
- Phân định rõ ràng: **Ảnh cần tách khung** và **Ảnh mẫu tham chiếu phong cách**.
- Ghi nhớ hồ sơ phong cách của từng người dùng (bảng màu, kiểu vát góc, ánh sáng).
- Cho phép tải thêm nhiều ảnh mẫu tham chiếu mới để cập nhật bộ nhớ thẩm mỹ.

### 4. Khu Vực Xem Trước Đa Chế Độ
- **Before / After Split Slider:** Kéo thanh trượt trực tiếp trên ảnh để so sánh ảnh gốc và khung sau khi tách nền.
- **Khung Trong Suốt (Alpha View):** Nền caro (checkerboard) tương phản cao để quan sát độ sạch của viền.
- **So Sánh Song Song (Side-by-Side View):** Đặt ảnh gốc và sản phẩm cạnh nhau.
- **Giả Lập OBS Studio Live:** Hiển thị khung overlay trực tiếp trên bối cảnh stream mẫu để kiểm tra độ vừa vặn của webcam và gameplay.
- **Bộ Công Cụ Zoom:** Phóng to 50%, 100%, 200%, 400% để soi kỹ từng chi tiết viền.

### 5. Hệ Thống AI Provider Adapter Linh Hoạt & An Toàn
- **Local Neural Engine (Rembg & OpenCV):** Tích hợp sẵn 100% offline, miễn phí hoàn toàn, tốc độ xử lý tức thì, bảo mật tuyệt đối không gửi ảnh lên cloud.
- **Google Gemini API:** Hỗ trợ `gemini-1.5-flash`, `gemini-2.0-flash`, `gemini-1.5-pro` với khả năng multimodal vision vượt trội.
- **OpenAI API:** Hỗ trợ `gpt-4o` và `gpt-4o-mini`.
- **Custom Endpoint:** Hỗ trợ mọi endpoint tương thích chuẩn OpenAI.
- **Replicate:** Hỗ trợ BiRefNet & background removal models.
- **Server-Side Security:** API Key được lưu an toàn tại phía server (`storage/server_config.json`), không bao giờ để lộ ra frontend hay browser inspection.
- **Live Connection Test:** Nút kiểm tra kết nối thời gian thực hiển thị độ trễ latency (ms) và phản hồi thực từ API.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY DỰ ÁN

### Yêu cầu môi trường
- **Node.js**: v18+ trở lên (Đã xác nhận chạy mượt mà trên Node.js v24)
- **Python**: 3.10+ (Đã tích hợp sẵn OpenCV, Pillow, Rembg)

### Khởi động ứng dụng
```bash
# Di chuyển vào thư mục dự án
cd "C:\Users\hongg\.gemini\antigravity\scratch\ai-overlay-designer"

# Chạy server sản xuất (Production mode)
npm run start -- -p 3000

# Hoặc chạy môi trường phát triển (Development mode)
npm run dev
```

Truy cập trên trình duyệt: **`http://localhost:3000`**

---

## 📂 CẤU TRÚC THƯ MỤC DỰ ÁN

```
ai-overlay-designer/
├── public/
│   ├── samples/          # Các mẫu overlay có sẵn (Mecha Chatbox, Webcam 16:9, Gold Donate)
│   ├── uploads/          # Thư mục lưu ảnh người dùng tải lên
│   └── outputs/          # Thư mục xuất file PNG trong suốt hoàn chỉnh
├── scripts/
│   ├── process_overlay.py # Bộ xử lý bóc tách Alpha, Rembg, Glow & Shadow composite
│   ├── analyze_style.py   # Phân tích màu sắc K-Means, độ sáng, viền và layout
│   └── test_env.py        # Kiểm tra môi trường thư viện Python & rembg
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/       # API phân tích thị giác hình ảnh
│   │   │   ├── process/       # API xử lý 5 bước tạo khung
│   │   │   ├── settings/      # API quản lý cấu hình & test API key
│   │   │   ├── style-memory/  # API quản lý bộ nhớ phong cách
│   │   │   ├── upload/        # API tải ảnh an toàn
│   │   │   └── history/       # API lưu trữ và quản lý lịch sử
│   │   ├── globals.css        # Tailwind CSS & mẫu checkerboard trong suốt
│   │   ├── layout.tsx         # Root layout với typography Inter
│   │   └── page.tsx           # Trang điều khiển chính (Studio, Memory, History, Settings)
│   ├── components/
│   │   ├── Navbar.tsx                # Thanh điều hướng tối giản & trạng thái AI engine
│   │   ├── UploadDropzone.tsx        # Kéo thả ảnh & mẫu thử nghiệm 1-click
│   │   ├── StyleReferenceSelector.tsx# Bộ chọn phong cách tham chiếu
│   │   ├── EffectControls.tsx        # Thanh gạt điều chỉnh Glow, Shadow, Độ dày, Resolution
│   │   ├── PipelineStepper.tsx       # Hiển thị tiến trình 5 bước xử lý
│   │   ├── PreviewCanvas.tsx         # Before/After slider & công cụ tải PNG RGBA
│   │   ├── StyleMemoryView.tsx       # Quản lý hồ sơ phong cách tham chiếu
│   │   ├── HistoryView.tsx           # Lịch sử các thiết kế đã tạo
│   │   └── SettingsView.tsx          # Cấu hình API Provider & Test Connection
│   └── lib/
│       ├── types.ts           # Định nghĩa cấu trúc dữ liệu TypeScript
│       ├── storage.ts         # Lưu trữ bảo mật phía máy chủ
│       └── ai-provider.ts     # Adapter kết nối Gemini, OpenAI, Local Engine
└── storage/
    ├── server_config.json     # File lưu API keys an toàn trên server
    ├── styles.json            # Dữ liệu Style Profiles
    └── history.json           # Dữ liệu lịch sử Overlay
```

---

## 🎮 HƯỚNG DẪN IMPORT VÀO OBS STUDIO

1. Mở **OBS Studio**.
2. Tại bảng **Sources** (Nguồn), nhấn dấu `+` và chọn **Image** (Hình ảnh).
3. Đặt tên (ví dụ: `AI_Overlay_Webcam`).
4. Nhấn **Browse** và chọn file PNG tải từ **AI Overlay Designer**.
5. Nhấn **OK**. Khung overlay sẽ hiển thị ngay lập tức với nền trong suốt tuyệt đối!
