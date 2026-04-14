class Provider {
    getSettings() {
        return {
            episodeServers: ['Primary'],
            supportsDub: false
        };
    }

    async search(opts) {
        const res = await fetch(`https://hentai.tv/search/?query=${encodeURIComponent(opts.query)}`);
        const html = await res.text();
        const $ = LoadDoc(html);
        const results = [];

        $('.video-item').each((_, el) => {
            const a = $(el).find('a').first();
            const title = $(el).find('.title').text().trim();
            const href = a.attr('href');
            
            if (href) {
                results.push({
                    id: href,
                    title: title,
                    url: href.startsWith('http') ? href : `https://hentai.tv${href}`,
                    subOrDub: 'sub'
                });
            }
        });
        return results;
    }

    async findEpisodes(id) {
        const url = id.startsWith('http') ? id : `https://hentai.tv${id}`;
        return [{
            id: id,
            number: 1,
            title: 'Full Movie',
            url: url
        }];
    }

    async findEpisodeServer(episode) {
        const res = await fetch(episode.url);
        const html = await res.text();
        
        const videoMatch = html.match(/<source.*?src=["'](.*?)["']/i) || 
                           html.match(/file["']?\s*:\s*["'](.*?)["']/i);
        
        const videoUrl = videoMatch ? videoMatch[1] : '';

        return {
            server: 'Primary',
            headers: {
                'Referer': 'https://hentai.tv/',
                'User-Agent': 'Mozilla/5.0'
            },
            videoSources: [{
                url: videoUrl,
                type: videoUrl.includes('m3u8') ? 'm3u8' : 'mp4',
                quality: '720p'
            }]
        };
    }
}
