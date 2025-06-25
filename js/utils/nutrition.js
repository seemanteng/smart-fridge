/**
 * Nutrition Utilities for MTable
 * Helper functions for nutrition calculations and formatting
 */

const NutritionUtils = {
    // Format nutrition values for display
    formatNutrition(nutrition) {
        return {
            calories: Math.round(nutrition.calories || 0),
            protein: Math.round((nutrition.protein || 0) * 10) / 10,
            carbs: Math.round((nutrition.carbs || 0) * 10) / 10,
            fat: Math.round((nutrition.fat || 0) * 10) / 10,
            fiber: Math.round((nutrition.fiber || 0) * 10) / 10
        };
    },

    // Calculate calories from macros
    calculateCalories(protein, carbs, fat, alcohol = 0) {
        return Math.round(
            (protein * 4) + (carbs * 4) + (fat * 9) + (alcohol * 7)
        );
    },

    // Calculate macro percentages
    calculateMacroPercentages(protein, carbs, fat) {
        const totalCalories = this.calculateCalories(protein, carbs, fat);
        
        if (totalCalories === 0) {
            return { protein: 0, carbs: 0, fat: 0 };
        }

        return {
            protein: Math.round((protein * 4 / totalCalories) * 100),
            carbs: Math.round((carbs * 4 / totalCalories) * 100),
            fat: Math.round((fat * 9 / totalCalories) * 100)
        };
    },

    // Combine multiple nutrition objects
    combineNutrition(nutritionArray) {
        return nutritionArray.reduce((total, nutrition) => ({
            calories: (total.calories || 0) + (nutrition.calories || 0),
            protein: (total.protein || 0) + (nutrition.protein || 0),
            carbs: (total.carbs || 0) + (nutrition.carbs || 0),
            fat: (total.fat || 0) + (nutrition.fat || 0),
            fiber: (total.fiber || 0) + (nutrition.fiber || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
    },

    // Scale nutrition by portion size
    scaleNutrition(nutrition, scale) {
        return {
            calories: Math.round((nutrition.calories || 0) * scale),
            protein: Math.round((nutrition.protein || 0) * scale * 10) / 10,
            carbs: Math.round((nutrition.carbs || 0) * scale * 10) / 10,
            fat: Math.round((nutrition.fat || 0) * scale * 10) / 10,
            fiber: Math.round((nutrition.fiber || 0) * scale * 10) / 10
        };
    },

    // Calculate nutrition per serving
    calculatePerServing(totalNutrition, servings) {
        if (servings <= 0) return totalNutrition;
        return this.scaleNutrition(totalNutrition, 1 / servings);
    },

    // Get nutrition status compared to daily goals
    getNutritionStatus(current, goals) {
        return {
            calories: this.getStatus(current.calories, goals.dailyCalories),
            protein: this.getStatus(current.protein, goals.dailyProtein),
            carbs: this.getStatus(current.carbs, goals.dailyCarbs),
            fat: this.getStatus(current.fat, goals.dailyFat)
        };
    },

    // Get status for individual nutrient
    getStatus(current, target) {
        if (!target || target === 0) return 'unknown';
        
        const percentage = (current / target) * 100;
        
        if (percentage < 50) return 'low';
        if (percentage < 80) return 'moderate';
        if (percentage <= 110) return 'good';
        if (percentage <= 130) return 'high';
        return 'excessive';
    },

    // Calculate remaining nutrition for the day
    getRemainingNutrition(current, goals) {
        return {
            calories: Math.max(0, (goals.dailyCalories || 2000) - (current.calories || 0)),
            protein: Math.max(0, (goals.dailyProtein || 150) - (current.protein || 0)),
            carbs: Math.max(0, (goals.dailyCarbs || 250) - (current.carbs || 0)),
            fat: Math.max(0, (goals.dailyFat || 65) - (current.fat || 0))
        };
    },

    // Format nutrition for display with units
    formatNutritionDisplay(nutrition) {
        return {
            calories: `${Math.round(nutrition.calories || 0)} cal`,
            protein: `${Math.round((nutrition.protein || 0) * 10) / 10}g`,
            carbs: `${Math.round((nutrition.carbs || 0) * 10) / 10}g`,
            fat: `${Math.round((nutrition.fat || 0) * 10) / 10}g`,
            fiber: `${Math.round((nutrition.fiber || 0) * 10) / 10}g`
        };
    },

    // Estimate nutrition for unknown foods
    estimateNutrition(foodName, category = 'other', portionGrams = 100) {
        const estimates = {
            vegetables: { calories: 25, protein: 2, carbs: 5, fat: 0.3, fiber: 2 },
            fruits: { calories: 60, protein: 1, carbs: 15, fat: 0.2, fiber: 2.5 },
            meat: { calories: 200, protein: 25, carbs: 0, fat: 10, fiber: 0 },
            seafood: { calories: 150, protein: 20, carbs: 0, fat: 5, fiber: 0 },
            dairy: { calories: 80, protein: 5, carbs: 6, fat: 3, fiber: 0 },
            grains: { calories: 350, protein: 10, carbs: 70, fat: 2, fiber: 3 },
            legumes: { calories: 120, protein: 8, carbs: 20, fat: 0.5, fiber: 6 },
            nuts: { calories: 600, protein: 20, carbs: 20, fat: 50, fiber: 10 },
            other: { calories: 100, protein: 2, carbs: 15, fat: 1, fiber: 1 }
        };

        const baseNutrition = estimates[category] || estimates.other;
        const scale = portionGrams / 100;

        return this.scaleNutrition(baseNutrition, scale);
    },

    // Calculate nutrition density score (nutrition per calorie)
    calculateNutritionDensity(nutrition) {
        if (!nutrition.calories || nutrition.calories === 0) return 0;

        const proteinScore = (nutrition.protein || 0) * 4; // Protein is important
        const fiberScore = (nutrition.fiber || 0) * 2;     // Fiber is valuable
        const calorieScore = nutrition.calories;

        // Higher protein and fiber per calorie = better score
        return Math.round((proteinScore + fiberScore) / calorieScore * 100);
    },

    // Check if nutrition meets minimum requirements
    meetsMinimumRequirements(nutrition, requirements) {
        return {
            calories: (nutrition.calories || 0) >= (requirements.minCalories || 0),
            protein: (nutrition.protein || 0) >= (requirements.minProtein || 0),
            fiber: (nutrition.fiber || 0) >= (requirements.minFiber || 0),
            overall: (nutrition.calories || 0) >= (requirements.minCalories || 0) &&
                    (nutrition.protein || 0) >= (requirements.minProtein || 0)
        };
    },

    // Generate nutrition summary text
    generateNutritionSummary(nutrition) {
        const formatted = this.formatNutritionDisplay(nutrition);
        return `${formatted.calories}, ${formatted.protein} protein, ${formatted.carbs} carbs, ${formatted.fat} fat`;
    },

    // Calculate weekly nutrition averages
    calculateWeeklyAverages(dailyNutritionArray) {
        if (!dailyNutritionArray.length) return null;

        const totals = this.combineNutrition(dailyNutritionArray);
        const days = dailyNutritionArray.length;

        return {
            calories: Math.round(totals.calories / days),
            protein: Math.round((totals.protein / days) * 10) / 10,
            carbs: Math.round((totals.carbs / days) * 10) / 10,
            fat: Math.round((totals.fat / days) * 10) / 10,
            fiber: Math.round((totals.fiber / days) * 10) / 10
        };
    },

    // Convert between common measurement units
    convertUnit(amount, fromUnit, toUnit) {
        const conversions = {
            // Weight conversions
            'g-oz': 0.035274,
            'oz-g': 28.3495,
            'lb-kg': 0.453592,
            'kg-lb': 2.20462,
            'lb-g': 453.592,
            'g-lb': 0.00220462,

            // Volume conversions
            'cup-ml': 236.588,
            'ml-cup': 0.00422675,
            'tbsp-ml': 14.7868,
            'ml-tbsp': 0.067628,
            'tsp-ml': 4.92892,
            'ml-tsp': 0.202884,

            // Same unit
            'g-g': 1,
            'oz-oz': 1,
            'cup-cup': 1,
            'ml-ml': 1
        };

        const conversionKey = `${fromUnit}-${toUnit}`;
        const factor = conversions[conversionKey];
        
        return factor ? Math.round(amount * factor * 1000) / 1000 : amount;
    },

    // Validate nutrition data
    validateNutrition(nutrition) {
        const errors = [];

        if (nutrition.calories < 0) errors.push('Calories cannot be negative');
        if (nutrition.protein < 0) errors.push('Protein cannot be negative');
        if (nutrition.carbs < 0) errors.push('Carbs cannot be negative');
        if (nutrition.fat < 0) errors.push('Fat cannot be negative');

        // Check if macros add up to calories (with tolerance)
        const calculatedCalories = this.calculateCalories(
            nutrition.protein || 0, 
            nutrition.carbs || 0, 
            nutrition.fat || 0
        );
        
        const difference = Math.abs(calculatedCalories - (nutrition.calories || 0));
        if (difference > 50) { // 50 calorie tolerance
            errors.push('Macronutrients don\'t match calorie total');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    // Get color coding for nutrition status
    getStatusColor(status) {
        const colors = {
            low: '#ff6b6b',      // Red
            moderate: '#ffd43b',  // Yellow
            good: '#51cf66',      // Green
            high: '#74b9ff',      // Blue
            excessive: '#fd79a8', // Pink
            unknown: '#b2bec3'    // Gray
        };

        return colors[status] || colors.unknown;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NutritionUtils;
}