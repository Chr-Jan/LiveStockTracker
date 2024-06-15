// Initialize variables to store tickers, last prices, and counter
var tickers = JSON.parse(localStorage.getItem('tickers')) || []; // Array of tickers from localStorage or empty array
var lastPrices = {}; // Object to store last prices for each ticker
var counter = 15; // Counter for update cycle interval in seconds

// Function to start the update cycle for fetching stock prices
function startUpdateCycle() {
    updatePrices(); // Call updatePrices function initially
    // Set interval to update prices every second
    setInterval(() => {
        counter--; // Decrement the counter
        $('#counter').text(counter); // Update counter display in HTML
        if (counter <= 0) { // When counter reaches zero
            updatePrices(); // Update prices
            counter = 15; // Reset counter to 15 seconds
        }
    }, 1000); // Interval set to 1000 milliseconds (1 second)
}

$(document).ready(function () {
    // Execute when DOM is fully loaded
    tickers.forEach(addTickerToGrid); // Add existing tickers to the grid
    updatePrices(); // Update prices initially

    // Handle form submission to add new ticker
    $('#add-ticker-form').submit(function (e) {
        e.preventDefault(); // Prevent default form submission
        var newTicker = $('#new-ticker').val().toUpperCase(); // Get new ticker symbol and convert to uppercase
        if (!tickers.includes(newTicker)) { // If new ticker is not already in the list
            tickers.push(newTicker); // Add new ticker to the tickers array
            localStorage.setItem('tickers', JSON.stringify(tickers)); // Update tickers in localStorage
            addTickerToGrid(newTicker); // Add new ticker to the grid
            updatePrices(); // Update prices with new ticker data
        }
        $('#new-ticker').val(''); // Clear input field after submission
    });

    // Handle click event to remove ticker from grid
    $('#tickers-grid').on('click', '.remove-btn', function () {
        var tickerToRemove = $(this).data('ticker'); // Get ticker symbol to remove
        tickers = tickers.filter(t => t !== tickerToRemove); // Filter out the ticker to remove
        localStorage.setItem('tickers', JSON.stringify(tickers)); // Update tickers in localStorage
        $(`#${tickerToRemove}`).remove(); // Remove ticker element from the grid
    });

    startUpdateCycle(); // Start the update cycle for fetching prices
});

// Function to add ticker element to the grid
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
                <p>5 days movement</p>
                <canvas id="chart-${ticker}" width="200" height="100"></canvas>
            </div>
            <div>
                <p>Percentage</p>
                <p id="pct-${ticker}"></p>
            </div>
            <div class="button-container">
                <button class="remove-btn" data-ticker="${ticker}">Remove</button>
            </div>
        </div>
    `);
}

// Function to update stock prices and related information
function updatePrices() {
    tickers.forEach(function (ticker) {
        $.ajax({
            url: '/get_stock_data',
            type: 'POST',
            data: JSON.stringify({ 'ticker': ticker }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (data) {
                var changePercent = ((data.currentPrice - data.openPrice) / data.openPrice) * 100; // Calculate percentage change
                var colorClass; // Variable to store color class based on change percent

                // Determine color class based on percentage change
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

                // Update HTML elements with stock information
                $(`#prev-price-${ticker}`).text(`$${lastPrices[ticker]?.toFixed(2) || '-'}`);
                $(`#price-${ticker}`).text(`$${data.currentPrice.toFixed(2)}`);
                $(`#pct-${ticker}`).text(`${changePercent.toFixed(2)}%`);
                $(`#price-${ticker}`).removeClass('dark-red red green dark-green gray').addClass(colorClass);
                $(`#pct-${ticker}`).removeClass('dark-red red green dark-green gray').addClass(colorClass);

                var flashClass; // Variable to store flash class for price change indication

                // Determine flash class based on price change
                if (lastPrices[ticker] > data.currentPrice) {
                    flashClass = 'red-flash';
                } else if (lastPrices[ticker] < data.currentPrice) {
                    flashClass = 'green-flash';
                } else {
                    flashClass = 'gray-flash';
                }

                lastPrices[ticker] = data.currentPrice; // Update last price for the ticker
                $(`#${ticker}`).addClass(flashClass); // Add flash class to indicate price change

                // Remove flash class after 1 second
                setTimeout(function () {
                    $(`#${ticker}`).removeClass(flashClass);
                }, 1000);

                // Generate the sparkline chart if historical data is available
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

/**
 * Update the Chart.js chart with historical data and styling based on percentage change.
 * @param {string} ticker - The stock ticker symbol.
 * @param {number[]} history - Array of historical prices.
 * @param {number} changePercent - The percentage change in price.
 */
function updateChart(ticker, history, changePercent) {
    const ctx = document.getElementById(`chart-${ticker}`).getContext('2d'); // Get canvas context
    const lineColor = getLineColor(changePercent); // Determine line color based on percentage change

    if (!window.charts) {
        window.charts = {}; // Initialize charts object if not already initialized
    }

    // Check if chart for the ticker already exists
    if (window.charts[ticker]) {
        // Update existing chart with new data and styling
        window.charts[ticker].data.datasets[0].data = history;
        window.charts[ticker].data.datasets[0].borderColor = lineColor;
        window.charts[ticker].update(); // Update chart
    } else {
        // Create new Chart.js instance for the ticker
        window.charts[ticker] = new Chart(ctx, {
            type: 'line', // Chart type
            data: {
                labels: history.map((_, index) => {
                    const date = new Date();
                    date.setDate(date.getDate() - history.length + index + 1); // Adjust date based on history length
                    return date.toLocaleDateString('en-US', { weekday: 'short' }); // Display short weekday name
                }),
                datasets: [{
                    data: history, // Historical price data
                    borderColor: lineColor, // Line color
                    fill: false // Do not fill area under the line
                }]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Days' // X-axis title
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Price' // Y-axis title
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 0 // Hide points on the line
                    }
                },
                plugins: {
                    legend: {
                        display: false // Hide legend
                    }
                }
            }
        });
    }
}
