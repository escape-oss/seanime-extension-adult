class Provider {
    getSettings() {
        return {
            episodeServers: ["VidStreaming"],
            supportsDub: false,
        };
    }

    async search(opts) {
        // We use the search query provided by Seanime
        const searchUrl = `https://www.hentaicity.com/search?keyword=${encodeURIComponent(opts.query)}`;
        const res = await fetch(searchUrl);
        const html = await res.text();
        const $ = LoadDoc(html); // Seanime provides LoadDoc (cheerio-like)

        const results = [];
        $(".video-item").each((_, el) => {
            const title = $(el).find(".title").text();
            const id = $(el).find("a").attr("href"); // Extract slug
            results.push({
                id: id,
                title: title,
                url: `https://www.hentaicity.com${id}`,
                subOrDub: "sub"
            });
        });
        return results;
    }

    async findEpisodes(id) {
        // Most hentai are OVAs (1 episode) or short series
        // This returns the episode list based on the ID found in search
        return [{
            id: id,
            number: 1,
            title: "Full Video",
            url: `https://www.hentaicity.com${id}`
        }];
    }

    async findEpisodeServer(episode) {
        const res = await fetch(`https://www.hentaicity.com${episode.id}`);
        const html = await res.text();
        
        // This is the tricky part: extracting the actual video file (.m3u8 or .mp4)
        // Usually involves regex to find the 'file' or 'source' link in the script tags
        const videoUrlMatch = html.match(/file: "(.*?)"/);
        const videoUrl = videoUrlMatch ? videoUrlMatch[1] : "";

        return {
            server: "VidStreaming",
            videoSources: [{
                url: videoUrl,
                type: "m3u8", // or "mp4"
                quality: "720p"
            }]
        };
    }
}
