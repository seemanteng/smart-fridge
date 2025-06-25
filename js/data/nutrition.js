/**
 * Nutrition Data and Calculations 
 * Basic nutrition facts and calculation utilities
 */

// Basic nutrition constants
const NUTRITION_CONSTANTS = {
    // Calories per gram
    CALORIES_PER_GRAM: {
        protein: 4,
        carbs: 4,
        fat: 9,
        alcohol: 7
    },

    // Daily recommended values (general adult)
    DAILY_VALUES: {
        calories: 2000,
        protein: 50,        // grams
        carbs: 300,         // grams
        fat: 65,            // grams
        fiber: 25,          // grams
        sodium: 2300,       // mg
        sugar: 50,          // grams
        cholesterol: 300,   // mg
        calcium: 1000,      // mg
        iron: 18,           // mg
        vitaminC: 60,       // mg
        vitaminD: 20        // mcg
    },

    // Macronutrient ratio recommendations
    MACRO_RATIOS: {
        balanced: { protein: 0.20, carbs: 0.50, fat: 0.30 },
        lowCarb: { protein: 0.30, carbs: 0.20, fat: 0.50 },
        highProtein: { protein: 0.30, carbs: 0.40, fat: 0.30 },
        mediterranean: { protein: 0.15, carbs: 0.55, fat: 0.30 }
    }
};

// Nutrition calculation utilities
const NutritionCalculator = {
    // Calculate calories from macronutrients
    calculateCalories(protein, carbs, fat, alcohol = 0) {
        return Math.round(
            (protein * NUTRITION_CONSTANTS.CALORIES_PER_GRAM.protein) +
            (carbs * NUTRITION_CONSTANTS.CALORIES_PER_GRAM.carbs) +
            (fat * NUTRITION_CONSTANTS.CALORIES_PER_GRAM.fat) +
            (alcohol * NUTRITION_CONSTANTS.CALORIES_PER_GRAM.alcohol)
        );
    },

    // Calculate macro ratios from grams
    calculateMacroRatios(protein, carbs, fat) {
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

    // Calculate macros from calories and ratios
    calculateMacrosFromCalories(calories, ratios) {
        return {
            protein: Math.round((calories * ratios.protein) / 4),
            carbs: Math.round((calories * ratios.carbs) / 4),
            fat: Math.round((calories * ratios.fat) / 9)
        };
    },

    // Calculate BMR using Mifflin-St Jeor equation
    calculateBMR(weight, height, age, gender) {
        if (!weight || !height || !age || !gender) return null;

        let bmr;
        if (gender === 'male') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }

        return Math.round(bmr);
    },

    // Calculate TDEE from BMR and activity level
    calculateTDEE(bmr, activityLevel) {
        const multipliers = {
            sedentary: 1.2,
            lightlyActive: 1.375,
            moderatelyActive: 1.55,
            veryActive: 1.725,
            extremelyActive: 1.9
        };

        return Math.round(bmr * (multipliers[activityLevel] || 1.375));
    },

    // Calculate protein needs based on weight and activity
    calculateProteinNeeds(weight, activityLevel, goal = 'maintain') {
        let proteinPerKg;

        switch (activityLevel) {
            case 'sedentary':
                proteinPerKg = goal === 'muscle' ? 1.4 : 0.8;
                break;
            case 'lightlyActive':
                proteinPerKg = goal === 'muscle' ? 1.6 : 1.0;
                break;
            case 'moderatelyActive':
            case 'veryActive':
                proteinPerKg = goal === 'muscle' ? 2.0 : 1.2;
                break;
            default:
                proteinPerKg = 1.0;
        }

        return Math.round(weight * proteinPerKg);
    },

    // Estimate nutrition for unknown foods by category
    estimateNutrition(foodName, category, portion = 100) {
        const estimates = {
            vegetables: { calories: 25, protein: 2, carbs: 5, fat: 0.3, fiber: 2 },
            fruits: { calories: 60, protein: 1, carbs: 15, fat: 0.2, fiber: 2.5 },
            meat: { calories: 200, protein: 25, carbs: 0, fat: 10, fiber: 0 },
            seafood: { calories: 150, protein: 20, carbs: 0, fat: 5, fiber: 0 },
            dairy: { calories: 80, protein: 5, carbs: 6, fat: 3, fiber: 0 },
            grains: { calories: 350, protein: 10, carbs: 70, fat: 2, fiber: 3 },
            legumes: { calories: 120, protein: 8, carbs: 20, fat: 0.5, fiber: 6 },
            nuts: { calories: 600, protein: 20, carbs: 20, fat: 50, fiber: 10 },
            oils: { calories: 880, protein: 0, carbs: 0, fat: 100, fiber: 0 }
        };

        const base = estimates[category] || estimates.other || { calories: 100, protein: 2, carbs: 15, fat: 1, fiber: 1 };
        const multiplier = portion / 100;

        return {
            calories: Math.round(base.calories * multiplier),
            protein: Math.round(base.protein * multiplier * 10) / 10,
            carbs: Math.round(base.carbs * multiplier * 10) / 10,
            fat: Math.round(base.fat * multiplier * 10) / 10,
            fiber: Math.round(base.fiber * multiplier * 10) / 10
        };
    },

    // Calculate nutrition density score
    calculateNutritionDensity(nutrition) {
        if (!nutrition.calories || nutrition.calories === 0) return 0;

        // Higher protein and fiber are good, lower calories for same nutrients is better
        const proteinScore = nutrition.protein || 0;
        const fiberScore = (nutrition.fiber || 0) * 2; // Fiber is important
        const calorieScore = Math.max(0, 100 - nutrition.calories / 5); // Penalty for high calories

        return Math.round(proteinScore + fiberScore + calorieScore);
    }
};

