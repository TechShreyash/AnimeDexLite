const searchapi = "https://techzapi2.vercel.app/anime/gogoanime/";

// Usefull functions

async function getJson(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (errors) {
        console.error(errors);
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

    for (let i = 0; i < animes.length; i++) {
        const anime = animes[i];
        html += `<a href="./anime.html?anime=${anime["id"]}"><div class="poster la-anime"> <div id="shadow1" class="shadow"> <div class="dubb">${anime["subOrDub"].toUpperCase()}</div></div><div id="shadow2" class="shadow"> <img class="lzy_img" src="https://cdn.jsdelivr.net/gh/TechShreyash/AnimeDex@main/static/img/loading.gif" data-src="${anime["image"]}"> </div><div class="la-details"> <h3>${sentenceCase(anime["title"])}</h3> <div id="extra"> <span>${anime["releaseDate"]}</span> </div></div></div></a>`;
    }
    contentdiv.innerHTML += html;

    loader.style.display = "none";
    contentdiv.style.display = "block";

    return data["hasNextPage"];
}

const params = new URLSearchParams(window.location.search);
const query = params.get("query");
let page = 1

if (query == null) {
    window.location.replace("./index.html");
}

document.getElementById('latest').innerHTML = `Search Results: ${query}`;

SearchAnime(query, page).then((data) => {
    hasNextPage = data;
    page += 1;
    RefreshLazyLoader();
    console.log("Search animes loaded");
});

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
