/**
 * Recipes Database 
 * Collection of recipes with nutrition info, instructions, and video tutorials
 */

const RECIPE_DATABASE = {
    // Asian Cuisine
    'teriyaki-chicken-bowl': {
        id: 1,
        name: 'Teriyaki Chicken Bowl',
        emoji: '🍗',
        videoUrl: 'https://youtu.be/8oVfFmTNEzw?si=prKuaL747ZbPp-f7', // Replace with actual recipe video
        cuisine: 'asian',
        difficulty: 'easy',
        cookTime: 25,
        servings: 2,
        calories: 450,
        nutrition: { protein: 35, carbs: 45, fat: 12, fiber: 3 },
        ingredients: [
            { name: 'chicken breast', amount: 8, unit: 'oz' },
            { name: 'rice', amount: 1, unit: 'cup' },
            { name: 'broccoli', amount: 1, unit: 'cup' },
            { name: 'teriyaki sauce', amount: 3, unit: 'tbsp' },
            { name: 'sesame oil', amount: 1, unit: 'tsp' }
        ],
        instructions: [
            'Cook rice according to package directions',
            'Season chicken with salt and pepper, cook in pan until done',
            'Steam broccoli until tender-crisp',
            'Slice chicken and combine with teriyaki sauce',
            'Serve over rice with broccoli, drizzle with sesame oil'
        ],
        tags: ['high-protein', 'balanced', 'asian']
    },

    'vegetable-stir-fry': {
        id: 2,
        name: 'Vegetable Stir Fry',
        emoji: '🥬',
        videoUrl: 'https://www.youtube.com/watch?v=example2', // Replace with actual recipe video
        cuisine: 'asian',
        difficulty: 'easy',
        cookTime: 15,
        servings: 2,
        calories: 320,
        nutrition: { protein: 12, carbs: 28, fat: 18, fiber: 6 },
        ingredients: [
            { name: 'mixed vegetables', amount: 3, unit: 'cups' },
            { name: 'garlic', amount: 2, unit: 'cloves' },
            { name: 'ginger', amount: 1, unit: 'tsp' },
            { name: 'soy sauce', amount: 2, unit: 'tbsp' },
            { name: 'olive oil', amount: 2, unit: 'tbsp' }
        ],
        instructions: [
            'Heat oil in large pan or wok',
            'Add garlic and ginger, cook for 30 seconds',
            'Add vegetables and stir-fry for 5-7 minutes',
            'Add soy sauce and cook for 2 more minutes',
            'Serve hot over rice or noodles'
        ],
        tags: ['vegetarian', 'quick', 'low-calorie']
    },

    // Mediterranean
    'quinoa-power-salad': {
        id: 3,
        name: 'Quinoa Power Salad',
        emoji: '🥗',
        videoUrl: 'https://www.youtube.com/watch?v=example3', // Replace with actual recipe video
        cuisine: 'mediterranean',
        difficulty: 'easy',
        cookTime: 20,
        servings: 2,
        calories: 380,
        nutrition: { protein: 18, carbs: 42, fat: 14, fiber: 8 },
        ingredients: [
            { name: 'quinoa', amount: 1, unit: 'cup' },
            { name: 'chickpeas', amount: 0.5, unit: 'cup' },
            { name: 'cucumber', amount: 1, unit: 'medium' },
            { name: 'cherry tomatoes', amount: 1, unit: 'cup' },
            { name: 'olive oil', amount: 2, unit: 'tbsp' },
            { name: 'lemon juice', amount: 2, unit: 'tbsp' }
        ],
        instructions: [
            'Cook quinoa and let cool completely',
            'Dice cucumber and halve cherry tomatoes',
            'Combine quinoa, chickpeas, and vegetables',
            'Whisk olive oil and lemon juice for dressing',
            'Toss salad with dressing and season with salt and pepper'
        ],
        tags: ['vegetarian', 'high-fiber', 'mediterranean', 'meal-prep']
    },

    'greek-yogurt-parfait': {
        id: 4,
        name: 'Greek Yogurt Parfait',
        emoji: '🥛',
        videoUrl: 'https://www.youtube.com/watch?v=example4', // Replace with actual recipe video
        cuisine: 'mediterranean',
        difficulty: 'easy',
        cookTime: 5,
        servings: 1,
        calories: 280,
        nutrition: { protein: 20, carbs: 35, fat: 8, fiber: 4 },
        ingredients: [
            { name: 'greek yogurt', amount: 1, unit: 'cup' },
            { name: 'mixed berries', amount: 0.5, unit: 'cup' },
            { name: 'granola', amount: 0.25, unit: 'cup' },
            { name: 'honey', amount: 1, unit: 'tbsp' }
        ],
        instructions: [
            'Layer half the yogurt in a bowl or glass',
            'Add half the berries and granola',
            'Repeat layers with remaining ingredients',
            'Drizzle with honey',
            'Serve immediately'
        ],
        tags: ['breakfast', 'high-protein', 'quick', 'healthy']
    },

    // Italian
    'veggie-pasta-primavera': {
        id: 5,
        name: 'Veggie Pasta Primavera',
        emoji: '🍝',
        videoUrl: 'https://www.youtube.com/watch?v=example5', // Replace with actual recipe video
        cuisine: 'italian',
        difficulty: 'easy',
        cookTime: 20,
        servings: 2,
        calories: 420,
        nutrition: { protein: 15, carbs: 65, fat: 12, fiber: 8 },
        ingredients: [
            { name: 'pasta', amount: 6, unit: 'oz' },
            { name: 'zucchini', amount: 1, unit: 'medium' },
            { name: 'bell pepper', amount: 1, unit: 'medium' },
            { name: 'cherry tomatoes', amount: 1, unit: 'cup' },
            { name: 'olive oil', amount: 2, unit: 'tbsp' },
            { name: 'garlic', amount: 2, unit: 'cloves' },
            { name: 'basil', amount: 0.25, unit: 'cup' }
        ],
        instructions: [
            'Cook pasta according to package directions',
            'Dice vegetables into bite-sized pieces',
            'Heat olive oil and sauté garlic for 1 minute',
            'Add vegetables and cook until tender',
            'Toss pasta with vegetables and fresh basil'
        ],
        tags: ['vegetarian', 'italian', 'balanced']
    },

    // American
    'baked-salmon': {
        id: 6,
        name: 'Baked Salmon with Asparagus',
        emoji: '🐟',
        videoUrl: 'https://www.youtube.com/watch?v=example6', // Replace with actual recipe video
        cuisine: 'american',
        difficulty: 'easy',
        cookTime: 25,
        servings: 2,
        calories: 380,
        nutrition: { protein: 42, carbs: 8, fat: 18, fiber: 4 },
        ingredients: [
            { name: 'salmon fillet', amount: 12, unit: 'oz' },
            { name: 'asparagus', amount: 1, unit: 'lb' },
            { name: 'lemon', amount: 1, unit: 'medium' },
            { name: 'olive oil', amount: 2, unit: 'tbsp' },
            { name: 'herbs', amount: 1, unit: 'tsp' }
        ],
        instructions: [
            'Preheat oven to 400°F (200°C)',
            'Place salmon and asparagus on baking sheet',
            'Drizzle with olive oil and season with herbs',
            'Add lemon slices on top',
            'Bake for 15-20 minutes until salmon flakes easily'
        ],
        tags: ['high-protein', 'low-carb', 'omega-3', 'healthy']
    }
};