// Nutrition goals and recommendations
const NutritionGoals = {
    // Get recommended goals based on user profile
    getRecommendedGoals(profile) {
        const { weight, height, age, gender, activityLevel, goal } = profile;
        
        if (!weight || !height || !age || !gender) {
            return NUTRITION_CONSTANTS.DAILY_VALUES;
        }

        const bmr = NutritionCalculator.calculateBMR(weight, height, age, gender);
        let tdee = NutritionCalculator.calculateTDEE(bmr, activityLevel);

        // Adjust calories based on goal
        switch (goal) {
            case 'lose':
                tdee -= 500; // 1 lb per week deficit
                break;
            case 'gain':
                tdee += 500; // 1 lb per week surplus
                break;
        }

        const protein = NutritionCalculator.calculateProteinNeeds(weight, activityLevel, goal);
        
        // Use balanced macro ratios for other macros
        const ratios = NUTRITION_CONSTANTS.MACRO_RATIOS.balanced;
        const macros = NutritionCalculator.calculateMacrosFromCalories(tdee, ratios);

        return {
            calories: Math.max(1200, tdee), // Minimum 1200 calories
            protein: Math.max(protein, macros.protein),
            carbs: macros.carbs,
            fat: macros.fat,
            fiber: 25,
            water: Math.round(weight * 0.033) // 33ml per kg
        };
    },

    // Validate nutrition goals
    validateGoals(goals) {
        const warnings = [];

        if (goals.calories < 1200) {
            warnings.push('Daily calories seem very low. Consider consulting a healthcare provider.');
        }

        if (goals.calories > 4000) {
            warnings.push('Daily calories seem very high. Verify this matches your needs.');
        }

        if (goals.protein < 0.8 * (goals.weight || 70)) {
            warnings.push('Protein intake may be insufficient for muscle maintenance.');
        }

        const totalMacroCalories = (goals.protein * 4) + (goals.carbs * 4) + (goals.fat * 9);
        if (Math.abs(totalMacroCalories - goals.calories) > 100) {
            warnings.push('Macronutrient totals don\'t match calorie goal.');
        }

        return warnings;
    }
};

// Food composition helpers
const FoodComposition = {
    // Combine nutrition from multiple foods
    combineNutrition(nutritionArray) {
        return nutritionArray.reduce((total, nutrition) => ({
            calories: (total.calories || 0) + (nutrition.calories || 0),
            protein: (total.protein || 0) + (nutrition.protein || 0),
            carbs: (total.carbs || 0) + (nutrition.carbs || 0),
            fat: (total.fat || 0) + (nutrition.fat || 0),
            fiber: (total.fiber || 0) + (nutrition.fiber || 0),
            sodium: (total.sodium || 0) + (nutrition.sodium || 0),
            sugar: (total.sugar || 0) + (nutrition.sugar || 0)
        }), {});
    },

    // Scale nutrition by serving size
    scaleNutrition(nutrition, scale) {
        const scaled = {};
        Object.keys(nutrition).forEach(key => {
            scaled[key] = Math.round((nutrition[key] || 0) * scale * 10) / 10;
        });
        return scaled;
    },

    // Convert between units (simplified)
    convertUnit(amount, fromUnit, toUnit) {
        const conversions = {
            'grams-oz': 0.035274,
            'oz-grams': 28.3495,
            'lbs-kg': 0.453592,
            'kg-lbs': 2.20462,
            'cups-ml': 236.588,
            'ml-cups': 0.00422675
        };

        const conversionKey = `${fromUnit}-${toUnit}`;
        return conversions[conversionKey] ? amount * conversions[conversionKey] : amount;
    }
};

// Quick nutrition facts for common foods
const QUICK_NUTRITION = {
    // Per 100g serving
    'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
    'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
    'chicken-breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
    'salmon': { calories: 208, protein: 25, carbs: 0, fat: 12, fiber: 0 },
    'broccoli': { calories: 25, protein: 3, carbs: 5, fat: 0.4, fiber: 2.6 },
    'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
    'quinoa': { calories: 222, protein: 8, carbs: 39, fat: 3.6, fiber: 5 },
    'eggs': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        NUTRITION_CONSTANTS,
        NutritionCalculator,
        NutritionGoals,
        FoodComposition,
        QUICK_NUTRITION
    };
}