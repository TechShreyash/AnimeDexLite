// Api urls

const ProxyApi = "https://proxy.techzbots1.workers.dev/?u="
const animeapi = "/anime/";
const recommendationsapi = "/recommendations/";

// Api Server Manager

const AvailableServers = ['https://api1.anime-dex.workers.dev', 'https://api2.anime-dex.workers.dev', 'https://api3.anime-dex.workers.dev']

function getApiServer() {
    return AvailableServers[Math.floor(Math.random() * AvailableServers.length)]
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
        const response = await fetch(url);
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
    document.getElementById("watch-btn").href =
        "./episode.html?anime=" +
        data["episodes"][0][1].split("-episode-")[0] +
        "&episode=" +
        data["episodes"][0][0];
    const anime_title = data["name"];

    console.log("Anime Info loaded");
    RefreshLazyLoader();

    await getEpSlider(data["episodes"])
    await getEpList(data["episodes"])
    await getRecommendations(anime_title)
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
        rechtml += `<a href="./anime.html?anime=${title}"><div class="poster la-anime"> <div id="shadow1" class="shadow"> <div class="dubb">${anime["meanScore"]} / 100</div><div class="dubb dubb2">${anime["format"]}</div></div><div id="shadow2" class="shadow"> <img class="lzy_img" src="./static/loading1.gif" data-src="${anime["coverImage"]["large"]}"> </div><div class="la-details"> <h3>${title}</h3> <div id="extra"> <span>${anime["status"]}</span> <span class="dot"></span> <span>EP ${anime["episodes"]}</span> </div></div></div></a>`;
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

    for (let i = 0; i < total.length; i++) {
        let episodeId = total[i][1]
        let epNum = total[i][0]
        let x = episodeId.split("-episode-");
        ephtml += `<div class=ep-slide><a href="./episode.html?anime=${x[0]}&episode=${x[1]}"><img onerror="retryImageLoad(this)" class="lzy_img" src="./static/loading1.gif" data-src=https://thumb.anime-dex.workers.dev/thumb/${episodeId}><div class=ep-title><span>Episode ${epNum}</span></div></a></div>`;
    }
    document.getElementById("ep-slider").innerHTML = ephtml;
    document.getElementById("slider-main").style.display = "block";
    RefreshLazyLoader();
    console.log("Episode Slider loaded");
}

// Retry image load
function retryImageLoad(img) {
    const ImageUrl = img.src
    img.src = "./static/loading1.gif";

    // load after 3 second

    setTimeout(() => {

        if (ImageUrl.includes("?t=")) {
            const t = Number(ImageUrl.split("?t=")[1]) + 1;

            // Retry 10 times
            if (t < 5) {
                img.src = ImageUrl.split("?t=")[0] + "?t=" + String(t);
            }
        }
        else {
            img.src = ImageUrl + "?t=1";
        }

    }, 3000);

}

// Function to get episode list
async function getEpList(total) {
    const TotalEp = total.length;
    let html = "";
    let loadedFirst = false;

    for (let i = 0; i < total.length; i++) {
        const x = total[i][1].split("-episode-");
        const animeid = x[0];
        const epnum = Number(x[1].replaceAll('-', '.'));

        if (((epnum - 1) % 100) === 0) {
            let epUpperBtnText;
            if ((TotalEp - epnum) < 100) {
                epUpperBtnText = `${epnum} - ${TotalEp}`;
                html += `<option class="ep-btn" data-from=${epnum} data-to=${TotalEp} data-id=${animeid}>${epUpperBtnText}</option>`;

                if (!loadedFirst) {
                    getEpLowerList(epnum, TotalEp, animeid);
                    loadedFirst = true;
                }
            } else {
                epUpperBtnText = `${epnum} - ${epnum + 99}`;
                html += `<option class="ep-btn" data-from=${epnum} data-to=${epnum + 99} data-id=${animeid}>${epUpperBtnText}</option>`;

                if (!loadedFirst) {
                    getEpLowerList(epnum, epnum + 99, animeid);
                    loadedFirst = true;
                }
            }
        }
    }
    document.getElementById('ep-upper-div').innerHTML = html;
    console.log("Episode list loaded");
}

async function getEpLowerList(start, end, animeid) {
    let html = "";
    for (let i = start; i <= end; i++) {
        let epLowerBtnText;
        if (i === end) {
            epLowerBtnText = `${i}`;
            html += `<a class="ep-btn" href="./episode.html?anime=${animeid}&episode=${i}">${epLowerBtnText}</a>`;
        } else {
            epLowerBtnText = `${i}`;
            html += `<a class="ep-btn" href="./episode.html?anime=${animeid}&episode=${i}">${epLowerBtnText}</a>`;
        }
    }
    document.getElementById('ep-lower-div').innerHTML = html;
}

async function episodeSelectChange(elem){
    var option = elem.options[elem.selectedIndex];
    getEpLowerList(parseInt(option.getAttribute('data-from')),parseInt(option.getAttribute('data-to')),option.getAttribute('data-id'))
}

// Function to get anime recommendations
async function getRecommendations(anime_title) {
    document.getElementsByClassName("sload")[0].style.display = 'block';

    anime_title = anime_title.replaceAll(" ", "+");

    let data;
    try {
        data = await getJson(recommendationsapi + anime_title);
    }
    catch (err) {
        document.getElementById('similar-div').style.display = 'none';
        return
    }

    const recommendations = data["results"];
    let rechtml = "";

    for (i = 0; i < recommendations.length; i++) {
        let anime = recommendations[i];
        let title = anime["title"]["userPreferred"];
        rechtml += `<a href="./anime.html?anime=${title}"><div class="poster la-anime"> <div id="shadow1" class="shadow"> <div class="dubb">${anime["meanScore"]} / 100</div><div class="dubb dubb2">${anime["format"]}</div></div><div id="shadow2" class="shadow"> <img class="lzy_img" src="./static/loading1.gif" data-src="${anime["coverImage"]["large"]}"> </div><div class="la-details"> <h3>${title}</h3> <div id="extra"> <span>${anime["status"]}</span> <span class="dot"></span> <span>EP ${anime["episodes"]}</span> </div></div></div></a>`;
    }
    document.getElementById("latest2").innerHTML = rechtml;
    document.getElementsByClassName("sload")[0].style.display = 'none';
    console.log("Anime Recommendations loaded");
    RefreshLazyLoader();
}

// Function to scroll episode slider
function plusSlides(n) {
    if (n === 1) {
        document.getElementById("slider-carousel").scrollLeft += 600;
    }
    else if (n === -1) {
        document.getElementById("slider-carousel").scrollLeft -= 600;
    }
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if (urlParams.get("anime") == null) {
    window.location = "./index.html";
}

//Running functions

async function loadData() {
    try {
        let data = await getJson(animeapi + urlParams.get("anime"));
        data = data["results"];

        if (data.source == "gogoanime") {
            loadAnimeFromGogo(data);
        } else if (data.source == "anilist") {
            loadAnimeFromAnilist(data);
        }
        RefreshLazyLoader();
    } catch (err) {
        document.getElementById("error-page").style.display = "block";
        document.getElementById("load").style.display = "none";
        document.getElementById("error-desc").innerHTML = err;
        console.error(err);
    }
}

loadData();