// Recipe categories and filters
const RECIPE_CATEGORIES = {
    cuisine: ['asian', 'mediterranean', 'italian', 'american', 'mexican'],
    difficulty: ['easy', 'medium', 'hard'],
    mealType: ['breakfast', 'lunch', 'dinner', 'snack'],
    dietaryTags: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb', 'high-protein', 'low-calorie']
};

// YouTube Video Utilities
const VideoUtils = {
    // Extract YouTube video ID from various URL formats
    extractVideoId(url) {
        if (!url) return null;
        
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&\n?#]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        
        return null;
    },

    // Generate YouTube thumbnail URL from video ID
    getThumbnailUrl(videoId, quality = 'hqdefault') {
        if (!videoId) return null;
        
        // Available qualities: default, mqdefault, hqdefault, sddefault, maxresdefault
        return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
    },

    // Generate YouTube embed URL
    getEmbedUrl(videoId, autoplay = false, start = 0) {
        if (!videoId) return null;
        
        let embedUrl = `https://www.youtube.com/embed/${videoId}`;
        const params = [];
        
        if (autoplay) params.push('autoplay=1');
        if (start > 0) params.push(`start=${start}`);
        
        if (params.length > 0) {
            embedUrl += '?' + params.join('&');
        }
        
        return embedUrl;
    },

    // Get video thumbnail for recipe
    getRecipeVideoThumbnail(recipe) {
        if (!recipe.videoUrl) return null;
        
        const videoId = this.extractVideoId(recipe.videoUrl);
        return this.getThumbnailUrl(videoId, 'hqdefault');
    },

    // Check if video URL is valid YouTube URL
    isValidYouTubeUrl(url) {
        return this.extractVideoId(url) !== null;
    }
};

