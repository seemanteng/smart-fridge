/**
 * Goals Component 
 * Handles user goals setting and progress tracking
 */

class Goals {
    constructor() {
        this.goals = this.loadGoals();
        this.progress = this.loadProgress();
        this.weeklyStats = this.loadWeeklyStats();
        this.init();
    }

    init() {
        this.renderGoalsForm();
        this.renderWeeklyProgress();
        this.bindEvents();
        this.calculateRecommendations();
    }

    loadGoals() {
        const savedGoals = localStorage.getItem('mtable_goals');
        if (savedGoals) {
            return JSON.parse(savedGoals);
        }

        // Default goals based on general recommendations
        return {
            dailyCalories: 2000,
            dailyProtein: 150,
            dailyCarbs: 250,
            dailyFat: 65,
            dailyFiber: 25,
            dailyWater: 8,
            activityLevel: 'lightly-active',
            goal: 'maintain', // maintain, lose, gain
            weightGoal: null,
            height: null,
            weight: null,
            age: null,
            gender: null,
            preferences: {
                vegetarian: false,
                vegan: false,
                glutenFree: false,
                dairyFree: false,
                lowCarb: false,
                highProtein: false
            }
        };
    }

    loadProgress() {
        const today = new Date().toISOString().split('T')[0];
        const savedProgress = localStorage.getItem(`mtable_progress_${today}`);
        
        if (savedProgress) {
            return JSON.parse(savedProgress);
        }

        return {
            date: today,
            calories: 1850,
            protein: 145,
            carbs: 180,
            fat: 75,
            fiber: 18,
            water: 6,
            exercise: 0,
            steps: 0
        };
    }

    loadWeeklyStats() {
        const savedStats = localStorage.getItem('mtable_weekly_progress');
        if (savedStats) {
            return JSON.parse(savedStats);
        }

        // Generate sample weekly data
        return this.generateSampleWeeklyStats();
    }

    generateSampleWeeklyStats() {
        const stats = {
            daysOnTrack: 6,
            totalDays: 7,
            averageCalories: 1950,
            averageProtein: 145,
            recipesTried: 15,
            weeklyCalories: [],
            weeklyProtein: [],
            streakDays: 12
        };

        // Generate 7 days of sample data
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            stats.weeklyCalories.push({
                date: date.toISOString().split('T')[0],
                calories: Math.floor(Math.random() * 400) + 1800,
                target: this.goals.dailyCalories
            });
            
            stats.weeklyProtein.push({
                date: date.toISOString().split('T')[0],
                protein: Math.floor(Math.random() * 40) + 130,
                target: this.goals.dailyProtein
            });
        }

