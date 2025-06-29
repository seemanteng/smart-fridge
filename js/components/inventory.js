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
        this.bindSearchEvents(); 

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

    bindSearchEvents() {
        const searchInput = document.getElementById('ingredientSearch');
        if (searchInput) {
        searchInput.addEventListener('input', (e) => {
        this.searchIngredients(e.target.value);
        });
        }
    }

    searchIngredients(query) {
        const inventoryContainer = document.getElementById('inventoryList');
        if (!inventoryContainer) return;

        const ingredientList = Object.values(this.ingredients);

        if (!query.trim()) {
        this.renderInventoryList();
        return;
        }

        const filteredItems = ingredientList.filter(ingredient =>
        ingredient.name.toLowerCase().includes(query.toLowerCase())
        );

        if (filteredItems.length === 0) {
        inventoryContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-secondary);">
        <div style="font-size: 3rem; margin-bottom: 2rem; opacity: 0.5;">🔍</div>
        <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-primary);">No ingredients found</div>
        <div>Try searching for something else</div>
        </div>
        `;
        return;
        }

        inventoryContainer.innerHTML = filteredItems.map(ingredient => 
        this.renderIngredientCard(ingredient)
        ).join('');
    }

    // Update the renderIngredientCard method
    renderIngredientCard(ingredient) {
        const category = this.categorizeIngredient(ingredient.name);
        const backgroundImage = this.getCategoryBackgroundImage(category);

        return `
        <div class="ingredient-card" data-id="${ingredient.id}">
        <div class="card-background" style="background-image: url('${backgroundImage}'); background-size: cover; background-position: center;"></div>
        <div class="card-overlay"></div>
        <div class="card-content">
        <h4>${ingredient.name}</h4>
        <div class="ingredient-quantity">${ingredient.quantity} ${ingredient.unit}</div>
        <div class="ingredient-actions">
        <button class="btn btn-edit" onclick="inventory.showEditModal('${ingredient.id}')">Edit</button>
        <button class="btn btn-delete" onclick="inventory.confirmDelete('${ingredient.id}')">Delete</button>
        </div>
        </div>
        </div>
        `;
    }

    // Add category background image mapping
    getCategoryBackgroundImage(category) {
        const backgroundImages = {
        'Vegetables': 'assets/images/Vege Item.png',
        'Fruits': 'assets/images/Fruit Item.png',
        'Proteins': 'assets/images/Protein Item.png',
        'Grains': 'assets/images/Grain Item.png',
        'Dairy': 'assets/images/Dairy Item.png',
        'Other': 'assets/images/Other Item.png'
        };
        return backgroundImages[category] || backgroundImages['Other'];
    }

    // Show edit modal
    showEditModal(id) {
        const ingredient = this.ingredients[id];
        if (!ingredient) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
        <div class="modal-content">
        <div class="modal-header">
        <h3 class="modal-title">Edit ${ingredient.name}</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
        <form id="editIngredientForm" onsubmit="inventory.updateIngredient(event, '${id}')">
        <div class="form-group">
        <label for="editQuantity">Quantity:</label>
        <input type="number" id="editQuantity" value="${ingredient.quantity}" step="0.1" min="0" required>
        </div>
        <div class="form-group">
        <label for="editUnit">Unit:</label>
        <select id="editUnit" required>
        <option value="grams" ${ingredient.unit === 'grams' ? 'selected' : ''}>Grams</option>
        <option value="kg" ${ingredient.unit === 'kg' ? 'selected' : ''}>Kilograms</option>
        <option value="pieces" ${ingredient.unit === 'pieces' ? 'selected' : ''}>Pieces</option>
        <option value="cups" ${ingredient.unit === 'cups' ? 'selected' : ''}>Cups</option>
        <option value="tablespoons" ${ingredient.unit === 'tablespoons' ? 'selected' : ''}>Tablespoons</option>
        <option value="teaspoons" ${ingredient.unit === 'teaspoons' ? 'selected' : ''}>Teaspoons</option>
        <option value="ounces" ${ingredient.unit === 'ounces' ? 'selected' : ''}>Ounces</option>
        <option value="pounds" ${ingredient.unit === 'pounds' ? 'selected' : ''}>Pounds</option>
        <option value="milliliters" ${ingredient.unit === 'milliliters' ? 'selected' : ''}>Milliliters</option>
        <option value="liters" ${ingredient.unit === 'liters' ? 'selected' : ''}>Liters</option>
        </select>
        </div>
        <div class="modal-actions">
        <button type="submit" class="btn btn-primary">Update</button>
        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
        </div>
        </form>
        </div>
        </div>
        `;
        document.body.appendChild(modal);
    }

    // Update ingredient
    updateIngredient(event, id) {
        event.preventDefault();
        const quantity = parseFloat(document.getElementById('editQuantity').value);
        const unit = document.getElementById('editUnit').value;

        if (!quantity || !unit || quantity <= 0) {
        this.showToast('Please enter valid quantity and unit', 'error');
        return;
        }

        this.ingredients[id].quantity = quantity;
        this.ingredients[id].unit = unit;
        this.saveIngredients();
        this.renderInventoryList();

        // Close modal
        document.querySelector('.modal').remove();
        this.showToast(`Updated ${this.ingredients[id].name}`, 'success');
    }

    // Confirm delete with modal
    confirmDelete(id) {
        const ingredient = this.ingredients[id];
        if (!ingredient) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
        <div class="modal-content">
        <div class="modal-header">
        <h3 class="modal-title">Delete ${ingredient.name}?</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
        <p>Are you sure you want to delete <strong>${ingredient.name}</strong> (${ingredient.quantity} ${ingredient.unit}) from your inventory?</p>
        <div class="modal-actions">
        <button class="btn btn-delete" onclick="inventory.deleteIngredient('${id}'); this.closest('.modal').remove();">Delete</button>
        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
        </div>
        </div>
        </div>
        `;
        document.body.appendChild(modal);
    }

    // Delete ingredient
    deleteIngredient(id) {
        const ingredient = this.ingredients[id];
        if (ingredient) {
        delete this.ingredients[id];
        this.saveIngredients();
        this.renderInventoryList();
        this.showToast(`Removed ${ingredient.name} from inventory`, 'success');
        }
    }

    // Update the old editIngredient method to use the new modal
    editIngredient(id) {
        this.showEditModal(id);
    }

    // Update removeIngredient to use confirmation
    removeIngredient(id) {
        this.confirmDelete(id);
    }

    renderInventoryList() {
        const inventoryContainer = document.getElementById('inventoryList');
        if (!inventoryContainer) return;

        const ingredientList = Object.values(this.ingredients);
        if (ingredientList.length === 0) {
        inventoryContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-secondary);">
        <div style="font-size: 4rem; margin-bottom: 2rem; opacity: 0.5;">📦</div>
        <div style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-primary);">Your inventory is empty</div>
        <div style="font-size: 1rem;">Add ingredients to start tracking your food items</div>
        </div>
        `;
        return;
        }

        inventoryContainer.innerHTML = ingredientList.map(ingredient => 
        this.renderIngredientCard(ingredient)
        ).join('');
    }

    // Update the filterByCategory method
    filterByCategory(categoryName) {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${categoryName}"]`).classList.add('active');

        const inventoryContainer = document.getElementById('inventoryList');
        if (!inventoryContainer) return;

        const ingredientList = Object.values(this.ingredients);

        if (categoryName === 'all') {
        this.renderInventoryList();
        return;
        }

        const filteredItems = ingredientList.filter(ingredient => 
        this.categorizeIngredient(ingredient.name) === categoryName
        );

        if (filteredItems.length === 0) {
        inventoryContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-secondary);">
        <div style="font-size: 3rem; margin-bottom: 2rem; opacity: 0.5;">📭</div>
        <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-primary);">No ${categoryName.toLowerCase()} found</div>
        <div>Try adding some ${categoryName.toLowerCase()} to your inventory</div>
        </div>
        `;
        return;
        }

        inventoryContainer.innerHTML = filteredItems.map(ingredient => 
        this.renderIngredientCard(ingredient)
        ).join('');
    }
    groupIngredientsByCategory(ingredientList) {
        const categories = {
        'Fruits': { icon: '🍎', items: [] },
        'Vegetables': { icon: '🥬', items: [] },
        'Grains': { icon: '🌾', items: [] },
        'Proteins': { icon: '🍖', items: [] },
        'Dairy': { icon: '🥛', items: [] },
        'Other': { icon: '📦', items: [] }
        };

        ingredientList.forEach(ingredient => {
        const category = this.categorizeIngredient(ingredient.name);
        if (categories[category]) {
        categories[category].items.push(ingredient);
        } else {
        categories['Other'].items.push(ingredient);
        }
        });

        // Remove empty categories
        Object.keys(categories).forEach(key => {
        if (categories[key].items.length === 0) {
        delete categories[key];
        }
        });

        return categories;
    }

    categorizeIngredient(ingredientName) {
        const name = ingredientName.toLowerCase();

        // Fruits
        const fruits = ['apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'mango', 'pineapple', 'avocado', 'lemon', 'lime', 'cherry', 'peach', 'pear', 'kiwi', 'watermelon', 'cantaloupe', 'berries'];
        if (fruits.some(fruit => name.includes(fruit))) return 'Fruits';

        // Vegetables
        const vegetables = ['tomato', 'carrot', 'broccoli', 'spinach', 'lettuce', 'onion', 'garlic', 'potato', 'bell pepper', 'cucumber', 'celery', 'mushroom', 'zucchini', 'corn', 'peas', 'cabbage', 'cauliflower', 'asparagus', 'green beans'];
        if (vegetables.some(veg => name.includes(veg))) return 'Vegetables';

        // Grains
        const grains = ['rice', 'pasta', 'bread', 'quinoa', 'oats', 'barley', 'wheat', 'flour', 'cereal', 'noodles', 'couscous', 'bulgur'];
        if (grains.some(grain => name.includes(grain))) return 'Grains';

        // Proteins
        const proteins = ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'turkey', 'eggs', 'beans', 'lentils', 'chickpeas', 'tofu', 'nuts', 'seeds', 'peanut', 'almond'];
        if (proteins.some(protein => name.includes(protein))) return 'Proteins';

        // Dairy
        const dairy = ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'sour cream', 'cottage cheese', 'mozzarella', 'cheddar', 'parmesan'];
        if (dairy.some(d => name.includes(d))) return 'Dairy';

        return 'Other';
    }

    renderCategorizedInventory(categories) {
        return Object.keys(categories).map(categoryName => {
        const category = categories[categoryName];
        return `
        <div class="category-section">
        <div class="category-header">
        <span class="category-icon">${category.icon}</span>
        <h4 class="category-title">${categoryName}</h4>
        <span class="category-count">(${category.items.length})</span>
        </div>
        <div class="category-items">
        ${category.items.map(ingredient => this.renderIngredientItem(ingredient)).join('')}
        </div>
        </div>
        `;
        }).join('');
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

    filterByCategory(categoryName) {
        const inventoryContainer = document.getElementById('inventoryList');
        if (!inventoryContainer) return;

        const ingredientList = Object.values(this.ingredients);

        if (categoryName === 'all') {
        this.renderInventoryList();
        return;
        }

        const filteredItems = ingredientList.filter(ingredient => 
        this.categorizeIngredient(ingredient.name) === categoryName
        );

        if (filteredItems.length === 0) {
        inventoryContainer.innerHTML = `
        <div class="empty-state">
        <div style="font-size: 2rem; margin-bottom: 1rem;">📭</div>
        <div>No ${categoryName.toLowerCase()} found</div>
        </div>
        `;
        return;
        }

        inventoryContainer.innerHTML = filteredItems.map(ingredient => 
        this.renderIngredientItem(ingredient)
        ).join('');
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