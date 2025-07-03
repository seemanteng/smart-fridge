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


    getLocalDateString(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    loadTodayStats() {
        const today = this.getLocalDateString(new Date()); // ← Add explicit parameter
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
        const today = this.getLocalDateString(new Date()); // ← Add explicit parameter
        localStorage.setItem(`mtable_stats_${today}`, JSON.stringify(this.todayStats));
    }

     updateProgressCircle(percentage) {
        const progressCircle = document.querySelector('.circle-progress');
        if (!progressCircle) return;

        // SVG circle with radius 50 (from your SVG: cx="60" cy="60" r="50")
        const radius = 50;
        const circumference = 2 * Math.PI * radius;
        const strokeDasharray = (percentage / 100) * circumference;
        
        progressCircle.style.strokeDasharray = `${strokeDasharray} ${circumference}`;
        progressCircle.style.strokeDashoffset = '0';
    }


    // REPLACE your removeMeal method in dashboard.js with this:

    removeMeal(mealIndex) {
        console.log('Removing meal at index:', mealIndex);
        console.log('Current meals:', this.todayStats.meals);
        
        // Safety check - make sure meals array exists and has items
        if (!this.todayStats.meals || !Array.isArray(this.todayStats.meals)) {
            console.error('todayStats.meals is not an array:', this.todayStats.meals);
            if (window.showToast) {
                showToast('Error: No meals to remove', 'error');
            }
            return;
        }
        
        // Safety check - make sure index is valid
        if (mealIndex < 0 || mealIndex >= this.todayStats.meals.length) {
            console.error('Invalid meal index:', mealIndex, 'Array length:', this.todayStats.meals.length);
            if (window.showToast) {
                showToast('Error: Invalid meal selection', 'error');
            }
            return;
        }
        
        const removedMeal = this.todayStats.meals[mealIndex];
        
        if (removedMeal) {
            console.log('Removing meal:', removedMeal);
            
            // Remove from today's meals array
            this.todayStats.meals.splice(mealIndex, 1);
            
            // Update nutrition totals
            this.todayStats.calories -= removedMeal.calories || 0;
            this.todayStats.protein -= removedMeal.protein || 0;
            this.todayStats.carbs -= removedMeal.carbs || 0;
            this.todayStats.fat -= removedMeal.fat || 0;
            
            // Ensure no negative values
            this.todayStats.calories = Math.max(0, this.todayStats.calories);
            this.todayStats.protein = Math.max(0, this.todayStats.protein);
            this.todayStats.carbs = Math.max(0, this.todayStats.carbs);
            this.todayStats.fat = Math.max(0, this.todayStats.fat);
            
            // Save to localStorage
            this.saveStats();
            
            // Update the display
            this.refreshDashboard();
            
            // Notify calendar about meal removal
            window.dispatchEvent(new CustomEvent('meal-removed', {
                detail: {
                    name: removedMeal.name,
                    timestamp: removedMeal.timestamp,
                    calories: removedMeal.calories
                }
            }));
            
            // Also dispatch general update
            window.dispatchEvent(new CustomEvent('dashboard-updated'));
            
            if (window.showToast) {
                showToast(`${removedMeal.name} removed!`, 'success');
            }
        } else {
            console.error('No meal found at index:', mealIndex);
            if (window.showToast) {
                showToast('Error: Could not find meal to remove', 'error');
            }
        }
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

        // Remove the recipe from "Things to Make" after logging
        this.removeRecipeFromDashboard(recipeId);

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

    // Update consumed label
    const consumedLabel = document.querySelector('.consumed-label');
    if (consumedLabel) {
        consumedLabel.textContent = 'Consumed';
    }

    // Update the progress circle
    this.updateProgressCircle(percentage);
    }

    renderMacronutrients() {
        const macros = [
            { 
                current: this.todayStats.protein, 
                target: this.goals.dailyProtein, 
                unit: 'g', 
                name: 'Protein',
                color: '#4ECDC4'
            },
            { 
                current: this.todayStats.carbs, 
                target: this.goals.dailyCarbs, 
                unit: 'g', 
                name: 'Carbs',
                color: '#4ECDC4'
            },
            { 
                current: this.todayStats.fat, 
                target: this.goals.dailyFat, 
                unit: 'g', 
                name: 'Fat',
                color: '#FF6B6B'
            }
        ];

        const macrosContainer = document.querySelector('.macros-display');
        if (macrosContainer) {
            macrosContainer.innerHTML = macros.map(macro => {
                const percentage = macro.target > 0 ? Math.round((macro.current / macro.target) * 100) : 0;
                return `
                    <div class="macro-item">
                        <div class="macro-info">
                            <span class="macro-label" style="color: ${macro.color};">${macro.name}</span>
                            <span class="macro-value">${Math.round(macro.current * 10) / 10}</span>
                        </div>
                        <span class="macro-percent">${percentage}%</span>
                    </div>
                `;
            }).join('');
        }
    }

    // Update renderMealBreakdown method
    renderMealBreakdown() {
        const mealsList = document.querySelector('#meals-breakdown');
        if (!mealsList) return;

        if (this.todayStats.meals.length === 0) {
            mealsList.innerHTML = '';
            return;
        }

        mealsList.innerHTML = this.todayStats.meals.map((meal, index) => {
            // Try to find the recipe to get thumbnail
            const allRecipes = this.getAllRecipes();
            const recipe = allRecipes.find(r => r.name === meal.name);
            let thumbnailUrl = null;
            
            if (recipe && recipe.videoUrl) {
                const videoId = VideoUtils.extractVideoId(recipe.videoUrl);
                thumbnailUrl = VideoUtils.getThumbnailUrl(videoId, 'hqdefault');
            }

            return `
                <div class="meal-item">
                    <div class="meal-image-small">
                        ${thumbnailUrl ? 
                            `<img src="${thumbnailUrl}" alt="${meal.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-md);">` 
                            : '🍽'
                        }
                    </div>
                    <div class="meal-info">
                        <span class="meal-name">${meal.name}</span>
                        <span class="meal-stats">${meal.calories} cal • ${meal.protein}g protein • ${meal.carbs || 0}g carbs • ${meal.fat || 0}g fat</span>
                    </div>
                    <button class="remove-btn" onclick="window.dashboard.removeMeal(${index})">REMOVE</button>
                </div>
            `;
        }).join('');
    } 

    // Update renderSuggestedRecipes method
    renderSuggestedRecipes() {
        const addedRecipes = this.getAddedRecipes();
        const suggestedContainer = document.querySelector('#recipe-suggestions');
        if (!suggestedContainer) return;

        if (addedRecipes.length === 0) {
            suggestedContainer.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🍽</div>
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">No recipes added yet</div>
                    <div style="font-size: 0.9rem;">Add recipes from the Recipes tab to see cooking instructions here</div>
                </div>
            `;
            return;
        }

        suggestedContainer.innerHTML = addedRecipes.slice(0, 2).map(recipe => {
        const videoId = VideoUtils.extractVideoId(recipe.videoUrl);
        const thumbnailUrl = VideoUtils.getThumbnailUrl(videoId, 'hqdefault');
        
        return `
            <div class="recipe-card-small" style="position: relative;">
                <button class="recipe-remove-btn" onclick="window.dashboard.removeRecipeFromDashboard(${recipe.id})" 
                        title="Remove from Things to Make">&times;</button>
                <div class="recipe-image">
                    ${thumbnailUrl ? 
                        `<img src="${thumbnailUrl}" alt="${recipe.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-xl);">` 
                        : (recipe.emoji || '🍽')
                    }
                </div>
                <div class="recipe-info">
                    <h3>${recipe.name}</h3>
                    <div class="recipe-actions">
                        <button class="btn-secondary" onclick="window.dashboard.showCookingInstructions(${recipe.id})">View Recipe</button>
                        <button class="btn-primary" onclick="window.dashboard.logRecipeAsCooked(${recipe.id})">Log Meal</button>
                    </div>
                </div>
            </div>
        `;
        }).join('');

        this.generateAutoGroceryList();
    }

    // Update renderAutoGroceryList method
    renderAutoGroceryList() {
        const groceryContainer = document.querySelector('#auto-grocery-grid');
        if (!groceryContainer) return;

        const ingredients = Object.values(this.autoGroceryList || {});
        
        if (ingredients.length === 0) {
            groceryContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🛒</div>
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">No ingredients needed</div>
                    <div style="font-size: 0.9rem;">Add recipes to generate your shopping list</div>
                </div>
            `;
            return;
        }

        groceryContainer.innerHTML = ingredients.map(ingredient => {
            const ingredientKey = ingredient.name.toLowerCase().trim();
            const totalAmountDisplay = ingredient.recipes.length > 1 ? 
                `Multiple recipes (${ingredient.recipes.length})` : 
                ingredient.recipes[0].amount;

            const recipeTags = ingredient.recipes.map(recipe => {
                const isOverlapping = ingredient.recipes.length > 1;
                return `<span class="recipe-tag ${isOverlapping ? '' : 'active'}">${recipe.recipeName}</span>`;
            }).join('');

            return `
                <div class="shopping-item ${ingredient.checked ? 'checked' : ''}">
                    <input type="checkbox" 
                        id="grocery-${ingredientKey.replace(/\s+/g, '-')}"
                        ${ingredient.checked ? 'checked' : ''}
                        onchange="window.dashboard.toggleAutoGroceryItem('${ingredientKey}')">
                    <label for="grocery-${ingredientKey.replace(/\s+/g, '-')}" ${ingredient.checked ? 'class="checked"' : ''}>
                        <strong>${ingredient.name}</strong>
                        <span class="item-detail">${totalAmountDisplay}</span>
                        <div class="recipe-tags">${recipeTags}</div>
                    </label>
                </div>
            `;
        }).join('');
    }

    // Clear all completed items
    clearCompletedItems() {
        let removedCount = 0;
        Object.keys(this.autoGroceryList || {}).forEach(key => {
            if (this.autoGroceryList[key].checked) {
                delete this.autoGroceryList[key];
                removedCount++;
            }
        });
        
        if (removedCount > 0) {
            this.saveGroceryCheckedStates();
            this.renderAutoGroceryList();
            
            if (window.showToast) {
                showToast(`Successfully Removed ${removedCount} items!`, 'success');
            }
        }
    }

    // Toggle grocery item checked status
    toggleAutoGroceryItem(ingredientKey) {
        if (this.autoGroceryList && this.autoGroceryList[ingredientKey]) {
            this.autoGroceryList[ingredientKey].checked = !this.autoGroceryList[ingredientKey].checked;
            
            // Save checked state to localStorage
            this.saveGroceryCheckedStates();
            
            // If item is checked, remove it from the display after a short delay
            if (this.autoGroceryList[ingredientKey].checked) {
                const itemElement = document.querySelector(`input[onchange*="${ingredientKey}"]`)?.closest('.shopping-item');
                if (itemElement) {
                    // Add fade out animation
                    itemElement.style.transition = 'all 0.3s ease';
                    itemElement.style.opacity = '0.5';
                    itemElement.style.transform = 'scale(0.95)';
                    
                    // Remove after animation
                    setTimeout(() => {
                        // Remove from data structure
                        delete this.autoGroceryList[ingredientKey];
                        
                        // Re-render the grocery list
                        this.renderAutoGroceryList();
                        
                        // Save updated state
                        this.saveGroceryCheckedStates();
                        
                        if (window.showToast) {
                            showToast('Successfully Removed!', 'success');
                        }
                    }, 300);
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
            showToast('Successfully Removed!', 'success');
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
        const today = this.getLocalDateString(new Date()); // ← Add explicit parameter
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