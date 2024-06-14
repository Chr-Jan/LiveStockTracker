var tickers = JSON.parse(localStorage.getItem('tickers')) || [];
var lastPrices = {};
var counter = 15;

function startUpdateCycle() {
    updatePrices();
    setInterval(() => {
        counter--;
        $('#counter').text(counter);
        if (counter <= 0) {
            updatePrices();
            counter = 15;
        }
    }, 1000);
}

$(document).ready(function () {
    tickers.forEach(addTickerToGrid);
    updatePrices();

    $('#add-ticker-form').submit(function (e) {
        e.preventDefault();
        var newTicker = $('#new-ticker').val().toUpperCase();
        if (!tickers.includes(newTicker)) {
            tickers.push(newTicker);
            localStorage.setItem('tickers', JSON.stringify(tickers));
            addTickerToGrid(newTicker);
            updatePrices();
        }
        $('#new-ticker').val('');
    });

    $('#tickers-grid').on('click', '.remove-btn', function () {
        var tickerToRemove = $(this).data('ticker');
        tickers = tickers.filter(t => t !== tickerToRemove);
        localStorage.setItem('tickers', JSON.stringify(tickers));
        $(`#${tickerToRemove}`).remove();
    });

    startUpdateCycle();
});

function addTickerToGrid(ticker) {
    $('#tickers-grid').append(`
        <div id="${ticker}" class="stock-box">
            <h2>${ticker}</h2>
            <div class="price-container">
                <div class="price-label">
                    <p>Previous Price</p>
                    <p id="prev-price-${ticker}" class="prev-price"></p>
                </div>
                <div class="price-label">
                    <p>Current Price</p>
                    <p id="price-${ticker}" class="current-price"></p>
                </div>
            </div>
            <div class="price-label">
            <p>Procentage</p>
                        <p id="pct-${ticker}" class="pct-price"></p>
                        <div>

            <button class="remove-btn" data-ticker="${ticker}">Remove</button>
        </div>
    `);
}


function updatePrices() {
    tickers.forEach(function (ticker) {
        $.ajax({
            url: '/get_stock_data',
            type: 'POST',
            data: JSON.stringify({ 'ticker': ticker }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (data) {
                updateTicker(ticker, data.currentPrice, data.openPrice);
            },
            error: function () {
                console.error(`Failed to fetch data for ${ticker}`);
            }
        });
    });
}

function updateTicker(ticker, currentPrice, openPrice) {
    var changePercent = ((currentPrice - openPrice) / openPrice) * 100;
    var colorClass = getColorClass(changePercent);

    var prevPrice = lastPrices[ticker] ? `$${lastPrices[ticker].toFixed(2)}` : 'N/A';
    $(`#prev-price-${ticker}`).text(prevPrice);

    $(`#price-${ticker}`).text(`$${currentPrice.toFixed(2)}`);
    $(`#pct-${ticker}`).text(`${changePercent.toFixed(2)}%`);
    $(`#price-${ticker}`).removeClass('dark-red red green dark-green gray').addClass(colorClass);
    $(`#pct-${ticker}`).removeClass('dark-red red green dark-green gray').addClass(colorClass);

    var flashClass = getFlashClass(ticker, currentPrice);
    lastPrices[ticker] = currentPrice;
    $(`#${ticker}`).addClass(flashClass);

    setTimeout(function () {
        $(`#${ticker}`).removeClass(flashClass);
    }, 1000);
}

function getColorClass(changePercent) {
    if (changePercent <= -2) {
        return 'dark-red';
    } else if (changePercent < 0) {
        return 'red';
    } else if (changePercent === 0) {
        return 'gray';
    } else if (changePercent <= 2) {
        return 'green';
    } else {
        return 'dark-green';
    }
}

function getFlashClass(ticker, currentPrice) {
    if (lastPrices[ticker] > currentPrice) {
        return 'red-flash';
    } else if (lastPrices[ticker] < currentPrice) {
        return 'green-flash';
    } else {
        return 'gray-flash';
    }
}
