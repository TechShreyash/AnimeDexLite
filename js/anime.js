// Api urls

const ProxyApi = "https://proxy.techzbots1.workers.dev/?u=";
const animeapi = "/anime/";
const recommendationsapi = "/recommendations/";

// Api Server Manager

const AvailableServers = ["https://api100.anime-dex.workers.dev"];

function getApiServer() {
    return AvailableServers[Math.floor(Math.random() * AvailableServers.length)];
}

// Usefull functions

async function getJson(path, errCount = 0) {
    const ApiServer = getApiServer();
    let url = ApiServer + path;

    if (errCount > 2) {
        throw `Too many errors while fetching ${url}`;
    }

    if (errCount > 0) {
        // Retry fetch using proxy
        console.log("Retrying fetch using proxy");
        url = ProxyApi + url;
    }

    try {
        const _url_of_site = new URL(window.location.href);
        const referer = _url_of_site.origin;
        const response = await fetch(url, { headers: { referer: referer } });
        return await response.json();
    } catch (errors) {
        console.error(errors);
        return getJson(path, errCount + 1);
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
    setTimeout(() => {
        document.getElementById("poster-img").style.display = "block";
    }, 100);

    const episodes = data["episodes"]

    if (episodes.length == 0) {
        const ephtml = '<a id="no-ep-found" class="ep-btn">No Episodes Found</a>';
        document.getElementById("ep-lower-div").innerHTML = ephtml;
        document.getElementById("ep-divo-outer").style.display = "block";
        document.getElementById("ep-upper-div").style.display = "none";
        document.getElementById('ep-lower-div').style.gridTemplateColumns = "unset";
        document.getElementById('no-ep-found').style.width = "100%";
    }
    else {
        document.getElementById("watch-btn").href =
            "./episode.html?anime_id=" +
            AnimeID +
            "&episode_id=" +
            data["episodes"][0][1];

        console.log("Anime Info loaded");
        RefreshLazyLoader();

        getEpSlider(data["episodes"]);
        getEpList(data["episodes"]);
    }
    getRecommendations(data["name"]);
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
        rechtml += `<a href="./anime.html?anime_id=${title}"><div class="poster la-anime"> <div id="shadow1" class="shadow"> <div class="dubb">${anime["meanScore"]} / 100</div><div class="dubb dubb2">${anime["format"]}</div></div><div id="shadow2" class="shadow"> <img class="lzy_img" src="./static/loading1.gif" data-src="${anime["coverImage"]["large"]}"> </div><div class="la-details"> <h3>${title}</h3> <div id="extra"> <span>${anime["status"]}</span> <span class="dot"></span> <span>EP ${anime["episodes"]}</span> </div></div></div></a>`;
    }
    document.getElementById("latest2").innerHTML = rechtml;

    document.getElementById("ephtmldiv").innerHTML =
        '<a class="ep-btn">Anime Name Not Found On GogoAnime, Try Searching With A Different Name...</a>';

    RefreshLazyLoader();
    console.log("Anime Recommendations loaded");
}

// Function to get episode Slider
async function getEpSlider(total) {
    let ephtml = "";

    try {
        for (let i = 0; i < total.length; i++) {
            const episodeId = total[i][1];
            const epNum = total[i][0].replaceAll("-", ".");
            if (Number(epNum) > 0) {
                ephtml += `<div class=ep-slide><a href="./episode.html?anime_id=${AnimeID}&episode_id=${episodeId}"><img onerror="retryImageLoad(this)" class="lzy_img" src="./static/loading1.gif" data-src=https://thumb.techzbots1.workers.dev/thumb/${episodeId}><div class=ep-title><span>Episode ${epNum}</span></div></a></div>`;
            }
        }
        document.getElementById("ep-slider").innerHTML = ephtml;
        document.getElementById("slider-main").style.display = "block";
        RefreshLazyLoader();
        console.log("Episode Slider loaded");
    } catch (err) {
        console.error(err);
    }
}

// Retry image load
function retryImageLoad(img) {
    const ImageUrl = img.src;
    img.src = "./static/loading1.gif";

    // retry loading after 3 second

    setTimeout(() => {
        if (ImageUrl.includes("?t=")) {
            const t = Number(ImageUrl.split("?t=")[1]) + 1;

            // Retry 10 times
            if (t < 5) {
                img.src = ImageUrl.split("?t=")[0] + "?t=" + String(t);
            }
        } else {
            img.src = ImageUrl + "?t=1";
        }
    }, 3000);
}

// Function to get episode list
let Episode_List = [];

