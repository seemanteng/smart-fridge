/**
 * Main Application File for MTable
 * Initializes all components and handles global functionality
 */

// Global variables for components - DO NOT INITIALIZE HERE
let dashboard;
let calendar;

// Global toast notification function
function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast.show');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.closest('.toast').remove()">&times;</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);
}

// Navigation function (global)
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update active tab in sidebar (for smart fridge layout)
    const sidebarTabs = document.querySelectorAll('.nav-item');
    sidebarTabs.forEach(tab => tab.classList.remove('active'));
    
    // Find and activate the correct sidebar tab
    const activeTab = document.querySelector(`.nav-item a[onclick*="${sectionId}"]`)?.parentElement;
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Update old nav tabs if they exist (for other sections)
    const oldTabs = document.querySelectorAll('.nav-tab');
    oldTabs.forEach(tab => tab.classList.remove('active'));
}

// Recipe filtering function (global)
function filterRecipes() {
    if (window.recipes) {
        window.recipes.applyFilters();
    } else {
        console.error('Recipes component not initialized');
    }
}

// Clear all MTable data function (global utility)
function clearAllMTableData() {
    console.log('🧹 Clearing all MTable data...');
    
    // Clear all localStorage with mtable prefix
    Object.keys(localStorage).forEach(key => {
        if (key.toLowerCase().includes('mtable')) {
            localStorage.removeItem(key);
            console.log(`Removed: ${key}`);
        }
    });
    
    // Refresh all components
    setTimeout(() => {
        if (window.dashboard && typeof window.dashboard.refreshDashboard === 'function') {
            window.dashboard.refreshDashboard();
        }
        if (window.calendar && typeof window.calendar.renderCalendar === 'function') {
            window.calendar.renderCalendar();
        }
        if (window.goals && typeof window.goals.refreshGoalsDisplay === 'function') {
            window.goals.refreshGoalsDisplay();
        }
        
        showToast('All data cleared successfully!', 'success');
        console.log('✅ All MTable data cleared and components refreshed');
    }, 100);
}

// Initialize all components when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🍽️ Initializing MTable app...');

    try {
        // Let each component initialize itself, then reference them
        setTimeout(() => {
            // Reference the globally initialized components
            dashboard = window.dashboard;
            inventory = window.inventory;
            recipes = window.recipes;
            calendar = window.calendar;
            goals = window.goals;
            
            // Set up global event listeners
            setupGlobalEvents();
            
            // Add toast styles if not present
            addToastStyles();
            
            console.log('✅ Smart Fridge initialized successfully! Hello, Im Man Teng the creator of this site and thanks for using my web app!');
            console.log('Components available:', {
                dashboard: !!dashboard,
                inventory: !!inventory,
                recipes: !!recipes,
                calendar: !!calendar,
                goals: !!goals
            });
            
            showToast('Welcome to Smart Fridge!', 'success');
            
        }, 100); // Small delay to let components initialize
        
    } catch (error) {
        console.error('❌ Error initializing MTable app:', error);
        showToast('Error loading app', 'error');
    }
});

function setupGlobalEvents() {
    // Handle form submissions globally
    document.addEventListener('submit', function(e) {
        // Prevent default form submission for our custom forms
        if (e.target.id === 'ingredientForm' || 
            e.target.closest('.modal') || 
            e.target.closest('#goals')) {
            // Let components handle their own forms
            return;
        }
    });

    // Handle escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal.active');
            if (modal) {
                modal.remove();
            }
        }
    });

    // Handle clicks outside modals to close them
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.remove();
        }
    });

    // Set up component communication events
    setupComponentCommunication();
}

function setupComponentCommunication() {
    // Listen for inventory updates and refresh other components
    window.addEventListener('inventory-updated', function(e) {
        console.log('📦 Inventory updated, refreshing components...');
        
        if (window.dashboard) {
            window.dashboard.refreshDashboard();
        }
        
        if (window.recipes) {
            window.recipes.renderRecipes();
        }
    });

    // Listen for goals updates
    window.addEventListener('goals-updated', function(e) {
        console.log('🎯 Goals updated, refreshing components...');
        
        if (window.dashboard) {
            window.dashboard.goals = window.dashboard.loadGoals();
            window.dashboard.refreshDashboard();
        }
    });

    // Listen for dashboard updates
    window.addEventListener('dashboard-updated', function(e) {
        console.log('📊 Dashboard updated');
        // Other components can react to dashboard changes here
    });

    // Listen for goals section activation
    document.addEventListener('click', function(e) {
        if (e.target.closest('a[onclick*="goals"]')) {
            setTimeout(() => {
                if (window.goals && typeof window.goals.refreshGoalsDisplay === 'function') {
                    console.log('Goals tab clicked, refreshing...');
                    window.goals.refreshGoalsDisplay();
                }
            }, 500);
        }
    });
}

