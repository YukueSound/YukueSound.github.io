const newsList = document.querySelector("#news-list");
const newsDirectoryApi = "https://api.github.com/repos/YukueSound/YukueSound.github.io/contents/news";
const newsFilePattern = /^(\d{4}-\d{2}-\d{2})_(.+)\.txt$/;

function formatDate(date) {
    return date.replaceAll("-", ".");
}

function createNewsItem(file, text) {
    const [, date, title] = file.name.match(newsFilePattern);
    const article = document.createElement("article");
    const time = document.createElement("time");
    const heading = document.createElement("h3");

    article.className = "card news-item";
    time.dateTime = date;
    time.textContent = formatDate(date);
    heading.textContent = title;
    article.append(time, heading);

    text.trim().split(/\n\s*\n/).forEach((paragraphText) => {
        const paragraph = document.createElement("p");
        const lines = paragraphText.trim().split("\n");

        lines.forEach((line, index) => {
            if (index > 0) {
                paragraph.append(document.createElement("br"));
            }

            paragraph.append(document.createTextNode(line));
        });

        article.append(paragraph);
    });

    return article;
}

async function loadNews() {
    try {
        const response = await fetch(newsDirectoryApi);

        if (!response.ok) {
            throw new Error("News directory could not be loaded.");
        }

        const files = (await response.json())
            .filter((file) => file.type === "file" && newsFilePattern.test(file.name))
            .sort((first, second) => second.name.localeCompare(first.name, "ja"));

        if (files.length === 0) {
            newsList.textContent = "現在、お知らせはありません。";
            return;
        }

        const articles = await Promise.all(files.map(async (file) => {
            const textResponse = await fetch(file.download_url);

            if (!textResponse.ok) {
                throw new Error("News file could not be loaded.");
            }

            return createNewsItem(file, await textResponse.text());
        }));

        newsList.replaceChildren(...articles);
    } catch (error) {
        newsList.textContent = "お知らせを読み込めませんでした。時間をおいて再度お試しください。";
    }
}

loadNews();
