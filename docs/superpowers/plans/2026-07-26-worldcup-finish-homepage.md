# Cập Nhật Giao Diện Trang Chủ Khi Kết Thúc Giải Đấu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cập nhật giao diện trang chủ World Cup 2026 khi giải đấu kết thúc, vinh danh đội vô địch Tây Ban Nha, hiển thị nổi bật trận chung kết và các trận knockout cuối cùng.

**Architecture:** Tự động phát hiện trạng thái giải đấu kết thúc (không còn trận đấu `upcoming` hay `live`) trong JavaScript để thay đổi DOM động: chèn Banner chúc mừng vàng kim, đưa trận chung kết lên làm tiêu điểm chính thay thế cho phần "Trận tiếp theo", và đổi phần lịch thi đấu sắp tới thành danh sách "Các trận đấu kịch tính gần đây".

**Tech Stack:** Vanilla JavaScript, CSS3.

## Global Constraints
- Chỉ sử dụng JavaScript thuần (Vanilla JS) và CSS thuần, không dùng framework hay thư viện bổ sung.
- Đảm bảo responsive trên các thiết bị Mobile, Tablet và Desktop.

---

### Task 1: Cập Nhật CSS Cho Banner Nhà Vô Địch

**Files:**
- Modify: [styles.css](file:///Users/twot/Documents/CODE/worldcup-live-hub-2026/css/styles.css)

- [ ] **Step 1: Thêm style CSS cho Banner vinh danh và hiệu ứng cúp vàng**

Sửa file [styles.css](file:///Users/twot/Documents/CODE/worldcup-live-hub-2026/css/styles.css) bằng cách thêm đoạn mã sau vào cuối file:

```css
/* Champion Banner Styling */
.champion-banner {
    background: linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771c 100%);
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
    margin-bottom: 2rem;
    box-shadow: 0 10px 25px rgba(191, 149, 63, 0.25);
    color: #1a1a1a;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.champion-cup {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    animation: cupPulse 2.5s infinite ease-in-out;
    display: inline-block;
}

.champion-title {
    font-size: 1.8rem;
    font-weight: 800;
    margin: 0 0 0.5rem 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #111;
}

.champion-subtitle {
    font-size: 1.1rem;
    margin: 0;
    opacity: 0.9;
    font-weight: 600;
    color: #222;
}

@keyframes cupPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.15) rotate(5deg); }
    100% { transform: scale(1); }
}

@media (max-width: 768px) {
    .champion-banner {
        padding: 1.5rem 1rem;
    }
    .champion-title {
        font-size: 1.4rem;
    }
    .champion-subtitle {
        font-size: 0.95rem;
    }
}
```

- [ ] **Step 2: Commit thay đổi**

```bash
git add css/styles.css
git commit -m "style: add champion banner styles with gold gradient and cup pulse animation"
```

---

### Task 2: Cập Nhật Logic Render Trang Chủ

**Files:**
- Modify: [app.js](file:///Users/twot/Documents/CODE/worldcup-live-hub-2026/js/app.js)

- [ ] **Step 1: Sửa đổi logic renderHomePage trong app.js**

Thay thế hàm `renderHomePage` trong file [app.js](file:///Users/twot/Documents/CODE/worldcup-live-hub-2026/js/app.js) (dòng 219-249) bằng đoạn code sau:

```javascript
    const renderHomePage = (matches) => {
        const now = new Date();
        const sortedMatches = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const upcomingMatches = sortedMatches.filter(m => m.status === 'upcoming' && new Date(m.date) >= now);
        let liveMatch = sortedMatches.find(m => m.status === 'live');
        
        const isTournamentFinished = upcomingMatches.length === 0 && !liveMatch;

        if (isTournamentFinished) {
            // 1. Thêm Champion Banner vào trước next-match-section
            const mainContainer = document.querySelector('main');
            if (mainContainer && !document.querySelector('.champion-banner')) {
                const bannerDiv = document.createElement('div');
                bannerDiv.className = 'champion-banner';
                bannerDiv.innerHTML = `
                    <div class="champion-cup">🏆</div>
                    <h2 class="champion-title">Tây Ban Nha vô địch World Cup 2026!</h2>
                    <p class="champion-subtitle">Chiến thắng kịch tính 1 - 0 trước Argentina tại trận chung kết lịch sử.</p>
                `;
                mainContainer.insertBefore(bannerDiv, nextMatchSection);
            }

            // 2. Trận đấu tiêu điểm (Featured Match) - Trận Chung kết (Trận đấu cuối cùng)
            const pastMatches = sortedMatches.filter(m => m.status === 'finished').reverse();
            const finalMatch = pastMatches[0]; // Trận chung kết
            if (finalMatch) {
                nextMatchSection.innerHTML = generateFeaturedMatchHTML(finalMatch, 'Trận chung kết lịch sử');
                nextMatchSection.style.display = 'block';
            }
            prevMatchSection.style.display = 'none'; // Ẩn trận đấu trước đó vì trận chung kết đã được đưa lên tiêu điểm

            // 3. Hiển thị 4 trận đấu knockout cuối cùng của giải đấu
            // Lấy 4 trận cuối cùng (Chung kết, Tranh hạng ba, 2 trận bán kết)
            const recentKnockouts = pastMatches.slice(0, 4);
            if (recentKnockouts.length > 0) {
                const upcomingSection = document.getElementById('upcoming-matches-section');
                if (upcomingSection) {
                    const header = upcomingSection.querySelector('.date-header');
                    if (header) {
                        header.innerHTML = '<span class="date-bar"></span> Các trận đấu kịch tính gần đây';
                    }
                    upcomingSection.style.display = 'block';
                }
                
                document.getElementById('upcoming-matches-grid').className = 'compact-matches-grid';
                upcomingMatchesGrid.innerHTML = recentKnockouts.map(m => generateCompactMatchListItemHTML(m)).join('');
            } else {
                document.getElementById('upcoming-matches-section').style.display = 'none';
            }
        } else {
            // Logic bình thường khi giải đấu chưa kết thúc
            // 1. Next match
            let nextMatch = liveMatch || (upcomingMatches.length > 0 ? upcomingMatches[0] : null);
            if (nextMatch) {
                nextMatchSection.innerHTML = generateFeaturedMatchHTML(nextMatch, 'Trận đấu tiếp theo');
                nextMatchSection.style.display = 'block';
            }

            // 2. Previous match
            const pastMatches = sortedMatches.filter(m => m.status === 'finished' || (new Date(m.date) < now && m.status !== 'live')).reverse();
            const prevMatch = pastMatches.length > 0 ? pastMatches[0] : null;
            if (prevMatch) {
                prevMatchSection.innerHTML = generateFeaturedMatchHTML(prevMatch, 'Trận đấu trước đó');
                prevMatchSection.style.display = 'block';
            }

            // 3. 4 matches after next match
            const upcoming4 = nextMatch && !liveMatch ? upcomingMatches.slice(1, 5) : upcomingMatches.slice(0, 4);
            if (upcoming4.length > 0) {
                document.getElementById('upcoming-matches-grid').className = 'compact-matches-grid';
                upcomingMatchesGrid.innerHTML = upcoming4.map(m => generateCompactMatchListItemHTML(m)).join('');
            } else {
                document.getElementById('upcoming-matches-section').style.display = 'none';
            }
        }
    };
```

- [ ] **Step 2: Commit thay đổi**

```bash
git add js/app.js
git commit -m "feat: add automatic tournament finished detection and render home page dynamically"
```
