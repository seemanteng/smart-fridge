/**
 * Enhanced Calendar Component with Proper Nutrition Tracking
 * Fixes the issue where protein, carbs, and fats aren't being logged
 */

class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.meals = this.loadMeals();
        this.groceryList = [];
        this.init();
    }

    init() {
        this.renderCalendar();
        this.bindEvents();
        this.generateGroceryList();
        
        // Listen for dashboard meal additions AND deletions
        window.addEventListener('dashboard-updated', () => {
            console.log('Calendar received dashboard update');
            this.syncWithDashboard();
            this.renderCalendar();
        });

        // Also listen for dashboard meal removals
        window.addEventListener('meal-removed', (event) => {
            console.log('Calendar received meal removal:', event.detail);
            this.removeMealFromDashboard(event.detail);
            this.renderCalendar();
        });
    }

    getAllRecipes() {
        // First try to get recipes from the recipes component if available
        if (window.recipes && typeof window.recipes.getAllRecipes === 'function') {
            return window.recipes.getAllRecipes();
        }
        // If recipes component not available, try to get directly from RECIPE_DATABASE
        if (typeof RECIPE_DATABASE !== 'undefined') {
            return Object.values(RECIPE_DATABASE);
        }
        // If RecipeUtils is available, use that
        if (typeof RecipeUtils !== 'undefined' && typeof RecipeUtils.getAllRecipes === 'function') {
            return RecipeUtils.getAllRecipes();
        }
        // Final fallback - empty array
        return [];
    }

    getLocalDateString(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Enhanced nutrition estimation with realistic values
    estimateNutrition(mealName, calories) {
        const lowerName = mealName.toLowerCase();
        
        // Base nutrition ratios (protein:carbs:fat as percentages of calories)
        let proteinRatio = 0.20; // 20% protein
        let carbRatio = 0.45;    // 45% carbs  
        let fatRatio = 0.35;     // 35% fat

        // Adjust ratios based on meal type
        if (lowerName.includes('salad') || lowerName.includes('quinoa')) {
            proteinRatio = 0.25;
            carbRatio = 0.35;
            fatRatio = 0.40;
        } else if (lowerName.includes('chicken') || lowerName.includes('salmon') || lowerName.includes('protein')) {
            proteinRatio = 0.40;
            carbRatio = 0.25;
            fatRatio = 0.35;
        } else if (lowerName.includes('pasta') || lowerName.includes('rice') || lowerName.includes('bread')) {
            proteinRatio = 0.15;
            carbRatio = 0.65;
            fatRatio = 0.20;
        } else if (lowerName.includes('egg') || lowerName.includes('cheese')) {
            proteinRatio = 0.30;
            carbRatio = 0.10;
            fatRatio = 0.60;
        }

        // Calculate grams (4 cal/g for protein and carbs, 9 cal/g for fat)
        const protein = Math.round((calories * proteinRatio) / 4);
        const carbs = Math.round((calories * carbRatio) / 4);
        const fat = Math.round((calories * fatRatio) / 9);

        return { protein, carbs, fat };
    }

    // Enhanced calorie estimation
    estimateCalories(mealName, mealType) {
        const baseCalories = {
            breakfast: 300,
            lunch: 400,
            dinner: 500,
            snack: 150,
            meal: 400
        };

        let calories = baseCalories[mealType] || 300;
        const lowCalKeywords = ['salad', 'soup', 'fruit', 'vegetable', 'green'];
        const highCalKeywords = ['pizza', 'burger', 'pasta', 'fried', 'cheese'];

        const lowerMeal = mealName.toLowerCase();
        
        if (lowCalKeywords.some(keyword => lowerMeal.includes(keyword))) {
            calories *= 0.7;
        } else if (highCalKeywords.some(keyword => lowerMeal.includes(keyword))) {
            calories *= 1.3;
        }

        return Math.round(calories);
    }

    // Get all days in current month view (including prev/next month days to fill grid)
    getMonthDays() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // First day of current month
        const firstDay = new Date(year, month, 1);
        // Last day of current month
        const lastDay = new Date(year, month + 1, 0);
        
        // Start from Monday of the week containing first day
        const startDate = new Date(firstDay);
        const dayOfWeek = (firstDay.getDay() + 6) % 7; // Make Monday = 0
        startDate.setDate(firstDay.getDate() - dayOfWeek);
        
        // Generate 42 days (6 weeks) to fill calendar grid
        const days = [];
        for (let i = 0; i < 42; i++) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            days.push({
                date: day,
                isCurrentMonth: day.getMonth() === month,
                isToday: this.getLocalDateString(day) === this.getLocalDateString(new Date())
            });
        }
        
        return days;
    }

    loadMeals() {
        // Load from localStorage or return empty object
        const savedMeals = localStorage.getItem('mtable_meals');
        if (savedMeals) {
            const meals = JSON.parse(savedMeals);
            // Auto-migrate existing meals that don't have nutrition data
            this.autoMigrateNutritionData(meals);
            return meals;
        }
        return {};
    }

    // Automatically add nutrition data to meals that don't have it
    autoMigrateNutritionData(meals) {
        let needsUpdate = false;
        
        Object.keys(meals).forEach(dateKey => {
            const dayMeals = meals[dateKey];
            
            dayMeals.forEach(meal => {
                // Check if meal is missing nutrition data
                if (meal.protein === undefined || meal.carbs === undefined || meal.fat === undefined) {
                    const calories = meal.calories || 300;
                    const nutrition = this.estimateNutrition(meal.name, calories);
                    
                    meal.protein = nutrition.protein;
                    meal.carbs = nutrition.carbs;
                    meal.fat = nutrition.fat;
                    
                    needsUpdate = true;
                    console.log(`Auto-migrated nutrition for ${meal.name}: ${nutrition.protein}g protein, ${nutrition.carbs}g carbs, ${nutrition.fat}g fat`);
                }
            });
        });
        
        // Save updated meals if any were migrated
        if (needsUpdate) {
            localStorage.setItem('mtable_meals', JSON.stringify(meals));
            console.log('Auto-migration complete - all meals now have nutrition data');
        }
    }

    saveMeals() {
        localStorage.setItem('mtable_meals', JSON.stringify(this.meals));
        this.generateGroceryList();
        
        // Notify other components
        window.dispatchEvent(new CustomEvent('calendar-updated', {
            detail: { meals: this.meals }
        }));
    }

    renderCalendar() {
        const calendarGrid = document.querySelector('.calendar-grid');
        if (!calendarGrid) return;

        // Update calendar header with current month/year
        this.updateCalendarHeader();

        calendarGrid.innerHTML = '';
        
        const monthDays = this.getMonthDays();
        
        monthDays.forEach(dayInfo => {
            const dayElement = this.createMonthDayElement(dayInfo);
            calendarGrid.appendChild(dayElement);
        });
    }

    updateCalendarHeader() {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        
        const monthYearText = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        
        // Find and update calendar header
        const calendarHeader = document.querySelector('.calendar-header h2');
        if (calendarHeader) {
            calendarHeader.textContent = monthYearText;
        }
        
        // Also update any other month display elements
        const monthDisplay = document.querySelector('.month-display');
        if (monthDisplay) {
            monthDisplay.textContent = monthYearText;
        }
    }

    createMonthDayElement(dayInfo) {
        const { date, isCurrentMonth, isToday } = dayInfo;
        const dateKey = this.formatDateKey(date);
        
        const dayDiv = document.createElement('div');
        dayDiv.className = `calendar-date ${isCurrentMonth ? '' : 'other-month'} ${isToday ? 'today' : ''}`;
        dayDiv.dataset.date = dateKey;

        const dayMeals = this.meals[dateKey] || [];
        
        // If it's today, also include dashboard stats
        if (isToday && window.dashboard) {
            const todayStats = window.dashboard.getTodayStats();
            const dashboardMeals = todayStats.meals || [];
            
            // Merge dashboard meals with calendar meals, avoiding duplicates
            dashboardMeals.forEach(dashboardMeal => {
                const exists = dayMeals.some(meal => 
                    meal.name === dashboardMeal.name && 
                    Math.abs(new Date(meal.timestamp || 0) - new Date(dashboardMeal.timestamp)) < 60000
                );
                
                if (!exists) {
                    dayMeals.push({
                        type: this.determineMealTypeFromTime(dashboardMeal.timestamp),
                        name: dashboardMeal.name,
                        emoji: this.getEmojiForMeal(dashboardMeal.name),
                        calories: dashboardMeal.calories,
                        protein: dashboardMeal.protein || 0,
                        carbs: dashboardMeal.carbs || 0,
                        fat: dashboardMeal.fat || 0,
                        timestamp: dashboardMeal.timestamp
                    });
                }
            });
        }

        const totalCalories = dayMeals.reduce((total, meal) => total + (meal.calories || 0), 0);
        const hasMeals = dayMeals.length > 0;
        
        // Add has-meals class for styling
        if (hasMeals) {
            dayDiv.classList.add('has-meals');
        }

        // Create day content
        dayDiv.innerHTML = `
            <div class="date-number">${date.getDate()}</div>
            ${hasMeals ? `
                <div class="meal-indicator">
                    <div class="meal-count">${dayMeals.length} meal${dayMeals.length > 1 ? 's' : ''}</div>
                    <div class="calorie-count">${totalCalories} cal</div>
                </div>
            ` : ''}
        `;

        return dayDiv;
    }

    determineMealTypeFromTime(timestamp) {
        if (!timestamp) return 'snack';
        
        const hour = new Date(timestamp).getHours();
        if (hour < 11) return 'breakfast';
        if (hour < 16) return 'lunch';
        if (hour < 21) return 'dinner';
        return 'snack';
    }

    getEmojiForMeal(mealName) {
        const lowerName = mealName.toLowerCase();
        
        if (lowerName.includes('chicken') || lowerName.includes('teriyaki')) return '🍗';
        if (lowerName.includes('salad') || lowerName.includes('quinoa')) return '🥗';
        if (lowerName.includes('salmon') || lowerName.includes('fish')) return '🐟';
        if (lowerName.includes('pasta') || lowerName.includes('spaghetti')) return '🍝';
        if (lowerName.includes('rice') || lowerName.includes('bowl')) return '🍚';
        if (lowerName.includes('egg')) return '🍳';
        if (lowerName.includes('pancake')) return '🥞';
        if (lowerName.includes('sandwich')) return '🥪';
        if (lowerName.includes('pizza')) return '🍕';
        if (lowerName.includes('stir fry') || lowerName.includes('veggie')) return '🥬';
        
        return '🍽️'; // Default
    }

    bindEvents() {
        // Calendar day click events
        document.addEventListener('click', (e) => {
            if (e.target.closest('.calendar-date')) {
                const dayElement = e.target.closest('.calendar-date');
                const date = dayElement.dataset.date;
                this.showMealPlanningModal(date);
            }
        });

        // Navigation arrows
        this.bindNavigationEvents();

        // Grocery list checkbox events
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.closest('.grocery-item')) {
                this.toggleGroceryItem(e.target);
            }
        });
    }

    bindNavigationEvents() {
        // Previous/Next month navigation
        const prevBtn = document.querySelector('.calendar-prev');
        const nextBtn = document.querySelector('.calendar-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.navigateMonth(-1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.navigateMonth(1);
            });
        }
    }

    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    showMealPlanningModal(dateKey) {
        const date = new Date(dateKey);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        
        const modal = this.createMealPlanningModal(dateKey, dayName, formattedDate);
        document.body.appendChild(modal);
        
        // Show modal with animation
        setTimeout(() => modal.classList.add('active'), 10);
    }

    createMealPlanningModal(dateKey, dayName, formattedDate) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Plan Meals for ${dayName}, ${formattedDate}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.renderMealPlanningForm(dateKey)}
                </div>
            </div>
        `;

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        return modal;
    }

    renderMealPlanningForm(dateKey) {
        const dayMeals = this.meals[dateKey] || [];

        return `
            <div class="meal-planning-form">
                <div class="form-group">
                    <label for="mealName">Meal Name</label>
                    <input type="text" 
                        id="mealName"
                        class="meal-input" 
                        placeholder="Enter meal name..."
                        value="">
                </div>
                
                <div class="form-group">
                    <label for="mealCalories">Calories</label>
                    <input type="number" 
                        id="mealCalories"
                        class="meal-input" 
                        placeholder="Enter calories (optional)"
                        min="0"
                        step="1"
                        value="">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label for="mealProtein">Protein (g)</label>
                        <input type="number" 
                            id="mealProtein"
                            class="meal-input" 
                            placeholder="Auto"
                            min="0"
                            step="0.1">
                    </div>
                    <div class="form-group">
                        <label for="mealCarbs">Carbs (g)</label>
                        <input type="number" 
                            id="mealCarbs"
                            class="meal-input" 
                            placeholder="Auto"
                            min="0"
                            step="0.1">
                    </div>
                    <div class="form-group">
                        <label for="mealFat">Fat (g)</label>
                        <input type="number" 
                            id="mealFat"
                            class="meal-input" 
                            placeholder="Auto"
                            min="0"
                            step="0.1">
                    </div>
                </div>
                
                ${dayMeals.length > 0 ? `
                    <div class="existing-meals" style="margin-top: var(--space-4);">
                        <h4 style="margin-bottom: var(--space-3); color: var(--text-primary);">Current Meals:</h4>
                        ${dayMeals.map((meal, index) => `
                            <div class="meal-info" style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-2) var(--space-3); margin-bottom: var(--space-2); background: var(--bg-secondary); border-radius: var(--radius-md);">
                                <div>
                                    <div>${meal.emoji} ${meal.name} (${meal.calories || 0} cal)</div>
                                    <div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 2px;">
                                        ${meal.protein || 0}g protein • ${meal.carbs || 0}g carbs • ${meal.fat || 0}g fat
                                    </div>
                                </div>
                                <button class="btn btn-sm btn-danger" onclick="calendar.removeMealByIndex('${dateKey}', ${index})">Remove</button>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="calendar.addSingleMeal('${dateKey}')">Add Meal</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        `;
    }

    // Enhanced add single meal with proper nutrition tracking
    addSingleMeal(dateKey) {
        const modal = document.querySelector('.modal');
        const mealInput = modal.querySelector('#mealName');
        const calorieInput = modal.querySelector('#mealCalories');
        const proteinInput = modal.querySelector('#mealProtein');
        const carbsInput = modal.querySelector('#mealCarbs');
        const fatInput = modal.querySelector('#mealFat');
        
        const mealName = mealInput.value.trim();
        const customCalories = calorieInput.value.trim();
        const customProtein = proteinInput.value.trim();
        const customCarbs = carbsInput.value.trim();
        const customFat = fatInput.value.trim();
        
        if (!mealName) {
            if (window.showToast) {
                showToast('Please enter a meal name', 'warning');
            }
            return;
        }
        
        if (!this.meals[dateKey]) {
            this.meals[dateKey] = [];
        }
        
        // Use custom calories if provided, otherwise estimate
        const calories = customCalories && !isNaN(customCalories) ? 
            parseInt(customCalories) : 
            this.estimateCalories(mealName, 'meal');
        
        // Get nutrition values - use custom if provided, otherwise estimate
        let protein, carbs, fat;
        
        if (customProtein || customCarbs || customFat) {
            // Use custom values if any are provided
            protein = customProtein && !isNaN(customProtein) ? parseFloat(customProtein) : 0;
            carbs = customCarbs && !isNaN(customCarbs) ? parseFloat(customCarbs) : 0;
            fat = customFat && !isNaN(customFat) ? parseFloat(customFat) : 0;
        } else {
            // Estimate nutrition based on calories and meal type
            const nutrition = this.estimateNutrition(mealName, calories);
            protein = nutrition.protein;
            carbs = nutrition.carbs;
            fat = nutrition.fat;
        }
        
        const newMeal = {
            type: 'meal',
            name: mealName,
            emoji: this.getEmojiForMeal(mealName) || '🍽',
            calories: calories,
            protein: protein,
            carbs: carbs,
            fat: fat,
            timestamp: new Date().toISOString()
        };
        
        this.meals[dateKey].push(newMeal);
        
        // Calculate and save total calories for the day
        const totalCalories = this.meals[dateKey].reduce((total, meal) => total + (meal.calories || 0), 0);
        this.saveDayTotalCalories(dateKey, totalCalories);
        
        this.saveMeals();
        this.renderCalendar();
        
        // Clear inputs and refresh modal
        mealInput.value = '';
        calorieInput.value = '';
        proteinInput.value = '';
        carbsInput.value = '';
        fatInput.value = '';
        
        // Close and reopen modal to show updated meals
        modal.remove();
        setTimeout(() => this.showMealPlanningModal(dateKey), 100);
        
        if (window.showToast) {
            const nutritionSource = (customProtein || customCarbs || customFat) ? 'custom' : 'estimated';
            showToast(`${mealName} added! (${calories} cal, ${protein}g protein - ${nutritionSource})`, 'success');
        }
    }

    // Remove meal by index
    removeMealByIndex(dateKey, mealIndex) {
        if (this.meals[dateKey] && this.meals[dateKey][mealIndex]) {
            const removedMeal = this.meals[dateKey][mealIndex];
            this.meals[dateKey].splice(mealIndex, 1);
            
            if (this.meals[dateKey].length === 0) {
                delete this.meals[dateKey];
                // Remove daily total when no meals left
                const dailyTotals = this.loadDailyTotals();
                delete dailyTotals[dateKey];
                localStorage.setItem('mtable_daily_totals', JSON.stringify(dailyTotals));
            } else {
                // Recalculate total calories
                const totalCalories = this.meals[dateKey].reduce((total, meal) => total + (meal.calories || 0), 0);
                this.saveDayTotalCalories(dateKey, totalCalories);
            }
            
            this.saveMeals();
            this.renderCalendar();
            
            // Close and reopen modal to refresh
            const modal = document.querySelector('.modal');
            if (modal) {
                modal.remove();
                setTimeout(() => this.showMealPlanningModal(dateKey), 100);
            }
            
            if (window.showToast) {
                showToast(`${removedMeal.name} removed`, 'success');
            }
        }
    }

    // Save daily total calories
    saveDayTotalCalories(dateKey, totalCalories) {
        const dailyTotals = this.loadDailyTotals();
        dailyTotals[dateKey] = totalCalories;
        localStorage.setItem('mtable_daily_totals', JSON.stringify(dailyTotals));
    }

    // Load daily totals
    loadDailyTotals() {
        const saved = localStorage.getItem('mtable_daily_totals');
        return saved ? JSON.parse(saved) : {};
    }

    // Get total calories for a specific date
    getDayTotalCalories(dateKey) {
        const dailyTotals = this.loadDailyTotals();
        return dailyTotals[dateKey] || 0;
    }

    formatDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Enhanced public method to add meal with nutrition
    addMeal(date, mealType, mealName, calories = null, emoji = null, nutrition = null) {
        const dateKey = typeof date === 'string' ? date : this.formatDateKey(date);
        if (!this.meals[dateKey]) {
            this.meals[dateKey] = [];
        }

        // Check if meal already exists to avoid duplicates
        const existingMeal = this.meals[dateKey].find(meal =>
            meal.name === mealName && meal.type === mealType
        );
        
        if (!existingMeal) {
            const estimatedCalories = calories || this.estimateCalories(mealName, mealType);
            const estimatedNutrition = nutrition || this.estimateNutrition(mealName, estimatedCalories);
            
            this.meals[dateKey].push({
                type: mealType,
                name: mealName,
                emoji: emoji || this.getEmojiForMeal(mealName) || '🍽️',
                calories: estimatedCalories,
                protein: estimatedNutrition.protein,
                carbs: estimatedNutrition.carbs,
                fat: estimatedNutrition.fat,
                timestamp: new Date().toISOString()
            });
            
            // Calculate and save daily total
            const totalCalories = this.meals[dateKey].reduce((total, meal) => total + (meal.calories || 0), 0);
            this.saveDayTotalCalories(dateKey, totalCalories);
            
            this.saveMeals();
            this.renderCalendar();
        }
    }

    getMealsForDate(date) {
        const dateKey = typeof date === 'string' ? date : this.formatDateKey(date);
        return this.meals[dateKey] || [];
    }

    getTotalCaloriesForDate(date) {
        const meals = this.getMealsForDate(date);
        return meals.reduce((total, meal) => total + (meal.calories || 0), 0);
    }

    // Get total nutrition for a date
    getTotalNutritionForDate(date) {
        const meals = this.getMealsForDate(date);
        return meals.reduce((total, meal) => ({
            calories: total.calories + (meal.calories || 0),
            protein: total.protein + (meal.protein || 0),
            carbs: total.carbs + (meal.carbs || 0),
            fat: total.fat + (meal.fat || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }

    // Enhanced sync with dashboard to include nutrition and auto-migrate
    syncWithDashboard() {
        if (!window.dashboard) return;
        
        const today = this.getLocalDateString(new Date());
        const todayStats = window.dashboard.getTodayStats();
        
        if (todayStats.meals && todayStats.meals.length > 0) {
            if (!this.meals[today]) {
                this.meals[today] = [];
            }
            
            todayStats.meals.forEach(dashboardMeal => {
                const exists = this.meals[today].some(meal => 
                    meal.name === dashboardMeal.name && 
                    Math.abs(new Date(meal.timestamp || 0) - new Date(dashboardMeal.timestamp)) < 60000
                );
                
                if (!exists) {
                    const estimatedCalories = dashboardMeal.calories || this.estimateCalories(dashboardMeal.name, 'meal');
                    const nutrition = this.estimateNutrition(dashboardMeal.name, estimatedCalories);
                    
                    // Create meal with complete nutrition data
                    const newMeal = {
                        type: this.determineMealTypeFromTime(dashboardMeal.timestamp),
                        name: dashboardMeal.name,
                        emoji: this.getEmojiForMeal(dashboardMeal.name),
                        calories: estimatedCalories,
                        protein: dashboardMeal.protein || nutrition.protein,
                        carbs: dashboardMeal.carbs || nutrition.carbs,
                        fat: dashboardMeal.fat || nutrition.fat,
                        timestamp: dashboardMeal.timestamp
                    };
                    
                    this.meals[today].push(newMeal);
                    console.log(`Synced meal with nutrition: ${newMeal.name} - ${newMeal.protein}g protein, ${newMeal.carbs}g carbs, ${newMeal.fat}g fat`);
                }
            });
            
            // Calculate and save total calories
            const totalCalories = this.meals[today].reduce((total, meal) => total + (meal.calories || 0), 0);
            this.saveDayTotalCalories(today, totalCalories);
            this.saveMeals();
        } else {
            // If dashboard has no meals for today, clear today's meals in calendar
            if (this.meals[today]) {
                delete this.meals[today];
                this.saveMeals();
            }
        }
    }

    // Remove meal from calendar when removed from dashboard
    removeMealFromDashboard(mealData) {
        const today = this.getLocalDateString(new Date());
        
        if (this.meals[today]) {
            // Find and remove the meal by name and timestamp
            this.meals[today] = this.meals[today].filter(meal => {
                // Match by name and similar timestamp (within 1 minute)
                const timeDiff = Math.abs(new Date(meal.timestamp || 0) - new Date(mealData.timestamp || 0));
                return !(meal.name === mealData.name && timeDiff < 60000);
            });
            
            // If no meals left for today, delete the day
            if (this.meals[today].length === 0) {
                delete this.meals[today];
                
                // Also remove daily total
                const dailyTotals = this.loadDailyTotals();
                delete dailyTotals[today];
                localStorage.setItem('mtable_daily_totals', JSON.stringify(dailyTotals));
            } else {
                // Recalculate total calories
                const totalCalories = this.meals[today].reduce((total, meal) => total + (meal.calories || 0), 0);
                this.saveDayTotalCalories(today, totalCalories);
            }
            
            this.saveMeals();
        }
    }

    // Grocery list methods (unchanged but included for completeness)
    generateGroceryList() {
        const ingredients = this.extractIngredientsFromMeals();
        const currentInventory = this.getCurrentInventory();
        const needed = this.calculateNeededItems(ingredients, currentInventory);
        
        this.groceryList = this.organizeByStoreSection(needed);
        this.renderGroceryList();
    }

    extractIngredientsFromMeals() {
        const ingredients = {};
        
        Object.values(this.meals).forEach(dayMeals => {
            dayMeals.forEach(meal => {
                const mealIngredients = this.getMealIngredients(meal.name);
                mealIngredients.forEach(ingredient => {
                    if (ingredients[ingredient.name]) {
                        ingredients[ingredient.name].quantity += ingredient.quantity;
                    } else {
                        ingredients[ingredient.name] = { ...ingredient };
                    }
                });
            });
        });

        return ingredients;
    }

    getMealIngredients(mealName) {
        // Simplified ingredient extraction based on meal names
        const ingredientMap = {
            'eggs': [{ name: 'Eggs', quantity: 6, unit: 'pieces', section: 'Dairy' }],
            'salad': [
                { name: 'Lettuce', quantity: 1, unit: 'head', section: 'Produce' },
                { name: 'Tomatoes', quantity: 2, unit: 'pieces', section: 'Produce' }
            ],
            'chicken': [{ name: 'Chicken Breast', quantity: 1, unit: 'lb', section: 'Meat' }],
            'teriyaki': [
                { name: 'Chicken Breast', quantity: 1, unit: 'lb', section: 'Meat' },
                { name: 'Rice', quantity: 1, unit: 'cup', section: 'Pantry' },
                { name: 'Broccoli', quantity: 1, unit: 'cup', section: 'Produce' }
            ],
            'pasta': [
                { name: 'Pasta', quantity: 1, unit: 'box', section: 'Pantry' },
                { name: 'Pasta Sauce', quantity: 1, unit: 'jar', section: 'Pantry' }
            ],
            'salmon': [{ name: 'Salmon Fillet', quantity: 1, unit: 'lb', section: 'Seafood' }],
            'pancakes': [
                { name: 'Flour', quantity: 2, unit: 'cups', section: 'Pantry' },
                { name: 'Milk', quantity: 1, unit: 'cup', section: 'Dairy' }
            ],
            'quinoa': [
                { name: 'Quinoa', quantity: 1, unit: 'cup', section: 'Pantry' },
                { name: 'Chickpeas', quantity: 1, unit: 'can', section: 'Pantry' }
            ]
        };

        const lowerMeal = mealName.toLowerCase();
        let ingredients = [];

        Object.keys(ingredientMap).forEach(key => {
            if (lowerMeal.includes(key)) {
                ingredients = ingredients.concat(ingredientMap[key]);
            }
        });

        return ingredients.length > 0 ? ingredients : [
            { name: 'Mixed Ingredients', quantity: 1, unit: 'serving', section: 'Pantry' }
        ];
    }

    getCurrentInventory() {
        // Get current inventory from localStorage or inventory component
        if (window.inventory) {
            return window.inventory.getAllIngredients();
        }
        
        const savedInventory = localStorage.getItem('mtable_inventory');
        return savedInventory ? JSON.parse(savedInventory) : {};
    }

    calculateNeededItems(needed, inventory) {
        const result = {};
        
        Object.keys(needed).forEach(itemName => {
            const neededItem = needed[itemName];
            const inventoryItem = Object.values(inventory).find(item => 
                item.name.toLowerCase() === itemName.toLowerCase()
            );
            
            if (!inventoryItem || inventoryItem.quantity < neededItem.quantity) {
                const shortage = neededItem.quantity - (inventoryItem?.quantity || 0);
                if (shortage > 0) {
                    result[itemName] = {
                        ...neededItem,
                        quantity: shortage
                    };
                }
            }
        });

        return result;
    }

    organizeByStoreSection(items) {
        const sections = {
            'Produce': [],
            'Meat': [],
            'Seafood': [],
            'Dairy': [],
            'Pantry': [],
            'Other': []
        };

        Object.values(items).forEach(item => {
            const section = item.section || 'Other';
            if (sections[section]) {
                sections[section].push(item);
            } else {
                sections['Other'].push(item);
            }
        });

        return sections;
    }

    renderGroceryList() {
        const groceryContainer = document.querySelector('.ingredient-list');
        if (!groceryContainer || !groceryContainer.closest('.card')?.querySelector('h3')?.textContent.includes('Grocery')) {
            return;
        }

        const allItems = [];
        Object.keys(this.groceryList).forEach(section => {
            this.groceryList[section].forEach(item => {
                allItems.push({ ...item, section });
            });
        });

        if (allItems.length === 0) {
            groceryContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🛒</div>
                    <div class="empty-state-title">All set!</div>
                    <div class="empty-state-description">You have everything you need for your planned meals.</div>
                </div>
            `;
            return;
        }

        groceryContainer.innerHTML = allItems.map(item => `
            <div class="grocery-item">
                <input type="checkbox" id="grocery-${item.name.replace(/\s+/g, '-').toLowerCase()}">
                <div class="ingredient-info">
                    <div class="ingredient-name">${item.name} <span class="grocery-section">${item.section}</span></div>
                    <div class="ingredient-quantity">${item.quantity} ${item.unit}</div>
                </div>
            </div>
        `).join('');
    }

    toggleGroceryItem(checkbox) {
        const item = checkbox.closest('.grocery-item');
        if (checkbox.checked) {
            item.classList.add('checked');
        } else {
            item.classList.remove('checked');
        }
    }
}

    // Initialize calendar when DOM is loaded with auto-migration
document.addEventListener('DOMContentLoaded', function() {
    window.calendar = new Calendar();
    
    // Force a save to trigger any auto-migration on first load
    setTimeout(() => {
        if (window.calendar) {
            // Trigger auto-migration by calling loadMeals again
            window.calendar.meals = window.calendar.loadMeals();
            window.calendar.renderCalendar();
            
            // Sync with dashboard after migration
            if (typeof window.calendar.syncWithDashboard === 'function') {
                window.calendar.syncWithDashboard();
            }
            
            console.log('Calendar initialized with automatic nutrition migration');
        }
    }, 500);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Calendar;
}