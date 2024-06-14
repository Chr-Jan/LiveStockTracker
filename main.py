import yfinance as yf
from flask import request, render_template, jsonify, Flask

main = Flask(__name__, template_folder='templates')

@main.route('/')
def index():
    return render_template('index.html')

@main.route('/get_stock_data', methods=['POST'])
def get_stock_data():
    ticker = request.get_json()['ticker']
    data = yf.Ticker(ticker).history(period='5d')  # Fetch data for the past 5 days
    history = data['Close'].tolist()  
    return jsonify({
        'currentPrice': data.iloc[-1].Close,
        'openPrice': data.iloc[-1].Open,
        'history': history  
    })

if __name__ == '__main__':
    main.run(debug=True)