async function getEpList(total) {
    Episode_List = total;
    const TotalEp = total.length;
    let html = "";
    let loadedFirst = false;

    for (let i = 0; i < total.length; i++) {
        const epnum = Number(total[i][0].replaceAll("-", "."));

        if ((epnum - 1) % 100 === 0) {
            let epUpperBtnText;

            if (TotalEp - epnum < 100) {
                epUpperBtnText = `${epnum} - ${TotalEp}`;
                html += `<option class="ep-btn" data-from=${epnum} data-to=${TotalEp}>${epUpperBtnText}</option>`;

                if (!loadedFirst) {
                    // load first episode list
                    getEpLowerList(epnum, TotalEp);
                    loadedFirst = true;
                }
            } else {
                epUpperBtnText = `${epnum} - ${epnum + 99}`;
                html += `<option class="ep-btn" data-from=${epnum} data-to=${epnum + 99
                    }>${epUpperBtnText}</option>`;

                if (!loadedFirst) {
                    // load first episode list
                    getEpLowerList(epnum, epnum + 99);
                    loadedFirst = true;
                }
            }
        }
    }
    document.getElementById("ep-upper-div").innerHTML = html;
    document.getElementById("ep-divo-outer").style.display = "block";
    console.log("Episode list loaded");
}

async function getEpLowerList(start, end) {
    let html = "";
    const eplist = Episode_List.slice(start - 1, end);

    for (let i = 0; i < eplist.length; i++) {
        const episode_id = eplist[i][1];
        const x = eplist[i][1].split("-episode-");
        let epnum = Number(x[1].replaceAll("-", "."));

        let epLowerBtnText = `${epnum}`;

        html += `<a class="ep-btn" href="./episode.html?anime_id=${AnimeID}&episode_id=${episode_id}">${epLowerBtnText}</a>`;
    }
    document.getElementById("ep-lower-div").innerHTML = html;
}

async function episodeSelectChange(elem) {
    var option = elem.options[elem.selectedIndex];
    getEpLowerList(
        parseInt(option.getAttribute("data-from")),
        parseInt(option.getAttribute("data-to"))
    );
}

// Function to get anime recommendations
async function getRecommendations(anime_title) {
    document.getElementsByClassName("sload")[0].style.display = "block";

    anime_title = anime_title.replaceAll(" ", "+");

    let data;
    try {
        data = await getJson(recommendationsapi + anime_title);
    } catch (err) {
        document.getElementById("similar-div").style.display = "none";
        return;
    }

    const recommendations = data["results"];
    let rechtml = "";

    for (i = 0; i < recommendations.length; i++) {
        let anime = recommendations[i];
        let title = anime["title"]["userPreferred"];
        rechtml += `<a href="./anime.html?anime_id=${title}"><div class="poster la-anime"> <div id="shadow1" class="shadow"> <div class="dubb">${anime["meanScore"]} / 100</div><div class="dubb dubb2">${anime["format"]}</div></div><div id="shadow2" class="shadow"> <img class="lzy_img" src="./static/loading1.gif" data-src="${anime["coverImage"]["large"]}"> </div><div class="la-details"> <h3>${title}</h3> <div id="extra"> <span>${anime["status"]}</span> <span class="dot"></span> <span>EP ${anime["episodes"]}</span> </div></div></div></a>`;
    }
    document.getElementById("latest2").innerHTML = rechtml;
    document.getElementsByClassName("sload")[0].style.display = "none";
    console.log("Anime Recommendations loaded");
    RefreshLazyLoader();
}

// Function to scroll episode slider
const windowWidth = window.innerWidth;

function plusSlides(n) {
    if (n === 1) {
        document.getElementById("slider-carousel").scrollLeft += windowWidth / 2;
    } else if (n === -1) {
        document.getElementById("slider-carousel").scrollLeft -= windowWidth / 2;
    }
}

//Running functions

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const AnimeID = urlParams.get("anime_id");
if (AnimeID == null) {
    window.location = "./index.html";
}

async function loadData() {
    try {
        let data = await getJson(animeapi + AnimeID);
        data = data["results"];

        if (data.source == "gogoanime") {
            await loadAnimeFromGogo(data);
        } else if (data.source == "anilist") {
            await loadAnimeFromAnilist(data);
        }
        RefreshLazyLoader();
    } catch (err) {
        document.getElementById("error-page").style.display = "block";
        document.getElementById("load").style.display = "none";
        document.getElementById("main-content").style.display = "none";
        document.getElementById("error-desc").innerHTML = err;
        console.error(err);
    }
}

loadData();
