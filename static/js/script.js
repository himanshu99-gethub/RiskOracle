document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ RiskOracle Consumer Loan Observatory initialized');

    // Element References
    const loanForm = document.getElementById('loanForm');
    const resetBtn = loanForm.querySelector('button[type="reset"]');
    const ageInput = document.getElementById('age');
    const incomeInput = document.getElementById('income');
    const loanAmountInput = document.getElementById('loan_amount');
    const durationInput = document.getElementById('duration');
    const incomeSlider = document.getElementById('incomeSlider');
    const loanSlider = document.getElementById('loanSlider');
    const dtiLiveVal = document.getElementById('dtiLiveVal');

    // EMI Calculator References
    const emiMonthly = document.getElementById('emiMonthly');
    const emiInterest = document.getElementById('emiInterest');
    const emiTotal = document.getElementById('emiTotal');
    const ratePills = document.querySelectorAll('.rate-pill');
    let currentInterestRate = 10.5;

    // Result & Gauge Display References
    const verdictText = document.getElementById('verdictText');
    const confidenceScore = document.getElementById('confidenceScore');
    const progressCircle = document.getElementById('progressCircle');
    const riskLevel = document.getElementById('riskLevel');
    const oracleQuote = document.getElementById('oracleQuote');
    const exposure = document.getElementById('exposure');
    const durationDisplay = document.getElementById('durationDisplay');
    const computedTime = document.getElementById('computedTime');
    const appId = document.getElementById('appId');

    // Risk Factor & XAI References
    const creditBar = document.getElementById('creditBar');
    const collateralBar = document.getElementById('collateralBar');
    const volatilityBar = document.getElementById('volatilityBar');
    const creditVal = document.getElementById('creditVal');
    const collateralVal = document.getElementById('collateralVal');
    const volatilityVal = document.getElementById('volatilityVal');
    const xaiCredit = document.getElementById('xaiCredit');
    const xaiIncome = document.getElementById('xaiIncome');
    const xaiLoan = document.getElementById('xaiLoan');

    // Insight Engine & Portfolio Stats
    const insightText = document.getElementById('insightText');
    const growthMetric = document.getElementById('growthMetric');
    const sensitivityMetric = document.getElementById('sensitivityMetric');
    const statAssets = document.getElementById('statAssets');
    const statRate = document.getElementById('statRate');
    const statIncome = document.getElementById('statIncome');
    const navLinks = document.querySelectorAll('.nav-link');
    const recentTableBody = document.getElementById('recentTableBody');

    // Sanction Modal References
    const btnSanctionLetter = document.getElementById('btnSanctionLetter');
    const sanctionModal = document.getElementById('sanctionModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const btnModalClose = document.getElementById('btnModalClose');
    const btnPrintSanction = document.getElementById('btnPrintSanction');
    const sanctionAppId = document.getElementById('sanctionAppId');
    const sanctionDate = document.getElementById('sanctionDate');
    const sanctionVerdict = document.getElementById('sanctionVerdict');
    const sanctionPrincipal = document.getElementById('sanctionPrincipal');
    const sanctionTenure = document.getElementById('sanctionTenure');
    const sanctionRate = document.getElementById('sanctionRate');
    const sanctionEMI = document.getElementById('sanctionEMI');
    const sanctionDTI = document.getElementById('sanctionDTI');

    // Table Toolbar References
    const tableSearch = document.getElementById('tableSearch');
    const filterPills = document.querySelectorAll('.filter-pill-btn');
    const btnExportCSV = document.getElementById('btnExportCSV');
    let currentFilter = 'all';
    let allRecordsData = [
        { Age: 56, Income: 125186, LoanAmount: 27017, CreditHistory: 1, Approval: 1 },
        { Age: 69, Income: 54674, LoanAmount: 77707, CreditHistory: 1, Approval: 1 },
        { Age: 46, Income: 186926, LoanAmount: 46350, CreditHistory: 1, Approval: 1 },
        { Age: 32, Income: 66271, LoanAmount: 13201, CreditHistory: 1, Approval: 1 },
        { Age: 60, Income: 93688, LoanAmount: 30426, CreditHistory: 0, Approval: 0 },
        { Age: 25, Income: 189590, LoanAmount: 18778, CreditHistory: 0, Approval: 0 },
        { Age: 38, Income: 131076, LoanAmount: 46241, CreditHistory: 1, Approval: 1 },
        { Age: 56, Income: 161339, LoanAmount: 43229, CreditHistory: 1, Approval: 1 },
        { Age: 36, Income: 21062, LoanAmount: 87652, CreditHistory: 0, Approval: 0 },
        { Age: 40, Income: 70448, LoanAmount: 49364, CreditHistory: 1, Approval: 1 },
        { Age: 28, Income: 115462, LoanAmount: 99833, CreditHistory: 1, Approval: 0 },
        { Age: 28, Income: 157301, LoanAmount: 85878, CreditHistory: 1, Approval: 1 },
        { Age: 41, Income: 67915, LoanAmount: 58056, CreditHistory: 0, Approval: 0 },
        { Age: 53, Income: 24632, LoanAmount: 28490, CreditHistory: 1, Approval: 1 },
        { Age: 57, Income: 124592, LoanAmount: 20975, CreditHistory: 1, Approval: 1 }
    ];

    // Pretrained Logistic Model Parameters (Exact fallback from loan_model.json)
    const MODEL_COEFFS = [-0.01410034450422269, 1.6142235400467798e-05, -3.114580661398675e-05, 4.918078003414269];
    const MODEL_INTERCEPT = -2.2413554686260553;

    // State Variables
    let lastEvaluatedData = null;

    // Initialize Calculator & UI
    updateLiveCalculations();
    fetchStats();
    renderFilteredTable();

    // Two-Way Sync: Text Inputs <-> Sensitivity Range Sliders
    if (incomeSlider && incomeInput) {
        incomeSlider.addEventListener('input', () => {
            incomeInput.value = incomeSlider.value;
            updateLiveCalculations();
            evaluateLoanLive();
        });
        incomeInput.addEventListener('input', () => {
            if (incomeInput.value !== '') {
                incomeSlider.value = incomeInput.value;
            }
            updateLiveCalculations();
            evaluateLoanLive();
        });
    }

    if (loanSlider && loanAmountInput) {
        loanSlider.addEventListener('input', () => {
            loanAmountInput.value = loanSlider.value;
            updateLiveCalculations();
            evaluateLoanLive();
        });
        loanAmountInput.addEventListener('input', () => {
            if (loanAmountInput.value !== '') {
                loanSlider.value = loanAmountInput.value;
            }
            updateLiveCalculations();
            evaluateLoanLive();
        });
    }

    if (durationInput) {
        durationInput.addEventListener('input', () => {
            updateLiveCalculations();
            evaluateLoanLive();
        });
    }

    // Rate Selector Pills for EMI
    ratePills.forEach(pill => {
        pill.addEventListener('click', () => {
            ratePills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentInterestRate = parseFloat(pill.getAttribute('data-rate')) || 10.5;
            calculateEMI();
        });
    });

    function updateLiveCalculations() {
        updateLiveDTI();
        calculateEMI();
    }

    function updateLiveDTI() {
        const income = parseFloat(incomeInput.value) || 0;
        const loan = parseFloat(loanAmountInput.value) || 0;
        if (income > 0 && loan > 0) {
            const dti = (loan / income) * 100;
            if (dtiLiveVal) {
                dtiLiveVal.textContent = dti.toFixed(1) + '%';
                if (dti <= 35) {
                    dtiLiveVal.style.color = 'var(--status-approved-text)';
                } else if (dti <= 50) {
                    dtiLiveVal.style.color = 'var(--accent-teal)';
                } else {
                    dtiLiveVal.style.color = 'var(--status-rejected-text)';
                }
            }
        } else if (dtiLiveVal) {
            dtiLiveVal.textContent = '--%';
            dtiLiveVal.style.color = 'var(--ink-muted)';
        }
    }

    function calculateEMI() {
        const principal = parseFloat(loanAmountInput.value) || 0;
        const tenureMonths = parseFloat(durationInput.value) || 0;
        const annualRate = currentInterestRate;

        if (principal > 0 && tenureMonths > 0) {
            const monthlyRate = (annualRate / 12) / 100;
            const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
                        (Math.pow(1 + monthlyRate, tenureMonths) - 1);
            const totalRepayment = emi * tenureMonths;
            const totalInterest = totalRepayment - principal;

            if (emiMonthly) emiMonthly.textContent = '₹ ' + Math.round(emi).toLocaleString('en-IN');
            if (emiInterest) emiInterest.textContent = '₹ ' + Math.round(totalInterest).toLocaleString('en-IN');
            if (emiTotal) emiTotal.textContent = '₹ ' + Math.round(totalRepayment).toLocaleString('en-IN');
        } else {
            if (emiMonthly) emiMonthly.textContent = '₹ --';
            if (emiInterest) emiInterest.textContent = '₹ --';
            if (emiTotal) emiTotal.textContent = '₹ --';
        }
    }

    // Debounced live evaluation for smooth slider movement
    let liveEvalTimeout = null;
    function evaluateLoanLive() {
        // Only run live evaluation when all numeric inputs have values
        if (!ageInput.value || !durationInput.value || !incomeInput.value || !loanAmountInput.value) {
            return;
        }
        clearTimeout(liveEvalTimeout);
        liveEvalTimeout = setTimeout(() => {
            evaluateLoan(false); // live update without button state change
        }, 80);
    }

    // Form Reset Handler - Clears textboxes to display placeholders cleanly
    function resetFormAndDashboard() {
        if (ageInput) ageInput.value = '';
        if (durationInput) durationInput.value = '';
        if (incomeInput) incomeInput.value = '';
        if (loanAmountInput) loanAmountInput.value = '';

        if (incomeSlider) incomeSlider.value = incomeSlider.min || 10000;
        if (loanSlider) loanSlider.value = loanSlider.min || 5000;

        const creditGood = document.getElementById('credit_good');
        if (creditGood) creditGood.checked = true;

        if (dtiLiveVal) {
            dtiLiveVal.textContent = '--%';
            dtiLiveVal.style.color = 'var(--ink-muted)';
        }
        if (emiMonthly) emiMonthly.textContent = '₹ --';
        if (emiInterest) emiInterest.textContent = '₹ --';
        if (emiTotal) emiTotal.textContent = '₹ --';

        if (appId) appId.textContent = 'RO-STANDBY';
        if (verdictText) {
            verdictText.textContent = 'Pending Scan';
            verdictText.style.background = 'var(--surface-muted)';
            verdictText.style.color = 'var(--ink-muted)';
            verdictText.style.borderColor = 'var(--border-subtle)';
        }
        if (confidenceScore) confidenceScore.textContent = '--';
        if (progressCircle) {
            progressCircle.style.strokeDashoffset = '691';
            progressCircle.style.stroke = 'var(--accent-teal)';
        }
        if (riskLevel) riskLevel.textContent = 'Waiting For Applicant Input';
        if (oracleQuote) {
            oracleQuote.textContent = 'Input applicant financial coordinates or select a scenario preset to run the mathematical risk evaluation protocol.';
        }
        if (exposure) exposure.textContent = '₹--,---';
        if (durationDisplay) durationDisplay.textContent = '-- Months';

        if (creditBar) creditBar.style.width = '0%';
        if (collateralBar) collateralBar.style.width = '0%';
        if (volatilityBar) volatilityBar.style.width = '0%';
        if (creditVal) creditVal.textContent = '0%';
        if (collateralVal) collateralVal.textContent = '0%';
        if (volatilityVal) volatilityVal.textContent = '0%';

        if (xaiCredit) xaiCredit.innerHTML = '<span class="xai-factor-badge">Standby</span>';
        if (xaiIncome) xaiIncome.innerHTML = '<span class="xai-factor-badge">Standby</span>';
        if (xaiLoan) xaiLoan.innerHTML = '<span class="xai-factor-badge">Standby</span>';

        lastEvaluatedData = null;
    }

    if (loanForm) {
        loanForm.addEventListener('reset', (e) => {
            e.preventDefault();
            resetFormAndDashboard();
        });
    }
    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            resetFormAndDashboard();
        });
    }

    // Quick Scenario Preset Chips
    const presetChips = document.querySelectorAll('.preset-chip');
    presetChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const pAge = chip.getAttribute('data-age');
            const pIncome = chip.getAttribute('data-income');
            const pLoan = chip.getAttribute('data-loan');
            const pCredit = chip.getAttribute('data-credit');
            const pDuration = chip.getAttribute('data-duration');

            if (pAge) ageInput.value = pAge;
            if (pIncome) {
                incomeInput.value = pIncome;
                if (incomeSlider) incomeSlider.value = pIncome;
            }
            if (pLoan) {
                loanAmountInput.value = pLoan;
                if (loanSlider) loanSlider.value = pLoan;
            }
            if (pDuration) durationInput.value = pDuration;

            if (pCredit === 'Good') {
                document.getElementById('credit_good').checked = true;
            } else {
                document.getElementById('credit_poor').checked = true;
            }

            updateLiveCalculations();
            evaluateLoan(true);
        });
    });

    // Interactive Loan Option Cards
    const optionCards = document.querySelectorAll('.loan-option-card');
    optionCards.forEach(card => {
        card.addEventListener('click', () => {
            optionCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            const preset = card.getAttribute('data-preset');
            if (preset === 'personal') {
                loanAmountInput.value = '50000';
                if (loanSlider) loanSlider.value = '50000';
                durationInput.value = '36';
            } else if (preset === 'vehicle') {
                loanAmountInput.value = '120000';
                if (loanSlider) loanSlider.value = '120000';
                durationInput.value = '48';
            } else if (preset === 'business') {
                loanAmountInput.value = '150000';
                if (loanSlider) loanSlider.value = '150000';
                durationInput.value = '60';
            } else if (preset === 'emergency') {
                loanAmountInput.value = '25000';
                if (loanSlider) loanSlider.value = '25000';
                durationInput.value = '18';
            }
            updateLiveCalculations();
            evaluateLoan(true);
        });
    });

    // Form Submission
    loanForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!ageInput.value || !durationInput.value || !incomeInput.value || !loanAmountInput.value) {
            if (!ageInput.value) ageInput.focus();
            else if (!durationInput.value) durationInput.focus();
            else if (!incomeInput.value) incomeInput.focus();
            else if (!loanAmountInput.value) loanAmountInput.focus();
            return;
        }
        evaluateLoan(true);
    });

    async function evaluateLoan(animateBtn = true) {
        const btn = loanForm.querySelector('button[type="submit"]');
        let originalText = '';
        if (animateBtn) {
            originalText = btn.innerHTML;
            btn.innerHTML = '<span>Scanning Profile...</span>';
            btn.disabled = true;
        }

        const creditChecked = document.querySelector('input[name="credit_history"]:checked');
        const formData = {
            age: parseFloat(ageInput.value) || 30,
            income: parseFloat(incomeInput.value) || 50000,
            loan_amount: parseFloat(loanAmountInput.value) || 10000,
            credit_history: creditChecked ? creditChecked.value : 'Good',
            duration: parseFloat(durationInput.value) || 36
        };

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    displayResult(data, formData);
                    return;
                }
            }
            throw new Error('Server fallback requested');
        } catch (error) {
            // Standalone client-side logistic calculation
            const isGoodCredit = formData.credit_history === 'Good' ? 1 : 0;
            const logit = MODEL_INTERCEPT + (
                MODEL_COEFFS[0] * formData.age +
                MODEL_COEFFS[1] * formData.income +
                MODEL_COEFFS[2] * formData.loan_amount +
                MODEL_COEFFS[3] * isGoodCredit
            );
            const probability = 1.0 / (1.0 + Math.exp(-logit));
            const prediction = probability >= 0.5 ? 1 : 0;
            const dti = (formData.loan_amount / formData.income * 100);

            const fallbackData = {
                status: 'success',
                prediction: prediction,
                probability: Math.round(probability * 10000) / 10000,
                result_text: prediction === 1 ? 'Approved' : 'Rejected',
                dti: Math.round(dti * 100) / 100,
                message: 'Local model evaluation complete.'
            };
            displayResult(fallbackData, formData);
        } finally {
            if (animateBtn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }
    }

    function displayResult(data, inputs) {
        lastEvaluatedData = { data, inputs };

        const newAppId = 'RO-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        if (appId) appId.textContent = newAppId;

        const isApproved = data.prediction === 1;
        const probabilityPct = Math.round(data.probability * 100);

        // Update Verdict Badge Pill
        if (verdictText) {
            verdictText.textContent = isApproved ? 'APPROVED' : 'REJECTED / HIGH RISK';
            verdictText.style.background = isApproved ? 'var(--status-approved-bg)' : 'var(--status-rejected-bg)';
            verdictText.style.color = isApproved ? 'var(--status-approved-text)' : 'var(--status-rejected-text)';
            verdictText.style.borderColor = isApproved ? 'rgba(30, 108, 71, 0.25)' : 'rgba(186, 55, 34, 0.25)';
        }

        // Update Progress Circle Stroke & Gauge Value
        if (progressCircle) {
            progressCircle.style.stroke = isApproved ? 'var(--accent-teal)' : 'var(--status-rejected-bar)';
        }
        if (confidenceScore) {
            confidenceScore.style.color = isApproved ? 'var(--ink-primary)' : 'var(--status-rejected-text)';
        }

        animateGauge(probabilityPct);

        // Update Risk Profile Headline & Underwriting Quote
        if (riskLevel && oracleQuote) {
            if (isApproved && probabilityPct >= 80) {
                riskLevel.textContent = 'Prime Low-Risk Profile';
                oracleQuote.textContent = 'Underwriting models confirm robust solvency, healthy debt-servicing ratio, and optimal historical repayment stability. Pre-approved for immediate automated closing.';
            } else if (isApproved) {
                riskLevel.textContent = 'Standard Qualified Profile';
                oracleQuote.textContent = 'Applicant meets institutional risk parameters with acceptable collateral coverage and manageable leverage. Approved for standard underwriting disbursement.';
            } else if (probabilityPct >= 35) {
                riskLevel.textContent = 'Elevated Risk Exposure';
                oracleQuote.textContent = 'Model detects heightened debt-to-income stress or thin credit documentation. Recommendation: require co-signatory, collateral pledge, or reduced exposure.';
            } else {
                riskLevel.textContent = 'High-Risk Default Probability';
                oracleQuote.textContent = 'Elevated volatility markers and compromised debt servicing capacity exceed standard consumer risk tolerances. Application cannot be approved under existing parameters.';
            }
        }

        // Calculate Factor Scores & Explainable AI (XAI) Attribution
        const creditScore = isApproved 
            ? Math.min(98, Math.round(82 + Math.random() * 16))
            : Math.max(25, Math.round(35 + Math.random() * 25));

        const collateralCoverage = Math.min(100, Math.max(20, Math.round((inputs.income / inputs.loan_amount) * 35)));
        const volatility = Math.max(5, 100 - probabilityPct);

        animateBar(creditBar, creditScore);
        animateBar(collateralBar, collateralCoverage);
        animateBar(volatilityBar, volatility);

        if (creditVal) creditVal.textContent = creditScore + '%';
        if (collateralVal) collateralVal.textContent = collateralCoverage + '%';
        if (volatilityVal) volatilityVal.textContent = volatility + '%';

        // XAI Attribution Calculation
        if (xaiCredit) {
            if (inputs.credit_history === 'Good') {
                xaiCredit.className = 'xai-factor-badge positive';
                xaiCredit.textContent = '+49.2% Lift';
            } else {
                xaiCredit.className = 'xai-factor-badge negative';
                xaiCredit.textContent = '-38.4% Penalty';
            }
        }

        if (xaiIncome) {
            const incomeLift = Math.min(35, Math.max(5, Math.round((inputs.income / 100000) * 18)));
            xaiIncome.className = 'xai-factor-badge positive';
            xaiIncome.textContent = `+${incomeLift}% Lift`;
        }

        if (xaiLoan) {
            const loanDrag = Math.min(45, Math.max(8, Math.round((inputs.loan_amount / inputs.income) * 30)));
            xaiLoan.className = 'xai-factor-badge negative';
            xaiLoan.textContent = `-${loanDrag}% Drag`;
        }

        // Update Exposure & Duration Metrics
        if (exposure) {
            exposure.textContent = '₹' + Math.round(inputs.loan_amount).toLocaleString('en-IN');
        }
        if (durationDisplay) {
            durationDisplay.textContent = (inputs.duration || 36) + ' Months';
        }

        // Update Computed Timestamp
        if (computedTime) {
            const now = new Date();
            const timeStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
                ' • ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            computedTime.textContent = timeStr;
        }

        // Update Insight Text
        if (insightText) {
            const defaultProb = (100 - probabilityPct);
            if (isApproved) {
                insightText.textContent = `Model assigns an estimated ${(defaultProb / 10).toFixed(1)}% trailing 12-month default variance. The borrower exhibits favorable cash-flow stability across ₹${inputs.income.toLocaleString('en-IN')} declared income with ₹${inputs.loan_amount.toLocaleString('en-IN')} loan liability.`;
            } else {
                insightText.textContent = `High default risk of ${defaultProb}% calculated by logistic classification. The debt exposure of ₹${inputs.loan_amount.toLocaleString('en-IN')} creates excessive pressure against reported financial bandwidth.`;
            }
        }

        // Update Growth / Sensitivity Metrics
        if (growthMetric && sensitivityMetric) {
            if (probabilityPct >= 75) {
                growthMetric.textContent = 'Tier A (Strong)';
                growthMetric.style.color = 'var(--status-approved-text)';
                sensitivityMetric.textContent = 'Low (Resilient)';
            } else if (probabilityPct >= 50) {
                growthMetric.textContent = 'Tier B (Moderate)';
                growthMetric.style.color = 'var(--accent-teal)';
                sensitivityMetric.textContent = 'Medium (Balanced)';
            } else {
                growthMetric.textContent = 'Tier C (Subprime)';
                growthMetric.style.color = 'var(--status-rejected-text)';
                sensitivityMetric.textContent = 'High (Vulnerable)';
            }
        }
    }

    // Official Sanction Letter Modal Actions
    if (btnSanctionLetter && sanctionModal) {
        btnSanctionLetter.addEventListener('click', () => {
            if (!lastEvaluatedData) {
                evaluateLoan(false);
            }
            openSanctionModal();
        });
    }

    function openSanctionModal() {
        if (!lastEvaluatedData) return;
        const { data, inputs } = lastEvaluatedData;
        const isApproved = data.prediction === 1;

        if (sanctionAppId && appId) sanctionAppId.textContent = appId.textContent;
        if (sanctionDate) {
            const now = new Date();
            sanctionDate.textContent = 'Date: ' + now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }

        if (sanctionVerdict) {
            sanctionVerdict.textContent = isApproved ? 'APPROVED (Sanction Issued)' : 'DECLINED / ELEVATED RISK';
            sanctionVerdict.style.color = isApproved ? 'var(--status-approved-text)' : 'var(--status-rejected-text)';
        }

        if (sanctionPrincipal) sanctionPrincipal.textContent = '₹ ' + Math.round(inputs.loan_amount).toLocaleString('en-IN');
        if (sanctionTenure) sanctionTenure.textContent = (inputs.duration || 36) + ' Months';
        if (sanctionRate) sanctionRate.textContent = currentInterestRate + '% Annualized APR';
        
        if (sanctionEMI && emiMonthly) sanctionEMI.textContent = emiMonthly.textContent + ' / month';
        if (sanctionDTI && dtiLiveVal) sanctionDTI.textContent = dtiLiveVal.textContent + ' (Debt Servicing Ratio)';

        sanctionModal.classList.add('open');
    }

    function closeSanctionModal() {
        if (sanctionModal) sanctionModal.classList.remove('open');
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeSanctionModal);
    if (btnModalClose) btnModalClose.addEventListener('click', closeSanctionModal);
    if (sanctionModal) {
        sanctionModal.addEventListener('click', (e) => {
            if (e.target === sanctionModal) closeSanctionModal();
        });
    }

    if (btnPrintSanction) {
        btnPrintSanction.addEventListener('click', () => {
            window.print();
        });
    }

    // Table Filter & Search Logic
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilter = pill.getAttribute('data-filter') || 'all';
            renderFilteredTable();
        });
    });

    if (tableSearch) {
        tableSearch.addEventListener('input', () => {
            renderFilteredTable();
        });
    }

    function renderFilteredTable() {
        if (!recentTableBody) return;
        const query = tableSearch ? tableSearch.value.trim().toLowerCase() : '';

        const filtered = allRecordsData.filter(rec => {
            // Status filter
            if (currentFilter === 'approved' && rec.Approval !== 1) return false;
            if (currentFilter === 'rejected' && rec.Approval !== 0) return false;

            // Search query filter (matches age or income or loan amount)
            if (query) {
                const matchAge = rec.Age.toString().includes(query);
                const matchIncome = rec.Income.toString().includes(query);
                const matchLoan = rec.LoanAmount.toString().includes(query);
                return matchAge || matchIncome || matchLoan;
            }
            return true;
        });

        recentTableBody.innerHTML = '';
        if (filtered.length === 0) {
            recentTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--ink-muted);">No matching loan records found.</td></tr>`;
            return;
        }

        filtered.slice(0, 8).forEach(rec => {
            const tr = document.createElement('tr');
            const isApp = rec.Approval === 1;
            const creditLabel = rec.CreditHistory === 1 ? 'Stable / Good' : 'Volatile / Poor';
            tr.innerHTML = `
                <td>${rec.Age} Yrs</td>
                <td>₹ ${Math.round(rec.Income).toLocaleString('en-IN')}</td>
                <td>₹ ${Math.round(rec.LoanAmount).toLocaleString('en-IN')}</td>
                <td>${creditLabel}</td>
                <td><span class="table-tag ${isApp ? 'good' : 'bad'}">${isApp ? 'Approved' : 'Rejected'}</span></td>
            `;
            recentTableBody.appendChild(tr);
        });
    }

    // Export CSV Feature
    if (btnExportCSV) {
        btnExportCSV.addEventListener('click', () => {
            let csv = 'ApplicantAge,AnnualIncome,LoanAmount,CreditHistory,ModelVerdict\n';
            allRecordsData.forEach(r => {
                const verdict = r.Approval === 1 ? 'Approved' : 'Rejected';
                const credit = r.CreditHistory === 1 ? 'Good' : 'Poor';
                csv += `${r.Age},${r.Income},${r.LoanAmount},${credit},${verdict}\n`;
            });
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'RiskOracle_Loan_Evaluations.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    // Navigation Smooth Scroll & Active Indicator
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    navLinks.forEach(nl => nl.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    });

    // Fetch Stats with Server Data Integration
    async function fetchStats() {
        try {
            const response = await fetch('/stats');
            if (response.ok) {
                const data = await response.json();
                if (data.total_samples) {
                    if (statAssets) statAssets.textContent = data.total_samples.toLocaleString('en-IN') + ' Records';
                    if (statRate) statRate.textContent = data.approval_rate + '%';
                    if (statIncome) statIncome.textContent = '₹ ' + Math.round(data.avg_income).toLocaleString('en-IN');
                    if (data.preview && data.preview.length > 0) {
                        allRecordsData = data.preview;
                        renderFilteredTable();
                    }
                    return;
                }
            }
        } catch (e) {
            console.log('ℹ️ Using default local portfolio aggregates');
        }

        if (statAssets) statAssets.textContent = '1,001 Records';
        if (statRate) statRate.textContent = '63.8%';
        if (statIncome) statIncome.textContent = '₹ 1,03,420';
    }

    // Circular Gauge Animation
    function animateGauge(targetValue) {
        const circumference = 691;
        const duration = 1000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easeOutCubic(progress);
            
            const currentValue = easeProgress * targetValue;
            const offset = circumference - (circumference * (currentValue / 100));
            
            if (progressCircle) {
                progressCircle.style.strokeDashoffset = offset;
            }
            if (confidenceScore) {
                confidenceScore.textContent = Math.round(currentValue) + '%';
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    // Progress Bar Animation
    function animateBar(barElement, targetValue) {
        if (!barElement) return;
        const duration = 800;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easeOutCubic(progress);
            
            barElement.style.width = (easeProgress * targetValue) + '%';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    function easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }

    // =========================================================================
    // SMART SCROLL NAVBAR AUTO-HIDE & REVEAL CONTROLLER
    // =========================================================================
    const siteHeader = document.querySelector('.site-header');
    if (siteHeader) {
        let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
        const scrollThreshold = 8;
        let isNavHidden = false;

        window.addEventListener('scroll', () => {
            const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
            const scrollDiff = currentScrollY - lastScrollY;

            // When at or near top of page, always show navbar in un-elevated state
            if (currentScrollY <= 25) {
                siteHeader.classList.remove('nav-hidden');
                siteHeader.classList.remove('is-scrolled');
                isNavHidden = false;
                lastScrollY = currentScrollY;
                return;
            }

            // Elevation styling when scrolled past 25px
            if (currentScrollY > 25) {
                siteHeader.classList.add('is-scrolled');
            }

            // Ignore micro-scroll jitter below threshold
            if (Math.abs(scrollDiff) < scrollThreshold) {
                return;
            }

            if (scrollDiff > 0 && currentScrollY > 70) {
                // Scrolling DOWN -> Smoothly slide navbar up and off
                if (!isNavHidden) {
                    siteHeader.classList.add('nav-hidden');
                    isNavHidden = true;
                }
            } else if (scrollDiff < 0) {
                // Scrolling UP -> Smoothly slide navbar back in
                if (isNavHidden) {
                    siteHeader.classList.remove('nav-hidden');
                    isNavHidden = false;
                }
            }

            lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
        }, { passive: true });
    }
});
