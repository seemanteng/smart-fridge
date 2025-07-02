/**
 * Goals Component - Complete Updated Version
 * Handles user goals setting, progress tracking, and insights with fixed fats stats
 */
class Goals {
    constructor() {
        this.goals = this.loadGoals();
        this.userProfile = this.loadUserProfile();
        this.weeklyStats = this.loadWeeklyStats();
        this.chart = null;
        this.init();
    }

    init() {
        // Delay initialization to ensure DOM is ready
        setTimeout(() => {
            this.renderGoalsForm();
            this.renderWeeklyChart();
            this.renderMacroStats();
            this.renderSummaryStats();
            this.renderExerciseSuggestions();
            this.renderRecipeSuggestions();
            
            // Initialize visual layout
            this.refreshGoalsDisplayVisual();
            
            this.bindEvents();
        }, 1000);
    }

    loadGoals() {
        const savedGoals = localStorage.getItem('mtable_goals');
        if (savedGoals) {
            return JSON.parse(savedGoals);
        }
        return {
            dailyCalories: 2000,
            dailyProtein: 150,
            dailyCarbs: 87,
            dailyFat: 97
        };
    }

    loadUserProfile() {
        const savedProfile = localStorage.getItem('mtable_user_profile');
        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            return {
                firstName: profile.firstName || null,
                age: profile.age || null,
                gender: profile.gender || null,
                weight: profile.weight || null,
                height: profile.height || null,
                activityLevel: profile.activityLevel || 'moderate',
                goal: profile.goal || 'maintain'
            };
        }
        return {
            firstName: null,
            age: null,
            gender: null,
            weight: null,
            height: null,
            activityLevel: 'moderate',
            goal: 'maintain'
        };
    }

    loadWeeklyStats() {
        // Get actual data from the last 7 days
        const weeklyData = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            
            // Try to get data from multiple sources
            let dayStats = this.getDayStats(dateKey);
            
            // If no stats found, check if it's today and get from dashboard
            if (!dayStats && i === 0 && window.dashboard) {
                const todayStats = window.dashboard.getTodayStats();
                if (todayStats) {
                    dayStats = {
                        calories: todayStats.calories || 0,
                        protein: todayStats.protein || 0,
                        carbs: todayStats.carbs || 0,
                        fat: todayStats.fat || 0
                    };
                }
            }
            
            weeklyData.push({
                date: dateKey,
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                calories: dayStats ? dayStats.calories || 0 : 0,
                protein: dayStats ? dayStats.protein || 0 : 0,
                carbs: dayStats ? dayStats.carbs || 0 : 0,
                fat: dayStats ? dayStats.fat || 0 : 0
            });
        }
        
        console.log('Weekly stats loaded:', weeklyData); // Debug log
        return weeklyData;
    }

    // Force refresh all data and displays
    refreshGoalsDisplay() {
        console.log('Refreshing goals display...');
        this.weeklyStats = this.loadWeeklyStats();
        this.renderWeeklyChart();
        this.renderMacroStats();
        this.renderSummaryStats();
        this.renderExerciseSuggestions();
        this.renderRecipeSuggestions();
    }
    getDayStats(dateKey) {
        const savedStats = localStorage.getItem(`mtable_stats_${dateKey}`);
        return savedStats ? JSON.parse(savedStats) : null;
    }

    saveGoals() {
        localStorage.setItem('mtable_goals', JSON.stringify(this.goals));
        this.renderGoalsForm();
        this.renderWeeklyChart();
        this.renderMacroStats();
        this.renderSummaryStats();
        
        // Notify other components
        window.dispatchEvent(new CustomEvent('goals-updated', {
            detail: { goals: this.goals }
        }));
    }

    saveUserProfile() {
        localStorage.setItem('mtable_user_profile', JSON.stringify(this.userProfile));
        this.renderExerciseSuggestions();
        this.renderRecipeSuggestions();
    }

    renderGoalsForm() {
        // Update the input fields with current values
        const calorieInput = document.getElementById('dailyCalorieGoal');
        const proteinInput = document.getElementById('dailyProteinGoal');
        const carbsInput = document.getElementById('dailyCarbsGoal');
        const fatsInput = document.getElementById('dailyFatsGoal');
        const ageInput = document.getElementById('userAge');
        const genderInput = document.getElementById('userGender');

        if (calorieInput) calorieInput.value = this.goals.dailyCalories;
        if (proteinInput) proteinInput.value = this.goals.dailyProtein;
        if (carbsInput) carbsInput.value = this.goals.dailyCarbs;
        if (fatsInput) fatsInput.value = this.goals.dailyFat;
        if (ageInput) ageInput.value = this.userProfile.age || '';
        if (genderInput) genderInput.value = this.userProfile.gender || '';

        // Update target displays
        const targetCalories = document.getElementById('targetCalories');
        if (targetCalories) {
            targetCalories.textContent = this.goals.dailyCalories;
        }
    }

     renderWeeklyChart() {
    const canvas = document.getElementById('caloriesChart');
    if (!canvas) {
        console.log('Canvas not found');
        return;
    }

    // Refresh weekly stats before rendering
    this.weeklyStats = this.loadWeeklyStats();
    
    // Ensure canvas is visible and has dimensions
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        console.log('Canvas has no dimensions, retrying...');
        setTimeout(() => this.renderWeeklyChart(), 1000);
        return;
    }

    const ctx = canvas.getContext('2d');
    const data = this.weeklyStats;

    // Set canvas size properly
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.offsetWidth;
    const displayHeight = canvas.offsetHeight;
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    const padding = 40;
    const chartWidth = displayWidth - (padding * 2);
    const chartHeight = displayHeight - (padding * 2);

    // Find max value for scaling
    const maxCalories = Math.max(...data.map(d => d.calories), this.goals.dailyCalories, 100);
    const scale = chartHeight / maxCalories;

    // Draw bars
    const barWidth = chartWidth / 7;
    data.forEach((day, index) => {
        const barHeight = Math.max(day.calories * scale, 3);
        const x = padding + (index * barWidth) + (barWidth * 0.15);
        const y = displayHeight - padding - barHeight;
        const actualBarWidth = barWidth * 0.7;

        // Determine color
        const percentage = (day.calories / this.goals.dailyCalories) * 100;
        let color;
        if (percentage >= 90 && percentage <= 110) {
            color = '#4CAF50'; // Perfect - green
        } else if (percentage < 80) {
            color = '#FFC107'; // Under - yellow
        } else if (percentage > 120) {
            color = '#FF5722'; // Over - red
        } else {
            color = '#2196F3'; // Close - blue
        }

        // Draw bar
        ctx.fillStyle = color;
        ctx.fillRect(x, y, actualBarWidth, barHeight);

        // Draw percentage label
        if (day.calories > 0) {
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            const percentText = Math.round(percentage) + '%';
            ctx.fillText(percentText, x + actualBarWidth/2, y - 5);
        }
    });

    // Draw target line
    const targetY = displayHeight - padding - (this.goals.dailyCalories * scale);
    ctx.strokeStyle = '#FF9800';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding, targetY);
    ctx.lineTo(displayWidth - padding, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Update current calories display
    const today = data[data.length - 1];
    const currentCalories = document.getElementById('currentCalories');
    if (currentCalories) {
        currentCalories.textContent = today.calories;
    }

    console.log('Chart rendered with data:', data);
}

    renderMacroStats() {
        const today = this.weeklyStats[this.weeklyStats.length - 1] || { protein: 0, carbs: 0, fat: 0 };
        
        console.log('Rendering macro stats:', today); // Debug log
        
        // Protein stats
        this.renderMacroCard('protein', today.protein, this.goals.dailyProtein, '#E91E63');
        
        // Carbs stats
        this.renderMacroCard('carbs', today.carbs, this.goals.dailyCarbs, '#FF9800');
        
        // Fats stats - fixed the naming issue
        this.renderMacroCard('fats', today.fat, this.goals.dailyFat, '#9C27B0');
    }

    renderMacroCard(macroType, current, target, color) {
        // Handle the fats vs fat naming inconsistency
        const elementSuffix = macroType === 'fats' ? 'fats' : macroType;
        const statsElement = document.getElementById(`${elementSuffix}Stats`);
        const chartElement = document.getElementById(`${elementSuffix}Chart`);
        
        console.log(`Rendering ${macroType}: current=${current}, target=${target}`); // Debug log
        console.log(`Looking for elements: ${elementSuffix}Stats, ${elementSuffix}Chart`); // Debug log
        
        if (!statsElement) {
            console.error(`Stats element not found: ${elementSuffix}Stats`);
            return;
        }
        
        const percentage = Math.round((current / target) * 100);
        
        // Update stats content
        statsElement.innerHTML = `
            <div class="macro-current">${current}g / ${target}g</div>
            <div class="macro-percentage">${percentage}% of goal</div>
            <div class="macro-status">${this.getMacroStatus(percentage)}</div>
        `;
        
        // Draw mini chart if canvas exists
        if (chartElement) {
            this.drawMacroChart(chartElement, current, target, color);
        } else {
            console.warn(`Chart element not found: ${elementSuffix}Chart`);
        }
    }

    drawMacroChart(canvas, current, target, color) {
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = canvas.offsetWidth;
        const displayHeight = canvas.offsetHeight;
        
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
        ctx.scale(dpr, dpr);
        
        const centerX = displayWidth / 2;
        const centerY = displayHeight / 2;
        const radius = Math.min(displayWidth, displayHeight) / 2 - 5;
        
        // Clear canvas
        ctx.clearRect(0, 0, displayWidth, displayHeight);
        
        // Draw background circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 6;
        ctx.stroke();
        
        // Draw progress arc
        const percentage = Math.min((current / target), 1);
        const endAngle = (percentage * 2 * Math.PI) - (Math.PI / 2);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle);
        ctx.strokeStyle = color;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        // Draw percentage text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(percentage * 100) + '%', centerX, centerY);
    }

    getMacroStatus(percentage) {
        if (percentage < 50) return 'Low - Consider increasing intake';
        if (percentage < 80) return 'Below target - Room for improvement';
        if (percentage <= 110) return 'On track - Great job!';
        if (percentage <= 130) return 'Slightly over - Monitor intake';
        return 'High - Consider reducing intake';
    }

    renderSummaryStats() {
        const averageStats = document.getElementById('averageStats');
        if (!averageStats) return;
        
        // Calculate weekly averages
        const totalDays = this.weeklyStats.length;
        const avgCalories = Math.round(this.weeklyStats.reduce((sum, day) => sum + day.calories, 0) / totalDays);
        const avgProtein = Math.round(this.weeklyStats.reduce((sum, day) => sum + day.protein, 0) / totalDays);
        const avgCarbs = Math.round(this.weeklyStats.reduce((sum, day) => sum + day.carbs, 0) / totalDays);
        const avgFat = Math.round(this.weeklyStats.reduce((sum, day) => sum + day.fat, 0) / totalDays);
        
        // Days on track calculation
        const daysOnTrack = this.weeklyStats.filter(day => {
            const percentage = (day.calories / this.goals.dailyCalories) * 100;
            return percentage >= 90 && percentage <= 110;
        }).length;
        
        averageStats.innerHTML = `
            <div class="stats-layout">
                <div class="stat-item">
                    <div class="stat-label">Average Calories</div>
                    <div class="stat-value">${avgCalories} kcal</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Average Protein</div>
                    <div class="stat-value">${avgProtein}g</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Average Carbs</div>
                    <div class="stat-value">${avgCarbs}g</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Average Fats</div>
                    <div class="stat-value">${avgFat}g</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Days on Track</div>
                    <div class="stat-value">${daysOnTrack}/7 days</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Weekly Consistency</div>
                    <div class="stat-value">${Math.round((daysOnTrack/7) * 100)}%</div>
                </div>
            </div>
        `;
    }

     renderExerciseSuggestions() {
        const exerciseSuggestions = document.getElementById('exerciseSuggestions');
        if (!exerciseSuggestions) return;

        const userData = JSON.parse(localStorage.getItem('mtable_user_profile') || '{}');
        let suggestion = "Complete your profile for personalized exercise recommendations.";

        if (userData.firstName && userData.age && userData.gender && userData.goal) {
            const today = this.weeklyStats[this.weeklyStats.length - 1] || { calories: 0 };
            const calorieDeficit = this.goals.dailyCalories - today.calories;
            
            // Personalized suggestions based on user profile
            const name = userData.firstName;
            
            if (userData.goal === 'lose') {
                if (calorieDeficit > 500) {
                    suggestion = `Hi ${name}! Try 30-45 minutes of cardio (walking, cycling) to boost your weight loss goals while maintaining energy.`;
                } else if (calorieDeficit > 0) {
                    suggestion = `${name}, add some strength training (2-3x/week) along with cardio to preserve muscle during weight loss.`;
                } else {
                    suggestion = `${name}, you're over your calorie goal. Consider a longer workout session (60+ min) or high-intensity interval training.`;
                }
            } else if (userData.goal === 'gain' || userData.goal === 'muscle') {
                suggestion = `${name}, focus on strength training 4-5x/week with compound movements. Limit cardio to 2-3 sessions per week.`;
            } else if (userData.goal === 'maintain') {
                if (userData.activityLevel === 'sedentary') {
                    suggestion = `${name}, aim for 150 minutes of moderate exercise per week. Start with 20-30 minute walks daily.`;
                } else {
                    suggestion = `${name}, maintain your current routine! Mix cardio and strength training 4-5x per week for optimal health.`;
                }
            }
        }

        exerciseSuggestions.innerHTML = `
            <div class="exercise-recommendation">
                <p>${suggestion}</p>
            </div>
        `;
    }

    renderRecipeSuggestions() {
        const recipeSuggestions = document.getElementById('recipeSuggestions');
        if (!recipeSuggestions) return;

        const userData = JSON.parse(localStorage.getItem('mtable_user_profile') || '{}');
        
        // Get suggested recipes based on goals and user profile
        const suggestions = this.getPersonalizedRecipeSuggestions(userData);
        
        if (suggestions.length === 0) {
            recipeSuggestions.innerHTML = `
                <div class="recipe-suggestion-item">
                    <div class="recipe-name">Greek Yogurt Parfait</div>
                    <div class="recipe-match">Good choice: high protein, light meal</div>
                </div>
                <div class="recipe-suggestion-item">
                    <div class="recipe-name">Teriyaki Chicken Bowl</div>
                    <div class="recipe-match">Good choice: high protein</div>
                </div>
                <div class="recipe-suggestion-item">
                    <div class="recipe-name">Quinoa Power Salad</div>
                    <div class="recipe-match">Good choice: high protein</div>
                </div>
            `;
            return;
        }

        recipeSuggestions.innerHTML = suggestions.map(recipe => `
            <div class="recipe-suggestion-item">
                <div class="recipe-name">${recipe.name}</div>
                <div class="recipe-match">${recipe.reason}</div>
            </div>
        `).join('');
    }

    getPersonalizedRecipeSuggestions(userData) {
        const today = this.weeklyStats[this.weeklyStats.length - 1] || { calories: 0, protein: 0, carbs: 0, fat: 0 };
        const remaining = {
            calories: this.goals.dailyCalories - today.calories,
            protein: this.goals.dailyProtein - today.protein,
            carbs: this.goals.dailyCarbs - today.carbs,
            fat: this.goals.dailyFat - today.fat
        };

        const suggestions = [];
        
        // Personalized suggestions based on user goal
        if (userData.goal === 'lose') {
            suggestions.push(
                { name: 'Quinoa Power Salad', reason: 'Perfect for weight loss: high fiber, low calories' },
                { name: 'Baked Salmon with Asparagus', reason: 'Lean protein for fat loss goals' },
                { name: 'Vegetable Stir Fry', reason: 'Low calorie, nutrient dense for weight loss' }
            );
        } else if (userData.goal === 'gain' || userData.goal === 'muscle') {
            suggestions.push(
                { name: 'Teriyaki Chicken Bowl', reason: 'High protein and carbs for muscle building' },
                { name: 'Greek Yogurt Parfait', reason: 'Great post-workout protein source' },
                { name: 'Veggie Pasta Primavera', reason: 'Good carbs for energy and recovery' }
            );
        } else {
            suggestions.push(
                { name: 'Teriyaki Chicken Bowl', reason: 'Balanced macros for maintenance' },
                { name: 'Quinoa Power Salad', reason: 'Complete protein and healthy fats' },
                { name: 'Baked Salmon with Asparagus', reason: 'Omega-3s for overall health' }
            );
        }

        return suggestions.slice(0, 3);
    }

    getRecipeSuggestions() {
        const today = this.weeklyStats[this.weeklyStats.length - 1] || { calories: 0, protein: 0, carbs: 0, fat: 0 };
        const remaining = {
            calories: this.goals.dailyCalories - today.calories,
            protein: this.goals.dailyProtein - today.protein,
            carbs: this.goals.dailyCarbs - today.carbs,
            fat: this.goals.dailyFat - today.fat
        };
        
        const suggestions = [];
        
        // Get all recipes if available
        let allRecipes = [];
        if (window.recipes && typeof window.recipes.getAllRecipes === 'function') {
            allRecipes = window.recipes.getAllRecipes();
        } else if (typeof RECIPE_DATABASE !== 'undefined') {
            allRecipes = Object.values(RECIPE_DATABASE);
        }
        
        // If no recipes available, return empty
        if (allRecipes.length === 0) {
            return [];
        }
        
        // Filter recipes based on remaining macros
        allRecipes.forEach(recipe => {
            let score = 0;
            let reasons = [];
            
            // Check if recipe fits remaining calories
            if (recipe.calories <= remaining.calories + 100 && remaining.calories > 100) {
                score += 2;
                reasons.push('fits calorie budget');
            }
            
            // Check protein needs
            if (remaining.protein > 20 && recipe.nutrition && recipe.nutrition.protein > 15) {
                score += 3;
                reasons.push('high protein');
            }
            
            // Check if low calorie needed
            if (remaining.calories < 300 && recipe.calories < 300) {
                score += 2;
                reasons.push('light meal');
            }
            
            // Check if balanced meal needed
            if (remaining.calories > 300 && remaining.protein > 10 && recipe.calories > 300) {
                score += 1;
                reasons.push('balanced option');
            }
            
            if (score >= 1) {
                suggestions.push({
                    name: recipe.name,
                    reason: `Good choice: ${reasons.join(', ')}`,
                    score: score
                });
            }
        });
        
        // Sort by score and return top 3
        return suggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
    }

    bindEvents() {
        // Listen for dashboard updates to refresh stats
        window.addEventListener('dashboard-updated', () => {
            console.log('Dashboard updated, refreshing goals...');
            setTimeout(() => {
                this.refreshGoalsDisplay();
            }, 500);
        });

        // Listen for calendar updates
        window.addEventListener('calendar-updated', () => {
            console.log('Calendar updated, refreshing goals...');
            setTimeout(() => {
                this.refreshGoalsDisplay();
            }, 500);
        });

        // Re-render charts when window is resized
        window.addEventListener('resize', () => {
            setTimeout(() => {
                this.renderWeeklyChart();
                this.renderMacroStats();
            }, 300);
        });

        // Listen for section changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const goalsSection = document.getElementById('goals');
                    if (goalsSection && goalsSection.classList.contains('active')) {
                        console.log('Goals section became active, refreshing...');
                        setTimeout(() => {
                            this.refreshGoalsDisplay();
                        }, 200);
                    }
                }
            });
        });

        const goalsSection = document.getElementById('goals');
        if (goalsSection) {
            observer.observe(goalsSection, { attributes: true });
        }
    }
    setUserProfile() {
        const ageInput = document.getElementById('userAge');
        const genderInput = document.getElementById('userGender');
        
        if (!ageInput || !genderInput) {
            console.error('Profile input elements not found');
            return;
        }
        
        const age = ageInput.value;
        const gender = genderInput.value;
        
        if (age && gender) {
            this.userProfile.age = parseInt(age);
            this.userProfile.gender = gender;
            this.saveUserProfile();
            
            if (window.showToast) {
                showToast('User profile updated successfully!', 'success');
            } else {
                console.log('User profile updated successfully!');
            }
        } else {
            if (window.showToast) {
                showToast('Please fill in both age and gender', 'warning');
            } else {
                console.log('Please fill in both age and gender');
            }
        }
    }

    clearUserProfile() {
        this.userProfile = {
            age: null,
            gender: null,
            weight: null,
            height: null,
            activityLevel: 'moderate'
        };
        this.saveUserProfile();
        
        // Clear form fields
        const ageInput = document.getElementById('userAge');
        const genderInput = document.getElementById('userGender');
        
        if (ageInput) ageInput.value = '';
        if (genderInput) genderInput.value = '';
        
        if (window.showToast) {
            showToast('User profile cleared', 'success');
        } else {
            console.log('User profile cleared');
        }
    }

    setDailyGoals() {
        const calorieInput = document.getElementById('dailyCalorieGoal');
        const proteinInput = document.getElementById('dailyProteinGoal');
        const carbsInput = document.getElementById('dailyCarbsGoal');
        const fatsInput = document.getElementById('dailyFatsGoal');
        
        if (!calorieInput || !proteinInput || !carbsInput || !fatsInput) {
            console.error('Goals input elements not found');
            return;
        }
        
        const calories = calorieInput.value;
        const protein = proteinInput.value;
        const carbs = carbsInput.value;
        const fats = fatsInput.value;
        
        if (calories && protein && carbs && fats) {
            this.goals.dailyCalories = parseInt(calories);
            this.goals.dailyProtein = parseInt(protein);
            this.goals.dailyCarbs = parseInt(carbs);
            this.goals.dailyFat = parseInt(fats);
            
            this.saveGoals();
            
            if (window.showToast) {
                showToast('Daily goals updated successfully!', 'success');
            } else {
                console.log('Daily goals updated successfully!');
            }
        } else {
            if (window.showToast) {
                showToast('Please fill in all goal fields', 'warning');
            } else {
                console.log('Please fill in all goal fields');
            }
        }
    }

    clearDailyGoals() {
        this.goals = {
            dailyCalories: 2000,
            dailyProtein: 150,
            dailyCarbs: 250,
            dailyFat: 65
        };
        this.saveGoals();
        
        if (window.showToast) {
            showToast('Daily goals reset to defaults', 'success');
        } else {
            console.log('Daily goals reset to defaults');
        }
    }

    // Refresh method to update all displays
    refreshGoalsDisplay() {
        this.weeklyStats = this.loadWeeklyStats();
        this.renderWeeklyChart();
        this.renderMacroStats();
        this.renderSummaryStats();
        this.renderExerciseSuggestions();
        this.renderRecipeSuggestions();
    }



    // Public API methods for other components
    getGoals() {
        return { ...this.goals };
    }

    getUserProfile() {
        return { ...this.userProfile };
    }

    updateGoal(goalType, value) {
        if (this.goals.hasOwnProperty(goalType)) {
            this.goals[goalType] = value;
            this.saveGoals();
            return true;
        }
        return false;
    }

    // Legacy methods for backward compatibility
    loadProgress() {
        const today = new Date().toISOString().split('T')[0];
        const savedProgress = localStorage.getItem(`mtable_stats_${today}`);
        if (savedProgress) {
            return JSON.parse(savedProgress);
        }
        return {
            date: today,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            meals: []
        };
    }

    getGoalStatus() {
        const today = this.loadProgress();
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
            }
        };
    }

    getStatus(current, target) {
        const percentage = (current / target) * 100;
        if (percentage < 80) return 'under';
        if (percentage <= 110) return 'on-track';
        return 'over';
    }

    getAllGoals() {
        return { ...this.goals };
    }

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
    // New visual chart rendering methods
