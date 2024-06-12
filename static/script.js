var tickers = JSON.parse(localStorage.getItem('tickers')) || [];
var lastPrices = {};
var counter = 5;

function startUpdateCycle() {
    updatePrices();
    var coundown = setInterval(() => {
        counter--;
        $('#counter').text(counter);
        if (counter <= 0) {
            updatePrices();
            counter = 5;
        }
    }, 1000)
}