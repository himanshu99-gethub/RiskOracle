# 🛡️ RiskOracle: Consumer Loan Risk Observatory

RiskOracle is a consumer loan underwriting and predictive analytics observatory. It combines the aesthetic of modern consumer finance—featuring an organic **Sage-Mint & Spruce Teal** palette with radiant warm orange highlights—with real-time logistic regression underwriting and multi-factor risk stress analysis.

---

## 🎨 Design System & Color Palette

Engineered in strict accordance with the **design-taste-frontend** anti-slop guidelines and the reference consumer loan art direction:

| Token | Hex / Value | Description & Purpose |
| :--- | :--- | :--- |
| **Ground (`--bg-ground`)** | `#F3F7F5` | Crisp, fresh sage off-white ground with subtle topographical isoline accents |
| **Primary Accent (`--accent-teal`)** | `#5A847E` | Muted spruce sea-green for primary actions, gauges, and loan cards |
| **Warm Accent (`--accent-orange`)** | `#F17623` | Warm knit terracotta/orange highlight representing borrower optimism and energy |
| **Obsidian Ink (`--ink-primary`)** | `#111617` | Authoritative, high-contrast dark typography and brand emblem |
| **Card Surface (`--surface-white`)** | `#FFFFFF` | Clean white cards with subtle borders (`rgba(17, 22, 23, 0.08)`) and elevation |
| **Coral Pill (`--pill-coral-bg`)** | `#F7B49F` | Soft peach-coral floating metric badge |
| **Apricot Pill (`--pill-apricot-bg`)** | `#F6CE9F` | Soft warm apricot floating metric badge |
| **Sand Pill (`--pill-sand-bg`)** | `#E4BE97` | Soft warm sand floating metric badge |
| **Sage Pill (`--pill-sage-bg`)** | `#98B9B2` | Soft sage-teal floating metric badge |

---

## 🎯 Key Capabilities

- **Consumer Loan Hero Showcase:** High-impact hero section with photography, value guarantees, and floating metric pills (`300k+ Active Customers`, `225+ Branch Locations`, `65+ Years In Business`, `₹400Cr+ Loaned`).
- **Interactive Loan Options:** Category cards for Personal, Vehicle & Asset, Enterprise Liquidity, and Emergency Buffer loans with one-click form pre-filling.
- **Sigmoid Risk Prediction Engine:** Evaluates applicant age, income, requested loan, and credit history using Scikit-learn logistic classification with animated confidence dial.
- **Live Debt-to-Income (DTI) Meter:** Real-time calculation of debt servicing exposure as inputs are adjusted.
- **Multi-Factor Stress Breakdown:** Visual decomposition of Credit Stability, Collateral & Income Coverage, and Market Volatility.
- **Quick Scenario Presets:** One-click simulation chips for Prime High Liquidity, Moderate Earner, and High DTI Risk profiles.
- **Loan Portfolio Observatory:** Aggregated statistics from 1,000+ historical evaluations with average income, approval ratios, and recent data records.
- **Localized Financial Standards:** Fully calibrated for Indian Rupee (₹) amounts and standard consumer credit metrics.

---

## 🛠️ Tech Stack

- **Frontend:** Semantic HTML5, Vanilla CSS3 (Custom Properties & Fluid Typography), JavaScript ES6+.
- **Backend:** Flask (Python).
- **Machine Learning:** Scikit-learn Logistic Sigmoid Classifier (`loan_model.json`).
- **Data Engine:** Pandas, NumPy (`loan_data.csv`).

---

## 🚀 How to Run

1. Ensure Python is installed on your system.
2. Install dependencies:
   ```bash
   pip install flask pandas scikit-learn numpy
   ```
3. Start the Flask server:
   ```bash
   python server.py
   ```
4. Access the observatory in your browser at:
   ```
   http://127.0.0.1:5000
   ```
*(Note: The interface also includes an offline logistic evaluation fallback if viewed statically).*
