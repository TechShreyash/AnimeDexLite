home = "https://gogoanime3.net"
host = "https://animedex.pages.dev"

import requests
from bs4 import BeautifulSoup as bs
from datetime import datetime


def get_recent_anime():
    page = requests.get(home)
    soup = bs(page.content, "html.parser")
    anime_list = soup.find("div", class_="added_series_body final").find_all("li")

    animes = []
    for anime in anime_list:
        anime_link = anime.find("a")["href"]
        url = host + "/anime.html?anime=" + anime_link.split("/")[-1]
        animes.append(url)

    return animes


def sitemap_gen(filename, priority, frequency, data):
    text = """<?xml version="1.0" encoding="UTF-8"?>
    <urlset
        xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
    """

    today = datetime.today().strftime("%Y-%m-%d")

    for link in data:
        text += f"""
        <url>
            <loc>{link}</loc>
            <lastmod>{today}</lastmod>
            <changefreq>{frequency}</changefreq>
            <priority>{priority}</priority>
        </url>
        """

    text += "</urlset>"
    with open("./sitemap/" + filename, "w") as f:
        f.write(text)


if __name__ == "__main__":
    print("Generating sitemap for recent anime...")
    data = get_recent_anime()
    sitemap_gen("recent.xml", 1, "weekly", data)
