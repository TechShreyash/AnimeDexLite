async function getEpisode() {}

async function playVideo(url) {
    const video = document.querySelector("video");

    const defaultOptions = {
        title: "{{ title }}",
    };

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(source);
        hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
            const availableQualities = hls.levels.map((l) => l.height);

            defaultOptions.quality = {
                default: availableQualities[0],
                options: availableQualities,
                forced: true,
                onChange: (e) => updateQuality(e),
            };
            const player = new Plyr(video, defaultOptions);
        });
        hls.attachMedia(video);
        window.hls = hls;
    } else {
        const player = new Plyr(video, defaultOptions);
    }
}
function updateQuality(newQuality) {
    window.hls.levels.forEach((level, levelIndex) => {
        if (level.height === newQuality) {
            window.hls.currentLevel = levelIndex;
        }
    });
}
