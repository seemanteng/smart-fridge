/**
 * Ingredients Data 
 * Common ingredients database with categories and basic nutrition
 */

const INGREDIENT_DATABASE = {
    // Vegetables
    'broccoli': {
        name: 'Broccoli',
        category: 'vegetables',
        defaultUnit: 'lb',
        shelfLife: 7,
        location: 'refrigerator',
        nutrition: { calories: 25, protein: 3, carbs: 5, fat: 0.4, fiber: 2.6 }
    },
    'spinach': {
        name: 'Spinach',
        category: 'vegetables',
        defaultUnit: 'oz',
        shelfLife: 5,
        location: 'refrigerator',
        nutrition: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 }
    },
    'carrots': {
        name: 'Carrots',
        category: 'vegetables',
        defaultUnit: 'lb',
        shelfLife: 14,
        location: 'refrigerator',
        nutrition: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 }
    },
    'bell-pepper': {
        name: 'Bell Pepper',
        category: 'vegetables',
        defaultUnit: 'pieces',
        shelfLife: 7,
        location: 'refrigerator',
        nutrition: { calories: 20, protein: 1, carbs: 5, fat: 0.2, fiber: 2 }
    },
    'onion': {
        name: 'Onion',
        category: 'vegetables',
        defaultUnit: 'pieces',
        shelfLife: 30,
        location: 'pantry',
        nutrition: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 }
    },

    // Fruits
    'banana': {
        name: 'Banana',
        category: 'fruits',
        defaultUnit: 'pieces',
        shelfLife: 5,
        location: 'counter',
        nutrition: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 }
    },
    'apple': {
        name: 'Apple',
        category: 'fruits',
        defaultUnit: 'pieces',
        shelfLife: 14,
        location: 'refrigerator',
        nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 }
    },
    'avocado': {
        name: 'Avocado',
        category: 'fruits',
        defaultUnit: 'pieces',
        shelfLife: 5,
        location: 'counter',
        nutrition: { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 }
    },
    'berries': {
        name: 'Mixed Berries',
        category: 'fruits',
        defaultUnit: 'cups',
        shelfLife: 3,
        location: 'refrigerator',
        nutrition: { calories: 60, protein: 1, carbs: 15, fat: 0.5, fiber: 4 }
    },

    // Meat & Poultry
    'chicken-breast': {
        name: 'Chicken Breast',
        category: 'meat',
        defaultUnit: 'lbs',
        shelfLife: 3,
        location: 'refrigerator',
        nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 }
    },
    'ground-beef': {
        name: 'Ground Beef',
        category: 'meat',
        defaultUnit: 'lbs',
        shelfLife: 2,
        location: 'refrigerator',
        nutrition: { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0 }
    },
    'turkey': {
        name: 'Turkey Breast',
        category: 'meat',
        defaultUnit: 'lbs',
        shelfLife: 3,
        location: 'refrigerator',
        nutrition: { calories: 135, protein: 30, carbs: 0, fat: 1, fiber: 0 }
    },

    // Seafood
    'salmon': {
        name: 'Salmon Fillet',
        category: 'seafood',
        defaultUnit: 'lbs',
        shelfLife: 2,
        location: 'refrigerator',
        nutrition: { calories: 208, protein: 25, carbs: 0, fat: 12, fiber: 0 }
    },
    'tuna': {
        name: 'Tuna',
        category: 'seafood',
        defaultUnit: 'oz',
        shelfLife: 2,
        location: 'refrigerator',
        nutrition: { calories: 144, protein: 30, carbs: 0, fat: 1, fiber: 0 }
    },
    'shrimp': {
        name: 'Shrimp',
        category: 'seafood',
        defaultUnit: 'lbs',
        shelfLife: 2,
        location: 'refrigerator',
        nutrition: { calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0 }
    },

    // Dairy
    'milk': {
        name: 'Milk',
        category: 'dairy',
        defaultUnit: 'cups',
        shelfLife: 7,
        location: 'refrigerator',
        nutrition: { calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0 }
    },
    'eggs': {
        name: 'Eggs',
        category: 'dairy',
        defaultUnit: 'pieces',
        shelfLife: 21,
        location: 'refrigerator',
        nutrition: { calories: 70, protein: 6, carbs: 0.6, fat: 5, fiber: 0 }
    },
    'cheese': {
        name: 'Cheese',
        category: 'dairy',
        defaultUnit: 'oz',
        shelfLife: 14,
        location: 'refrigerator',
        nutrition: { calories: 113, protein: 7, carbs: 1, fat: 9, fiber: 0 }
    },
    'greek-yogurt': {
        name: 'Greek Yogurt',
        category: 'dairy',
        defaultUnit: 'oz',
        shelfLife: 14,
        location: 'refrigerator',
        nutrition: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 }
    },

    // Grains
    'rice': {
        name: 'Rice',
        category: 'grains',
        defaultUnit: 'cups',
        shelfLife: 365,
        location: 'pantry',
        nutrition: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 }
    },
    'quinoa': {
        name: 'Quinoa',
        category: 'grains',
        defaultUnit: 'cups',
        shelfLife: 365,
        location: 'pantry',
        nutrition: { calories: 222, protein: 8, carbs: 39, fat: 3.6, fiber: 5 }
    },
    'pasta': {
        name: 'Pasta',
        category: 'grains',
        defaultUnit: 'oz',
        shelfLife: 365,
        location: 'pantry',
        nutrition: { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8 }
    },
    'bread': {
        name: 'Bread',
        category: 'grains',
        defaultUnit: 'slices',
        shelfLife: 7,
        location: 'pantry',
        nutrition: { calories: 79, protein: 2.3, carbs: 13, fat: 1.2, fiber: 0.8 }
    },
    'oats': {
        name: 'Oats',
        category: 'grains',
        defaultUnit: 'cups',
        shelfLife: 365,
        location: 'pantry',
        nutrition: { calories: 154, protein: 5.3, carbs: 28, fat: 2.5, fiber: 4 }
    },

    // Legumes
    'black-beans': {
        name: 'Black Beans',
        category: 'legumes',
        defaultUnit: 'cups',
        shelfLife: 365,
        location: 'pantry',
        nutrition: { calories: 227, protein: 15, carbs: 41, fat: 0.9, fiber: 15 }
    },
    'chickpeas': {
        name: 'Chickpeas',
        category: 'legumes',
        defaultUnit: 'cups',
        shelfLife: 365,
        location: 'pantry',
        nutrition: { calories: 269, protein: 15, carbs: 45, fat: 4.3, fiber: 12.5 }
    },
    'lentils': {
        name: 'Lentils',
        category: 'legumes',
        defaultUnit: 'cups',
        shelfLife: 365,
        location: 'pantry',
        nutrition: { calories: 230, protein: 18, carbs: 40, fat: 0.8, fiber: 16 }
    },

    // Condiments & Seasonings
    'olive-oil': {
        name: 'Olive Oil',
        category: 'condiments',
        defaultUnit: 'oz',
        shelfLife: 365,
        location: 'pantry',
        nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 }
    },
    'salt': {
        name: 'Salt',
        category: 'condiments',
        defaultUnit: 'oz',
        shelfLife: 1825, // 5 years
        location: 'pantry',
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    },
    'garlic': {
        name: 'Garlic',
        category: 'herbs',
        defaultUnit: 'pieces',
        shelfLife: 21,
        location: 'pantry',
        nutrition: { calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1 }
    },
    'ginger': {
        name: 'Ginger',
        category: 'herbs',
        defaultUnit: 'oz',
        shelfLife: 14,
        location: 'refrigerator',
        nutrition: { calories: 80, protein: 1.8, carbs: 18, fat: 0.8, fiber: 2 }
    }
};