renderVisualCharts() {
    this.renderCaloriesChartVisual();
    this.renderProteinChartVisual();
    this.renderCarbsChartVisual();
    this.renderFatsChartVisual();
}

renderCaloriesChartVisual() {
    this.renderWeeklyChartVisual('caloriesChartVisual', 'calories', '#ff7043');
}

renderProteinChartVisual() {
    this.renderWeeklyChartVisual('proteinChartVisual', 'protein', '#ffb74d');
}

renderCarbsChartVisual() {
    this.renderWeeklyChartVisual('carbsChartVisual', 'carbs', '#fff176');
}

renderFatsChartVisual() {
    this.renderWeeklyChartVisual('fatsChartVisual', 'fat', '#81c784');
}

renderWeeklyChartVisual(canvasId, dataType, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const data = this.weeklyStats;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.offsetWidth;
    const displayHeight = canvas.offsetHeight;
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    const padding = 20;
    const chartWidth = displayWidth - (padding * 2);
    const chartHeight = displayHeight - (padding * 2);

    // Get max value for scaling
    let maxValue = Math.max(...data.map(d => d[dataType] || 0), 1);
    
    // Add some headroom
    maxValue = maxValue * 1.2;
    
    const scale = chartHeight / maxValue;

    // Draw target line
    let targetValue = 0;
    if (dataType === 'calories') targetValue = this.goals.dailyCalories;
    else if (dataType === 'protein') targetValue = this.goals.dailyProtein;
    else if (dataType === 'carbs') targetValue = this.goals.dailyCarbs;
    else if (dataType === 'fat') targetValue = this.goals.dailyFat;

    if (targetValue > 0) {
        const targetY = displayHeight - padding - (targetValue * scale);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding, targetY);
        ctx.lineTo(displayWidth - padding, targetY);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Draw bars
    const barWidth = chartWidth / 7;
    data.forEach((day, index) => {
        const value = day[dataType] || 0;
        const barHeight = Math.max(value * scale, 2);
        const x = padding + (index * barWidth) + (barWidth * 0.2);
        const y = displayHeight - padding - barHeight;
        const actualBarWidth = barWidth * 0.6;

        // Determine if over/under target
        let barColor = color;
        if (targetValue > 0) {
            const percentage = (value / targetValue) * 100;
            if (percentage >= 90 && percentage <= 110) {
                barColor = '#4CAF50'; // Good
            } else if (percentage < 70) {
                barColor = '#FFC107'; // Under
            } else if (percentage > 130) {
                barColor = '#FF5722'; // Over
            }
        }

        // Draw bar
        ctx.fillStyle = barColor;
        ctx.fillRect(x, y, actualBarWidth, barHeight);
    });
}

    // Update visual stats
    updateVisualStats() {
        const weeklyData = this.weeklyStats;
        const totalDays = weeklyData.filter(day => day.calories > 0).length || 1;
        
        const avgCalories = Math.round(weeklyData.reduce((sum, day) => sum + day.calories, 0) / totalDays);
        const avgProtein = Math.round(weeklyData.reduce((sum, day) => sum + day.protein, 0) / totalDays);
        const avgCarbs = Math.round(weeklyData.reduce((sum, day) => sum + day.carbs, 0) / totalDays);
        const avgFats = Math.round(weeklyData.reduce((sum, day) => sum + day.fat, 0) / totalDays);

        // Update stat circles
        const avgCaloriesEl = document.getElementById('avgCalories');
        const avgProteinEl = document.getElementById('avgProtein');
        const avgCarbsEl = document.getElementById('avgCarbs');
        const avgFatsEl = document.getElementById('avgFats');

        if (avgCaloriesEl) avgCaloriesEl.textContent = avgCalories;
        if (avgProteinEl) avgProteinEl.textContent = avgProtein;
        if (avgCarbsEl) avgCarbsEl.textContent = avgCarbs;
        if (avgFatsEl) avgFatsEl.textContent = avgFats;
    }

