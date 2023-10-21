// Api urls

const infoapi = "https://techzapi2.vercel.app/anime/gogoanime/info/";
const epapi = "https://api.techzbots1.workers.dev/gogo/episodes/";
const searchapi = "https://techzapi2.vercel.app/meta/anilist/";
const anilistinfoapi = "https://techzapi2.vercel.app/meta/anilist/info/";
const gogosearchapi = "https://techzapi2.vercel.app/anime/gogoanime/";

// Usefull functions

async function getJson(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (errors) {
        console.error(errors);
    }
}

function getGenreHtml(genres) {
    let ghtml = "";
    for (let i = 0; i < genres.length; i++) {
        ghtml += `<a>${genres[i]}</a>`;
    }
    return ghtml;
}

async function RefreshLazyLoader() {
    const imageObserver = new IntersectionObserver((entries, imgObserver) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const lazyImage = entry.target;
                lazyImage.src = lazyImage.dataset.src;
            }
        });
    });
    const arr = document.querySelectorAll("img.lzy_img");
    arr.forEach((v) => {
        imageObserver.observe(v);
    });
}

function getAnilistTitle(title) {
    if (title["userPreferred"] != null) {
        return title["userPreferred"];
    } else if (title["english"] != null) {
        return title["english"];
    } else if (title["romaji"] != null) {
        return title["romaji"];
    } else if (title["native"] != null) {
        return title["native"];
    } else {
        return "Unknown";
    }
}

function getAnilistOtherTitle(title, current) {
    if (title["userPreferred"] != null && title["userPreferred"] != current) {
        return title["userPreferred"];
    } else if (title["english"] != null && title["english"] != current) {
        return title["english"];
    } else if (title["romaji"] != null && title["romaji"] != current) {
        return title["romaji"];
    } else if (title["native"] != null && title["native"] != current) {
        return title["native"];
    } else {
        return "Unknown";
    }
}

