# Thiết Kế Giao Diện Trang Chủ Khi Kết Thúc Giải Đấu

Tài liệu này đặc tả thiết kế cập nhật giao diện trang chủ của dự án **GoalTrack (WorldCup Live Hub 2026)** khi giải đấu đã kết thúc, nhằm vinh danh nhà vô địch và tối ưu hóa trải nghiệm người dùng thay vì hiển thị giao diện trống trải.

## 1. Trạng Thái Giải Đấu & Phát Hiện Tự Động
Trong file [app.js](file:///Users/twot/Documents/CODE/worldcup-live-hub-2026/js/app.js), hàm `renderHomePage` sẽ tự động xác định trạng thái giải đấu đã kết thúc dựa trên dữ liệu từ `matches.json`:
- **Điều kiện kết thúc:** Không còn bất kỳ trận đấu nào có trạng thái `"status": "upcoming"` hoặc `"status": "live"`.
- **Biến trạng thái:** `const isTournamentFinished = upcomingMatches.length === 0 && !liveMatch;`

## 2. Banner Vinh Danh Nhà Vô Địch (Champion Banner)
Khi `isTournamentFinished` là `true`, một banner chúc mừng sẽ được chèn động vào đầu khu vực `<main>` (trước `next-match-section`).

### Cấu Trúc HTML Động:
```html
<div class="champion-banner">
    <div class="champion-cup">🏆</div>
    <h2 class="champion-title">Tây Ban Nha vô địch World Cup 2026!</h2>
    <p class="champion-subtitle">Chiến thắng thuyết phục 1 - 0 trước Argentina trong trận chung kết lịch sử.</p>
</div>
```

### Phong Cách CSS (styles.css):
- **Nền (Background):** Sử dụng dải màu gradient vàng kim (Gold Gradient) kết hợp hiệu ứng kính mờ (glassmorphism) nếu cần:
  `background: linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771c 100%);`
- **Chữ (Color):** Màu chữ tối tương phản tốt với nền vàng kim (ví dụ: `#111` hoặc `#1a1a1a`), font chữ đậm và nổi bật.
- **Hiệu Ứng (Animation):** Thêm micro-animation phóng to/thu nhỏ nhẹ nhàng cho cúp vàng 🏆 (scale pulse).
- **Đổ Bóng (Shadow):** Đổ bóng mờ nhẹ để banner nổi lên trên bề mặt trang web.

## 3. Trận Đấu Tiêu Điểm (Featured Match)
- Khi giải đấu kết thúc, vị trí "Trận đấu tiếp theo" (`next-match-section`) sẽ hiển thị trận **Chung kết** (Tây Ban Nha vs Argentina) làm tiêu điểm chính.
- Tiêu đề tiêu điểm được đổi thành: **"Trận chung kết lịch sử"**.
- Hiển thị đầy đủ tỉ số `1 - 0`, thông tin sân vận động, thời gian thi đấu và các nút liên kết highlight/replay nếu có.

## 4. Danh Sách Trận Đấu Gần Đây
- Tiêu đề của khu vực danh sách trận đấu tiếp theo được đổi từ "Các trận đấu tiếp theo" thành **"Các trận đấu kịch tính gần đây"**.
- Grid bên dưới sẽ hiển thị 4 trận đấu cuối cùng của giải đấu theo thứ tự ngược (Chung kết, Tranh hạng ba, Bán kết 1, Bán kết 2):
  1. Chung kết: Tây Ban Nha vs Argentina (1 - 0)
  2. Tranh hạng ba: Pháp vs Anh (4 - 6)
  3. Bán kết 2: Anh vs Argentina (1 - 2)
  4. Bán kết 1: Pháp vs Tây Ban Nha (0 - 2)
- Layout của phần này sẽ hiển thị dưới dạng grid nhỏ, gọn gàng, trực quan.

## 5. Kế Hoạch Xác Minh (Verification Plan)
- **Kiểm tra cục bộ:** Mở trang web ở localhost để đảm bảo banner hiển thị chính xác, cúp vàng có hiệu ứng chuyển động mượt mà, trận chung kết hiển thị đầy đủ thông tin tỉ số và các trận knockout gần nhất được liệt kê đầy đủ.
- **Kiểm tra thiết bị (Responsive):** Đảm bảo banner chúc mừng co giãn tốt trên màn hình Mobile, Tablet và Desktop mà không bị vỡ bố cục hoặc tràn chữ.
