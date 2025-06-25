/**
 * Inventory Component 
 * Handles essential ingredient inventory management
 */

class Inventory {
    constructor() {
        this.ingredients = this.loadIngredients();
        this.init();
    }

    init() {
        this.renderInventoryList();
        this.bindEvents();
    }

    loadIngredients() {
        const savedIngredients = localStorage.getItem('mtable_inventory');
        if (savedIngredients) {
            return JSON.parse(savedIngredients);
        }

        // Start with empty inventory
        return {};
    }

    saveIngredients() {
        localStorage.setItem('mtable_inventory', JSON.stringify(this.ingredients));
        
        // Notify other components
        window.dispatchEvent(new CustomEvent('inventory-updated', {
            detail: { ingredients: this.ingredients }
        }));
    }

    renderInventoryList() {
        const inventoryContainer = document.getElementById('inventoryList');
        if (!inventoryContainer) return;

        const ingredientList = Object.values(this.ingredients);
        
        if (ingredientList.length === 0) {
            inventoryContainer.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">Your inventory is empty</div>
                    <div>Add ingredients to start tracking your food items</div>
                </div>
            `;
            return;
        }

        inventoryContainer.innerHTML = ingredientList.map(ingredient => 
            this.renderIngredientItem(ingredient)
        ).join('');
    }

    renderIngredientItem(ingredient) {
        return `
            <div class="ingredient-item" data-id="${ingredient.id}">
                <div class="ingredient-info">
                    <div class="ingredient-name">${ingredient.name}</div>
                    <div class="ingredient-quantity">${ingredient.quantity} ${ingredient.unit}</div>
                </div>
                <div class="ingredient-actions">
                    <button class="btn btn-sm btn-secondary" onclick="inventory.editIngredient('${ingredient.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="inventory.removeIngredient('${ingredient.id}')">Remove</button>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Form submission
        const form = document.getElementById('ingredientForm');
        if (form) {
            // Remove any existing listeners
            form.removeEventListener('submit', this.handleSubmit);
            // Add new listener
            this.handleSubmit = this.handleSubmit.bind(this);
            form.addEventListener('submit', this.handleSubmit);
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('ingredientName').value.trim();
        const quantity = parseFloat(document.getElementById('ingredientQuantity').value);
        const unit = document.getElementById('ingredientUnit').value;

        if (!name || !quantity || !unit || quantity <= 0) {
            this.showToast('Please fill in all fields with valid values', 'error');
            return;
        }

        this.addIngredient(name, quantity, unit);
    }

    addIngredient(name, quantity, unit) {
        const id = this.generateIngredientId(name);
        
        // Check if ingredient already exists
        if (this.ingredients[id]) {
            this.ingredients[id].quantity += quantity;
            this.showToast(`Updated ${name} quantity to ${this.ingredients[id].quantity} ${unit}`, 'success');
        } else {
            this.ingredients[id] = {
                id: id,
                name: name,
                quantity: quantity,
                unit: unit,
                dateAdded: new Date().toISOString()
            };
            this.showToast(`Added ${name} to inventory`, 'success');
        }

        this.saveIngredients();
        this.renderInventoryList();
        
        // Clear form
        document.getElementById('ingredientForm').reset();
    }

    generateIngredientId(name) {
        return name.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    }

    editIngredient(id) {
        const ingredient = this.ingredients[id];
        if (!ingredient) return;

        const newQuantity = prompt(`Enter new quantity for ${ingredient.name}:`, ingredient.quantity);
        if (newQuantity !== null && !isNaN(newQuantity) && parseFloat(newQuantity) > 0) {
            ingredient.quantity = parseFloat(newQuantity);
            this.saveIngredients();
            this.renderInventoryList();
            this.showToast(`Updated ${ingredient.name} to ${ingredient.quantity} ${ingredient.unit}`, 'success');
        } else if (newQuantity !== null) {
            this.showToast('Please enter a valid quantity', 'error');
        }
    }

    removeIngredient(id) {
        const ingredient = this.ingredients[id];
        if (!ingredient) return;

        if (confirm(`Remove ${ingredient.name} from inventory?`)) {
            delete this.ingredients[id];
            this.saveIngredients();
            this.renderInventoryList();
            this.showToast(`Removed ${ingredient.name} from inventory`, 'success');
        }
    }

    showToast(message, type = 'success') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Public API methods for other components
    getAllIngredients() {
        return { ...this.ingredients };
    }

    hasIngredient(ingredientName) {
        return Object.values(this.ingredients).some(ingredient =>
            ingredient.name.toLowerCase().includes(ingredientName.toLowerCase())
        );
    }

    getAvailableIngredients() {
        return Object.values(this.ingredients).map(ingredient => ({
            id: ingredient.id,
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit
        }));
    }

    updateQuantity(id, newQuantity) {
        const ingredient = this.ingredients[id];
        if (ingredient) {
            if (newQuantity <= 0) {
                delete this.ingredients[id];
                this.showToast(`Removed ${ingredient.name} from inventory`, 'success');
            } else {
                ingredient.quantity = newQuantity;
                this.showToast(`Updated ${ingredient.name} quantity`, 'success');
            }
            this.saveIngredients();
            this.renderInventoryList();
            return true;
        }
        return false;
    }

    getIngredientCount() {
        return Object.keys(this.ingredients).length;
    }

    clearInventory() {
        if (confirm('Are you sure you want to clear all inventory items?')) {
            this.ingredients = {};
            this.saveIngredients();
            this.renderInventoryList();
            this.showToast('Inventory cleared', 'success');
        }
    }
}

// Initialize inventory when DOM is loaded
let inventory;
document.addEventListener('DOMContentLoaded', function() {
    inventory = new Inventory();
    
    // Make inventory globally available for debugging
    window.inventory = inventory;
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Inventory;
}