// Update visual suggestions
updateVisualSuggestions() {
    this.renderExerciseSuggestionVisual();
    this.renderRecipeSuggestionsVisual();
}

renderExerciseSuggestionVisual() {
    const container = document.getElementById('exerciseSuggestionVisual');
    if (!container) return;

    const userData = JSON.parse(localStorage.getItem('mtable_user_profile') || '{}');
    let suggestion = "Complete your profile for personalized exercise recommendations.";

    if (userData.firstName && userData.age && userData.gender && userData.goal) {
        const name = userData.firstName;
        
        if (userData.goal === 'lose') {
            suggestion = `Moderate exercise (30 min cardio or strength training) to complement your nutrition.`;
        } else if (userData.goal === 'gain' || userData.goal === 'muscle') {
            suggestion = `${name}, focus on strength training 4-5x/week with compound movements.`;
        } else {
            suggestion = `Balanced routine: 3-4 days cardio, 2-3 days strength training for optimal health.`;
        }
    }

    container.innerHTML = `<p>${suggestion}</p>`;
}

    renderRecipeSuggestionsVisual() {
        const container = document.getElementById('recipeSuggestionsVisual');
        if (!container) return;

        const userData = JSON.parse(localStorage.getItem('mtable_user_profile') || '{}');
        let suggestions = [
            { name: 'Greek Yogurt Parfait', reason: 'Good choice: high protein, light meal' },
            { name: 'Teriyaki Chicken Bowl', reason: 'Good choice: high protein' },
            { name: 'Quinoa Power Salad', reason: 'Good choice: high protein' }
        ];

        if (userData.goal === 'lose') {
            suggestions = [
                { name: 'Greek Yogurt Parfait', reason: 'Good choice: high protein, light meal' },
                { name: 'Teriyaki Chicken Bowl', reason: 'Good choice: high protein' },
                { name: 'Quinoa Power Salad', reason: 'Good choice: high protein' }
            ];
        }

        container.innerHTML = suggestions.map(recipe => `
            <div class="recipe-suggestion-visual">
                <div class="recipe-name-visual">${recipe.name}</div>
                <div class="recipe-match-visual">${recipe.reason}</div>
            </div>
        `).join('');
    }

