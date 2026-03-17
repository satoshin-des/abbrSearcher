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
        console.error('データの読み込みに失敗しました:', error);
        document.getElementById('resultsContainer').innerHTML = '<li>データの読み込みに失敗しました。</li>';
    });

function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const resultsContainer = document.getElementById('resultsContainer');
    
    // 前回の検索結果をクリア
    resultsContainer.innerHTML = '';

    // 空欄の場合は何もしない
    if (query === '') return;

    const filteredData = abbreviationData.filter(item => 
        item.abbr.toLowerCase().includes(query)
    );

    // 検索結果が0件の場合
    if (filteredData.length === 0) {
        resultsContainer.innerHTML = '<li>該当する略語が見つかりませんでした。</li>';
        return;
    }

    // 検索結果をリストに追加していく
    filteredData.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="abbr-title">${item.abbr}</span>
            <span class="abbr-full">${item.full}</span>
            <span class="abbr-meaning">${item.meaning}</span>
        `;
        resultsContainer.appendChild(li);
    });
}

// 検索ボタンがクリックされた時の処理
document.getElementById('searchBtn').addEventListener('click', performSearch);

// Enterキーが押された時にも検索を実行する処理
document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        performSearch();
    }
});