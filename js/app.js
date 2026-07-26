document.addEventListener('DOMContentLoaded', () => {
    // Elements for index-copy.html
    const matchesGrid = document.getElementById('matches-grid');
    const searchInput = document.getElementById('search');
    const filterSelect = document.getElementById('status-filter');
    const stageTabs = document.querySelectorAll('.stage-tab');

    // Elements for index.html (Home)
    const nextMatchSection = document.getElementById('next-match-section');
    const prevMatchSection = document.getElementById('prev-match-section');
    const upcomingMatchesGrid = document.getElementById('upcoming-matches-grid');

    let matchesData = [];
    let currentStageFilter = 'all';

    // Format date
    const formatDate = (dateString) => {
        const options = { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    // Format date headers
    const formatDay = (dateString) => {
        const d = new Date(dateString);
        return `Ngày ${d.getDate()}/${d.getMonth() + 1}`;
    };

    // Format time for match
    const formatTime = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatRelativeDay = (dateString) => {
        const d = new Date(dateString);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const diff = (target - today) / (1000 * 60 * 60 * 24);
        
        if (diff === 0) return 'Hôm nay';
        if (diff === 1) return 'Ngày mai';
        
        const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return `${days[d.getDay()]}, ${d.getDate()}/${d.getMonth()+1}`;
    };

    const generateFeaturedMatchHTML = (featured, title) => {
        const statusClass = featured.status === 'live' ? 'status-live' : (featured.status === 'finished' ? 'status-finished' : 'status-upcoming');
        let statusText = 'Dự Đoán';
        if (featured.status === 'live') statusText = '🔵 Đang diễn ra';
        if (featured.status === 'finished') statusText = 'Kết Thúc';
        
        const homeIsUndetermined = featured.home_team && (featured.home_team.startsWith('Thắng trận') || featured.home_team.startsWith('Thua trận'));
        const awayIsUndetermined = featured.away_team && (featured.away_team.startsWith('Thắng trận') || featured.away_team.startsWith('Thua trận'));
        const homeTeamName = homeIsUndetermined ? 'Chưa xác định' : featured.home_team;
        const awayTeamName = awayIsUndetermined ? 'Chưa xác định' : featured.away_team;
        
        const homeFlagHTML = homeIsUndetermined || !featured.home_flag_local 
            ? `<span class="flag-placeholder"></span>` 
            : `<img src="${featured.home_flag_local}" alt="${homeTeamName} flag" class="team-flag">`;
        
        const awayFlagHTML = awayIsUndetermined || !featured.away_flag_local 
            ? `<span class="flag-placeholder"></span>` 
            : `<img src="${featured.away_flag_local}" alt="${awayTeamName} flag" class="team-flag">`;
            
        let stageDisplay = featured.stage;
        if (featured.group) stageDisplay += ` &bull; ${featured.group}`;

        let linksHTML = '';
        if (featured.links && featured.links.live && featured.links.live.length > 0) {
            featured.links.live.forEach(liveLink => {
                linksHTML += `<a href="${liveLink.url}" target="_blank" class="btn btn-primary" title="Xem trực tiếp">${liveLink.name}</a>`;
            });
        }
        if (featured.links && featured.links.replay) {
            linksHTML += `<a href="${featured.links.replay}" target="_blank" class="btn btn-secondary" title="Xem lại toàn trận">Xem lại</a>`;
        }

        return `
            <div class="featured-header">${title}</div>
            <div class="match-list-item featured-item">
                <div class="match-status-badge ${statusClass}">${statusText}</div>
                <div class="match-stage" style="margin-bottom: 0.5rem; text-align: center;">
                    ${stageDisplay} &bull; ${formatTime(featured.date)} - ${formatDay(featured.date)}
                </div>
                <div class="match-main">
                    <div class="team team-home">
                        ${homeFlagHTML}
                        <span class="team-name">${homeTeamName}</span>
                    </div>
                    <div class="score-container" style="font-size: 1.5rem;">
                        ${featured.status === 'upcoming' ? 'VS' : (featured.home_score + ' - ' + featured.away_score)}
                    </div>
                    <div class="team team-away">
                        ${awayFlagHTML}
                        <span class="team-name">${awayTeamName}</span>
                    </div>
                </div>
                ${linksHTML ? `<div class="links-container" style="justify-content: center; margin-top: 1rem;">${linksHTML}</div>` : ''}
            </div>
        `;
    };

    const generateMatchListItemHTML = (match) => {
        const statusClass = `status-${match.status}`;
        const statusText = match.status === 'live' ? 'Đang diễn ra' : 
                         match.status === 'finished' ? 'Kết Thúc' : 'Dự Đoán';
        
        const scoreDisplay = match.status === 'upcoming' 
            ? `<span class="time-only">${formatTime(match.date)}</span>`
            : `<span class="score-only">${match.home_score} - ${match.away_score}</span>`;

        let linksHTML = '';
        if (match.links) {
            if (match.links.live && match.links.live.length > 0) {
                match.links.live.forEach(liveLink => {
                    linksHTML += `<a href="${liveLink.url}" target="_blank" class="btn btn-primary" title="Xem trực tiếp">${liveLink.name}</a>`;
                });
            }
            if (match.links.replay) {
                linksHTML += `<a href="${match.links.replay}" target="_blank" class="btn btn-secondary" title="Xem lại toàn trận">Xem lại</a>`;
            }
        }

        let stageDisplay = match.stage;
        if (match.group) {
            stageDisplay += ` &bull; ${match.group}`;
        }

        const homeIsUndetermined = match.home_team && (match.home_team.startsWith('Thắng trận') || match.home_team.startsWith('Thua trận'));
        const awayIsUndetermined = match.away_team && (match.away_team.startsWith('Thắng trận') || match.away_team.startsWith('Thua trận'));
        const homeTeamName = homeIsUndetermined ? 'Chưa xác định' : match.home_team;
        const awayTeamName = awayIsUndetermined ? 'Chưa xác định' : match.away_team;

        const homeFlagHTML = homeIsUndetermined || !match.home_flag_local 
            ? `<span class="flag-placeholder"></span>` 
            : `<img src="${match.home_flag_local}" alt="${homeTeamName} flag" class="team-flag">`;
        
        const awayFlagHTML = awayIsUndetermined || !match.away_flag_local 
            ? `<span class="flag-placeholder"></span>` 
            : `<img src="${match.away_flag_local}" alt="${awayTeamName} flag" class="team-flag">`;

        return `
            <div class="match-list-item">
                <div class="match-status-badge ${statusClass}">
                    ${match.status === 'live' ? '🔵 ' : ''}${statusText}
                </div>
                <div class="match-main">
                    <div class="team team-home">
                        ${homeFlagHTML}
                        <span class="team-name">${homeTeamName}</span>
                    </div>
                    <div class="score-container">
                        ${scoreDisplay}
                    </div>
                    <div class="team team-away">
                        ${awayFlagHTML}
                        <span class="team-name">${awayTeamName}</span>
                    </div>
                </div>
                <div class="match-stage">
                    ${stageDisplay} &bull; ${formatDay(match.date)}
                </div>
                ${linksHTML ? `<div class="links-container">${linksHTML}</div>` : ''}
            </div>
        `;
    };

    const generateCompactMatchListItemHTML = (match) => {
        let stageDisplay = match.stage;
        if (match.group) stageDisplay += ` &bull; ${match.group}`;

        const homeIsUndetermined = match.home_team && (match.home_team.startsWith('Thắng trận') || match.home_team.startsWith('Thua trận'));
        const awayIsUndetermined = match.away_team && (match.away_team.startsWith('Thắng trận') || match.away_team.startsWith('Thua trận'));
        const homeTeamName = homeIsUndetermined ? 'Chưa xác định' : match.home_team;
        const awayTeamName = awayIsUndetermined ? 'Chưa xác định' : match.away_team;

        const homeFlagHTML = homeIsUndetermined || !match.home_flag_local 
            ? `<span class="flag-placeholder" style="width: 20px; height: 14px;"></span>` 
            : `<img src="${match.home_flag_local}" alt="${homeTeamName} flag" class="cm-flag">`;
        
        const awayFlagHTML = awayIsUndetermined || !match.away_flag_local 
            ? `<span class="flag-placeholder" style="width: 20px; height: 14px;"></span>` 
            : `<img src="${match.away_flag_local}" alt="${awayTeamName} flag" class="cm-flag">`;

        let mainLink = '#';
        if (match.links && match.links.live && match.links.live.length > 0) mainLink = match.links.live[0].url;
        else if (match.links && match.links.replay) mainLink = match.links.replay;

        return `
            <div class="compact-match-item">
                <div class="cm-left" style="flex: 1; min-width: 0;">
                    <div class="cm-stage">${stageDisplay}</div>
                    <div class="cm-team" style="justify-content: space-between; width: 100%; display: flex; align-items: center; margin-bottom: 0.25rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 0; flex: 1;">
                            ${homeFlagHTML}
                            <span class="cm-team-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${homeTeamName}</span>
                        </div>
                        ${match.status === 'finished' ? `<span class="cm-score" style="font-weight: 700; color: #fff; font-size: 1rem; font-variant-numeric: tabular-nums; margin-left: 1rem; flex-shrink: 0;">${match.home_score}</span>` : ''}
                    </div>
                    <div class="cm-team" style="justify-content: space-between; width: 100%; display: flex; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 0; flex: 1;">
                            ${awayFlagHTML}
                            <span class="cm-team-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${awayTeamName}</span>
                        </div>
                        ${match.status === 'finished' ? `<span class="cm-score" style="font-weight: 700; color: #fff; font-size: 1rem; font-variant-numeric: tabular-nums; margin-left: 1rem; flex-shrink: 0;">${match.away_score}</span>` : ''}
                    </div>
                </div>
                <div class="cm-right" style="justify-content: center; margin-left: 1.5rem; flex-shrink: 0;">
                    <div class="cm-day">${formatRelativeDay(match.date)}</div>
                    <div class="cm-time" style="margin-bottom: 0;">${formatTime(match.date)}</div>
                </div>
            </div>
        `;
    };

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

    const renderFullPage = (matches) => {
        if (!matchesGrid) return;
        if (matches.length === 0) {
            matchesGrid.innerHTML = '<div class="loading">Không tìm thấy trận đấu nào phù hợp.</div>';
            return;
        }

        // Group matches by day
        const grouped = {};
        matches.forEach(match => {
            const dayStr = formatDay(match.date);
            if (!grouped[dayStr]) {
                grouped[dayStr] = [];
            }
            grouped[dayStr].push(match);
        });

        let html = '';
        for (const [dayStr, dayMatches] of Object.entries(grouped)) {
            html += `
                <div class="date-section">
                    <h2 class="date-header"><span class="date-bar"></span> ${dayStr}</h2>
                    <div class="matches-list">
                        ${dayMatches.map(m => generateMatchListItemHTML(m)).join('')}
                    </div>
                </div>
            `;
        }
        matchesGrid.innerHTML = html;
    };

    const filterMatches = () => {
        if (!matchesGrid) return;
        const searchTerm = searchInput.value.toLowerCase();
        const statusFilter = filterSelect.value;

        const filtered = matchesData.filter(match => {
            const matchesSearch = match.home_team.toLowerCase().includes(searchTerm) || 
                                match.away_team.toLowerCase().includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || match.status === statusFilter;
            const matchesStage = currentStageFilter === 'all' || match.stage === currentStageFilter;
            
            return matchesSearch && matchesStatus && matchesStage;
        });

        renderFullPage(filtered);
    };

    const fetchMatches = async () => {
        try {
            if (matchesGrid) matchesGrid.innerHTML = '<div class="loading">Đang tải dữ liệu trận đấu...</div>';
            
            const response = await fetch(`data/matches.json?t=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Không thể tải dữ liệu');
            
            matchesData = await response.json();
            
            if (nextMatchSection) {
                renderHomePage(matchesData);
            } else if (matchesGrid) {
                renderFullPage(matchesData);

                // Auto-scroll synchronously to avoid visual flash
                const now = new Date();
                const sorted = [...matchesData].sort((a, b) => new Date(a.date) - new Date(b.date));
                const pastMatches = sorted.filter(m => m.status === 'finished' || (new Date(m.date) < now && m.status !== 'live')).reverse();
                const prevMatch = pastMatches.length > 0 ? pastMatches[0] : null;
                
                if (prevMatch) {
                    const targetDayStr = formatDay(prevMatch.date);
                    const dateHeaders = document.querySelectorAll('.date-header');
                    for (let header of dateHeaders) {
                        if (header.innerText.includes(targetDayStr)) {
                            const stickyFilters = document.querySelector('.sticky-filters');
                            // Thêm 20px khoảng cách phụ để nhìn thoáng hơn
                            const offset = stickyFilters ? stickyFilters.offsetHeight + 20 : 180;
                            const y = header.getBoundingClientRect().top + window.scrollY - offset;
                            window.scrollTo({top: y, behavior: 'instant'});
                            break;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching matches:', error);
            if (matchesGrid) matchesGrid.innerHTML = '<div class="error">Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.</div>';
        }
    };

    // Event listeners for index-copy.html
    if (searchInput) searchInput.addEventListener('input', filterMatches);
    if (filterSelect) filterSelect.addEventListener('change', filterMatches);
    
    if (stageTabs.length > 0) {
        stageTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                stageTabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                currentStageFilter = e.target.getAttribute('data-stage');
                filterMatches();
            });
        });
    }

    // Initial load
    fetchMatches();
});
