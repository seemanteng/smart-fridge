/**
 * Main Application File for MTable
 * Initializes all components and handles global functionality
 */

// Global variables for components - DO NOT INITIALIZE HERE
let dashboard;
let recipes;
let calendar;
let goals;

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
            <span class="toast-icon">${getToastIcon(type)}</span>
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

function getToastIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
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
            
            console.log('✅ MTable app initialized successfully!');
            console.log('Components available:', {
                dashboard: !!dashboard,
                inventory: !!inventory,
                recipes: !!recipes,
                calendar: !!calendar,
                goals: !!goals
            });
            
            showToast('Welcome to MTable!', 'success');
            
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
    }
};

// Debug helper
window.debugMTable = function() {
    console.log('🔍 MTable Debug Info:');
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
};

// Export for modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showToast,
        showSection,
        filterRecipes
    };
}