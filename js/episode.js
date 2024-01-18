const proxy = "https://proxy.techzbots1.workers.dev/?u=";
const animeapi = "https://api.anime-dex.workers.dev/anime/";
const episodeapi = "https://api.anime-dex.workers.dev/episode/";
const dlapi = "https://api.anime-dex.workers.dev/download/";

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

function sentenceCase(str) {
    if (str === null || str === "") return false;
    else str = str.toString();

    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to get m3u8 url of episode
async function loadVideo(name, stream) {
    try {
        document.getElementById("ep-name").innerHTML = name;
        const serversbtn = document.getElementById("serversbtn");

        let url = stream["sources"][0]["file"];
        serversbtn.innerHTML += `<div class="sitem"> <a class="sobtn sactive" onclick="selectServer(this)" data-value="./embed.html?url=${url}">AD Free 1</a> </div>`;
        document.getElementsByClassName("sactive")[0].click();

        url = stream["sources_bk"][0]["file"];
        serversbtn.innerHTML += `<div class="sitem"> <a class="sobtn" onclick="selectServer(this)" data-value="./embed.html?url=${url}">AD Free 2</a> </div>`;

        return true;
    } catch (err) {
        return false;
    }
}

// Function to available servers
async function loadServers(servers, success = true) {
    console.log(servers);
    const serversbtn = document.getElementById("serversbtn");

    html = "";

    for (let [key, value] of Object.entries(servers)) {
        key = capitalizeFirstLetter(key);
        html += `<div class="sitem"> <a class="sobtn" onclick="selectServer(this)" data-value="${value}">${key}</a> </div>`;
    }
    serversbtn.innerHTML += html;

    if (success == false) {
        document.getElementsByClassName("sobtn")[0].click();
    }
}

// Function to select server
function selectServer(btn) {
    const buttons = document.getElementsByClassName("sobtn");
    const iframe = document.getElementById("AnimeDexFrame");
    iframe.src = btn.getAttribute("data-value");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].className = "sobtn";
    }
    btn.className = "sobtn sactive";
}

// Function to show download links
function showDownload() {
    document.getElementById("showdl").style.display = "none";
    document.getElementById("dldiv").classList.toggle("show");

    getDownloadLinks(urlParams.get("anime"), urlParams.get("episode")).then(
        () => {
            console.log("Download links loaded");
        }
    );
}

// Function to get episode list
async function getEpList(anime_id) {
    const data = (await getJson(proxy + animeapi + anime_id))["results"];
    const eplist = data["episodes"];
    let ephtml = "";

    for (let i = 0; i < eplist.length; i++) {
        anime_id = eplist[i][1].split("-episode-")[0];
        ep_num = eplist[i][0];
        ephtml += `<a class="ep-btn" href="./episode.html?anime=${anime_id}&episode=${ep_num}">${ep_num}</a>`;
    }
    document.getElementById("ephtmldiv").innerHTML = ephtml;
    return eplist;
}

// Function to get selector btn
async function getSelectorBtn(url, current, totalep) {
    current = Number(current);
    totalep = Number(totalep);
    let html = "";

    if (totalep < 2) {
        html = "";
    } else {
        if (current == 1) {
            html = `<a class="btns" href="${
                url + (current + 1)
            }"><button class="sbtn inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg ">Episode 2<i style="margin-left:10px; margin-right: auto;" class="fa fa-arrow-circle-right"></i></button></a>`;
        } else if (current == totalep) {
            html = `<a class="btns" href="${
                url + (totalep - 1)
            }"><button class="sbtn inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg "><i class="fa fa-arrow-circle-left"></i>Episode ${
                totalep - 1
            }</button></a>`;
        } else {
            html = `<a class="btns" href="${
                url + (current - 1)
            }"><button class="sbtn inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg "><i class="fa fa-arrow-circle-left"></i>Episode ${
                current - 1
            }</button></a>`;
            html += `<a class="btns" href="${
                url + (current + 1)
            }"><button class="sbtn inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg ">Episode ${
                current + 1
            }<i style="margin-left:10px; margin-right: auto;" class="fa fa-arrow-circle-right"></i></button></a>`;
        }

        document.getElementsByClassName("selector")[0].innerHTML = html;
    }
}

// Function to get download links
async function getDownloadLinks(anime, episode) {
    const data = (await getJson(proxy + dlapi + anime + "-episode-" + episode))[
        "results"
    ];
    let html = "";

    for (const [key, value] of Object.entries(data)) {
        const quality = key.split("x")[1];
        const url = value;
        html += `<div class="sitem"> <a class="sobtn download" target="_blank" href="${url}"><i class="fa fa-download"></i>${quality}p</a> </div>`;
    }
    document.getElementById("dllinks").innerHTML = html;
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if (urlParams.get("anime") == null || urlParams.get("episode") == null) {
    window.location = "./index.html";
}

// Running functions

async function loadEpisodeData(data) {
    data = data["results"];
    const name = data["name"];
    const episodes = data["episodes"];
    const stream = data["stream"];
    const servers = data["servers"];

    document.documentElement.innerHTML =
        document.documentElement.innerHTML.replaceAll("{{ title }}", name);

    try {
        loadVideo(name, stream).then(() => {
            console.log("Video loaded");
            loadServers(servers, true).then(() => {
                console.log("Servers loaded");
            });
        });
    } catch (err) {
        loadServers(servers, false).then(() => {
            console.log("Servers loaded");
        });
    }
}

getJson(
    proxy +
        episodeapi +
        urlParams.get("anime") +
        "-episode-" +
        urlParams.get("episode")
).then((data) => {
    loadEpisodeData(data).then(() => {
        getEpList(urlParams.get("anime")).then((eplist) => {
            console.log("Episode list loaded");

            getSelectorBtn(
                "./episode.html?anime=" + urlParams.get("anime") + "&episode=",
                urlParams.get("episode"),
                eplist.length
            ).then(() => {
                console.log("Selector btn loaded");
            });
        });
    });
});
