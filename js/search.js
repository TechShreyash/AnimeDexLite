// Api urls

const ProxyApi = "https://proxy.techzbots1.workers.dev/?u="
const searchapi = "/search/";

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

function sentenceCase(str) {
    if (str === null || str === "") return false;
    else str = str.toString();

    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

let hasNextPage = true;

// Search function to get anime from gogo
async function SearchAnime(query, page = 1) {
    const data = await getJson(searchapi + query + "?page=" + page);

    const animes = data["results"];
    const contentdiv = document.getElementById("latest2");
    const loader = document.getElementById("load");
    let html = "";

    if (animes.length == 0) {
        throw "No results found";
    }

    for (let i = 0; i < animes.length; i++) {
        const anime = animes[i];
        if (anime["title"].toLowerCase().includes("dub")) {
            anime["subOrDub"] = "DUB";
        } else {
            anime["subOrDub"] = "SUB";
        }

        html += `<a href="./anime.html?anime_id=${anime["id"]
            }"><div class="poster la-anime"> <div id="shadow1" class="shadow"> <div class="dubb">${anime[
                "subOrDub"
            ].toUpperCase()}</div></div><div id="shadow2" class="shadow"> <img class="lzy_img" src="./static/loading1.gif" data-src="${anime["img"]
            }"> </div><div class="la-details"> <h3>${sentenceCase(
                anime["title"]
            )}</h3> <div id="extra"> <span>${anime["releaseDate"]
            }</span> </div></div></div></a>`;
    }
    contentdiv.innerHTML += html;

    loader.style.display = "none";
    contentdiv.style.display = "block";

    return data["hasNextPage"];
}

const params = new URLSearchParams(window.location.search);
const query = params.get("query");
let page = 1;

if (query == null) {
    window.location.replace("./index.html");
}

document.getElementById("latest").innerHTML = `Search Results: ${query}`;


// Load more results on scroll
window.addEventListener("scroll", () => {
    if (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight
    ) {
        if (hasNextPage == true) {
            SearchAnime(query, page).then((data) => {
                hasNextPage = data;
                page += 1;
                RefreshLazyLoader();
                console.log("Search animes loaded");
            });
        }
    }
});

async function loadData() {
    try {
        const data = await SearchAnime(query, page)
        hasNextPage = data;
        page += 1;
        RefreshLazyLoader();
        console.log("Search animes loaded");

    } catch (err) {
        document.getElementById("main-section").style.display = "none";
        document.getElementById("error-page").style.display = "block";
        document.getElementById("error-desc").innerHTML = err;
        console.error(err);
    }
}

loadData();
