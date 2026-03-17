let abbreviationData = [];

fetch('data.json')
    .then(response => {
        if (!response.ok) throw new Error('ネットワークエラー');
        return response.json();
    })
    .then(data => {
        abbreviationData = data;
    })
    .catch(error => {
        console.error('データの読み込みに失敗:', error);
    });

function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const resultsContainer = document.getElementById('resultsContainer');

    resultsContainer.innerHTML = '';

    if (query === '') {
        return;
    }

    const filteredData = abbreviationData.filter(item => {
        if (!item.abbr) {
            return false;
        } else {
            return item.abbr.toLowerCase().includes(query);
        }
    });

    if (filteredData.length === 0) {
        resultsContainer.innerHTML = '<li>該当する略語が見つかりませんでした。</li>';
        return;
    }

    filteredData.forEach((item, index) => {
        const li = document.createElement('li');
        const uniqueCardId = `wiki-card-${index}`;

        li.innerHTML = `
            <span class="abbr-title" style="font-weight: bold; font-size: 1.2em;">${item.abbr}</span>
            <span class="abbr-full" style="margin-left: 10px; color: #555;">${item.full}</span>
            <div id="${uniqueCardId}" style="border: 1px solid #ddd; padding: 16px; border-radius: 8px; max-width: 500px; font-family: sans-serif; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 10px;">
                <p style="margin: 0; color: #666;">読み込み中...</p>
            </div>
        `;
        resultsContainer.appendChild(li);

        // get data from Wikipedia
        if (item.keyword) {
            const jaApiUrl = `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(item.keyword)}`; // for japanese
            const enApiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(item.full)}`; // for english

            fetch(jaApiUrl)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        return fetch(enApiUrl).then(enResponsue => {
                            if(!enResponsue.ok) {
                                throw new Error('ページが見つかりませんでした')
                            } else {
                                return enResponsue.json();
                            }
                        });
                    }
                })
                .then(data => {
                    const container = document.getElementById(uniqueCardId);
                    if (!container) return;

                    const imgHtml = data.thumbnail ? `<img src="${data.thumbnail.source}" alt="${data.title}" style="float: right; width: 100px; height: auto; margin-left: 15px; border-radius: 4px;">` : '';

                    container.innerHTML = `
                        <div style="overflow: hidden;">
                            ${imgHtml}
                            <h3 style="margin: 0 0 10px 0;"><a href="${data.content_urls.desktop.page}" target="_blank" style="color: #0645ad; text-decoration: none;">${data.title}</a></h3>
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #333;">${data.extract}</p>
                        </div>
                        <div style="margin-top: 10px; font-size: 12px; text-align: right;">
                            <a href="${data.content_urls.desktop.page}" target="_blank" style="color: #0645ad;">Wikipediaで続きを読む</a>
                        </div>
                    `;
                })
                .catch(error => {
                    const container = document.getElementById(uniqueCardId);
                    if (container) {
                        container.innerHTML = `<p style="color: red; margin: 0;">エラー: Wikipediaの概要を取得できませんでした</p>`;
                    }
                });
        }
    });
}

document.getElementById('searchBtn').addEventListener('click', performSearch);

document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        performSearch();
    }
});