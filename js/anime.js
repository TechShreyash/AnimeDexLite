// Api urls

const proxy = "https://proxy.techzbots1.workers.dev/?u=";
const animeapi = "https://api.anime-dex.workers.dev/anime/";
const recommendationsapi = "https://api.anime-dex.workers.dev/recommendations/";

// Usefull functions

async function getJson(url, errCount = 0) {
    if (errCount > 5) {
        return;
    }

    try {
        const response = await fetch(url);
        return await response.json();
    } catch (errors) {
        console.error(errors);
        return getJson(url, errCount + 1);
    }
}

function getGenreHtml(genres) {
    let ghtml = "";
    for (let i = 0; i < genres.length; i++) {
        ghtml += `<a>${genres[i].trim()}</a>`;
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
async function loadAnimeFromGogo(data) {
    document.documentElement.innerHTML = document.documentElement.innerHTML
        .replaceAll("TITLE", data["name"])
        .replaceAll("IMG", data["image"])
        .replaceAll("LANG", "EP " + data["episodes"].length)
        .replaceAll("TYPE", data["type"])
        .replaceAll("URL", window.location)
        .replaceAll("SYNOPSIS", data["plot_summary"])
        .replaceAll("OTHER", data["other_name"])
        .replaceAll("TOTAL", data["episodes"].length)
        .replaceAll("YEAR", data["released"])
        .replaceAll("STATUS", data["status"])
        .replaceAll("GENERES", getGenreHtml(data["genre"].split(",")));

    document.getElementById("main-content").style.display = "block";
    document.getElementById("load").style.display = "none";
    document.getElementById("watch-btn").href =
        "./episode.html?anime=" +
        data["episodes"][0][1].split("-episode-")[0] +
        "&episode=" +
        data["episodes"][0][0];
    const anime_title = data["title"];

    console.log("Anime Info loaded");
    RefreshLazyLoader();

    getEpList(data["id"], data["episodes"]).then((data) => {
        console.log("Episode list loaded");

        getRecommendations(anime_title).then((data) => {
            RefreshLazyLoader();
            console.log("Anime Recommendations loaded");
        });
    });
}

// Function to get anime info from anilist search
async function loadAnimeFromAnilist(data) {
    const title = getAnilistTitle(data["title"]);

    document.documentElement.innerHTML = document.documentElement.innerHTML
        .replaceAll("TITLE", title)
        .replaceAll("IMG", data["coverImage"]["large"])
        .replaceAll("LANG", "EP " + data["episodes"])
        .replaceAll("TYPE", data["format"])
        .replaceAll("URL", window.location)
        .replaceAll("SYNOPSIS", data["description"])
        .replaceAll("OTHER", getAnilistOtherTitle(data["title"], title))
        .replaceAll("TOTAL", "EP " + data["episodes"])
        .replaceAll("YEAR", data["seasonYear"])
        .replaceAll("STATUS", data["status"])
        .replaceAll("GENERES", getGenreHtml(data["genres"]));

    document.getElementById("main-content").style.display = "block";
    document.getElementById("load").style.display = "none";

    console.log("Anime Info loaded");

    const recommendations = data["recommendations"];
    let rechtml = "";

    for (i = 0; i < recommendations.length; i++) {
        let anime = recommendations[i];
        let title = anime["title"]["userPreferred"];
        rechtml += `<a href="./anime.html?anime=${title}"><div class="poster la-anime"> <div id="shadow1" class="shadow"> <div class="dubb">${anime["meanScore"]} / 100</div><div class="dubb dubb2">${anime["format"]}</div></div><div id="shadow2" class="shadow"> <img class="lzy_img" src="https://cdn.jsdelivr.net/gh/TechShreyash/AnimeDex@main/static/img/loading.gif" data-src="${anime["coverImage"]["large"]}"> </div><div class="la-details"> <h3>${title}</h3> <div id="extra"> <span>${anime["status"]}</span> <span class="dot"></span> <span>EP ${anime["episodes"]}</span> </div></div></div></a>`;
    }
    document.getElementById("latest2").innerHTML = rechtml;

    document.getElementById("ephtmldiv").innerHTML =
        '<a class="ep-btn">Anime Name Not Found On GogoAnime, Try Searching With A Different Name...</a>';

    RefreshLazyLoader();
    console.log("Anime Recommendations loaded");
}

// Function to get episode list
async function getEpList(anime_id, total) {
    let ephtml = "";

    for (let i = 0; i < total.length; i++) {
        x = total[i][1].split("-episode-");
        ephtml += `<a class="ep-btn" href="./episode.html?anime=${x[0]}&episode=${x[1]}">${x[1]}</a>`;
    }
    document.getElementById("ephtmldiv").innerHTML = ephtml;
}

// Function to get anime recommendations
async function getRecommendations(anime_title) {
    const data = await getJson(proxy + recommendationsapi + anime_title);
    const recommendations = data["results"];
    let rechtml = "";

    for (i = 0; i < recommendations.length; i++) {
        let anime = recommendations[i];
        let title = anime["title"]["userPreferred"];
        rechtml += `<a href="./anime.html?anime=${title}"><div class="poster la-anime"> <div id="shadow1" class="shadow"> <div class="dubb">${anime["meanScore"]} / 100</div><div class="dubb dubb2">${anime["format"]}</div></div><div id="shadow2" class="shadow"> <img class="lzy_img" src="https://cdn.jsdelivr.net/gh/TechShreyash/AnimeDex@main/static/img/loading.gif" data-src="${anime["coverImage"]["large"]}"> </div><div class="la-details"> <h3>${title}</h3> <div id="extra"> <span>${anime["status"]}</span> <span class="dot"></span> <span>EP ${anime["episodes"]}</span> </div></div></div></a>`;
    }
    document.getElementById("latest2").innerHTML = rechtml;
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if (urlParams.get("anime") == null) {
    window.location = "./index.html";
}

//Running functions
getJson(proxy + animeapi + urlParams.get("anime")).then((data) => {
    data = data["results"];

    if (data.source == "gogoanime") {
        loadAnimeFromGogo(data);
    } else if (data.source == "anilist") {
        loadAnimeFromAnilist(data);
    }
});