// New form methods for visual layout
    setDailyGoalsVisual() {
        const calories = document.getElementById('dailyCalorieGoalVisual').value;
        const protein = document.getElementById('dailyProteinGoalVisual').value;
        const carbs = document.getElementById('dailyCarbsGoalVisual').value;
        const fats = document.getElementById('dailyFatsGoalVisual').value;

        if (calories && protein && carbs && fats) {
            this.goals.dailyCalories = parseInt(calories);
            this.goals.dailyProtein = parseInt(protein);
            this.goals.dailyCarbs = parseInt(carbs);
            this.goals.dailyFat = parseInt(fats);
            this.saveGoals();
            
            if (window.showToast) {
                showToast('Daily goals updated successfully!', 'success');
            }
        } else {
            if (window.showToast) {
                showToast('Please fill in all goal fields', 'warning');
            }
        }
    }

    clearDailyGoalsVisual() {
        document.getElementById('dailyCalorieGoalVisual').value = '';
        document.getElementById('dailyProteinGoalVisual').value = '';
        document.getElementById('dailyCarbsGoalVisual').value = '';
        document.getElementById('dailyFatsGoalVisual').value = '';
        
        this.goals = {
            dailyCalories: 2000,
            dailyProtein: 150,
            dailyCarbs: 250,
            dailyFat: 65
        };
        this.saveGoals();
        
        if (window.showToast) {
            showToast('Daily goals reset to defaults', 'success');
        }
    }

    setUserProfileVisual() {
        const age = document.getElementById('userAgeVisual').value;
        const gender = document.getElementById('userGenderVisual').value;

        if (age && gender) {
            this.userProfile.age = parseInt(age);
            this.userProfile.gender = gender;
            this.saveUserProfile();
            
            if (window.showToast) {
                showToast('User profile updated successfully!', 'success');
            }
        } else {
            if (window.showToast) {
                showToast('Please fill in both age and gender', 'warning');
            }
        }
    }

    clearUserProfileVisual() {
        document.getElementById('userAgeVisual').value = '';
        document.getElementById('userGenderVisual').value = '';
        
        this.userProfile = {
            age: null,
            gender: null,
            weight: null,
            height: null,
            activityLevel: 'moderate'
        };
        this.saveUserProfile();
        
        if (window.showToast) {
            showToast('User profile cleared', 'success');
        }
    }

    // Update the refresh method
    refreshGoalsDisplayVisual() {
        this.weeklyStats = this.loadWeeklyStats();
        this.renderVisualCharts();
        this.updateVisualStats();
        this.updateVisualSuggestions();
        this.populateVisualForms();
    }

    populateVisualForms() {
        // Populate goals form
        document.getElementById('dailyCalorieGoalVisual').value = this.goals.dailyCalories;
        document.getElementById('dailyProteinGoalVisual').value = this.goals.dailyProtein;
        document.getElementById('dailyCarbsGoalVisual').value = this.goals.dailyCarbs;
        document.getElementById('dailyFatsGoalVisual').value = this.goals.dailyFat;
        
        // Populate profile form
        document.getElementById('userAgeVisual').value = this.userProfile.age || '';
        document.getElementById('userGenderVisual').value = this.userProfile.gender || '';
    }
}

// Initialize goals when DOM is loaded
let goals;
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit more to ensure everything is loaded
    setTimeout(() => {
        goals = new Goals();
        // Make goals globally available
        window.goals = goals;
        console.log('Goals component initialized');
    }, 1000);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Goals;
}