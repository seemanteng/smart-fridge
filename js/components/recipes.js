/**
 * Recipes Component 
 * Handles recipe display, filtering, and cooking functionality
 */

class Recipes {
    constructor() {
        this.recipes = this.loadRecipes();
        this.filters = {
            maxCalories: null,
            minProtein: null,
            cuisine: 'all'
        };
        this.init();
    }

    init() {
        this.renderRecipes();
        this.bindEvents();
    }

    loadRecipes() {
        // Use the recipe database from data/recipes.js
        if (typeof RECIPE_DATABASE !== 'undefined') {
            return Object.values(RECIPE_DATABASE);
        }
        
        // Fallback to simple recipes if database not loaded
        console.warn('RECIPE_DATABASE not found, using fallback recipes');
        return [
            {
                id: 1,
                name: 'Teriyaki Chicken Bowl',
                emoji: '🍗',
                calories: 450,
                nutrition: { protein: 35, carbs: 45, fat: 12, fiber: 3 },
                cookTime: 25,
                cuisine: 'asian',
                servings: 2,
                ingredients: [
                    { name: 'chicken breast', amount: 8, unit: 'oz' },
                    { name: 'rice', amount: 1, unit: 'cup' },
                    { name: 'broccoli', amount: 1, unit: 'cup' },
                    { name: 'teriyaki sauce', amount: 3, unit: 'tbsp' }
                ],
                instructions: [
                    'Cook rice according to package directions',
                    'Season and cook chicken breast',
                    'Steam broccoli until tender',
                    'Combine with teriyaki sauce and serve'
                ]
            },
            {
                id: 2,
                name: 'Quinoa Power Salad',
                emoji: '🥗',
                calories: 380,
                nutrition: { protein: 18, carbs: 42, fat: 14, fiber: 8 },
                cookTime: 15,
                cuisine: 'mediterranean',
                servings: 2,
                ingredients: [
                    { name: 'quinoa', amount: 1, unit: 'cup' },
                    { name: 'chickpeas', amount: 0.5, unit: 'cup' },
                    { name: 'vegetables', amount: 2, unit: 'cups' },
                    { name: 'olive oil', amount: 2, unit: 'tbsp' }
                ],
                instructions: [
                    'Cook quinoa and let cool',
                    'Mix with chickpeas and chopped vegetables',
                    'Dress with olive oil and lemon',
                    'Season with salt and pepper'
                ]
            }
        ];
    }