function addToastStyles() {
    // Check if toast styles already exist
    if (document.querySelector('#toast-styles')) return;

    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        .toast {
            position: fixed;
            top: var(--space-5);
            right: var(--space-5);
            background: var(--bg-primary);
            border: 1px solid var(--border-light);
            border-radius: var(--radius-lg);
            padding: var(--space-4);
            box-shadow: var(--shadow-xl);
            z-index: var(--z-tooltip);
            transform: translateX(100%);
            transition: var(--transition-normal);
            max-width: 400px;
            min-width: 250px;
        }

        .toast.show {
            transform: translateX(0);
        }

        .toast.success {
            border-left: 4px solid var(--success-color);
        }

        .toast.error {
            border-left: 4px solid var(--error-color);
        }

        .toast.warning {
            border-left: 4px solid var(--warning-color);
        }

        .toast.info {
            border-left: 4px solid var(--primary-color);
        }

        .toast-content {
            display: flex;
            align-items: center;
            gap: var(--space-2);
        }

        .toast-icon {
            font-size: var(--text-lg);
        }

        .toast-message {
            flex: 1;
            color: var(--text-primary);
            font-weight: var(--font-medium);
        }

        .toast-close {
            background: none;
            border: none;
            font-size: var(--text-lg);
            cursor: pointer;
            color: var(--text-secondary);
            transition: var(--transition-fast);
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .toast-close:hover {
            color: var(--text-primary);
        }

        @media (max-width: 575px) {
            .toast {
                left: var(--space-3);
                right: var(--space-3);
                top: var(--space-3);
                transform: translateY(-100%);
                max-width: none;
            }

            .toast.show {
                transform: translateY(0);
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Global utility functions
window.MTableUtils = {
    // Format numbers
    formatNumber(num, decimals = 1) {
        return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    },

    // Format date
    formatDate(date) {
        return new Date(date).toLocaleDateString();
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Get component references
    getComponents() {
        return {
            dashboard: window.dashboard,
            inventory: window.inventory,
            recipes: window.recipes,
            calendar: window.calendar,
            goals: window.goals
        };
    },

    // Clear all data utility
    clearAllData() {
        clearAllMTableData();
    }
};

// Recipe Manager Class
class CustomRecipeManager {
    constructor() {
        this.customRecipes = this.loadCustomRecipes();
        this.nextId = this.getNextId();
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderCustomRecipes();
        this.updateRecipeCount();
    }

    loadCustomRecipes() {
        const saved = localStorage.getItem('mtable_custom_recipes');
        return saved ? JSON.parse(saved) : [];
    }

    saveCustomRecipes() {
        localStorage.setItem('mtable_custom_recipes', JSON.stringify(this.customRecipes));
        this.updateRecipeCount();
        this.updateMainRecipeDatabase();
    }

    getNextId() {
        const maxId = this.customRecipes.reduce((max, recipe) => Math.max(max, recipe.id || 0), 0);
        return Math.max(maxId + 1, 1000); // Start custom recipes at 1000+
    }

    bindEvents() {
        const form = document.getElementById('recipeManagerForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addCustomRecipe();
            });
        }
    }

    addCustomRecipe() {
        const formData = this.getFormData();
        
        if (!this.validateFormData(formData)) {
            return;
        }

        const recipe = {
            id: this.nextId++,
            name: formData.name,
            videoUrl: formData.videoUrl,
            cuisine: formData.cuisine,
            difficulty: formData.difficulty,
            cookTime: parseInt(formData.cookTime),
            servings: parseInt(formData.servings),
            calories: parseInt(formData.calories),
            nutrition: {
                protein: parseFloat(formData.protein),
                carbs: parseFloat(formData.carbs) || 0,
                fat: parseFloat(formData.fat) || 0
            },
            ingredients: formData.ingredients,
            instructions: formData.instructions,
            tags: formData.tags,
            dateAdded: new Date().toISOString(),
            isCustom: true
        };

        this.customRecipes.push(recipe);
        this.saveCustomRecipes();
        this.renderCustomRecipes();
        this.clearForm();
        
        if (window.showToast) {
            showToast('Recipe added successfully!', 'success');
        }
    }

    getFormData() {
        const formData = {
            name: document.getElementById('newRecipeName').value.trim(),
            videoUrl: document.getElementById('newVideoUrl').value.trim(),
            cuisine: document.getElementById('newCuisine').value,
            difficulty: document.getElementById('newDifficulty').value,
            cookTime: document.getElementById('newCookTime').value,
            servings: document.getElementById('newServings').value,
            calories: document.getElementById('newCalories').value,
            protein: document.getElementById('newProtein').value,
            carbs: document.getElementById('newCarbs').value,
            fat: document.getElementById('newFat').value,
            tags: document.getElementById('newTags').value.trim()
        };

        // Get ingredients
        formData.ingredients = [];
        document.querySelectorAll('#newIngredientsList .ingredient-input').forEach(input => {
            const name = input.querySelector('.ingredient-name').value.trim();
            const amount = input.querySelector('.ingredient-amount').value.trim();
            const unit = input.querySelector('.ingredient-unit').value.trim();
            
            if (name && amount && unit) {
                formData.ingredients.push({
                    name: name,
                    amount: parseFloat(amount),
                    unit: unit
                });
            }
        });

        // Get instructions
        formData.instructions = [];
        document.querySelectorAll('#newInstructionsList .instruction-text').forEach(textarea => {
            const instruction = textarea.value.trim();
            if (instruction) {
                formData.instructions.push(instruction);
            }
        });

        // Process tags
        if (formData.tags) {
            formData.tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        } else {
            formData.tags = [];
        }

        return formData;
    }

    validateFormData(formData) {
        if (!formData.name) {
            if (window.showToast) showToast('Recipe name is required', 'error');
            return false;
        }
        if (!formData.cuisine) {
            if (window.showToast) showToast('Cuisine type is required', 'error');
            return false;
        }
        if (!formData.cookTime || formData.cookTime < 1) {
            if (window.showToast) showToast('Valid cook time is required', 'error');
            return false;
        }
        if (formData.ingredients.length === 0) {
            if (window.showToast) showToast('At least one ingredient is required', 'error');
            return false;
        }
        if (formData.instructions.length === 0) {
            if (window.showToast) showToast('At least one instruction is required', 'error');
            return false;
        }
        return true;
    }

    renderCustomRecipes() {
        const container = document.getElementById('customRecipesList');
        if (!container) return;

        if (this.customRecipes.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🍽</div>
                    <div>No custom recipes added yet</div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.customRecipes.map(recipe => `
            <div class="ingredient-card">
                <div class="card-content">
                    <div class="ingredient-info">
                        <h4>${recipe.name}</h4>
                        <div class="ingredient-quantity">${recipe.calories} cal • ${recipe.nutrition.protein}g protein • ${recipe.cookTime} min</div>
                    </div>
                    <div class="ingredient-actions">
                        <button class="btn btn-edit" onclick="customRecipeManager.viewRecipe(${recipe.id})">View</button>
                        <button class="btn btn-delete" onclick="customRecipeManager.deleteRecipe(${recipe.id})">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    viewRecipe(id) {
        const recipe = this.customRecipes.find(r => r.id === id);
        if (!recipe) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${recipe.name}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 1rem;">
                        <strong>Details:</strong> ${recipe.cuisine} • ${recipe.difficulty} • ${recipe.cookTime} min • ${recipe.servings} servings
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <strong>Nutrition:</strong> ${recipe.calories} cal, ${recipe.nutrition.protein}g protein, ${recipe.nutrition.carbs}g carbs, ${recipe.nutrition.fat}g fat
                    </div>

                    ${recipe.videoUrl ? `
                        <div style="margin-bottom: 1rem;">
                            <strong>Video:</strong> <a href="${recipe.videoUrl}" target="_blank">Watch on YouTube</a>
                        </div>
                    ` : ''}

                    <div style="margin-bottom: 1rem;">
                        <strong>Ingredients:</strong>
                        <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
                            ${recipe.ingredients.map(ing => `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`).join('')}
                        </ul>
                    </div>

                    <div style="margin-bottom: 1rem;">
                        <strong>Instructions:</strong>
                        <ol style="margin-top: 0.5rem; padding-left: 1.5rem;">
                            ${recipe.instructions.map(instruction => `<li style="margin-bottom: 0.5rem;">${instruction}</li>`).join('')}
                        </ol>
                    </div>

                    ${recipe.tags.length > 0 ? `
                        <div><strong>Tags:</strong> ${recipe.tags.join(', ')}</div>
                    ` : ''}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    deleteRecipe(id) {
        if (confirm('Are you sure you want to delete this recipe?')) {
            this.customRecipes = this.customRecipes.filter(r => r.id !== id);
            this.saveCustomRecipes();
            this.renderCustomRecipes();
            if (window.showToast) showToast('Recipe deleted', 'success');
        }
    }

    updateRecipeCount() {
        const countElement = document.getElementById('customRecipeCount');
        if (countElement) {
            countElement.textContent = this.customRecipes.length;
        }
    }

    updateMainRecipeDatabase() {
        // Merge custom recipes with existing RECIPE_DATABASE
        if (typeof RECIPE_DATABASE !== 'undefined') {
            this.customRecipes.forEach(recipe => {
                const key = recipe.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                RECIPE_DATABASE[key] = recipe;
            });
        }
    }

    clearForm() {
        document.getElementById('recipeManagerForm').reset();
        // Reset ingredients and instructions to have one empty field each
        document.getElementById('newIngredientsList').innerHTML = `
            <div class="ingredient-input" style="display: flex; gap: 10px; margin-bottom: 10px;">
                <input type="text" placeholder="Name" class="ingredient-name" style="flex: 2;">
                <input type="number" placeholder="Amount" step="0.1" class="ingredient-amount" style="flex: 1;">
                <input type="text" placeholder="Unit" class="ingredient-unit" style="flex: 1;">
                <button type="button" onclick="removeNewIngredient(this)" class="btn btn-secondary" style="flex: 0;">Remove</button>
            </div>
        `;
        document.getElementById('newInstructionsList').innerHTML = `
            <div class="instruction-input" style="display: flex; gap: 10px; margin-bottom: 10px; align-items: start;">
                <textarea placeholder="Step 1: Cook rice according to package directions..." class="instruction-text" style="flex: 1; min-height: 60px;"></textarea>
                <button type="button" onclick="removeNewInstruction(this)" class="btn btn-secondary">Remove</button>
            </div>
        `;
    }
}

// Helper functions for dynamic ingredients/instructions
function addNewIngredient() {
    const container = document.getElementById('newIngredientsList');
    const div = document.createElement('div');
    div.className = 'ingredient-input';
    div.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px;';
    div.innerHTML = `
        <input type="text" placeholder="Name" class="ingredient-name" style="flex: 2;">
        <input type="number" placeholder="Amount" step="0.1" class="ingredient-amount" style="flex: 1;">
        <input type="text" placeholder="Unit" class="ingredient-unit" style="flex: 1;">
        <button type="button" onclick="removeNewIngredient(this)" class="btn btn-secondary" style="flex: 0;">Remove</button>
    `;
    container.appendChild(div);
}

function removeNewIngredient(button) {
    const container = document.getElementById('newIngredientsList');
    if (container.children.length > 1) {
        button.closest('.ingredient-input').remove();
    }
}

function addNewInstruction() {
    const container = document.getElementById('newInstructionsList');
    const div = document.createElement('div');
    div.className = 'instruction-input';
    div.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: start;';
    div.innerHTML = `
        <textarea placeholder="Step ${container.children.length + 1}: ..." class="instruction-text" style="flex: 1; min-height: 60px;"></textarea>
        <button type="button" onclick="removeNewInstruction(this)" class="btn btn-secondary">Remove</button>
    `;
    container.appendChild(div);
}

function removeNewInstruction(button) {
    const container = document.getElementById('newInstructionsList');
    if (container.children.length > 1) {
        button.closest('.instruction-input').remove();
    }
}

function clearRecipeForm() {
    if (window.customRecipeManager) {
        window.customRecipeManager.clearForm();
    }
}

// Initialize Custom Recipe Manager
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.customRecipeManager = new CustomRecipeManager();
    }, 1000);
});

// Debug helper
window.debugMTable = function() {
    console.log('🔍 Smart Fridge Debug Info:');
    console.log('Components:', {
        dashboard: window.dashboard,
        inventory: window.inventory,
        recipes: window.recipes,
        calendar: window.calendar,
        goals: window.goals
    });
    console.log('Data available:', {
        ingredients: typeof INGREDIENT_DATABASE !== 'undefined',
        nutrition: typeof NUTRITION_CONSTANTS !== 'undefined',
        recipes: typeof RECIPE_DATABASE !== 'undefined'
    });
    console.log('Utils available:', {
        nutritionUtils: typeof NutritionUtils !== 'undefined',
        helpers: typeof Helpers !== 'undefined',
        storage: typeof Storage !== 'undefined'
    });
    
    // Show localStorage data
    console.log('🗄️ LocalStorage MTable Data:');
    Object.keys(localStorage).forEach(key => {
        if (key.toLowerCase().includes('mtable')) {
            try {
                console.log(`${key}:`, JSON.parse(localStorage.getItem(key)));
            } catch (e) {
                console.log(`${key}:`, localStorage.getItem(key));
            }
        }
    });
};

// Export for modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showToast,
        showSection,
        filterRecipes,
        clearAllMTableData
    };
}

// Secret admin access - Use activateAdminMode('password') in browser console
function activateAdminMode(password) {
    // Check if password is provided and correct
    if (password !== 'smartfridgeadmin') {
        console.error('❌ Access denied: Invalid password');
        if (window.showToast) {
            showToast('Access denied: Invalid password', 'error');
        }
        return false;
    }
    
    // Show desktop navigation
    const desktopNavItem = document.querySelector('.nav-item[data-section="recipe-manager"]');
    if (!desktopNavItem) {
        const desktopNav = document.querySelector('.nav-menu');
        if (desktopNav) {
            const adminNavItem = document.createElement('li');
            adminNavItem.className = 'nav-item';
            adminNavItem.setAttribute('data-section', 'recipe-manager');
            adminNavItem.innerHTML = `
                <a href="#" data-section="recipe-manager">
                    <span class="nav-icon">➕</span>
                    <span class="nav-text">Add Recipes</span>
                </a>
            `;
            desktopNav.appendChild(adminNavItem);
        }
    }
    
    // Show mobile navigation
    const mobileNavTab = document.querySelector('.mobile-nav-tab[data-section="recipe-manager"]');
    if (!mobileNavTab) {
        const mobileNavTabs = document.querySelector('.mobile-nav-tabs');
        if (mobileNavTabs) {
            const adminMobileTab = document.createElement('button');
            adminMobileTab.className = 'mobile-nav-tab';
            adminMobileTab.setAttribute('data-section', 'recipe-manager');
            adminMobileTab.textContent = 'Add Recipes';
            mobileNavTabs.appendChild(adminMobileTab);
        }
    }
    
    // Show success message
    if (window.showToast) {
        showToast('🔧 Admin mode activated! Recipe manager unlocked.', 'success');
    }
    
    console.log('✅ Admin mode activated - Recipe manager is now accessible');
    
    // Store admin mode in session storage
    sessionStorage.setItem('admin_mode_active', 'true');
    
    return true;
}

// Check if admin mode was previously activated in this session
document.addEventListener('DOMContentLoaded', function() {
    if (sessionStorage.getItem('admin_mode_active') === 'true') {
        setTimeout(() => {
            // Reactivate admin mode without password check (already authenticated this session)
            activateAdminModeWithoutPassword();
        }, 500);
    }
});

// Helper function to reactivate admin mode without password (for session persistence)
function activateAdminModeWithoutPassword() {
    // Same logic as activateAdminMode but without password check
    const desktopNavItem = document.querySelector('.nav-item[data-section="recipe-manager"]');
    if (!desktopNavItem) {
        const desktopNav = document.querySelector('.nav-menu');
        if (desktopNav) {
            const adminNavItem = document.createElement('li');
            adminNavItem.className = 'nav-item';
            adminNavItem.setAttribute('data-section', 'recipe-manager');
            adminNavItem.innerHTML = `
                <a href="#" data-section="recipe-manager">
                    <span class="nav-icon">➕</span>
                    <span class="nav-text">Add Recipes</span>
                </a>
            `;
            desktopNav.appendChild(adminNavItem);
        }
    }
    
    const mobileNavTab = document.querySelector('.mobile-nav-tab[data-section="recipe-manager"]');
    if (!mobileNavTab) {
        const mobileNavTabs = document.querySelector('.mobile-nav-tabs');
        if (mobileNavTabs) {
            const adminMobileTab = document.createElement('button');
            adminMobileTab.className = 'mobile-nav-tab';
            adminMobileTab.setAttribute('data-section', 'recipe-manager');
            adminMobileTab.textContent = 'Add Recipes';
            mobileNavTabs.appendChild(adminMobileTab);
        }
    }
    
    console.log('✅ Admin mode restored from session');
}

// Function to deactivate admin mode
function deactivateAdminMode() {
    // Remove desktop navigation item
    const desktopNavItem = document.querySelector('.nav-item[data-section="recipe-manager"]');
    if (desktopNavItem) {
        desktopNavItem.remove();
    }

    // Remove mobile navigation tab
    const mobileNavTab = document.querySelector('.mobile-nav-tab[data-section="recipe-manager"]');
    if (mobileNavTab) {
        mobileNavTab.remove();
    }

    // Remove from session storage
    sessionStorage.removeItem('admin_mode_active');
    
    // Go back to dashboard if currently on admin section
    if (document.getElementById('recipe-manager').classList.contains('active')) {
        showSection('dashboard');
    }
    
    if (window.showToast) {
        showToast('Admin mode deactivated', 'success');
    }
    
    console.log('❌ Admin mode deactivated');
}