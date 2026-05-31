const axios = require('axios');
const cheerio = require('cheerio');

async function googleSearch(query) {
    try {
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const $ = cheerio.load(data);
        const results = [];
        
        $('div.g').each((i, el) => {
            const title = $(el).find('h3').text();
            const link = $(el).find('a').attr('href');
            const snippet = $(el).find('.VwiC3b').text();
            if (title && link) {
                results.push({ title, link, snippet });
            }
        });
        
        return results.slice(0, 10);
    } catch (err) {
        throw new Error('Google search failed: ' + err.message);
    }
}

async function lyrics(title) {
    try {
        const { data } = await axios.get(
            `https://api.lyrics.ovh/v1/${encodeURIComponent(title.split('-')[0] || title)}/${encodeURIComponent(title.split('-')[1] || title)}`
        );
        return data.lyrics || 'Lyrics not found';
    } catch {
        return 'Lyrics not found for: ' + title;
    }
}

async function weather(city) {
    try {
        const { data } = await axios.get(
            `https://wttr.in/${encodeURIComponent(city)}?format=j1`
        );
        return data;
    } catch (err) {
        throw new Error('Weather fetch failed: ' + err.message);
    }
}

async function shortenUrl(url) {
    try {
        const { data } = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
        return data;
    } catch (err) {
        throw new Error('URL shortening failed: ' + err.message);
    }
}

async function wikipedia(query) {
    try {
        const { data } = await axios.get(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
        );
        return {
            title: data.title,
            extract: data.extract,
            image: data.thumbnail?.source,
            url: data.content_urls?.desktop?.page
        };
    } catch (err) {
        throw new Error('Wikipedia search failed: ' + err.message);
    }
}

module.exports = {
    googleSearch,
    lyrics,
    weather,
    shortenUrl,
    wikipedia
};