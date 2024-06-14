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
            <canvas id="chart-${ticker}" width="200" height="100"></canvas>
            <p id="pct-${ticker}"></p>
            <button class="remove-btn" data-ticker="${ticker}">Remove</button>
        </div>
    `);  
}

function updatePrices() {
    tickers.forEach(function (ticker) {
        $.ajax({
            url: '/get_stock_data',
            type: 'POST',
            data: JSON.stringify({'ticker': ticker}),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (data) {
                var changePercent = ((data.currentPrice - data.openPrice) / data.openPrice) * 100;
                var colorClass;
                if (changePercent <= -2) {
                    colorClass = 'dark-red';
                } else if (changePercent < 0) {
                    colorClass = 'red';
                } else if (changePercent === 0) {
                    colorClass = 'gray';
                } else if (changePercent <= 2) {
                    colorClass = 'green';
                } else {
                    colorClass = 'dark-green';
                }

                console.log('History:', data.history);
                console.log('Change percent:', changePercent);
                console.log('Line color:', getLineColor(changePercent));

                $(`#prev-price-${ticker}`).text(`$${lastPrices[ticker]?.toFixed(2) || '-'}`);
                $(`#price-${ticker}`).text(`$${data.currentPrice.toFixed(2)}`);
                $(`#pct-${ticker}`).text(`${changePercent.toFixed(2)}%`);
                $(`#price-${ticker}`).removeClass('dark-red red green dark-green gray').addClass(colorClass);
                $(`#pct-${ticker}`).removeClass('dark-red red green dark-green gray').addClass(colorClass);

                var flashClass;
                if (lastPrices[ticker] > data.currentPrice) {
                    flashClass = 'red-flash';
                } else if (lastPrices[ticker] < data.currentPrice) {
                    flashClass = 'green-flash';
                } else {
                    flashClass = 'gray-flash';
                }
                lastPrices[ticker] = data.currentPrice;
                $(`#${ticker}`).addClass(flashClass);

                setTimeout(function() {
                    $(`#${ticker}`).removeClass(flashClass);
                }, 1000);

                // Generate the sparkline chart
                if (data.history) {
                    updateChart(ticker, data.history, changePercent);
                }
            }
        });
    });
}


/**
 * Determines the color of a line based on the percentage change in value.
 * Returns different colors for various ranges of percentage change.
 * @param {number} changePercent - The percentage change.
 * @returns {string} - The color code based on the changePercent.
 */
function getLineColor(changePercent) {
    if (changePercent <= -2) {
        return '#8B0000'; // dark-red
    } else if (changePercent < 0) {
        return '#FF6347'; // red
    } else if (changePercent === 0) {
        return 'gray'; // gray
    } else if (changePercent <= 2) {
        return '#32CD32'; // green
    } else {
        return '#006400'; // dark-green
    }
}


function updateChart(ticker, history, changePercent) {
    const ctx = document.getElementById(`chart-${ticker}`).getContext('2d');
    const lineColor = getLineColor(changePercent);

    console.log('History for chart:', history);
    console.log('Change percent for chart:', changePercent);
    console.log('Line color for chart:', lineColor);

    if (!window.charts) {
        window.charts = {};
    }

    if (window.charts[ticker]) {
        window.charts[ticker].data.datasets[0].data = history;
        window.charts[ticker].data.datasets[0].borderColor = lineColor;
        window.charts[ticker].update();
    } else {
        window.charts[ticker] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: history.map((_, index) => index),
                datasets: [{
                    data: history,
                    borderColor: lineColor,
                    fill: false
                }]
            },
            options: {
                elements: {
                    point: {
                        radius: 0 // Hide the points on the line
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}
