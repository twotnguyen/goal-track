const fs = require('fs');
const path = require('path');

const generateMatches = () => {
    const matches = [];
    let matchId = 1;

    const addDays = (startDate, daysToAdd, hoursOffset = 0) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + daysToAdd);
        d.setHours(d.getHours() + hoursOffset);
        return d.toISOString();
    };

    const baseDate = new Date('2026-06-12T02:00:00+07:00'); 
    
    const defaultLinks = {
        live: [
            {"name": "VTV Go", "url": "https://vtvgo.vn/"}
        ],
        replay: "https://youtube.com/fifa"
    };

    // Danh sách 10 trận đấu thực tế (đã xác định) mà VnExpress có
    const knownMatches = [
        { home: "Canada", away: "Morocco", score: [0, 3], status: "finished" },
        { home: "Paraguay", away: "Pháp", score: [0, 1], status: "finished" },
        { home: "Brazil", away: "Na Uy", score: null, status: "upcoming" },
        { home: "Mexico", away: "Anh", score: null, status: "upcoming" },
        { home: "Bồ Đào Nha", away: "Tây Ban Nha", score: null, status: "upcoming" },
        { home: "Mỹ", away: "Bỉ", score: null, status: "upcoming" },
        { home: "Argentina", away: "Ai Cập", score: null, status: "upcoming" },
        { home: "Thụy Sĩ", away: "Colombia", score: null, status: "upcoming" },
        { home: "Pháp", away: "Morocco", score: null, status: "upcoming" },
        { home: "Thắng trận 93", away: "Thắng trận 94", score: null, status: "upcoming" }
    ];

    let knownIndex = 0;

    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    let dayOffset = 0;
    
    // 1. Vòng bảng (72 trận)
    for (let i = 0; i < 72; i++) {
        const groupIndex = Math.floor(i / 6);
        const groupName = groups[groupIndex];
        
        let home = "Chưa rõ";
        let away = "Chưa rõ";
        let homeScore = null;
        let awayScore = null;
        let status = "upcoming";

        // Gắn 10 trận đã biết vào 10 trận đầu tiên của vòng bảng
        if (knownIndex < knownMatches.length) {
            home = knownMatches[knownIndex].home;
            away = knownMatches[knownIndex].away;
            if (knownMatches[knownIndex].score) {
                homeScore = knownMatches[knownIndex].score[0];
                awayScore = knownMatches[knownIndex].score[1];
            }
            status = knownMatches[knownIndex].status;
            knownIndex++;
        }

        matches.push({
            id: String(matchId++),
            home_team: home,
            away_team: away,
            date: addDays(baseDate, dayOffset, (i % 4) * 3), 
            stage: `Vòng bảng - Bảng ${groupName}`,
            stadium: "TBD",
            status: status,
            home_score: homeScore,
            away_score: awayScore,
            links: defaultLinks
        });
        
        if (i > 0 && i % 4 === 0) dayOffset++; 
    }

    // 2. Các vòng Knockout
    const addKnockout = (count, stageName, startOffset, daysPerStep, matchesPerDay) => {
        let currentOffset = startOffset;
        for (let i = 0; i < count; i++) {
            matches.push({
                id: String(matchId++),
                home_team: "Chưa rõ",
                away_team: "Chưa rõ",
                date: addDays(baseDate, currentOffset, (i % matchesPerDay) * 4), 
                stage: stageName,
                stadium: "TBD",
                status: "upcoming",
                home_score: null,
                away_score: null,
                links: defaultLinks
            });
            if ((i + 1) % matchesPerDay === 0) currentOffset += daysPerStep;
        }
    };

    addKnockout(16, "Vòng 32 đội", 16, 1, 3);
    addKnockout(8, "Vòng 16 đội", 22, 1, 2);
    addKnockout(4, "Tứ kết", 27, 2, 2);
    addKnockout(2, "Bán kết", 32, 1, 2);
    addKnockout(1, "Hạng ba", 36, 1, 1);
    addKnockout(1, "Chung kết", 38, 1, 1);

    const outputPath = path.join(__dirname, '../data/matches.json');
    fs.writeFileSync(outputPath, JSON.stringify(matches, null, 2), 'utf-8');
    console.log(`Đã tạo thành công ${matches.length} trận đấu tại ${outputPath}`);
};

generateMatches();
