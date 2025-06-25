/**
 * Dashboard Component 
 * Handles main dashboard functionality and overview statistics
 */

class Dashboard {
    constructor() {
        this.goals = this.loadGoals();
        this.todayStats = this.loadTodayStats();
        this.suggestedRecipes = [];
        this.init();
    }

    init() {
        this.renderCalorieProgress();
        this.renderMacronutrients();
        this.renderMealBreakdown();
        this.renderSuggestedRecipes();
        this.bindEvents();
    }

    loadGoals() {
        const savedGoals = localStorage.getItem('mtable_goals');
        if (savedGoals) {
            return JSON.parse(savedGoals);
        }

        return {
            dailyCalories: 2000,
            dailyProtein: 150,
            dailyCarbs: 250,
            dailyFat: 65
        };
    }

    loadTodayStats() {
        const today = new Date().toISOString().split('T')[0];
        const savedStats = localStorage.getItem(`mtable_stats_${today}`);
        
        if (savedStats) {
            return JSON.parse(savedStats);
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

    saveStats() {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`mtable_stats_${today}`, JSON.stringify(this.todayStats));
    }

    renderCalorieProgress() {
        const current = this.todayStats.calories;
        const target = this.goals.dailyCalories;
        const percentage = Math.min((current / target) * 100, 100);
        
        // Update the circle text
        const numberElement = document.querySelector('.circle-text .number');
        const labelElement = document.querySelector('.circle-text .label');
        
        if (numberElement && labelElement) {
            numberElement.textContent = current.toLocaleString();
            labelElement.textContent = `of ${target.toLocaleString()} cal`;
        }

        // Update the progress circle
        this.updateProgressCircle(percentage);
    }

    updateProgressCircle(percentage) {
        const progressCircle = document.querySelector('.circle-progress');
        if (!progressCircle) return;

        const radius = 70; // Should match SVG radius
        const circumference = 2 * Math.PI * radius;
        const strokeDasharray = (percentage / 100) * circumference;
        
        progressCircle.style.strokeDasharray = `${strokeDasharray} ${circumference}`;
        progressCircle.style.strokeDashoffset = '0';
        progressCircle.style.transition = 'stroke-dasharray 1s ease-in-out';
    }

    renderMacronutrients() {
        const macros = [
            { current: this.todayStats.protein, target: this.goals.dailyProtein, unit: 'g', name: 'Protein' },
            { current: this.todayStats.carbs, target: this.goals.dailyCarbs, unit: 'g', name: 'Carbs' },
            { current: this.todayStats.fat, target: this.goals.dailyFat, unit: 'g', name: 'Fat' }
        ];

        const statsCards = document.querySelectorAll('.stat-card');
        macros.forEach((macro, index) => {
            if (statsCards[index]) {
                const numberEl = statsCards[index].querySelector('.stat-number');
                const labelEl = statsCards[index].querySelector('.stat-label');
                
                if (numberEl && labelEl) {
                    // Show current value with target
                    numberEl.innerHTML = `${macro.current}${macro.unit}<br><small style="font-size: 0.7em; opacity: 0.7;">of ${macro.target}${macro.unit}</small>`;
                    labelEl.textContent = macro.name;
                }
            }
        });
    }

    renderMealBreakdown() {
        // Check if we should show the breakdown
        if (this.todayStats.meals.length === 0) return;

        // Create or update the meal breakdown section
        let breakdownContainer = document.querySelector('.meal-breakdown');
        if (!breakdownContainer) {
            // Create the breakdown container
            const progressCard = document.querySelector('.card h3').parentNode;
            breakdownContainer = document.createElement('div');
            breakdownContainer.className = 'meal-breakdown';
            breakdownContainer.innerHTML = `
                <h4 style="margin: var(--space-4) 0 var(--space-3) 0; color: var(--text-primary);">Today's Meals</h4>
                <div class="meals-list"></div>
            `;
            progressCard.appendChild(breakdownContainer);
        }

        const mealsList = breakdownContainer.querySelector('.meals-list');
        if (!mealsList) return;

        mealsList.innerHTML = this.todayStats.meals.map((meal, index) => `
        <div class="meal-breakdown-item" style="display: flex; justify-content: space-between;
        align-items: center; padding: var(--space-2) var(--space-3); margin-bottom: var(--space-2);
        background: var(--bg-secondary); border-radius: var(--radius-md); border-left: 3px solid
        var(--primary-color);">
        <div class="meal-info">
        <div class="meal-name" style="font-weight: 600; color:
        var(--text-primary);">${meal.name}</div>
        <div class="meal-stats" style="font-size: 0.875rem; color: var(--text-secondary);">
        ${meal.calories} cal • ${meal.protein}g protein • ${meal.carbs || 0}g carbs •
        ${meal.fat || 0}g fat
        </div>
        </div>
        <button class="btn btn-sm btn-danger"
        onclick="window.dashboard.removeMeal(${index})" style="background: #ff4444;
        color: white; border: none; padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm);
        font-size: 0.75rem; font-weight: 600;">REMOVE</button>
        </div>
        `).join('');
    }

   removeMeal(mealIndex) {
        if (mealIndex >= 0 && mealIndex < this.todayStats.meals.length) {
            const meal = this.todayStats.meals[mealIndex];
            // Remove the meal's nutrition from totals
            this.todayStats.calories -= meal.calories;
            this.todayStats.protein -= meal.protein;
            this.todayStats.carbs -= (meal.carbs || 0);
            this.todayStats.fat -= (meal.fat || 0);
            
            // Remove the meal from the array
            this.todayStats.meals.splice(mealIndex, 1);
            this.saveStats();
            
            // If no meals left, remove the entire breakdown section
            if (this.todayStats.meals.length === 0) {
                const breakdownContainer = document.querySelector('.meal-breakdown');
                if (breakdownContainer) {
                    breakdownContainer.remove();
                }
            }
            
            this.refreshDashboard();
            
            if (window.showToast) {
                showToast(`${meal.name} removed from today's meals`, 'success');
            }
        }
    } 

    renderSuggestedRecipes() {
        // Get added recipes from localStorage instead of generating suggestions
        const addedRecipes = this.getAddedRecipes();
        
        const suggestedContainer = document.querySelector('#suggested-recipes .ingredient-list');
        if (!suggestedContainer) return;

        if (addedRecipes.length === 0) {
            suggestedContainer.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🍽️</div>
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">No recipes added yet</div>
                    <div>Add recipes from the Recipes tab to see cooking instructions here</div>
                </div>
            `;
            return;
        }

        suggestedContainer.innerHTML = addedRecipes.map(recipe => `
            <div class="ingredient-item recipe-suggestion" data-recipe-id="${recipe.id}">
                <div class="ingredient-info">
                    <div class="ingredient-name">${recipe.emoji} ${recipe.name}</div>
                    <div class="ingredient-quantity">${recipe.calories} cal • ${recipe.nutrition ? recipe.nutrition.protein : recipe.protein || 0}g protein • ${recipe.cookTime} min</div>
                </div>
                <div class="recipe-actions" style="display: flex; gap: var(--space-2); align-items: center;">
                    <button class="btn btn-sm btn-primary cook-btn" onclick="window.dashboard.showCookingInstructions(${recipe.id})">Cook</button>
                    <button class="btn btn-sm btn-danger delete-btn" onclick="window.dashboard.removeRecipeFromDashboard(${recipe.id})" style="background: var(--danger-color); width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; padding: 0;">&times;</button>
                </div>
            </div>
        `).join('');

        this.generateAutoGroceryList();
    }

    generateSuggestedRecipes() {
        const inventory = this.getCurrentInventory();
        const remainingCalories = this.goals.dailyCalories - this.todayStats.calories;
        
        const allRecipes = this.getAllRecipes();
        
        // Score recipes based on available ingredients and remaining calories
        this.suggestedRecipes = allRecipes
            .map(recipe => ({
                ...recipe,
                matchScore: this.calculateRecipeScore(recipe, inventory, remainingCalories)
            }))
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 4); // Show top 4 suggestions
    }

    getAddedRecipes() {
        const saved = localStorage.getItem('mtable_added_recipes');
        return saved ? JSON.parse(saved) : [];
    }


    saveAddedRecipes(recipes) {
        localStorage.setItem('mtable_added_recipes', JSON.stringify(recipes));
    }

    addRecipeToDashboard(recipeId) {
        const allRecipes = this.getAllRecipes();
        const recipe = allRecipes.find(r => r.id === recipeId);
        if (!recipe) {
            console.error('Recipe not found:', recipeId);
            console.log('Available recipe IDs:', allRecipes.map(r => r.id));
            return;
        }

        const addedRecipes = this.getAddedRecipes();

        // Add to dashboard suggestions - PRESERVE ALL RECIPE DATA
        const completeRecipe = {
            ...recipe,
            // Ensure all properties are preserved
            instructions: recipe.instructions || [],
            ingredients: recipe.ingredients || [],
            nutrition: recipe.nutrition || {}
        };
        
        console.log('Complete recipe being saved:', completeRecipe);
        
        addedRecipes.push(completeRecipe);
        this.saveAddedRecipes(addedRecipes);

        // Add to calendar for today
        if (window.calendar) {
            const today = new Date();
            const mealType = this.determineMealType();
            window.calendar.addMeal(today, mealType, recipe.name);
        }

        this.renderSuggestedRecipes();
        
        if (window.showToast) {
            showToast(`${recipe.name} added to dashboard and logged to today's progress!`, 'success');
        }
    }

    showCookingInstructions(recipeId) {
        console.log('showCookingInstructions called with ID:', recipeId);
        
        const addedRecipes = this.getAddedRecipes();
        console.log('Added recipes:', addedRecipes);
        
        const recipe = addedRecipes.find(r => r.id === recipeId);
        if (!recipe) {
            console.error('Recipe not found in added recipes:', recipeId);
            console.log('Available recipe IDs:', addedRecipes.map(r => r.id));
            return;
        }

        console.log('Found recipe:', recipe);
        console.log('Recipe instructions:', recipe.instructions);

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">🍳 Cooking Instructions: ${recipe.name}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="recipe-details">
                        <div class="recipe-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--space-3); margin-bottom: var(--space-4); padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius-lg);">
                            <div><strong>Cook Time:</strong> ${recipe.cookTime} min</div>
                            <div><strong>Calories:</strong> ${recipe.calories}</div>
                            <div><strong>Protein:</strong> ${recipe.nutrition ? recipe.nutrition.protein : (recipe.protein || 0)}g</div>
                            <div><strong>Serves:</strong> ${recipe.servings || 1}</div>
                        </div>
                        
                        <div class="recipe-section" style="margin-bottom: var(--space-4);">
                            <h4 style="color: var(--primary-color); margin-bottom: var(--space-3);">Ingredients:</h4>
                            <ul style="list-style: none; padding: 0;">
                                ${recipe.ingredients.map(ingredient => {
                                    if (typeof ingredient === 'string') {
                                        return `<li style="padding: var(--space-2); margin-bottom: var(--space-1); background: var(--bg-secondary); border-radius: var(--radius-md);">${ingredient}</li>`;
                                    } else {
                                        return `<li style="padding: var(--space-2); margin-bottom: var(--space-1); background: var(--bg-secondary); border-radius: var(--radius-md);"><strong>${ingredient.amount} ${ingredient.unit}</strong> ${ingredient.name}</li>`;
                                    }
                                }).join('')}
                            </ul>
                        </div>

                        <div class="recipe-section">
                            <h4 style="color: var(--primary-color); margin-bottom: var(--space-3);">Instructions:</h4>
                            <ol style="padding-left: var(--space-4);">
                                ${recipe.instructions && recipe.instructions.length > 0 ? recipe.instructions.map((step, index) => `
                                    <li style="margin-bottom: var(--space-3); line-height: 1.6;">
                                        <strong>Step ${index + 1}:</strong> ${step}
                                    </li>
                                `).join('') : '<li style="color: var(--text-secondary); font-style: italic;">No instructions available for this recipe</li>'}
                            </ol>
                        </div>
                    </div>
                    
                    <div class="modal-actions" style="margin-top: var(--space-6); display: flex; gap: var(--space-3);">
                        <button class="btn btn-success" onclick="window.dashboard.logRecipeAsCooked(${recipe.id}); this.closest('.modal').remove();" style="background: var(--success-color);">
                            📝 Log as Cooked
                        </button>
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        console.log('Modal created and added to DOM');
    }

    logRecipeAsCooked(recipeId) {
        const addedRecipes = this.getAddedRecipes();
        const recipe = addedRecipes.find(r => r.id === recipeId);
        if (!recipe) return;

        // Add to today's meals (this logs nutrition to dashboard)
        this.addMeal(
            recipe.name,
            recipe.calories,
            recipe.nutrition ? recipe.nutrition.protein : recipe.protein || 0,
            recipe.nutrition ? recipe.nutrition.carbs : recipe.carbs || Math.round(recipe.calories * 0.4 / 4),
            recipe.nutrition ? recipe.nutrition.fat : recipe.fat || Math.round(recipe.calories * 0.3 / 9)
        );

        // Also add to calendar for today
        if (window.calendar) {
            const today = new Date();
            const mealType = this.determineMealType();
            window.calendar.addMeal(
                today, 
                mealType, 
                recipe.name, 
                recipe.calories, 
                recipe.emoji || '🍽'
            );
        }

        if (window.showToast) {
            showToast(`${recipe.name} logged as cooked! +${recipe.calories} calories`, 'success');
        }
    }

    // Generate grocery list from added recipes
    generateAutoGroceryList() {
        const addedRecipes = this.getAddedRecipes();
        const neededIngredients = {};
        
        // Extract ingredients from all added recipes
        addedRecipes.forEach(recipe => {
            if (recipe.ingredients && recipe.ingredients.length > 0) {
                recipe.ingredients.forEach(ingredient => {
                    const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name;
                    const amount = typeof ingredient === 'string' ? '1 serving' : `${ingredient.amount} ${ingredient.unit}`;
                    const key = ingredientName.toLowerCase().trim();
                    
                    if (!neededIngredients[key]) {
                        neededIngredients[key] = {
                            name: ingredientName,
                            recipes: [{
                                recipeName: recipe.name,
                                recipeId: recipe.id,
                                amount: amount
                            }],
                            checked: this.isIngredientChecked(key)
                        };
                    } else {
                        // Add this recipe's requirement to existing ingredient
                        neededIngredients[key].recipes.push({
                            recipeName: recipe.name,
                            recipeId: recipe.id,
                            amount: amount
                        });
                    }
                });
            }
        });
        
        this.autoGroceryList = neededIngredients;
        this.renderAutoGroceryList();
    } 

    // Render the auto grocery list
    renderAutoGroceryList() {
        const groceryContainer = document.querySelector('#auto-grocery-list .grocery-list-container');
        if (!groceryContainer) return;
        
        const ingredients = Object.values(this.autoGroceryList || {});
        
        if (ingredients.length === 0) {
            groceryContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🛒</div>
                    <div class="empty-state-title">No ingredients needed</div>
                    <div class="empty-state-description">Add recipes to generate your shopping list</div>
                </div>
            `;
            return;
        }
        
        groceryContainer.innerHTML = ingredients.map(ingredient => {
            const ingredientKey = ingredient.name.toLowerCase().trim();
            
            // Create recipe tags
            const recipeTags = ingredient.recipes.map(recipe => {
                const isOverlapping = ingredient.recipes.length > 1;
                return `
                    <span class="recipe-tag ${isOverlapping ? 'overlapping' : ''}" 
                        title="${recipe.recipeName}: ${recipe.amount}">
                        ${recipe.recipeName}${isOverlapping ? ` (${recipe.amount})` : ''}
                    </span>
                `;
            }).join('');
            
            // Calculate total amount display
            const totalAmountDisplay = ingredient.recipes.length > 1 ? 
                `Multiple recipes (${ingredient.recipes.length})` : 
                ingredient.recipes[0].amount;
            
            return `
                <div class="auto-grocery-item ${ingredient.checked ? 'checked' : ''}" data-ingredient="${ingredientKey}">
                    <input type="checkbox" 
                        id="auto-grocery-${ingredientKey.replace(/\s+/g, '-')}"
                        ${ingredient.checked ? 'checked' : ''}
                        onchange="window.dashboard.toggleAutoGroceryItem('${ingredientKey}')">
                    <div class="ingredient-info">
                        <div class="ingredient-header">
                            <div class="ingredient-name">${ingredient.name}</div>
                            <div class="ingredient-amount">${totalAmountDisplay}</div>
                        </div>
                        <div class="recipe-tags">
                            ${recipeTags}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Check if any recipes should be hidden
        this.checkRecipeCompletion();
    }

    // Toggle grocery item checked status
    toggleAutoGroceryItem(ingredientKey) {
        if (this.autoGroceryList && this.autoGroceryList[ingredientKey]) {
            this.autoGroceryList[ingredientKey].checked = !this.autoGroceryList[ingredientKey].checked;
            
            // Save checked state to localStorage
            this.saveGroceryCheckedStates();
            
            // Update the visual state
            const item = document.querySelector(`[data-ingredient="${ingredientKey}"]`);
            if (item) {
                if (this.autoGroceryList[ingredientKey].checked) {
                    item.classList.add('checked');
                } else {
                    item.classList.remove('checked');
                }
            }
            
            // Check if any recipes should be hidden
            this.checkRecipeCompletion();
        }
    }

    // Check if recipes should be hidden based on ingredient completion
    checkRecipeCompletion() {
        const addedRecipes = this.getAddedRecipes();
        
        addedRecipes.forEach(recipe => {
            const recipeIngredients = recipe.ingredients || [];
            const allIngredientsChecked = recipeIngredients.every(ingredient => {
                const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name;
                const key = ingredientName.toLowerCase().trim();
                return this.autoGroceryList[key] && this.autoGroceryList[key].checked;
            });
            
            // Hide/show recipe based on ingredient completion
            const recipeElement = document.querySelector(`[data-recipe-id="${recipe.id}"]`);
            if (recipeElement) {
                if (allIngredientsChecked) {
                    recipeElement.style.opacity = '0.5';
                    recipeElement.style.transform = 'scale(0.95)';
                    recipeElement.title = 'All ingredients purchased!';
                } else {
                    recipeElement.style.opacity = '1';
                    recipeElement.style.transform = 'scale(1)';
                    recipeElement.title = '';
                }
            }
        });
    }

    // Save checked states to localStorage
    saveGroceryCheckedStates() {
        const checkedStates = {};
        Object.keys(this.autoGroceryList || {}).forEach(key => {
            checkedStates[key] = this.autoGroceryList[key].checked;
        });
        localStorage.setItem('mtable_grocery_checked', JSON.stringify(checkedStates));
    }

    // Load checked states from localStorage
    loadGroceryCheckedStates() {
        const saved = localStorage.getItem('mtable_grocery_checked');
        return saved ? JSON.parse(saved) : {};
    }

        // Check if ingredient is already checked
        isIngredientChecked(ingredientKey) {
            const checkedStates = this.loadGroceryCheckedStates();
            return checkedStates[ingredientKey] || false;
        }

    // Clear grocery list when recipes are removed
    clearGroceryForRemovedRecipes() {
        const addedRecipes = this.getAddedRecipes();
        const activeRecipeIds = addedRecipes.map(r => r.id);
        
        // Remove ingredients that are no longer needed
        Object.keys(this.autoGroceryList || {}).forEach(key => {
            const ingredient = this.autoGroceryList[key];
            ingredient.recipes = ingredient.recipes.filter(recipe => activeRecipeIds.includes(recipe.recipeId));
            
            // Remove ingredient if no recipes need it
            if (ingredient.recipes.length === 0) {
                delete this.autoGroceryList[key];
            }
        });
        
        this.saveGroceryCheckedStates();
        this.renderAutoGroceryList();
    } 

    removeRecipeFromDashboard(recipeId) {
        const addedRecipes = this.getAddedRecipes();
        const updatedRecipes = addedRecipes.filter(r => r.id !== recipeId);
        
        this.saveAddedRecipes(updatedRecipes);
        this.renderSuggestedRecipes();
        
        // Update grocery list after removing recipe
        this.clearGroceryForRemovedRecipes();
        
        if (window.showToast) {
            showToast('Recipe removed from dashboard', 'success');
        }
    } 

    calculateRecipeScore(recipe, inventory, remainingCalories) {
        let score = 0;
        
        // Ingredient availability score (0-50 points)
        const availableIngredients = recipe.ingredients.filter(ingredient => {
            const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name;
            return Object.values(inventory).some(item =>
                item.name.toLowerCase().includes(ingredientName.toLowerCase()) ||
                ingredientName.toLowerCase().includes(item.name.toLowerCase())
            );
        }).length;
        const ingredientScore = (availableIngredients / recipe.ingredients.length) * 50;
        score += ingredientScore;
        
        // Calorie appropriateness (0-50 points)
        const calorieScore = Math.max(0, 50 - Math.abs(recipe.calories - (remainingCalories / 3)) / 10);
        score += calorieScore;
        
        return Math.round(score);
    }

    getAllRecipes() {
        console.log('getAllRecipes() called');
        
        // First try to get recipes from the recipes component if available
        if (window.recipes && typeof window.recipes.getAllRecipes === 'function') {
            const recipes = window.recipes.getAllRecipes();
            console.log('Got recipes from recipes component:', recipes);
            return recipes;
        }
        
        // If recipes component not available, try to get directly from RECIPE_DATABASE
        if (typeof RECIPE_DATABASE !== 'undefined') {
            const recipes = Object.values(RECIPE_DATABASE);
            console.log('Got recipes from RECIPE_DATABASE:', recipes);
            return recipes;
        }
        
        // If RecipeUtils is available, use that
        if (typeof RecipeUtils !== 'undefined' && typeof RecipeUtils.getAllRecipes === 'function') {
            const recipes = RecipeUtils.getAllRecipes();
            console.log('Got recipes from RecipeUtils:', recipes);
            return recipes;
        }
        
        // Final fallback - empty array (no recipes available)
        console.warn('No recipe database available');
        return [];
    } 

    getCurrentInventory() {
        if (window.inventory) {
            return window.inventory.getAllIngredients();
        }
        
        // Try to get from localStorage as fallback
        const savedInventory = localStorage.getItem('mtable_inventory');
        return savedInventory ? JSON.parse(savedInventory) : {};
    }

    bindEvents() {
        // Listen for data updates from other components
        window.addEventListener('inventory-updated', () => {
            this.refreshDashboard();
        });

        window.addEventListener('goals-updated', () => {
            this.goals = this.loadGoals();
            this.refreshDashboard();
        });
    }

    cookAndLogRecipe(recipeId) {
        const recipe = this.getAllRecipes().find(r => r.id === recipeId);
        if (!recipe) return;

        // Add to today's stats
        this.addMeal(
            recipe.name, 
            recipe.calories, 
            recipe.protein,
            recipe.carbs || Math.round(recipe.calories * 0.4 / 4),
            recipe.fat || Math.round(recipe.calories * 0.3 / 9)
        );

        // Add to calendar for today
        if (window.calendar) {
            const today = new Date();
            const mealType = this.determineMealType();
            window.calendar.addMeal(today, mealType, recipe.name);
        }

        // Update inventory (reduce ingredient quantities if inventory component is available)
        this.updateInventoryAfterCooking(recipe.ingredients);

        if (window.showToast) {
            showToast(`${recipe.name} cooked and logged! +${recipe.calories} calories`, 'success');
        }
    }

    determineMealType() {
        const currentHour = new Date().getHours();
        
        if (currentHour < 11) {
            return 'breakfast';
        } else if (currentHour < 16) {
            return 'lunch';
        } else if (currentHour < 21) {
            return 'dinner';
        } else {
            return 'snack';
        }
    }

    updateInventoryAfterCooking(ingredients) {
        if (!window.inventory) return;

        const inventory = window.inventory.getAllIngredients();
        
        ingredients.forEach(ingredient => {
            const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name;
            
            // Find matching inventory item
            const found = Object.values(inventory).find(item =>
                item.name.toLowerCase().includes(ingredientName.toLowerCase()) ||
                ingredientName.toLowerCase().includes(item.name.toLowerCase())
            );

            if (found && found.quantity > 0) {
                // Reduce quantity by a reasonable amount
                const reductionAmount = Math.min(found.quantity * 0.2, 1);
                window.inventory.updateQuantity(found.id, Math.max(0, found.quantity - reductionAmount));
            }
        });
    }

    refreshDashboard() {
        this.renderCalorieProgress();
        this.renderMacronutrients();
        this.renderMealBreakdown();
        this.renderSuggestedRecipes();
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('dashboard-updated', {
            detail: { stats: this.todayStats }
        }));
    }

    // Public API methods
    updateCalories(calories) {
        this.todayStats.calories += calories;
        this.saveStats();
        this.renderCalorieProgress();
    }

    updateMacros(protein, carbs, fat) {
        this.todayStats.protein += protein;
        this.todayStats.carbs += carbs;
        this.todayStats.fat += fat;
        this.saveStats();
        this.renderMacronutrients();
    }

    getProgress() {
        return {
            calories: {
                current: this.todayStats.calories,
                target: this.goals.dailyCalories,
                percentage: (this.todayStats.calories / this.goals.dailyCalories) * 100
            },
            protein: {
                current: this.todayStats.protein,
                target: this.goals.dailyProtein,
                percentage: (this.todayStats.protein / this.goals.dailyProtein) * 100
            }
        };
    }

    addMeal(name, calories, protein, carbs, fat) {
        this.todayStats.calories += calories;
        this.todayStats.protein += protein;
        this.todayStats.carbs += carbs;
        this.todayStats.fat += fat;
        this.todayStats.meals.push({
            name: name,
            calories: calories,
            protein: protein,
            carbs: carbs,
            fat: fat,
            timestamp: new Date().toISOString()
        });

        this.saveStats();
        this.refreshDashboard();
    }

    getTodayStats() {
        return { ...this.todayStats };
    }

    reset() {
        const today = new Date().toISOString().split('T')[0];
        this.todayStats = {
            date: today,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            meals: []
        };
        this.saveStats();
        this.refreshDashboard();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new Dashboard();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dashboard;
}