    renderRecipes() {
        const recipeGrid = document.querySelector('.recipe-grid');
        if (!recipeGrid) return;

        const filteredRecipes = this.getFilteredRecipes();
        
        if (filteredRecipes.length === 0) {
            recipeGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🍽️</div>
                    <div class="empty-state-title">No recipes found</div>
                    <div class="empty-state-description">Try adjusting your filters</div>
                </div>
            `;
            return;
        }

        recipeGrid.innerHTML = filteredRecipes.map(recipe => 
            this.renderRecipeCard(recipe)
        ).join('');
    }

    getFilteredRecipes() {
        let filtered = [...this.recipes];

        // Filter by max calories
        if (this.filters.maxCalories) {
            filtered = filtered.filter(recipe => recipe.calories <= this.filters.maxCalories);
        }

        // Filter by min protein
        if (this.filters.minProtein) {
            filtered = filtered.filter(recipe => recipe.nutrition.protein >= this.filters.minProtein);
        }

        // Filter by cuisine
        if (this.filters.cuisine !== 'all' && this.filters.cuisine !== '') {
            filtered = filtered.filter(recipe => recipe.cuisine === this.filters.cuisine);
        }

        return filtered;
    }

    renderRecipeCard(recipe) {
        const availability = this.checkIngredientAvailability(recipe.ingredients);
        const canCook = availability.available >= availability.total * 0.75; // 75% ingredients available

        return `
            <div class="recipe-card ${canCook ? 'can-cook' : 'missing-ingredients'}" data-recipe-id="${recipe.id}">
                <div class="recipe-image">
                    ${recipe.thumbnailUrl ? `<img src="${recipe.thumbnailUrl}" alt="${recipe.name} video">` : recipe.emoji}
                    ${recipe.videoId ? `<div class="video-play-button" onclick="window.open('https://www.youtube.com/watch?v=${recipe.videoId}', '_blank')"></div>` : ''}
                </div>
                <div class="recipe-content">
                    <div class="recipe-title">${recipe.name}</div>
                    <div class="recipe-meta">
                        <span>${recipe.calories} cal</span>
                        <span>${recipe.nutrition ? recipe.nutrition.protein : recipe.protein || 0}g protein</span>
                        <span>${recipe.cookTime} min</span>
                    </div>
                    <div class="recipe-ingredients">
                        ${recipe.ingredients
                            .slice(0, 3)
                            .map(ing => typeof ing === 'string' ? ing : ing.name)
                            .join(', ')}${recipe.ingredients.length > 3 ? '...' : ''}
                    </div>
                    <div class="recipe-availability">
                        ${availability.available}/${availability.total} ingredients available
                    </div>
                    <div style="display: flex; gap: var(--space-2); margin-top: var(--space-3);">
                        <button class="btn btn-primary" onclick="recipes.showRecipeModal(${recipe.id})" style="flex: 0.7;">
                            View 
                        </button>
                        <button class="btn btn-success" onclick="recipes.addRecipeToDashboard(${recipe.id})" style="flex: 2.3; background: var(--success-color);">
                            Add to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    addRecipeToDashboard(recipeId) {
        if (window.dashboard && typeof window.dashboard.addRecipeToDashboard === 'function') {
            window.dashboard.addRecipeToDashboard(recipeId);
        } else {
            if (window.showToast) {
                showToast('Dashboard component not available', 'error');
            }
        }
    }

    checkIngredientAvailability(recipeIngredients) {
        const inventory = this.getCurrentInventory();
        let available = 0;
        const total = recipeIngredients.length;

        recipeIngredients.forEach(ingredient => {
            // Handle both string and object ingredient formats
            const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name;
            
            const found = Object.values(inventory).some(item =>
                item.name.toLowerCase().includes(ingredientName.toLowerCase()) ||
                ingredientName.toLowerCase().includes(item.name.toLowerCase())
            );
            if (found) available++;
        });

        return { available, total };
    }

    getCurrentInventory() {
        if (window.inventory) {
            return window.inventory.getAllIngredients();
        }
        return {};
    }

    bindEvents() {
        // Filter form submission
        const filterButton = document.querySelector('[onclick*="filterRecipes"]');
        if (filterButton) {
            filterButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.applyFilters();
            });
        }

        // Filter inputs
        document.addEventListener('input', (e) => {
            if (e.target.id === 'maxCalories' || e.target.id === 'minProtein') {
                this.applyFilters();
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.id === 'cuisineType') {
                this.applyFilters();
            }
        });

        // Listen for inventory updates
        window.addEventListener('inventory-updated', () => {
            this.renderRecipes();
        });
    }

    applyFilters() {
        const maxCaloriesInput = document.getElementById('maxCalories');
        const minProteinInput = document.getElementById('minProtein');
        const cuisineSelect = document.getElementById('cuisineType');

        this.filters.maxCalories = maxCaloriesInput?.value ? parseInt(maxCaloriesInput.value) : null;
        this.filters.minProtein = minProteinInput?.value ? parseInt(minProteinInput.value) : null;
        this.filters.cuisine = cuisineSelect?.value || 'all';

        this.renderRecipes();

        if (window.showToast) {
            showToast('Recipe filters applied!', 'success');
        }
    }

    cookRecipe(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        const availability = this.checkIngredientAvailability(recipe.ingredients);
        
        if (availability.available < availability.total * 0.75) {
            this.showMissingIngredientsModal(recipe, availability);
            return;
        }

        // Add to dashboard with proper nutrition data
        if (window.dashboard) {
            window.dashboard.addMeal(
                recipe.name, 
                recipe.calories, 
                recipe.nutrition ? recipe.nutrition.protein : recipe.protein || 0,
                recipe.nutrition ? recipe.nutrition.carbs : Math.round(recipe.calories * 0.4 / 4),
                recipe.nutrition ? recipe.nutrition.fat : Math.round(recipe.calories * 0.3 / 9)
            );
        }

        // Update inventory (reduce ingredient quantities)
        this.updateInventoryAfterCooking(recipe.ingredients);

        if (window.showToast) {
            showToast(`${recipe.name} added to your daily intake!`, 'success');
        }
    }

