/**
 * Monthly Calendar Component
 * Replaces weekly view with proper monthly calendar showing meals
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
            return JSON.parse(savedMeals);
        }
        return {};
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
                
                ${dayMeals.length > 0 ? `
                    <div class="existing-meals" style="margin-top: var(--space-4);">
                        <h4 style="margin-bottom: var(--space-3); color: var(--text-primary);">Current Meals:</h4>
                        ${dayMeals.map((meal, index) => `
                            <div class="meal-info" style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-2) var(--space-3); margin-bottom: var(--space-2); background: var(--bg-secondary); border-radius: var(--radius-md);">
                                <span>${meal.emoji} ${meal.name} (${meal.calories || 0} calories)</span>
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

    // Add a single meal
    addSingleMeal(dateKey) {
        const modal = document.querySelector('.modal');
        const mealInput = modal.querySelector('#mealName');
        const calorieInput = modal.querySelector('#mealCalories');
        const mealName = mealInput.value.trim();
        const customCalories = calorieInput.value.trim();
        
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
        
        const newMeal = {
            type: 'meal',
            name: mealName,
            emoji: this.getEmojiForMeal(mealName) || '🍽',
            calories: calories,
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
        
        // Close and reopen modal to show updated meals
        modal.remove();
        setTimeout(() => this.showMealPlanningModal(dateKey), 100);
        
        if (window.showToast) {
            const calorieSource = customCalories ? 'custom' : 'estimated';
            showToast(`${mealName} added! (${calories} calories - ${calorieSource})`, 'success');
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

    estimateCalories(mealName, mealType) {
        // Simple calorie estimation based on meal type and keywords
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

    // Grocery list methods (unchanged)
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

    // Public methods for external access
    addMeal(date, mealType, mealName, calories = null, emoji = null) {
        const dateKey = typeof date === 'string' ? date : this.formatDateKey(date);
        if (!this.meals[dateKey]) {
            this.meals[dateKey] = [];
        }

        // Check if meal already exists to avoid duplicates
        const existingMeal = this.meals[dateKey].find(meal =>
            meal.name === mealName && meal.type === mealType
        );
        
        if (!existingMeal) {
            this.meals[dateKey].push({
                type: mealType,
                name: mealName,
                emoji: emoji || this.getEmojiForMeal(mealName) || '🍽️',
                calories: calories || this.estimateCalories(mealName, mealType),
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

    // Method to sync with dashboard meals
    syncWithDashboard() {
        if (!window.dashboard) return;
        
        const today = this.getLocalDateString(new Date());
        const todayStats = window.dashboard.getTodayStats();
        
        if (todayStats.meals && todayStats.meals.length > 0) {
            const todayMeals = this.meals[today] || [];
            
            todayStats.meals.forEach(dashboardMeal => {
                const exists = todayMeals.some(meal => 
                    meal.name === dashboardMeal.name && 
                    Math.abs(new Date(meal.timestamp || 0) - new Date(dashboardMeal.timestamp)) < 60000
                );
                
                if (!exists) {
                    this.addMeal(
                        today, 
                        this.determineMealTypeFromTime(dashboardMeal.timestamp),
                        dashboardMeal.name,
                        dashboardMeal.calories,
                        this.getEmojiForMeal(dashboardMeal.name)
                    );
                }
            });
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
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.calendar = new Calendar();
    
    // Sync with dashboard after a short delay
    setTimeout(() => {
        if (window.calendar && typeof window.calendar.syncWithDashboard === 'function') {
            window.calendar.syncWithDashboard();
        }
    }, 1000);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Calendar;
}