import yfinance as yf  # Import yfinance library for fetching stock data
from flask import request, render_template, jsonify, Flask  # Import necessary Flask modules

main = Flask(__name__, template_folder='templates')  # Create Flask application instance

# Route for the home page
@main.route('/')
def index():
    return render_template('index.html')  # Render index.html template when accessing root URL '/'

# Route to handle AJAX request for fetching stock data
@main.route('/get_stock_data', methods=['POST'])
def get_stock_data():
    ticker = request.get_json()['ticker']  # Extract ticker symbol from POST request JSON data
    data = yf.Ticker(ticker).history(period='5d')  # Fetch historical data for the past 5 days using yfinance
    history = data['Close'].tolist()  # Extract closing prices from historical data to a list

    # Return JSON response with current price, open price, and historical closing prices
    return jsonify({
        'currentPrice': data.iloc[-1].Close,  # Current closing price
        'openPrice': data.iloc[-1].Open,  # Opening price of the latest day
        'history': history  # List of closing prices for the past 5 days
    })

# Entry point to run the Flask application
if __name__ == '__main__':
    main.run(debug=True)  # Run the Flask app in debug mode if executed directly