    showRecipeModal(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${recipe.emoji} ${recipe.name}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="recipe-details">
                        <div class="recipe-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--space-3); margin-bottom: var(--space-4); padding: var(--space-3); background: var(--bg-secondary); border-radius: var(--radius-lg);">
                            <div><strong>Calories:</strong> ${recipe.calories}</div>
                            <div><strong>Protein:</strong> ${recipe.nutrition ? recipe.nutrition.protein : recipe.protein || 0}g</div>
                            <div><strong>Cook Time:</strong> ${recipe.cookTime} min</div>
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
                                ${recipe.instructions.map((step, index) => `
                                    <li style="margin-bottom: var(--space-3); line-height: 1.6;">
                                        <strong>Step ${index + 1}:</strong> ${step}
                                    </li>
                                `).join('')}
                            </ol>
                        </div>
                    </div>
                    
                   <div class="modal-actions" style="margin-top: var(--space-6); display: flex; gap:
                    var(--space-3); justify-content: center;">
                    <button class="btn btn-secondary"
                    onclick="this.closest('.modal').remove()">Close</button>
                    </div> 
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }

    showMissingIngredientsModal(recipe, availability) {
        const inventory = this.getCurrentInventory();
        const missing = recipe.ingredients.filter(ingredient => {
            return !Object.values(inventory).some(item =>
                item.name.toLowerCase().includes(ingredient.toLowerCase()) ||
                ingredient.toLowerCase().includes(item.name.toLowerCase())
            );
        });

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">Missing Ingredients</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>You're missing some ingredients for <strong>${recipe.name}</strong>:</p>
                    <ul class="missing-ingredients">
                        ${missing.map(ingredient => `<li>${ingredient}</li>`).join('')}
                    </ul>
                    <p>Would you like to add these to your grocery list or cook anyway?</p>
                    
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="recipes.addToGroceryList([${missing.map(i => `'${i}'`).join(', ')}]); this.closest('.modal').remove();">Add to Grocery List</button>
                        <button class="btn btn-secondary" onclick="recipes.cookRecipe(${recipe.id}); this.closest('.modal').remove();">Cook Anyway</button>
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }

    markAsCooked(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        // Reduce inventory quantities (simplified)
        this.updateInventoryAfterCooking(recipe.ingredients);

        if (window.showToast) {
            showToast(`${recipe.name} marked as cooked!`, 'success');
        }
    }

    updateInventoryAfterCooking(ingredients) {
        if (!window.inventory) return;

        const inventory = window.inventory.getAllIngredients();
        
        ingredients.forEach(ingredient => {
            // Find matching inventory item
            const found = Object.values(inventory).find(item =>
                item.name.toLowerCase().includes(ingredient.toLowerCase()) ||
                ingredient.toLowerCase().includes(item.name.toLowerCase())
            );

            if (found && found.quantity > 0) {
                // Reduce quantity by a small amount (simplified logic)
                const reductionAmount = Math.min(found.quantity * 0.1, 0.5);
                window.inventory.updateQuantity(found.id, found.quantity - reductionAmount);
            }
        });
    }

    addToGroceryList(missingIngredients) {
        // Add to grocery list (simplified - just show toast for now)
        const ingredientList = missingIngredients.join(', ');
        
        if (window.showToast) {
            showToast(`Added to grocery list: ${ingredientList}`, 'success');
        }

        // In a real app, this would integrate with the calendar's grocery list
        console.log('Added to grocery list:', missingIngredients);
    }

    clearFilters() {
        this.filters = {
            maxCalories: null,
            minProtein: null,
            cuisine: 'all'
        };

        // Clear form inputs
        const maxCaloriesInput = document.getElementById('maxCalories');
        const minProteinInput = document.getElementById('minProtein');
        const cuisineSelect = document.getElementById('cuisineType');

        if (maxCaloriesInput) maxCaloriesInput.value = '';
        if (minProteinInput) minProteinInput.value = '';
        if (cuisineSelect) cuisineSelect.value = 'all';

        this.renderRecipes();
    }

    // Public API methods
    getRecipe(id) {
        return this.recipes.find(recipe => recipe.id === id);
    }

    getAllRecipes() {
        return [...this.recipes];
    }

    getRecipesByCuisine(cuisine) {
        return this.recipes.filter(recipe => recipe.cuisine === cuisine);
    }

    searchRecipes(query) {
        return this.recipes.filter(recipe =>
            recipe.name.toLowerCase().includes(query.toLowerCase()) ||
            recipe.ingredients.some(ingredient => 
                ingredient.toLowerCase().includes(query.toLowerCase())
            )
        );
    }

    getRecipesWithAvailableIngredients() {
        return this.recipes.filter(recipe => {
            const availability = this.checkIngredientAvailability(recipe.ingredients);
            return availability.available >= availability.total * 0.75;
        });
    }
}

// Initialize recipes when DOM is loaded
let recipes;
document.addEventListener('DOMContentLoaded', function() {
    recipes = new Recipes();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Recipes;
}