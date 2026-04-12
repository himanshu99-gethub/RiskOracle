document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ RiskOracle Script Loaded - Form initialized');
    const loanForm = document.getElementById('loanForm');
    const resetBtn = loanForm.querySelector('button[type="reset"]');

    // Element References for new design
    const verdictText = document.getElementById('verdictText');
    const confidenceScore = document.getElementById('confidenceScore');
    const progressCircle = document.getElementById('progressCircle');
    const riskLevel = document.getElementById('riskLevel');
    const oracleQuote = document.getElementById('oracleQuote');
    const exposure = document.getElementById('exposure');
    const durationInput = document.getElementById('duration');
    const durationDisplay = document.getElementById('durationDisplay');
    const computedTime = document.getElementById('computedTime');
    const creditBar = document.getElementById('creditBar');
    const collateralBar = document.getElementById('collateralBar');
    const volatilityBar = document.getElementById('volatilityBar');
    const creditVal = document.getElementById('creditVal');
    const collateralVal = document.getElementById('collateralVal');
    const volatilityVal = document.getElementById('volatilityVal');
    const insightText = document.getElementById('insightText');
    const appId = document.getElementById('appId');
    const statAssets = document.getElementById('statAssets');
    const statRate = document.getElementById('statRate');
    const statIncome = document.getElementById('statIncome');
    const navLinks = document.querySelectorAll('.nav-link');
    const growthMetric = document.getElementById('growthMetric');
    const sensitivityMetric = document.getElementById('sensitivityMetric');

    // Load initial stats
    fetchStats();

    // Form Submission
    loanForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('📋 Form submitted');
        
        const btn = loanForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Processing...';
        btn.disabled = true;

        const formData = {
            age: parseFloat(document.getElementById('age').value),
            income: parseFloat(document.getElementById('income').value),
            loan_amount: parseFloat(document.getElementById('loan_amount').value),
            credit_history: document.querySelector('input[name="credit_history"]:checked').value
        };
        
        console.log('📝 Form data:', formData);

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            console.log('✓ API Response:', data);

            if (data.status === 'success') {
                console.log('🎯 Displaying results...');
                displayResult(data, formData);
            } else {
                console.error('❌ Prediction failed:', data);
                alert('Prediction failed. Please try again.');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Connection error occurred.');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });

    function displayResult(data, inputs) {
        console.log('📊 Starting displayResult...');
        
        // Generate Application ID
        const newAppId = 'RO-' + Math.random().toString(36).substr(2, 5).toUpperCase();
        appId.textContent = newAppId;
        console.log('📌 App ID:', newAppId);

        // Update Verdict
        const isApproved = data.prediction === 1;
        verdictText.textContent = isApproved ? 'Approved' : 'Rejected';
        verdictText.style.background = isApproved ? 'rgba(0, 255, 148, 0.1)' : 'rgba(255, 59, 59, 0.1)';
        verdictText.style.color = isApproved ? 'var(--accent-green)' : 'var(--accent-red)';
        
        // Update Gauge color dynamically
        progressCircle.style.stroke = isApproved ? 'var(--primary-color)' : 'var(--accent-red)';
        progressCircle.style.filter = `drop-shadow(0 0 12px ${isApproved ? 'var(--primary-color)' : 'var(--accent-red)'})`;
        confidenceScore.style.color = isApproved ? 'var(--primary-color)' : 'var(--accent-red)';

        // Calculate probability percentage
        const probability = Math.round(data.probability * 100);
        
        // Animate gauge
        animateGauge(probability);
        
        // Update risk profile
        if (probability >= 80) {
            riskLevel.textContent = 'Low-Risk Profile';
            oracleQuote.textContent = '"The oracle detects high stability in historical repayment structures paired with a robust current liquidity ratio. Proceed with standard verification protocols."';
        } else if (probability >= 60) {
            riskLevel.textContent = 'Medium-Risk Profile';
            oracleQuote.textContent = '"The oracle detects moderate stability with acceptable liquidity structures. Proceed with enhanced verification protocols."';
        } else {
            riskLevel.textContent = 'High-Risk Profile';
            oracleQuote.textContent = '"The oracle detects elevated risk markers. Additional documentation and enhanced verification protocols are recommended."';
        }

        // Calculate and update risk factors based on inputs
        const creditScore = isApproved ? 85 + Math.random() * 15 : 50 + Math.random() * 30;
        const collateralCoverage = Math.min(100, Math.max(30, (inputs.income / inputs.loan_amount * 100)));
        const volatility = 100 - probability;

        animateBar(creditBar, creditScore);
        animateBar(collateralBar, collateralCoverage);
        animateBar(volatilityBar, volatility);

        creditVal.textContent = Math.round(creditScore) + '%';
        collateralVal.textContent = Math.round(collateralCoverage) + '%';
        volatilityVal.textContent = Math.round(volatility) + '%';

        // Update metrics
        exposure.textContent = '₹' + (inputs.loan_amount).toLocaleString();
        durationDisplay.textContent = durationInput.value + ' Months';

        // Update computed time
        const now = new Date();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedTime = monthNames[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear() + 
                              ' • ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');
        computedTime.textContent = formattedTime;

        // Update insight text
        if (isApproved) {
            insightText.textContent = `Predictive modeling suggests a ${(1 - data.probability).toFixed(2)}% probability of default over a 12-month trailing period based on current market trends.`;
        } else {
            insightText.textContent = `Risk assessment indicates higher volatility. Recommendation: require additional documentation or collateral to proceed with this application.`;
        }

        // Update growth and sensitivity metrics
        if (probability >= 80) {
            growthMetric.textContent = 'Strong';
            sensitivityMetric.textContent = 'Low';
        } else if (probability >= 60) {
            growthMetric.textContent = 'Moderate';
            sensitivityMetric.textContent = 'Medium';
        } else {
            growthMetric.textContent = 'Weak';
            sensitivityMetric.textContent = 'High';
        }

        // Scroll to results
        setTimeout(() => {
            document.querySelector('#dashboard').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }

    // Sidebar Navigation logic
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    // Update active state
                    navLinks.forEach(nl => nl.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    });

    async function fetchStats() {
        try {
            const response = await fetch('/stats');
            const data = await response.json();
            if (data.total_samples && statAssets) {
                statAssets.textContent = data.total_samples + ' Entries';
                if (statRate) statRate.textContent = data.approval_rate + '%';
                if (data.avg_income && statIncome) {
                    statIncome.textContent = '₹' + data.avg_income.toLocaleString();
                }
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }

    function animateGauge(targetValue) {
        const circumference = 691; // SVG circle circumference
        let currentValue = 0;
        const duration = 1200;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            currentValue = progress * targetValue;
            const offset = circumference - (circumference * (currentValue / 100));
            
            progressCircle.style.strokeDashoffset = offset;
            
            animateValue(confidenceScore, 0, targetValue, duration);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    function animateBar(barElement, targetValue) {
        let currentValue = 0;
        const duration = 800;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            currentValue = progress * targetValue;
            barElement.style.width = currentValue + '%';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            element.textContent = current + '%';
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    }

    // Reset Form
    resetBtn.addEventListener('click', () => {
        loanForm.reset();
        // Reset display values
        verdictText.textContent = 'Pending';
        confidenceScore.textContent = '--';
        progressCircle.style.strokeDashoffset = '691';
        riskLevel.textContent = 'Pending';
        oracleQuote.textContent = 'Analyzing applicant profile...';
        creditVal.textContent = '--';
        collateralVal.textContent = '--';
        volatilityVal.textContent = '--';
        creditBar.style.width = '0%';
        collateralBar.style.width = '0%';
        volatilityBar.style.width = '0%';
        exposure.textContent = '₹--,---';
        durationDisplay.textContent = '-- Months';
        insightText.textContent = 'Predictive modeling suggests...';
        growthMetric.textContent = '--';
        sensitivityMetric.textContent = '--';
    });
});