// Recipe utility functions - UNIFIED VERSION
const RecipeUtils = {
    // Get all recipes
    getAllRecipes() {
        return Object.values(RECIPE_DATABASE);
    },

    // Get recipe by ID
    getRecipe(id) {
        return Object.values(RECIPE_DATABASE).find(recipe => recipe.id === id);
    },

    // Get recipe with video thumbnail
    getRecipeWithThumbnail(id) {
        const recipe = this.getRecipe(id);
        if (!recipe) return null;
        
        return {
            ...recipe,
            thumbnailUrl: VideoUtils.getRecipeVideoThumbnail(recipe),
            videoId: VideoUtils.extractVideoId(recipe.videoUrl)
        };
    },

    // Filter recipes by criteria
    filterRecipes(filters) {
        let recipes = this.getAllRecipes();

        if (filters.maxCalories) {
            recipes = recipes.filter(recipe => recipe.calories <= filters.maxCalories);
        }

        if (filters.minProtein) {
            recipes = recipes.filter(recipe => recipe.nutrition.protein >= filters.minProtein);
        }

        if (filters.cuisine && filters.cuisine !== 'all') {
            recipes = recipes.filter(recipe => recipe.cuisine === filters.cuisine);
        }

        if (filters.maxCookTime) {
            recipes = recipes.filter(recipe => recipe.cookTime <= filters.maxCookTime);
        }

        if (filters.tags && filters.tags.length > 0) {
            recipes = recipes.filter(recipe => 
                filters.tags.some(tag => recipe.tags.includes(tag))
            );
        }

        // Add video thumbnails to filtered results
        return recipes.map(recipe => ({
            ...recipe,
            thumbnailUrl: VideoUtils.getRecipeVideoThumbnail(recipe),
            videoId: VideoUtils.extractVideoId(recipe.videoUrl)
        }));
    },

    // Search recipes by name or ingredients
    searchRecipes(query) {
        const searchTerm = query.toLowerCase();
        const recipes = this.getAllRecipes().filter(recipe =>
            recipe.name.toLowerCase().includes(searchTerm) ||
            recipe.ingredients.some(ingredient => 
                ingredient.name.toLowerCase().includes(searchTerm)
            )
        );

        // Add video thumbnails to search results
        return recipes.map(recipe => ({
            ...recipe,
            thumbnailUrl: VideoUtils.getRecipeVideoThumbnail(recipe),
            videoId: VideoUtils.extractVideoId(recipe.videoUrl)
        }));
    },

    // Get recipes by available ingredients
    getRecipesByIngredients(availableIngredients) {
        return this.getAllRecipes().map(recipe => {
            const score = this.calculateIngredientMatch(recipe, availableIngredients);
            return { 
                ...recipe, 
                matchScore: score,
                thumbnailUrl: VideoUtils.getRecipeVideoThumbnail(recipe),
                videoId: VideoUtils.extractVideoId(recipe.videoUrl)
            };
        }).filter(recipe => recipe.matchScore > 0)
          .sort((a, b) => b.matchScore - a.matchScore);
    },

    // Calculate how well recipe matches available ingredients
    calculateIngredientMatch(recipe, availableIngredients) {
        const available = availableIngredients.map(ing => ing.toLowerCase());
        let matches = 0;

        recipe.ingredients.forEach(ingredient => {
            const ingredientName = ingredient.name.toLowerCase();
            if (available.some(avail => 
                avail.includes(ingredientName) || ingredientName.includes(avail)
            )) {
                matches++;
            }
        });

        return Math.round((matches / recipe.ingredients.length) * 100);
    },

    // Scale recipe for different serving sizes
    scaleRecipe(recipe, newServings) {
        const scale = newServings / recipe.servings;
        
        return {
            ...recipe,
            servings: newServings,
            calories: Math.round(recipe.calories * scale),
            nutrition: {
                protein: Math.round(recipe.nutrition.protein * scale),
                carbs: Math.round(recipe.nutrition.carbs * scale),
                fat: Math.round(recipe.nutrition.fat * scale),
                fiber: Math.round(recipe.nutrition.fiber * scale)
            },
            ingredients: recipe.ingredients.map(ingredient => ({
                ...ingredient,
                amount: Math.round(ingredient.amount * scale * 10) / 10
            })),
            thumbnailUrl: VideoUtils.getRecipeVideoThumbnail(recipe),
            videoId: VideoUtils.extractVideoId(recipe.videoUrl)
        };
    },

    // Get recipes for meal planning
    getRecipesForMealPlanning(criteria) {
        const { targetCalories, preferredCuisines, avoidTags, maxCookTime } = criteria;
        
        let recipes = this.getAllRecipes();

        // Filter by calories (within 20% of target)
        if (targetCalories) {
            const tolerance = targetCalories * 0.2;
            recipes = recipes.filter(recipe => 
                recipe.calories >= targetCalories - tolerance &&
                recipe.calories <= targetCalories + tolerance
            );
        }

        // Filter by cuisine preferences
        if (preferredCuisines && preferredCuisines.length > 0) {
            recipes = recipes.filter(recipe => 
                preferredCuisines.includes(recipe.cuisine)
            );
        }

        // Avoid certain tags
        if (avoidTags && avoidTags.length > 0) {
            recipes = recipes.filter(recipe => 
                !avoidTags.some(tag => recipe.tags.includes(tag))
            );
        }

        // Filter by cook time
        if (maxCookTime) {
            recipes = recipes.filter(recipe => recipe.cookTime <= maxCookTime);
        }

        // Add video thumbnails to meal planning results
        return recipes.map(recipe => ({
            ...recipe,
            thumbnailUrl: VideoUtils.getRecipeVideoThumbnail(recipe),
            videoId: VideoUtils.extractVideoId(recipe.videoUrl)
        }));
    },

    // Get nutrition totals for multiple recipes
    calculateTotalNutrition(recipes) {
        return recipes.reduce((total, recipe) => ({
            calories: total.calories + recipe.calories,
            protein: total.protein + recipe.nutrition.protein,
            carbs: total.carbs + recipe.nutrition.carbs,
            fat: total.fat + recipe.nutrition.fat,
            fiber: total.fiber + recipe.nutrition.fiber
        }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
    },

    // Get recipes with video tutorials only
    getRecipesWithVideos() {
        return this.getAllRecipes()
            .filter(recipe => recipe.videoUrl && VideoUtils.isValidYouTubeUrl(recipe.videoUrl))
            .map(recipe => ({
                ...recipe,
                thumbnailUrl: VideoUtils.getRecipeVideoThumbnail(recipe),
                videoId: VideoUtils.extractVideoId(recipe.videoUrl)
            }));
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RECIPE_DATABASE,
        RECIPE_CATEGORIES,
        RecipeUtils,
        VideoUtils
    };
}