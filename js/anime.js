// Api urls

const infoapi = "https://api.consumet.org/anime/gogoanime/info/";

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
}

//Running functions
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

getAnimeInfo(urlParams.get("anime")).then((data) => {
    RefreshLazyLoader();
    console.log("Anime Info loaded");
});