// Function to get anime info from gogo id
async function getAnimeInfo(anime_id) {
    try {
        const data = await getJson(infoapi + anime_id);

        document.documentElement.innerHTML = document.documentElement.innerHTML
            .replaceAll("TITLE", data["title"])
            .replaceAll("IMG", data["image"])
            .replaceAll("LANG", data["subOrDub"].toUpperCase())
            .replaceAll("TYPE", data["type"])
            .replaceAll("URL", window.location)
            .replaceAll("SYNOPSIS", data["description"])
            .replaceAll("OTHER", data["otherName"])
            .replaceAll("TOTAL", data["totalEpisodes"])
            .replaceAll("YEAR", data["releaseDate"])
            .replaceAll("STATUS", data["status"])
            .replaceAll("GENERES", getGenreHtml(data["genres"]));

        document.getElementById("main-content").style.display = "block";
        document.getElementById("load").style.display = "none";
        const anime_title = data["title"];

        getEpList(anime_id).then((data) => {
            console.log("Episode list loaded");

            getRecommendations(anime_title).then((data) => {
                RefreshLazyLoader();
                console.log("Anime Recommendations loaded");
            });
        });
    } catch (e) {
        await getSearchGogoAnimeInfo(anime_id);
    }
}
// Function to get anime info from gogo search
async function getSearchGogoAnimeInfo(anime_title) {
    try {
        let data = await getJson(gogosearchapi + anime_title);
        const anime_id = data["results"][0]["id"];

        data = await getJson(infoapi + anime_id);

        document.documentElement.innerHTML = document.documentElement.innerHTML
            .replaceAll("TITLE", data["title"])
            .replaceAll("IMG", data["image"])
            .replaceAll("LANG", data["subOrDub"].toUpperCase())
            .replaceAll("TYPE", data["type"])
            .replaceAll("URL", window.location)
            .replaceAll("SYNOPSIS", data["description"])
            .replaceAll("OTHER", data["otherName"])
            .replaceAll("TOTAL", data["totalEpisodes"])
            .replaceAll("YEAR", data["releaseDate"])
            .replaceAll("STATUS", data["status"])
            .replaceAll("GENERES", getGenreHtml(data["genres"]));

        document.getElementById("main-content").style.display = "block";
        document.getElementById("load").style.display = "none";

        getEpList(anime_id).then((data) => {
            console.log("Episode list loaded");

            getRecommendations(anime_title).then((data) => {
                RefreshLazyLoader();
                console.log("Anime Recommendations loaded");
            });
        });
    } catch (e) {
        await getAnilistAnimeInfo(anime_title);
    }
}
// Function to get anime info from anilist search
async function getAnilistAnimeInfo(anime_title) {
    try {
        let data = await getJson(searchapi + anime_title);
        const anime_id = data["results"][0]["id"];
        data = await getJson(anilistinfoapi + anime_id);

        const title = getAnilistTitle(data["title"]);

        document.documentElement.innerHTML = document.documentElement.innerHTML
            .replaceAll("TITLE", title)
            .replaceAll("IMG", data["image"])
            .replaceAll("LANG", data["subOrDub"].toUpperCase())
            .replaceAll("TYPE", data["type"])
            .replaceAll("URL", window.location)
            .replaceAll("SYNOPSIS", data["description"])
            .replaceAll("OTHER", getAnilistOtherTitle(data["title"], title))
            .replaceAll("TOTAL", data["totalEpisodes"])
            .replaceAll("YEAR", data["releaseDate"])
            .replaceAll("STATUS", data["status"])
            .replaceAll("GENERES", getGenreHtml(data["genres"]));

        document.getElementById("main-content").style.display = "block";
        document.getElementById("load").style.display = "none";

        const recommendations = data["recommendations"];
        let rechtml = "";

        for (i = 0; i < recommendations.length; i++) {
            let anime = recommendations[i];
            let title = anime["title"]["userPreferred"];
            rechtml += `<a href="./anime.html?anime=${title}"><div class="poster la-anime"> <div id="shadow1" class="shadow"> <div class="dubb">${anime["rating"]}</div><div class="dubb dubb2">${anime["type"]}</div></div><div id="shadow2" class="shadow"> <img class="lzy_img" src="https://cdn.jsdelivr.net/gh/TechShreyash/AnimeDex@main/static/img/loading.gif" data-src="${anime["image"]}"> </div><div class="la-details"> <h3>${title}</h3> <div id="extra"> <span>${anime["status"]}</span> <span class="dot"></span> <span>${anime["episodes"]}</span> </div></div></div></a>`;
        }
        document.getElementById("latest2").innerHTML = rechtml;

        document.getElementById("ephtmldiv").innerHTML =
            '<a class="ep-btn">Anime Name Not Found On GogoAnime, Try Searching With A Different Name...</a>';
    } catch (e) {
        console.log(e);
    }
}

// Function to get episode list
async function getEpList(anime_id) {
    const data = await getJson(epapi + anime_id);
    const total = Number(data["total"]);
    let ephtml = "";

    for (let i = 0; i < total; i++) {
        ephtml += `<a class="ep-btn" href="./episode.html?anime=${anime_id}&episode=${i + 1
            }">${i + 1}</a>`;
    }
    document.getElementById("ephtmldiv").innerHTML = ephtml;
}

// Function to get anime recommendations
async function getRecommendations(anime_title) {
    let data = await getJson(searchapi + anime_title);
    const anime_id = data["results"][0]["id"];

    data = await getJson(anilistinfoapi + anime_id);
    const recommendations = data["recommendations"];
    let rechtml = "";

    for (i = 0; i < recommendations.length; i++) {
        let anime = recommendations[i];
        let title = anime["title"]["userPreferred"];
        rechtml += `<a href="./anime.html?anime=${title}"><div class="poster la-anime"> <div id="shadow1" class="shadow"> <div class="dubb">${anime["rating"]}</div><div class="dubb dubb2">${anime["type"]}</div></div><div id="shadow2" class="shadow"> <img class="lzy_img" src="https://cdn.jsdelivr.net/gh/TechShreyash/AnimeDex@main/static/img/loading.gif" data-src="${anime["image"]}"> </div><div class="la-details"> <h3>${title}</h3> <div id="extra"> <span>${anime["status"]}</span> <span class="dot"></span> <span>${anime["episodes"]}</span> </div></div></div></a>`;
    }
    document.getElementById("latest2").innerHTML = rechtml;
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if (urlParams.get("anime") == null) {
    window.location = "./index.html";
}

//Running functions
getAnimeInfo(urlParams.get("anime")).then((anime_title) => {
    RefreshLazyLoader();
    console.log("Anime Info loaded");
});