        return stats;
    }

    saveGoals() {
        localStorage.setItem('mtable_goals', JSON.stringify(this.goals));
        this.calculateRecommendations();
        
        // Notify other components
        window.dispatchEvent(new CustomEvent('goals-updated', {
            detail: { goals: this.goals }
        }));
    }

    saveProgress() {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`mtable_progress_${today}`, JSON.stringify(this.progress));
    }

    renderGoalsForm() {
        const goalsForm = document.querySelector('#goals form');
        if (!goalsForm) return;

        // Update form values
        const calorieInput = goalsForm.querySelector('input[type="number"]');
        const proteinInput = goalsForm.querySelectorAll('input[type="number"]')[1];
        const activitySelect = goalsForm.querySelector('select');

        if (calorieInput) calorieInput.value = this.goals.dailyCalories;
        if (proteinInput) proteinInput.value = this.goals.dailyProtein;
        if (activitySelect) activitySelect.value = this.goals.activityLevel;

        // Add advanced form if it doesn't exist
        this.addAdvancedGoalsForm(goalsForm);
    }

    addAdvancedGoalsForm(form) {
        const existingAdvanced = form.querySelector('.advanced-goals');
        if (existingAdvanced) return;
        
        return;
    }

    renderWeeklyProgress() {
        const progressContainer = document.querySelector('#goals .stats-grid');
        if (!progressContainer) return;

        // Clear existing content
        progressContainer.innerHTML = '';

        // Calculate real weekly stats
        const realWeeklyStats = this.calculateRealWeeklyStats();

        const stats = [
            {
                number: `${realWeeklyStats.daysOnTrack}/${realWeeklyStats.totalDays}`,
                label: 'Days on Track',
                percentage: (realWeeklyStats.daysOnTrack / realWeeklyStats.totalDays) * 100
            },
            {
                number: realWeeklyStats.averageCalories.toLocaleString(),
                label: 'Avg Calories',
                percentage: realWeeklyStats.averageCalories > 0 ? (realWeeklyStats.averageCalories / this.goals.dailyCalories) * 100 : 0
            },
            {
                number: `${realWeeklyStats.averageProtein}g`,
                label: 'Avg Protein',
                percentage: realWeeklyStats.averageProtein > 0 ? (realWeeklyStats.averageProtein / this.goals.dailyProtein) * 100 : 0
            },
            {
                number: realWeeklyStats.mealsLogged.toString(),
                label: 'Meals Logged',
                percentage: Math.min((realWeeklyStats.mealsLogged / 21) * 100, 100) // 3 meals per day * 7 days
            }
        ];

        stats.forEach(stat => {
            const statCard = document.createElement('div');
            statCard.className = 'stat-card';
            statCard.innerHTML = `
                <div class="stat-number">${stat.number}</div>
                <div class="stat-label">${stat.label}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(stat.percentage, 100)}%"></div>
                </div>
            `;
            progressContainer.appendChild(statCard);
        });

        // Add streak and trends with real data
        this.addProgressCharts();
    }

    calculateRealWeeklyStats() {
        const today = new Date();
        const weekStats = {
            totalDays: 7,
            daysOnTrack: 0,
            averageCalories: 0,
            averageProtein: 0,
            mealsLogged: 0,
            totalCalories: 0,
            totalProtein: 0,
            daysWithData: 0
        };

        // Get data for the last 7 days
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            
            // Try to get saved stats for this day
            const dayStats = this.getDayStats(dateKey);
            
            if (dayStats && dayStats.calories > 0) {
                weekStats.daysWithData++;
                weekStats.totalCalories += dayStats.calories;
                weekStats.totalProtein += dayStats.protein || 0;
                weekStats.mealsLogged += dayStats.meals ? dayStats.meals.length : 0;
                
                // Check if day was "on track" (within 90-110% of calorie goal)
                const caloriePercentage = (dayStats.calories / this.goals.dailyCalories) * 100;
                if (caloriePercentage >= 90 && caloriePercentage <= 110) {
                    weekStats.daysOnTrack++;
                }
            }
        }

        // Calculate averages
        if (weekStats.daysWithData > 0) {
            weekStats.averageCalories = Math.round(weekStats.totalCalories / weekStats.daysWithData);
            weekStats.averageProtein = Math.round(weekStats.totalProtein / weekStats.daysWithData);
        }

        return weekStats;
    }

    getDayStats(dateKey) {
        // Try to get stats from localStorage
        const savedStats = localStorage.getItem(`mtable_stats_${dateKey}`);
        if (savedStats) {
            return JSON.parse(savedStats);
        }
        
        // If no saved stats, return null
        return null;
    }

    addProgressCharts() {
        const goalsSection = document.querySelector('#goals');
        if (!goalsSection) return;

        let chartsContainer = goalsSection.querySelector('.progress-charts');
        if (!chartsContainer) {
            chartsContainer = document.createElement('div');
            chartsContainer.className = 'progress-charts';
            chartsContainer.innerHTML = `
                <div class="card">
                    <h3>Weekly Trends</h3>
                    <div class="charts-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-6);">
                        <div class="chart-container">
                            <h4>Calorie Trend</h4>
                            <div class="simple-chart" id="calorieChart"></div>
                        </div>
                        <div class="chart-container">
                            <h4>Protein Trend</h4>
                            <div class="simple-chart" id="proteinChart"></div>
                        </div>
                    </div>
                    <div class="streak-info" style="text-align: center; margin-top: var(--space-6);">
                        <div class="streak-card" style="display: inline-block; padding: var(--space-4); background: var(--bg-secondary); border-radius: var(--radius-lg);">
                            <div class="streak-number" style="font-size: var(--text-3xl); font-weight: var(--font-bold); color: var(--primary-color);">${this.calculateRealStreak()}</div>
                            <div class="streak-label" style="color: var(--text-secondary);">Day Streak</div>
                            <div class="streak-emoji" style="font-size: var(--text-2xl); margin-top: var(--space-2);">🔥</div>
                        </div>
                    </div>
                </div>
            `;
            
            // Insert after the existing cards
            const existingCards = goalsSection.querySelectorAll('.card');
            if (existingCards.length > 1) {
                existingCards[1].after(chartsContainer);
            }
        }

        this.renderSimpleCharts();
    }

    calculateRealStreak() {
        let streak = 0;
        const today = new Date();
        
        // Count consecutive days from today backwards where user was on track
        for (let i = 0; i < 30; i++) { // Check up to 30 days back
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            const dayStats = this.getDayStats(dateKey);
            
            if (dayStats && dayStats.calories > 0) {
                const caloriePercentage = (dayStats.calories / this.goals.dailyCalories) * 100;
                if (caloriePercentage >= 90 && caloriePercentage <= 110) {
                    streak++;
                } else {
                    break; // Streak broken
                }
            } else {
                break; // No data = streak broken
            }
        }
        
        return streak;
    }

    renderSimpleCharts() {
        this.renderCalorieChart();
        this.renderProteinChart();
    }

    renderCalorieChart() {
        const chartContainer = document.getElementById('calorieChart');
        if (!chartContainer) return;

        const data = this.getRealWeeklyCalorieData();
        const maxCalories = Math.max(...data.map(d => d.calories), this.goals.dailyCalories);

        chartContainer.innerHTML = `
            <div class="chart-bars" style="display: flex; align-items: end; gap: var(--space-2); height: 150px; margin: var(--space-4) 0;">
                ${data.map((day, index) => {
                    const height = day.calories > 0 ? (day.calories / maxCalories) * 100 : 10;
                    const targetHeight = (day.target / maxCalories) * 100;
                    const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                    const isOnTarget = day.calories >= day.target * 0.9 && day.calories <= day.target * 1.1;
                    
                    return `
                        <div class="chart-bar-container" style="flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; height: 100%;">
                            <div class="chart-target-line" style="position: absolute; bottom: ${targetHeight}%; width: 100%; height: 2px; background: var(--warning-color); opacity: 0.7;"></div>
                            <div class="chart-bar ${isOnTarget ? 'on-target' : ''}" style="width: 100%; background: ${isOnTarget ? 'var(--success-color)' : 'var(--primary-color)'}; border-radius: var(--radius-sm) var(--radius-sm) 0 0; height: ${height}%; min-height: 10px; position: relative; margin-top: auto;">
                                <div class="chart-value" style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: var(--text-xs); font-weight: var(--font-medium);">${day.calories || 0}</div>
                            </div>
                            <div class="chart-label" style="margin-top: var(--space-1); font-size: var(--text-xs); color: var(--text-secondary);">${dayName}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="chart-legend" style="display: flex; justify-content: center; gap: var(--space-4); margin-top: var(--space-3);">
                <span class="legend-item" style="display: flex; align-items: center; gap: var(--space-1); font-size: var(--text-xs);">
                    <span class="legend-color" style="width: 12px; height: 12px; background: var(--primary-color); border-radius: var(--radius-sm);"></span>
                    Actual
                </span>
                <span class="legend-item" style="display: flex; align-items: center; gap: var(--space-1); font-size: var(--text-xs);">
                    <span class="legend-color" style="width: 12px; height: 2px; background: var(--warning-color);"></span>
                    Target
                </span>
            </div>
        `;
    }

    renderProteinChart() {
        const chartContainer = document.getElementById('proteinChart');
        if (!chartContainer) return;

        const data = this.getRealWeeklyProteinData();
        const maxProtein = Math.max(...data.map(d => d.protein), this.goals.dailyProtein);

        chartContainer.innerHTML = `
            <div class="chart-bars" style="display: flex; align-items: end; gap: var(--space-2); height: 150px; margin: var(--space-4) 0;">
                ${data.map((day, index) => {
                    const height = day.protein > 0 ? (day.protein / maxProtein) * 100 : 10;
                    const targetHeight = (day.target / maxProtein) * 100;
                    const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                    const isOnTarget = day.protein >= day.target * 0.9;
                    
                    return `
                        <div class="chart-bar-container" style="flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; height: 100%;">
                            <div class="chart-target-line" style="position: absolute; bottom: ${targetHeight}%; width: 100%; height: 2px; background: var(--warning-color); opacity: 0.7;"></div>
                            <div class="chart-bar ${isOnTarget ? 'on-target' : ''}" style="width: 100%; background: ${isOnTarget ? 'var(--success-color)' : 'var(--secondary-color)'}; border-radius: var(--radius-sm) var(--radius-sm) 0 0; height: ${height}%; min-height: 10px; position: relative; margin-top: auto;">
                                <div class="chart-value" style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: var(--text-xs); font-weight: var(--font-medium);">${day.protein || 0}g</div>
                            </div>
                            <div class="chart-label" style="margin-top: var(--space-1); font-size: var(--text-xs); color: var(--text-secondary);">${dayName}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    getRealWeeklyCalorieData() {
        const weekData = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            const dayStats = this.getDayStats(dateKey);
            
            weekData.push({
                date: dateKey,
                calories: dayStats ? dayStats.calories || 0 : 0,
                target: this.goals.dailyCalories
            });
        }
        
        return weekData;
    }

    getRealWeeklyProteinData() {
        const weekData = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            const dayStats = this.getDayStats(dateKey);
            
            weekData.push({
                date: dateKey,
                protein: dayStats ? dayStats.protein || 0 : 0,
                target: this.goals.dailyProtein
            });
        }
        
        return weekData;
    }

    bindEvents() {
        // Goals form submission
        const goalsForm = document.querySelector('#goals form');
        if (goalsForm) {
            goalsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateGoals(goalsForm);
            });
        }

        // Real-time input updates
        document.addEventListener('input', (e) => {
            if (e.target.closest('#goals')) {
                this.handleGoalInput(e.target);
            }
        });

        // Preference checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.closest('.preferences-grid')) {
                this.updatePreference(e.target.id, e.target.checked);
            }
        });
    }

    handleGoalInput(input) {
        const id = input.id;
        const value = input.value;

        // Auto-calculate related values
        if (id === 'weight' || id === 'height' || id === 'age' || id === 'gender') {
            this.updateBodyInfo();
        }
    }

    updateGoals(form) {
        // Update basic goals
        const calorieInput = form.querySelector('input[type="number"]');
        const proteinInput = form.querySelectorAll('input[type="number"]')[1];
        const activitySelect = form.querySelector('select');

        if (calorieInput) this.goals.dailyCalories = parseInt(calorieInput.value) || 2000;
        if (proteinInput) this.goals.dailyProtein = parseInt(proteinInput.value) || 150;
        if (activitySelect) this.goals.activityLevel = activitySelect.value;

        // Update advanced goals
        const advancedInputs = {
            age: form.querySelector('#age'),
            gender: form.querySelector('#gender'),
            height: form.querySelector('#height'),
            weight: form.querySelector('#weight'),
            primaryGoal: form.querySelector('#primaryGoal'),
            targetWeight: form.querySelector('#targetWeight'),
            carbs: form.querySelector('#carbs'),
            fat: form.querySelector('#fat'),
            fiber: form.querySelector('#fiber'),
            water: form.querySelector('#water')
        };

        Object.keys(advancedInputs).forEach(key => {
            const input = advancedInputs[key];
            if (input) {
                if (key === 'gender' || key === 'primaryGoal') {
                    this.goals[key === 'primaryGoal' ? 'goal' : key] = input.value;
                } else if (key === 'targetWeight') {
                    this.goals.weightGoal = parseFloat(input.value) || null;
                } else if (['carbs', 'fat', 'fiber', 'water'].includes(key)) {
                    this.goals[`daily${key.charAt(0).toUpperCase() + key.slice(1)}`] = parseInt(input.value) || 0;
                } else {
                    this.goals[key] = parseFloat(input.value) || null;
                }
            }
        });

        this.saveGoals();
        this.validateGoals();
        
        if (window.showToast) {
            showToast('Goals updated successfully!', 'success');
        }
    }

    updatePreference(preference, value) {
        this.goals.preferences[preference] = value;
        this.saveGoals();
        
        // Handle conflicting preferences
        this.handlePreferenceConflicts(preference, value);
    }

    handlePreferenceConflicts(preference, value) {
        if (value) {
            // If vegan is selected, also select vegetarian
            if (preference === 'vegan') {
                this.goals.preferences.vegetarian = true;
                const vegInput = document.querySelector('#vegetarian');
                if (vegInput) vegInput.checked = true;
            }
            
            // If low carb is selected, suggest higher protein
            if (preference === 'lowCarb') {
                this.goals.preferences.highProtein = true;
                const proteinInput = document.querySelector('#highProtein');
                if (proteinInput) proteinInput.checked = true;
                this.suggestLowCarbMacros();
            }
        } else {
            // If vegetarian is unselected, also unselect vegan
            if (preference === 'vegetarian') {
                this.goals.preferences.vegan = false;
                const veganInput = document.querySelector('#vegan');
                if (veganInput) veganInput.checked = false;
            }
        }
    }

    calculateBMR() {
        if (!this.goals.weight || !this.goals.height || !this.goals.age || !this.goals.gender) {
            if (window.showToast) {
                showToast('Please fill in weight, height, age, and gender first', 'warning');
            }
            return;
        }

        let bmr;
        const weight = this.goals.weight;
        const height = this.goals.height;
        const age = this.goals.age;

        // Mifflin-St Jeor Equation
        if (this.goals.gender === 'male') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }

        bmr = Math.round(bmr);

        return bmr;
    }

    calculateTDEE() {
        const bmr = this.calculateBMR();
        if (!bmr) return;

        const multipliers = {
            'sedentary': 1.2,
            'lightly-active': 1.375,
            'moderately-active': 1.55,
            'very-active': 1.725,
            'extremely-active': 1.9
        };

        const multiplier = multipliers[this.goals.activityLevel] || 1.375;
        const tdee = Math.round(bmr * multiplier);

        // Auto-update calorie goal
        this.goals.dailyCalories = tdee;
        const calorieInput = document.querySelector('#goals input[type="number"]');
        if (calorieInput) {
            calorieInput.value = tdee;
        }

        this.saveGoals();
        
        if (window.showToast) {
            showToast(`TDEE calculated: ${tdee} calories. Goal updated!`, 'success');
        }
    }

    suggestMacros() {
        const calories = this.goals.dailyCalories;
        let proteinRatio, carbRatio, fatRatio;

        // Adjust ratios based on goals and preferences
        if (this.goals.preferences.lowCarb) {
            proteinRatio = 0.30;
            carbRatio = 0.20;
            fatRatio = 0.50;
        } else if (this.goals.preferences.highProtein || this.goals.goal === 'muscle') {
            proteinRatio = 0.30;
            carbRatio = 0.40;
            fatRatio = 0.30;
        } else if (this.goals.goal === 'lose') {
            proteinRatio = 0.25;
            carbRatio = 0.45;
            fatRatio = 0.30;
        } else {
            // Balanced approach
            proteinRatio = 0.20;
            carbRatio = 0.50;
            fatRatio = 0.30;
        }

        const suggestedProtein = Math.round((calories * proteinRatio) / 4);
        const suggestedCarbs = Math.round((calories * carbRatio) / 4);
        const suggestedFat = Math.round((calories * fatRatio) / 9);

        // Update form inputs
        const proteinInput = document.querySelector('#goals input[type="number"]:nth-of-type(2)');
        const carbsInput = document.querySelector('#carbs');
        const fatInput = document.querySelector('#fat');

        if (proteinInput) proteinInput.value = suggestedProtein;
        if (carbsInput) carbsInput.value = suggestedCarbs;
        if (fatInput) fatInput.value = suggestedFat;

        // Update goals object
        this.goals.dailyProtein = suggestedProtein;
        this.goals.dailyCarbs = suggestedCarbs;
        this.goals.dailyFat = suggestedFat;

        this.saveGoals();
        
        if (window.showToast) {
            showToast(`Macros suggested: ${suggestedProtein}g protein, ${suggestedCarbs}g carbs, ${suggestedFat}g fat`, 'success');
        }
    }

    suggestLowCarbMacros() {
        const calories = this.goals.dailyCalories;
        const protein = Math.round((calories * 0.30) / 4);
        const carbs = Math.round((calories * 0.15) / 4);
        const fat = Math.round((calories * 0.55) / 9);

        this.goals.dailyProtein = protein;
        this.goals.dailyCarbs = carbs;
        this.goals.dailyFat = fat;

        // Update inputs if they exist
        const proteinInput = document.querySelector('#goals input[type="number"]:nth-of-type(2)');
        const carbsInput = document.querySelector('#carbs');
        const fatInput = document.querySelector('#fat');

        if (proteinInput) proteinInput.value = protein;
        if (carbsInput) carbsInput.value = carbs;
        if (fatInput) fatInput.value = fat;
    }

    updateBodyInfo() {
        // Auto-calculate BMI if height and weight are available
        if (this.goals.height && this.goals.weight) {
            const heightM = this.goals.height / 100;
            const bmi = this.goals.weight / (heightM * heightM);
            this.goals.bmi = Math.round(bmi * 10) / 10;
        }
    }

    validateGoals() {
        const warnings = [];
        
        // Check for very low calories
        if (this.goals.dailyCalories < 1200) {
            warnings.push('Daily calorie goal seems very low. Consider consulting a healthcare provider.');
        }
        
        // Check for very high calories
        if (this.goals.dailyCalories > 4000) {
            warnings.push('Daily calorie goal seems very high. Make sure this aligns with your activity level.');
        }
        
        // Check protein adequacy
        const proteinPerKg = this.goals.weight ? this.goals.dailyProtein / this.goals.weight : 0;
        if (proteinPerKg < 0.8) {
            warnings.push('Protein goal might be too low. Consider at least 0.8g per kg of body weight.');
        }
        
        // Show warnings
        if (warnings.length > 0 && window.showToast) {
            warnings.forEach(warning => {
                setTimeout(() => showToast(warning, 'warning'), 100);
            });
        }
    }

    calculateRecommendations() {
        // Calculate ideal ranges based on user input
        if (this.goals.weight && this.goals.height && this.goals.age && this.goals.gender) {
            const bmr = this.calculateBMR();
            const idealProtein = Math.round(this.goals.weight * 1.2); // 1.2g per kg for active individuals
            const idealWater = Math.round(this.goals.weight * 0.033); // 33ml per kg
            
            this.recommendations = {
                bmr: bmr,
                idealProtein: idealProtein,
                idealWater: idealWater,
                lastCalculated: new Date().toISOString()
            };
        }
    }

    getGoalStatus() {
        const today = this.progress;
        const goals = this.goals;
        
        return {
            calories: {
                current: today.calories,
                target: goals.dailyCalories,
                percentage: (today.calories / goals.dailyCalories) * 100,
                status: this.getStatus(today.calories, goals.dailyCalories)
            },
            protein: {
                current: today.protein,
                target: goals.dailyProtein,
                percentage: (today.protein / goals.dailyProtein) * 100,
                status: this.getStatus(today.protein, goals.dailyProtein)
            },
            carbs: {
                current: today.carbs,
                target: goals.dailyCarbs,
                percentage: (today.carbs / goals.dailyCarbs) * 100,
                status: this.getStatus(today.carbs, goals.dailyCarbs)
            },
            fat: {
                current: today.fat,
                target: goals.dailyFat,
                percentage: (today.fat / goals.dailyFat) * 100,
                status: this.getStatus(today.fat, goals.dailyFat)
            }
        };
    }

    getStatus(current, target) {
        const percentage = (current / target) * 100;
        
        if (percentage < 80) return 'under';
        if (percentage <= 110) return 'on-track';
        return 'over';
    }

    updateProgress(calories, protein, carbs, fat) {
        this.progress.calories += calories;
        this.progress.protein += protein;
        this.progress.carbs += carbs;
        this.progress.fat += fat;
        
        this.saveProgress();
        this.updateWeeklyStats();
    }

    updateWeeklyStats() {
        // Update today's entry in weekly stats
        const today = new Date().toISOString().split('T')[0];
        
        // Update calorie data
        const calorieEntry = this.weeklyStats.weeklyCalories.find(entry => entry.date === today);
        if (calorieEntry) {
            calorieEntry.calories = this.progress.calories;
        }
        
        // Update protein data
        const proteinEntry = this.weeklyStats.weeklyProtein.find(entry => entry.date === today);
        if (proteinEntry) {
            proteinEntry.protein = this.progress.protein;
        }
        
        // Recalculate averages
        this.weeklyStats.averageCalories = Math.round(
            this.weeklyStats.weeklyCalories.reduce((sum, day) => sum + day.calories, 0) / 7
        );
        
        this.weeklyStats.averageProtein = Math.round(
            this.weeklyStats.weeklyProtein.reduce((sum, day) => sum + day.protein, 0) / 7
        );
        
        // Update days on track
        this.weeklyStats.daysOnTrack = this.weeklyStats.weeklyCalories.filter(day => {
            const percentage = (day.calories / day.target) * 100;
            return percentage >= 90 && percentage <= 110;
        }).length;
        
        localStorage.setItem('mtable_weekly_progress', JSON.stringify(this.weeklyStats));
    }

    resetProgress() {
        const today = new Date().toISOString().split('T')[0];
        this.progress = {
            date: today,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            water: 0,
            exercise: 0,
            steps: 0
        };
        this.saveProgress();
    }

    exportGoals() {
        const data = {
            goals: this.goals,
            weeklyStats: this.weeklyStats,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mtable-goals-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        if (window.showToast) {
            showToast('Goals exported successfully!', 'success');
        }
    }

    importGoals(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.goals) {
                    this.goals = { ...this.goals, ...data.goals };
                    this.saveGoals();
                    this.renderGoalsForm();
                    this.renderWeeklyProgress();
                    
                    if (window.showToast) {
                        showToast('Goals imported successfully!', 'success');
                    }
                }
            } catch (error) {
                if (window.showToast) {
                    showToast('Error importing goals file', 'error');
                }
            }
        };
        reader.readAsText(file);
    }

    // Public API methods for other components
    getCalorieGoal() {
        return this.goals.dailyCalories;
    }

    getProteinGoal() {
        return this.goals.dailyProtein;
    }

    getMacroGoals() {
        return {
            calories: this.goals.dailyCalories,
            protein: this.goals.dailyProtein,
            carbs: this.goals.dailyCarbs,
            fat: this.goals.dailyFat
        };
    }

    getAllGoals() {
        return { ...this.goals };
    }

    updateGoal(goalType, value) {
        if (this.goals.hasOwnProperty(goalType)) {
            this.goals[goalType] = value;
            this.saveGoals();
            return true;
        }
        return false;
    }

    getWeeklyProgress() {
        return { ...this.weeklyStats };
    }

    getTodayProgress() {
        return { ...this.progress };
    }

    isOnTrack() {
        const status = this.getGoalStatus();
        return status.calories.status === 'on-track' && status.protein.status === 'on-track';
    }

    getDailyRemaining() {
        return {
            calories: Math.max(0, this.goals.dailyCalories - this.progress.calories),
            protein: Math.max(0, this.goals.dailyProtein - this.progress.protein),
            carbs: Math.max(0, this.goals.dailyCarbs - this.progress.carbs),
            fat: Math.max(0, this.goals.dailyFat - this.progress.fat)
        };
    }

    calculateCalorieAdjustment() {
        // Calculate calorie adjustment based on goal
        let adjustment = 0;
        
        if (this.goals.goal === 'lose') {
            adjustment = -500; // 500 calorie deficit for 1lb/week loss
        } else if (this.goals.goal === 'gain') {
            adjustment = 500; // 500 calorie surplus for 1lb/week gain
        }
        
        return this.goals.dailyCalories + adjustment;
    }

    getBMICategory() {
        if (!this.goals.bmi) return 'Unknown';
        
        if (this.goals.bmi < 18.5) return 'Underweight';
        if (this.goals.bmi < 25) return 'Normal weight';
        if (this.goals.bmi < 30) return 'Overweight';
        return 'Obese';
    }

    getProgressSummary() {
        const status = this.getGoalStatus();
        const remaining = this.getDailyRemaining();
        
        return {
            todayStatus: status,
            remaining: remaining,
            weeklyStats: this.weeklyStats,
            streak: this.weeklyStats.streakDays,
            bmi: this.goals.bmi,
            bmiCategory: this.getBMICategory(),
            isOnTrack: this.isOnTrack()
        };
    }

    // Utility methods
    formatMacroSplit() {
        const total = this.goals.dailyCalories;
        const proteinCals = this.goals.dailyProtein * 4;
        const carbCals = this.goals.dailyCarbs * 4;
        const fatCals = this.goals.dailyFat * 9;
        
        return {
            protein: Math.round((proteinCals / total) * 100),
            carbs: Math.round((carbCals / total) * 100),
            fat: Math.round((fatCals / total) * 100)
        };
    }

    predictWeightChange() {
        // Simple prediction based on calorie deficit/surplus
        const dailyBalance = this.progress.calories - this.goals.dailyCalories;
        const weeklyBalance = dailyBalance * 7;
        const predictedWeightChange = weeklyBalance / 3500; // 3500 calories = 1 pound
        
        return {
            dailyBalance: dailyBalance,
            weeklyBalance: weeklyBalance,
            predictedWeightChangePerWeek: Math.round(predictedWeightChange * 10) / 10
        };
    }
}

// Add CSS for charts and additional styling
const goalsCSS = `
<style>
.form-section {
    margin-bottom: var(--space-6);
    padding: var(--space-4);
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-light);
}

.form-section h4 {
    margin-bottom: var(--space-4);
    color: var(--text-primary);
    font-size: var(--text-lg);
}

.preferences-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--space-3);
}

.preference-checkbox {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
    padding: var(--space-2);
    border-radius: var(--radius-md);
    transition: var(--transition-fast);
}

.preference-checkbox:hover {
    background: var(--bg-tertiary);
}

.calculation-buttons {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
}

.charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-6);
}

