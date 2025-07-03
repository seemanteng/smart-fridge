/**
 * Goals Component - Clean Version with No Hardcoded Data
 * Handles user goals setting, progress tracking, and insights
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

    loadWeeklyStats() {
        // Get actual data from the last 7 days - only from real sources
        const weeklyData = [];
        const today = new Date();
        
        // Get today's date string for comparison
        const todayDateString = this.getLocalDateString(today);
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateKey = this.getLocalDateString(date);
            
            // Only get data from actual logged sources
            let dayStats = this.getDayStats(dateKey);
            
            // If no stats found and it's TODAY (not just i === 0), check dashboard
            if (!dayStats && dateKey === todayDateString && window.dashboard) {
                const todayStats = window.dashboard.getTodayStats();
                // EXTRA CHECK: Only use dashboard data if it has actual logged meals AND no fake data
                if (todayStats && todayStats.meals && todayStats.meals.length > 0 && 
                    !(todayStats.calories === 280 && todayStats.protein === 20)) { // Skip if it's the fake data
                        dayStats = {
                            calories: todayStats.calories || 0,
                            protein: todayStats.protein || 0,
                            carbs: todayStats.carbs || 0,
                            fat: todayStats.fat || 0
                        };
                }
            }
            
            // Default to empty stats if no real data found
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
        console.log('Today date string:', todayDateString); // Debug log
        return weeklyData;
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

    getLocalDateString(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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
            const percentage = day.calories > 0 ? (day.calories / this.goals.dailyCalories) * 100 : 0;
            let color;
            if (day.calories === 0) {
                color = '#E0E0E0'; // No data - gray
            } else if (percentage >= 90 && percentage <= 110) {
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

            // Draw percentage label only if there's data
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
        
        // Check if macro elements exist before rendering
        if (document.getElementById('proteinStats')) {
            this.renderMacroCard('protein', today.protein, this.goals.dailyProtein, '#E91E63');
        }
        
        if (document.getElementById('carbsStats')) {
            this.renderMacroCard('carbs', today.carbs, this.goals.dailyCarbs, '#FF9800');
        }
        
        if (document.getElementById('fatsStats')) {
            this.renderMacroCard('fats', today.fat, this.goals.dailyFat, '#9C27B0');
        }
    }

    renderMacroCard(macroType, current, target, color) {
        // Handle the fats vs fat naming inconsistency
        const elementSuffix = macroType === 'fats' ? 'fats' : macroType;
        const statsElement = document.getElementById(`${elementSuffix}Stats`);
        const chartElement = document.getElementById(`${elementSuffix}Chart`);
        
        console.log(`Rendering ${macroType}: current=${current}, target=${target}`); // Debug log
        console.log(`Looking for elements: ${elementSuffix}Stats, ${elementSuffix}Chart`); // Debug log
        
        if (!statsElement) {
            console.log(`Stats element not found: ${elementSuffix}Stats - skipping`);
            return;  // ← Changed from console.error to console.log
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
        
        // Calculate weekly averages only from days with actual data
        const daysWithData = this.weeklyStats.filter(day => day.calories > 0);
        const totalDays = daysWithData.length || 1; // Avoid division by zero
        
        const avgCalories = totalDays > 0 ? Math.round(daysWithData.reduce((sum, day) => sum + day.calories, 0) / totalDays) : 0;
        const avgProtein = totalDays > 0 ? Math.round(daysWithData.reduce((sum, day) => sum + day.protein, 0) / totalDays) : 0;
        const avgCarbs = totalDays > 0 ? Math.round(daysWithData.reduce((sum, day) => sum + day.carbs, 0) / totalDays) : 0;
        const avgFat = totalDays > 0 ? Math.round(daysWithData.reduce((sum, day) => sum + day.fat, 0) / totalDays) : 0;
        
        // Days on track calculation - only count days with data
        const daysOnTrack = daysWithData.filter(day => {
            const percentage = (day.calories / this.goals.dailyCalories) * 100;
            return percentage >= 90 && percentage <= 110;
        }).length;
        
        const consistencyPercentage = totalDays > 0 ? Math.round((daysOnTrack / totalDays) * 100) : 0;
        
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
                    <div class="stat-value">${daysOnTrack}/${totalDays} days</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Weekly Consistency</div>
                    <div class="stat-value">${consistencyPercentage}%</div>
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
                    <div class="recipe-name">Add some meals to get personalized recipe suggestions!</div>
                    <div class="recipe-match">Start logging your meals to see recommendations based on your goals.</div>
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
        
        // Only provide suggestions if there's actual meal data
        if (today.calories === 0) {
            return [];
        }
        
        const remaining = {
            calories: this.goals.dailyCalories - today.calories,
            protein: this.goals.dailyProtein - today.protein,
            carbs: this.goals.dailyCarbs - today.carbs,
            fat: this.goals.dailyFat - today.fat
        };

        const suggestions = [];
        
        // Get actual recipes from the system if available
        const actualSuggestions = this.getRecipeSuggestions();
        if (actualSuggestions.length > 0) {
            return actualSuggestions;
        }
        
        // Fallback to goal-based suggestions if no recipes available
        if (userData.goal === 'lose') {
            suggestions.push(
                { name: 'Consider light, protein-rich meals', reason: 'Perfect for weight loss: high fiber, low calories' },
                { name: 'Try lean proteins with vegetables', reason: 'Lean protein for fat loss goals' },
                { name: 'Focus on high-volume, low-calorie foods', reason: 'Low calorie, nutrient dense for weight loss' }
            );
        } else if (userData.goal === 'gain' || userData.goal === 'muscle') {
            suggestions.push(
                { name: 'Consider protein-rich meals with carbs', reason: 'High protein and carbs for muscle building' },
                { name: 'Try post-workout protein sources', reason: 'Great post-workout protein source' },
                { name: 'Include healthy carbohydrates', reason: 'Good carbs for energy and recovery' }
            );
        } else {
            suggestions.push(
                { name: 'Aim for balanced meals', reason: 'Balanced macros for maintenance' },
                { name: 'Include complete proteins', reason: 'Complete protein and healthy fats' },
                { name: 'Add omega-3 rich foods', reason: 'Omega-3s for overall health' }
            );
        }

        return suggestions.slice(0, 3);
    }

    getRecipeSuggestions() {
        const today = this.weeklyStats[this.weeklyStats.length - 1] || { calories: 0, protein: 0, carbs: 0, fat: 0 };
        
        // Only suggest if there's actual data
        if (today.calories === 0) {
            return [];
        }
        
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
        const today = this.getLocalDateString(new Date());
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
            if (targetValue > 0 && value > 0) {
                const percentage = (value / targetValue) * 100;
                if (percentage >= 90 && percentage <= 110) {
                    barColor = '#4CAF50'; // Good
                } else if (percentage < 70) {
                    barColor = '#FFC107'; // Under
                } else if (percentage > 130) {
                    barColor = '#FF5722'; // Over
                }
            } else if (value === 0) {
                barColor = '#E0E0E0'; // No data
            }

            // Draw bar
            ctx.fillStyle = barColor;
            ctx.fillRect(x, y, actualBarWidth, barHeight);
        });
    }

    // Update visual stats
    updateVisualStats() {
        const weeklyData = this.weeklyStats;
        const daysWithData = weeklyData.filter(day => day.calories > 0);
        const totalDays = daysWithData.length || 1;
        
        const avgCalories = totalDays > 0 ? Math.round(daysWithData.reduce((sum, day) => sum + day.calories, 0) / totalDays) : 0;
        const avgProtein = totalDays > 0 ? Math.round(daysWithData.reduce((sum, day) => sum + day.protein, 0) / totalDays) : 0;
        const avgCarbs = totalDays > 0 ? Math.round(daysWithData.reduce((sum, day) => sum + day.carbs, 0) / totalDays) : 0;
        const avgFats = totalDays > 0 ? Math.round(daysWithData.reduce((sum, day) => sum + day.fat, 0) / totalDays) : 0;

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
        const today = this.weeklyStats[this.weeklyStats.length - 1] || { calories: 0 };
        
        let suggestions = [];
        
        // Only provide suggestions if there's actual data
        if (today.calories > 0) {
            suggestions = this.getPersonalizedRecipeSuggestions(userData);
        }
        
        if (suggestions.length === 0) {
            container.innerHTML = `
                <div class="recipe-suggestion-visual">
                    <div class="recipe-name-visual">Start logging meals!</div>
                    <div class="recipe-match-visual">Add meals to get personalized recipe suggestions</div>
                </div>
            `;
            return;
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
        const calorieInput = document.getElementById('dailyCalorieGoalVisual');
        const proteinInput = document.getElementById('dailyProteinGoalVisual');
        const carbsInput = document.getElementById('dailyCarbsGoalVisual');
        const fatsInput = document.getElementById('dailyFatsGoalVisual');
        
        if (calorieInput) calorieInput.value = this.goals.dailyCalories;
        if (proteinInput) proteinInput.value = this.goals.dailyProtein;
        if (carbsInput) carbsInput.value = this.goals.dailyCarbs;
        if (fatsInput) fatsInput.value = this.goals.dailyFat;
        
        // Populate profile form
        const ageInput = document.getElementById('userAgeVisual');
        const genderInput = document.getElementById('userGenderVisual');
        
        if (ageInput) ageInput.value = this.userProfile.age || '';
        if (genderInput) genderInput.value = this.userProfile.gender || '';
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