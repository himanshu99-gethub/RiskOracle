import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import joblib
import os

# Remove old pickle file if it exists
if os.path.exists('loan_model.pkl'):
    os.remove('loan_model.pkl')
    print("Removed old pickle file")

# 1. Create Synthetic Dataset
def create_dataset():
    np.random.seed(42)
    n_samples = 1000
    
    age = np.random.randint(18, 70, n_samples)
    income = np.random.randint(20000, 200000, n_samples)
    loan_amount = np.random.randint(1000, 100000, n_samples)
    credit_history = np.random.choice([0, 1], n_samples, p=[0.3, 0.7])
    
    # Simple logic for approval: 
    # Approval depends mostly on credit history and income vs loan amount ratio
    noise = np.random.normal(0, 0.1, n_samples)
    approval_prob = (0.4 * credit_history + 0.3 * (income / 200000) - 0.2 * (loan_amount / 100000) + 0.2) + noise
    approval = (approval_prob > 0.5).astype(int)
    
    df = pd.DataFrame({
        'Age': age,
        'Income': income,
        'LoanAmount': loan_amount,
        'CreditHistory': credit_history,
        'Approval': approval
    })
    
    df.to_csv('loan_data.csv', index=False)
    print("Dataset saved as loan_data.csv")
    return df

# 2. Train Model
def train_model(df):
    X = df[['Age', 'Income', 'LoanAmount', 'CreditHistory']]
    y = df['Approval']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = LogisticRegression()
    model.fit(X_train, y_train)
    
    # Save model using pickle (expected by app.py)
    import pickle
    with open('loan_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    
    # Save model as JSON (expected by server.py)
    import json
    model_json = {
        "coefficients": model.coef_[0].tolist(),
        "intercept": float(model.intercept_[0]),
        "type": "trained_logistic"
    }
    with open('loan_model.json', 'w') as f:
        json.dump(model_json, f)
    
    print(f"Model trained and saved to loan_model.pkl and loan_model.json. Accuracy: {model.score(X_test, y_test):.2f}")

if __name__ == "__main__":
    df = create_dataset()
    train_model(df)