// Categories for ingredient organization
const INGREDIENT_CATEGORIES = {
    'vegetables': { name: 'Vegetables', icon: '🥬', color: '#51cf66' },
    'fruits': { name: 'Fruits', icon: '🍎', color: '#ff6b6b' },
    'meat': { name: 'Meat & Poultry', icon: '🍗', color: '#fd79a8' },
    'seafood': { name: 'Seafood', icon: '🐟', color: '#74b9ff' },
    'dairy': { name: 'Dairy', icon: '🥛', color: '#fdcb6e' },
    'grains': { name: 'Grains & Cereals', icon: '🌾', color: '#e17055' },
    'legumes': { name: 'Legumes', icon: '🫘', color: '#a29bfe' },
    'herbs': { name: 'Herbs & Spices', icon: '🌿', color: '#55a3ff' },
    'condiments': { name: 'Condiments', icon: '🧂', color: '#636e72' },
    'other': { name: 'Other', icon: '📦', color: '#b2bec3' }
};

// Common ingredient suggestions for autocomplete
const COMMON_INGREDIENTS = [
    'Apple', 'Avocado', 'Banana', 'Bell Pepper', 'Black Beans', 'Bread', 'Broccoli',
    'Carrots', 'Cheese', 'Chicken Breast', 'Chickpeas', 'Eggs', 'Garlic', 'Ginger',
    'Greek Yogurt', 'Ground Beef', 'Lentils', 'Milk', 'Mixed Berries', 'Oats',
    'Olive Oil', 'Onion', 'Pasta', 'Quinoa', 'Rice', 'Salmon Fillet', 'Salt',
    'Shrimp', 'Spinach', 'Tuna', 'Turkey Breast'
];

