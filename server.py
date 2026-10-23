from flask import Flask, request, jsonify, render_template
import pandas as pd
import numpy as np
import json
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

# Load Model 
MODEL_PATH = 'loan_model.json'
DATA_PATH = 'loan_data.csv'

# Global model storage
_model = None
_model_loading = False
_model_load_error = None

def get_model():
    global _model, _model_loading, _model_load_error
    
    if _model is not None:
        return _model
    
    if _model_loading:
        return None
    
    if _model_load_error:
        return None
    
    # Try to load model
    if os.path.exists(MODEL_PATH):
        try:
            _model_loading = True
            print(f"Loading model from {MODEL_PATH}...", flush=True)
            with open(MODEL_PATH, 'r') as f:
                _model = json.load(f)
            print("Model loaded successfully!", flush=True)
        except Exception as e:
            print(f"Error loading model: {e}", flush=True)
            _model_load_error = str(e)
        finally:
            _model_loading = False
    
    return _model

def get_data_stats():
    if os.path.exists(DATA_PATH):
        df = pd.read_csv(DATA_PATH)
        return {
            "total_samples": len(df),
            "approval_rate": round(df['Approval'].mean() * 100, 1),
            "avg_income": round(df['Income'].mean(), 0),
            "preview": df.head(20).to_dict(orient='records')
        }
    return {}

model = get_model()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    model = get_model()  # Get model on each request
    if not model:
        return jsonify({"error": "Model not available. Please try again."}), 503
    
    data = request.json
    try:
        # Extract inputs
        age = float(data.get('age', 30))
        income = float(data.get('income', 50000))
        loan_amount = float(data.get('loan_amount', 10000))
        duration = float(data.get('duration', 36))
        credit_history = 1 if data.get('credit_history') == 'Good' else 0
        
        # Simple logistic regression prediction
        # probability = 1 / (1 + exp(-(intercept + sum(coeff * feature))))
        coefficients = model.get('coefficients', [0.01, 0.000005, -0.000003, 1.5])
        intercept = model.get('intercept', -2.0)
        
        # Calculate logit
        logit = intercept + (
            coefficients[0] * age +
            coefficients[1] * income +
            coefficients[2] * loan_amount +
            coefficients[3] * credit_history
        )
        
        # Calculate probability using sigmoid function
        probability = 1.0 / (1.0 + np.exp(-logit))
        
        # Make prediction (threshold at 0.5)
        prediction = 1 if probability >= 0.5 else 0
        
        # Calculate DTI (Debt-to-income) ratio
        dti = (loan_amount / income * 100) if income > 0 else 0

        # Calculate monthly EMI with 10.5% prime rate
        annual_rate = 0.105
        monthly_rate = annual_rate / 12.0
        n_months = max(1.0, duration)
        if monthly_rate > 0:
            emi = (loan_amount * monthly_rate * ((1 + monthly_rate) ** n_months)) / (((1 + monthly_rate) ** n_months) - 1)
        else:
            emi = loan_amount / n_months
        total_payment = emi * n_months
        total_interest = max(0.0, total_payment - loan_amount)
        
        return jsonify({
            "status": "success",
            "prediction": prediction,
            "probability": round(probability, 4),
            "result_text": "Approved" if prediction == 1 else "Rejected",
            "dti": round(dti, 2),
            "emi": round(emi, 2),
            "total_interest": round(total_interest, 2),
            "total_payment": round(total_payment, 2),
            "message": "Model evaluation complete."
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/stats', methods=['GET'])
def stats():
    return jsonify(get_data_stats())

if __name__ == '__main__':
    print("Starting Flask server on http://127.0.0.1:5000")
    print("Model loaded:", model is not None)
    app.run(debug=False, host='127.0.0.1', port=5000)
