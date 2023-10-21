const streamapi = "https://techzapi2.vercel.app/anime/gogoanime/watch/";
const serversapi = "https://techzapi2.vercel.app/anime/gogoanime/servers/";
const epapi = "https://api.techzbots1.workers.dev/gogo/episodes/";
const dlapi = "https://api.techzbots1.workers.dev/gogo/dl/";

// Usefull functions

async function getJson(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (errors) {
        console.error(errors);
    }
}

function sentenceCase(str) {
    if (str === null || str === "") return false;
    else str = str.toString();

    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

// Function to get m3u8 url of episode
async function getEpisode(anime, episode) {
    try {
        const serversbtn = document.getElementById("serversbtn");

        const data = (await getJson(streamapi + anime + "-episode-" + episode))[
            "sources"
        ];

        for (let i = 0; i < data.length; i++) {
            if (data[i]["quality"] == "default") {
                const url = data[i]["url"];

                serversbtn.innerHTML += `<div class="sitem"> <a class="sobtn sactive" onclick="selectServer(this)" data-value="./embed.html?url=${url}">Server 1</a> </div>`;
                document.getElementsByClassName("sactive")[0].click();
            } else if (data[i]["quality"] == "backup") {
                const url = data[i]["url"];

                serversbtn.innerHTML += `<div class="sitem"> <a class="sobtn" onclick="selectServer(this)" data-value="./embed.html?url=${url}">Server 2</a> </div>`;
            }
        }
        return true;
    } catch (err) {
        return false;
    }
}

// Function to available servers
async function getServers(anime, episode, success) {
    const serversbtn = document.getElementById("serversbtn");
    const sno = serversbtn.getElementsByClassName("sobtn").length;

    const data = await getJson(serversapi + anime + "-episode-" + episode);
    html = "";

    if (success == true) {
        for (let i = 0; i < data.length; i++) {
            const server = data[i];
            if (server["name"] != "Vidstreaming") {
                html += `<div class="sitem"> <a class="sobtn" onclick="selectServer(this)" data-value="${server["url"]
                    }">Server ${i + sno}</a> </div>`;
            }
        }
        serversbtn.innerHTML += html;
    } else if (success == false) {
        for (let i = 0; i < data.length; i++) {
            const server = data[i];
            html += `<div class="sitem"> <a class="sobtn" onclick="selectServer(this)" data-value="${server["url"]
                }">Server ${i + sno}</a> </div>`;
        }
        serversbtn.innerHTML += html;
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
    return total;
}

// Function to get selector btn
async function getSelectorBtn(url, current, totalep) {
    current = Number(current);
    totalep = Number(totalep);
    console.log(current + " " + totalep);
    let html = "";

    if (totalep < 2) {
        html = "";
    } else {
        if (current == 1) {
            html = `<a class="btns" href="${url + (current + 1)
                }"><button class="sbtn inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg ">Episode 2<i style="margin-left:10px; margin-right: auto;" class="fa fa-arrow-circle-right"></i></button></a>`;
        } else if (current == totalep) {
            html = `<a class="btns" href="${url + (totalep - 1)
                }"><button class="sbtn inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg "><i class="fa fa-arrow-circle-left"></i>Episode ${totalep - 1
                }</button></a>`;
        } else {
            html = `<a class="btns" href="${url + (current - 1)
                }"><button class="sbtn inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg "><i class="fa fa-arrow-circle-left"></i>Episode ${current - 1
                }</button></a>`;
            html += `<a class="btns" href="${url + (current + 1)
                }"><button class="sbtn inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg ">Episode ${current + 1
                }<i style="margin-left:10px; margin-right: auto;" class="fa fa-arrow-circle-right"></i></button></a>`;
        }

        document.getElementsByClassName("selector")[0].innerHTML = html;
    }
}

// Function to get download links
async function getDownloadLinks(anime, episode) {
    const data = await getJson(dlapi + anime + "-episode-" + episode);
    console.log(data);
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

document.documentElement.innerHTML =
    document.documentElement.innerHTML.replaceAll(
        "{{ title }}",
        sentenceCase(urlParams.get("anime")) +
        " - Episode " +
        urlParams.get("episode")
    );

// Running functions
getEpisode(urlParams.get("anime"), urlParams.get("episode")).then((success) => {
    console.log("Episode loaded");
    getServers(urlParams.get("anime"), urlParams.get("episode"), success).then(
        (data) => {
            console.log("Servers loaded");
        }
    );
});

getEpList(urlParams.get("anime")).then((totalep) => {
    console.log("Episodes loaded");
    getSelectorBtn(
        `./episode.html?anime=${urlParams.get("anime")}&episode=`,
        urlParams.get("episode"),
        totalep
    ).then((data) => {
        console.log("Selector btn loaded");
        getDownloadLinks(urlParams.get("anime"), urlParams.get("episode")).then(
            (data) => {
                console.log("Download links loaded");
            }
        );
    });
});