// Helper functions
const IngredientUtils = {
    // Get ingredient data by name or ID
    getIngredient(nameOrId) {
        const key = nameOrId.toLowerCase().replace(/\s+/g, '-');
        return INGREDIENT_DATABASE[key];
    },

    // Get all ingredients in a category
    getByCategory(category) {
        return Object.values(INGREDIENT_DATABASE).filter(ingredient => 
            ingredient.category === category
        );
    },

    // Search ingredients by name
    search(query) {
        const searchTerm = query.toLowerCase();
        return Object.values(INGREDIENT_DATABASE).filter(ingredient =>
            ingredient.name.toLowerCase().includes(searchTerm)
        );
    },

    // Get default expiration date based on ingredient
    getDefaultExpiration(ingredientKey) {
        const ingredient = INGREDIENT_DATABASE[ingredientKey];
        if (!ingredient) return 7; // Default 7 days
        return ingredient.shelfLife;
    },

    // Get nutrition info for ingredient
    getNutrition(ingredientKey, amount = 100) {
        const ingredient = INGREDIENT_DATABASE[ingredientKey];
        if (!ingredient || !ingredient.nutrition) return null;

        const multiplier = amount / 100;
        return {
            calories: Math.round(ingredient.nutrition.calories * multiplier),
            protein: Math.round(ingredient.nutrition.protein * multiplier * 10) / 10,
            carbs: Math.round(ingredient.nutrition.carbs * multiplier * 10) / 10,
            fat: Math.round(ingredient.nutrition.fat * multiplier * 10) / 10,
            fiber: Math.round(ingredient.nutrition.fiber * multiplier * 10) / 10
        };
    },

    // Auto-detect category from ingredient name
    detectCategory(ingredientName) {
        const name = ingredientName.toLowerCase();
        
        // Check if exact match exists
        const key = name.replace(/\s+/g, '-');
        if (INGREDIENT_DATABASE[key]) {
            return INGREDIENT_DATABASE[key].category;
        }

        // Fallback category detection by keywords
        const categoryKeywords = {
            vegetables: ['lettuce', 'tomato', 'cucumber', 'celery', 'mushroom', 'potato', 'zucchini'],
            fruits: ['orange', 'grape', 'strawberry', 'blueberry', 'mango', 'pineapple', 'lemon'],
            meat: ['beef', 'pork', 'lamb', 'bacon', 'ham', 'sausage', 'chicken', 'turkey'],
            seafood: ['fish', 'cod', 'tilapia', 'crab', 'lobster'],
            dairy: ['butter', 'cream', 'yogurt', 'sour cream'],
            grains: ['barley', 'wheat', 'flour', 'cereal'],
            herbs: ['basil', 'oregano', 'thyme', 'parsley', 'cilantro', 'pepper']
        };

        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(keyword => name.includes(keyword))) {
                return category;
            }
        }

        return 'other';
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        INGREDIENT_DATABASE,
        INGREDIENT_CATEGORIES,
        COMMON_INGREDIENTS,
        IngredientUtils
    };
}