# LiveStockTracker
<br>
    <h1>Stock Price Tracker</h1>
<br>
    <h2>Framework</h2>
    <p>Flask</p>
<br>
    <h2>Functionality</h2>
    <ul>
        <li><strong>Follow a Stock:</strong> Users can track stocks using their ticker symbols.</li>
        <li><strong>Get a 5-Day Graph:</strong> Visualizes historical data with a line chart.</li>
        <li><strong>Live Updates:</strong> Prices update in real-time.</li>
    </ul>
<br
    <h2>Technologies Used</h2>
    <ul>
        <li><strong>Frontend:</strong> HTML, CSS, JavaScript (<code>jQuery</code>)</li>
        <li><strong>Charting Library:</strong> <code>Chart.js</code></li>
        <li><strong>Backend:</strong> Flask for routing and data handling</li>
        <li><strong>Storage:</strong> <code>localStorage</code> for persisting tracked stocks</li>
    </ul>
<br>
    <h2>Implementation Details</h2>
    <ul>
        <li><strong>Data Fetching:</strong> AJAX requests to Flask server endpoint (<code>/get_stock_data</code>).</li>
        <li><strong>Charting:</strong> <code>Chart.js</code> used to generate dynamic graphs.</li>
        <li><strong>Automatic Updates:</strong> Prices refresh every 15 seconds.</li>
    </ul>
<br>
    <h2>Deployment</h2>
    <ul>
        <li><strong>Local Setup:</strong> Clone the repository, install dependencies, run Flask app.</li>
        <li><strong>Production Deployment:</strong> Host Flask app on a web server, ensure backend endpoints are reachable.</li>
    </ul>
<br>
    <h2>Usage</h2>
    <ol>
        <li><strong>Add Stocks:</strong> Enter ticker symbols and click "Add".</li>
        <li><strong>Monitor Prices:</strong> View live updates and historical trends.</li>
        <li><strong>Remove Stocks:</strong> Click "Remove" to stop tracking a stock.</li>
    </ol>
