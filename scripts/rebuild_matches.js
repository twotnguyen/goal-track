const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../vnexpress_full.html');
const matchesPath = path.join(__dirname, '../data/matches.json');

const html = fs.readFileSync(htmlPath, 'utf8');
let existingMatches = [];
try {
    existingMatches = JSON.parse(fs.readFileSync(matchesPath, 'utf8'));
} catch(e) {}

// Build a dictionary of team names to local flags
const flagDict = {};
existingMatches.forEach(m => {
    if (m.home_team && m.home_flag_local) flagDict[m.home_team] = m.home_flag_local;
    if (m.away_team && m.away_flag_local) flagDict[m.away_team] = m.away_flag_local;
});

const defaultLinks = {
    live: [
        {"name": "VTV Go", "url": "https://vtvgo.vn/"},
        {"name": "Socolive", "url": "https://socolive.pro/"},
        {"name": "Xoilac", "url": "https://xoilac.tv/"}
    ],
    replay: "https://youtube.com/fifa"
};

const matches = [];
let matchId = 1;

const dayGroups = html.split('data-day-key="');
for (let i = 1; i < dayGroups.length; i++) {
    const dayKey = dayGroups[i].substring(0, 10);
    const chunk = dayGroups[i];
    
    const matchBlocks = chunk.split('class="doidau');
    for (let j = 1; j < matchBlocks.length; j++) {
        const block = matchBlocks[j];
        
        // home team
        const homeMatch = block.match(/class="doibong doi-1[^>]*>[\s\S]*?<span class="name">([^<]+)<\/span>/);
        const homeFlagMatch = block.match(/class="doibong doi-1[^>]*>[\s\S]*?<img src="([^"]+)"/);
        
        // away team (can be name first or avatar first)
        let awayName = '';
        let awayFlag = '';
        
        const awayBlock = block.substring(block.indexOf('class="doibong doi-2'));
        if (awayBlock) {
            const mName = awayBlock.match(/<span class="name">([^<]+)<\/span>/);
            if (mName) awayName = mName[1].trim();
            const mFlag = awayBlock.match(/<img src="([^"]+)"/);
            if (mFlag) awayFlag = mFlag[1].trim();
        }

        // time and scores
        const timeMatch = block.match(/class="ti-so"[^>]*><span class="so">([\s\S]*?)<\/span><\/div>/);
        let timeStr = timeMatch ? timeMatch[1].replace(/<[^>]*>/g, '').trim() : "00:00";
        
        let homeScore = null;
        let awayScore = null;
        let status = 'upcoming';
        let dateStr = dayKey;

        if (timeStr.includes(':')) {
            dateStr = `${dayKey}T${timeStr}:00+07:00`;
        } else if (timeStr.includes('-')) { // it's a score
            const parts = timeStr.split('-');
            homeScore = parseInt(parts[0].trim().split('(')[0], 10);
            awayScore = parseInt(parts[1].trim().split('(')[0], 10);
            status = 'finished';
            dateStr = `${dayKey}T00:00:00+07:00`; // Time unknown if finished and only score is shown
        }

        // status class check
        if (block.includes('status-live')) status = 'live';
        if (block.includes('status-finish')) status = 'finished';

        // stage tag
        let stage = 'Vòng bảng';
        const stageMatch = block.match(/<span class="item-tag">([^<]+)<\/span>/);
        if (stageMatch) {
            stage = stageMatch[1].trim();
        }

        const homeTeam = homeMatch ? homeMatch[1].trim() : 'Chưa rõ';
        const homeFlag = homeFlagMatch ? homeFlagMatch[1].trim() : '';

        const getLocalFlag = (team) => {
            if (flagDict[team]) return flagDict[team];
            return `img/flags/${team.replace(/\s+/g, '_').replace(/&/g, 'amp')}.png`;
        };

        matches.push({
            id: String(matchId++),
            home_team: homeTeam,
            away_team: awayName || 'Chưa rõ',
            stage: stage,
            status: status,
            home_score: homeScore,
            away_score: awayScore,
            stadium: "TBD",
            links: defaultLinks,
            date: new Date(dateStr).toISOString(),
            home_flag: homeFlag,
            away_flag: awayFlag,
            home_flag_local: getLocalFlag(homeTeam),
            away_flag_local: getLocalFlag(awayName || 'Chưa rõ')
        });
    }
}

fs.writeFileSync(matchesPath, JSON.stringify(matches, null, 2));
console.log(`Rebuilt matches.json with ${matches.length} matches exactly from VNExpress.`);
