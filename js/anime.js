// Api urls

const infoapi = "https://api.consumet.org/anime/gogoanime/info/";
const epapi = "https://api.techzbots1.workers.dev/gogo/episodes/";
const searchapi = "https://api.consumet.org/meta/anilist/";
const anilistinfoapi = "https://api.consumet.org/meta/anilist/info/";

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

// Function to get anime info
async function getAnimeInfo(anime_id) {
    try {
        let data = await getJson(infoapi + anime_id);

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
        return data["title"];
    } catch (e) {
        underConstruction();
    }
}

async function getEpList(anime_id) {
    let data = await getJson(epapi + anime_id);
    let total = Number(data["total"]);
    let ephtml = "";

    for (let i = 0; i < total; i++) {
        ephtml += `<a class="ep-btn" href="/episode?anime=${anime_id}&ep=${
            i + 1
        }">${i + 1}</a>`;
    }
    document.getElementById("ephtmldiv").innerHTML = ephtml;
}

async function getRecommendations(anime_title) {
    let data = await getJson(searchapi + anime_title);
    console.log(data);
    let anime_id = data["results"][0]["id"];

    data = await getJson(anilistinfoapi + anime_id);
    let recommendations = data["recommendations"];
    let rechtml = "";

    for (i = 0; i < recommendations.length; i++) {
        let anime = recommendations[i];
        let title = anime["title"]["userPreferred"];
        rechtml += `<a href="/anime.html?anime=${title}"><div class="poster la-anime"> <div id="shadow1" class="shadow"> <div class="dubb">${anime["rating"]}</div><div class="dubb dubb2">${anime["type"]}</div></div><div id="shadow2" class="shadow"> <img class="lzy_img" src="https://cdn.jsdelivr.net/gh/TechShreyash/AnimeDex@main/static/img/loading.gif" data-src="${anime["image"]}"> </div><div class="la-details"> <h3>${title}</h3> <div id="extra"> <span>${anime["status"]}</span> <span class="dot"></span> <span>${anime["episodes"]}</span> </div></div></div></a>`;
    }
    document.getElementById("latest2").innerHTML = rechtml;
}

//Running functions
let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);

getAnimeInfo(urlParams.get("anime")).then((anime_title) => {
    RefreshLazyLoader();
    console.log("Anime Info loaded");

    getEpList(urlParams.get("anime")).then((data) => {
        console.log("Episode list loaded");

        getRecommendations(anime_title).then((data) => {
            RefreshLazyLoader();
            console.log("Anime Recommendations loaded");
        });
    });
});

function underConstruction() {
    document.documentElement.innerHTML =
        '<h1>Under Construction !!!</h1><h3>Some features may not work properly...</h3><a href="/">Click To Go Back To Home</a>';
}
