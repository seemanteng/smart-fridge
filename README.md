# Smart Fridge
This web app is a a modern, intelligent meal planning and nutrition tracking web application that helps you manage your ingredients, discover recipes, and achieve your health goals. I wanted an applicaton that is able to be a
one stop for calorie logging and recipes while taking into account what you have in your fridge as I get annoyed sometimes when fitness apps suggets recipes that I have 0 ingredients available. 
The addition of YouTube videos was because I personally enjoy watching meal prep videos and fitness vlogs on YouTube and I think that giving a visual demonstration of how to cook a dish may be even more helpful than reading pure text (it is definitely a skill issue of mine to be very insecure with purely text based cooking instructions). 

**Features**
1. Dashboard
Daily Progress Tracking: Monitor calories, protein, carbs, and fat intake with interactive circular progress charts
Meal Logging: Track your daily meals with detailed nutrition information
Recipe Suggestions: Get personalized recipe recommendations based on your available ingredients
Smart Shopping List: Auto-generated grocery lists from your planned recipes to make it easier for users to know what to buy at one glance.

2. Inventory
Ingredient Tracking: Keep track of all your food items with quantities and units!
Smart Categorization: Offers both manual and automatic categorization of ingredients (Proteins, Vegetables, Grains, etc.)
Visual Interface: Beautiful card-based layout with category-specific background images
Search & Filter: Easily find ingredients with search and category filters

3. Recipes
Video-Enhanced Recipes: Integration with YouTube cooking tutorials to make recipes easy to follow
Smart Filtering: Filter recipes by calories, protein content, cuisine type, and cook time to instantly find meals that you like and are the best for you
Ingredient Matching: See which recipes you can make with your current inventory
Nutrition Information: Detailed nutritional breakdown for each recipe

3. Calendar
Monthly View: Visual calendar showing your planned meals
Meal Details: Click any date to view detailed meal information
Top Picks: Track your most frequently cooked meals
Progress Tracking: Monitor daily calorie and nutrition goals

4. Goals
Personal Goals: Set custom daily targets for calories, protein, carbs, and fat but when you input profile details at the start, the backend would have already suggested ideal dietary goals for you, so even novice users have something to start with :)
Weekly Insights: Visual charts showing your nutrition trends over the week
Progress Analytics: Track your consistency and average intake
Personalized Recommendations: Exercise and recipe suggestions based on your profile

5. Admin
Custom Recipe Manager: Add my own recipes with ingredients, instructions, and nutrition info so I can keep adding new recipes to this web app!
Secret page: In order to not make the interface too messy and so only restricted individuals can edit the recipes tab, I made the admin page password protected, only accessible by the consol.

# 🚀 Getting Started
**Prerequisites**
Modern web browser (Chrome, Firefox, Safari, Edge)
No server required - runs entirely in the browser

**Installation**
Clone the repository
bashgit clone https://github.com/yourusername/smart-fridge.git
cd smart-fridge

**Open in browser**
bash# Simply open index.html in your web browser
open index.html

**or on Windows**
start index.html

**Complete onboarding**
Set up your profile (name, age, gender, goals)
Configure your daily nutrition targets
Start adding ingredients and tracking meals!

# 📱 Mobile Support
Smart Fridge is fully responsive and optimized for mobile devices:

Touch-friendly interface with swipe gestures
Mobile navigation with easy access to all features
Responsive design that works on phones, tablets, and desktops
Offline functionality using localStorage

# Project Structure
<pre>
smart-fridge/
├── index.html              # Main application
├── onboarding.html          # User setup flow
├── css/
│   ├── variables.css        # CSS custom properties
│   ├── main.css            # Core styles
│   ├── components.css      # Component-specific styles
│   └── responsive.css      # Mobile responsiveness
├── js/
│   ├── components/
│   │   ├── dashboard.js    # Dashboard functionality
│   │   ├── inventory.js    # Inventory management
│   │   ├── recipes.js      # Recipe discovery
│   │   ├── calendar.js     # Meal planning
│   │   └── goals.js        # Goals and analytics
│   ├── data/
│   │   ├── recipes.js      # Recipe database
│   │   ├── ingredients.js  # Ingredient database
│   │   └── nutrition.js    # Nutrition calculations
│   ├── utils/
│   │   ├── helpers.js      # Utility functions
│   │   ├── storage.js      # localStorage wrapper
│   │   └── nutrition.js    # Nutrition utilities
│   └── main.js            # Application initialization
└── assets/
    └── images/            # UI icons and backgrounds
</pre>

**Design Features**
Modern Glassmorphism UI with backdrop blur effects
Gradient Backgrounds for visual appeal
Smooth Animations and hover effects (graphs on goals tab)
Accessible Design with proper contrast and focus states

**Data Storage**
Local Storage: All data is stored locally in your browser
No Server Required: Completely client-side application
Privacy First: Your data never leaves your device
Export/Import: Backup and restore your data

**API Integration**
YouTube Integration: Fetch video thumbnails and links
Nutrition Database: Built-in nutrition facts for common foods
Recipe Matching: Smart algorithm to match recipes with available ingredients


# Technologies Used
<pre>
Vanilla JavaScript: No frameworks, lightweight and fast
CSS Grid & Flexbox: Modern layout techniques
LocalStorage API: Client-side data persistence
Canvas API: Chart rendering for analytics
CSS Custom Properties: Maintainable theming system
</pre>

**Browser Support**
1. Chrome 80+
2. Firefox 75+
3. Safari 13+
4. Edge 80+

# Data Models
**Meal Object**
javascript{
  id: 1,
  name: "Teriyaki Chicken Bowl",
  type: "dinner",
  calories: 450,
  protein: 35,
  carbs: 45,
  fat: 12,
  timestamp: "2025-01-01T18:00:00Z"
}
**Recipe Object**
javascript{
  id: 1,
  name: "Teriyaki Chicken Bowl",
  cuisine: "asian",
  cookTime: 25,
  servings: 2,
  calories: 450,
  nutrition: { protein: 35, carbs: 45, fat: 12 },
  ingredients: [...],
  instructions: [...],
  videoUrl: "https://youtu.be/..."
}

**Contributing**
1. Fork the repository
2. Create a feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

🤍 Thank you for viewing this project! 
-Man Teng