.chart-container h4 {
    margin-bottom: var(--space-3);
    color: var(--text-primary);
    text-align: center;
}

.simple-chart {
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    border: 1px solid var(--border-light);
}

.chart-bars {
    display: flex;
    align-items: end;
    gap: var(--space-2);
    height: 150px;
    margin: var(--space-4) 0;
}

.chart-bar-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    height: 100%;
}

.chart-bar {
    width: 100%;
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    min-height: 10px;
    position: relative;
    margin-top: auto;
    transition: var(--transition-normal);
}

.chart-bar.on-target {
    background: var(--success-color) !important;
}

.chart-value {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    white-space: nowrap;
}

.chart-label {
    margin-top: var(--space-1);
    font-size: var(--text-xs);
    color: var(--text-secondary);
}

.chart-target-line {
    position: absolute;
    width: 100%;
    height: 2px;
    background: var(--warning-color);
    opacity: 0.7;
}

.chart-legend {
    display: flex;
    justify-content: center;
    gap: var(--space-4);
    margin-top: var(--space-3);
}

.legend-item {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-xs);
}

.legend-color {
    width: 12px;
    height: 12px;
    border-radius: var(--radius-sm);
}

.streak-info {
    text-align: center;
    margin-top: var(--space-6);
}

.streak-card {
    display: inline-block;
    padding: var(--space-4);
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-light);
}

.streak-number {
    font-size: var(--text-3xl);
    font-weight: var(--font-bold);
    color: var(--primary-color);
}

.streak-label {
    color: var(--text-secondary);
    margin-top: var(--space-1);
}

.streak-emoji {
    font-size: var(--text-2xl);
    margin-top: var(--space-2);
}

.progress-charts {
    margin-top: var(--space-8);
}

.advanced-goals {
    margin-top: var(--space-6);
}
</style>
`;

// Inject CSS if not already present
if (!document.querySelector('#goals-css')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'goals-css';
    styleSheet.innerHTML = goalsCSS.replace('<style>', '').replace('</style>', '');
    document.head.appendChild(styleSheet);
}

// Initialize goals when DOM is loaded
let goals;
document.addEventListener('DOMContentLoaded', function() {
    goals = new Goals();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Goals;
}