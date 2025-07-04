# Smart Fridge
Currently Hosted on: https://shimmering-frangollo-b5711a.netlify.app/
<br>
<div align="center">
<img src="https://github.com/user-attachments/assets/902b3c65-e1b1-402b-b598-1c30c902b5cc" width="400" alt="Smart Fridge Logo">
</div>
Smart Fridge is the meal planning app that actually looks at what's in your kitchen first. No more grocery store runs for exotic ingredients—just delicious, healthy meals made from what you already have, complete with YouTube tutorials because while text based instructions are great, learning visually is usually more fool-proof and fun.

# Features
**1. Dashboard**
- Daily Progress Tracking: Monitor calories, protein, carbs, and fat intake with interactive circular progress charts
- Meal Logging: Track your daily meals with detailed nutrition information
- Recipe Suggestions: Get personalized recipe recommendations based on your available ingredients
- Smart Shopping List: Auto-generated grocery lists from your planned recipes to make it easier for users to know what to buy at one glance.
![Dashboard Tab](https://github.com/user-attachments/assets/501edf40-b4e2-4705-8a25-483e2fe0b071)

**2. Inventory**
- Ingredient Tracking: Keep track of all your food items with quantities and units!
- Smart Categorization: Offers both manual and automatic categorization of ingredients (Proteins, Vegetables, Grains, etc.)
- Visual Interface: Beautiful card-based layout with category-specific background images
- Search & Filter: Easily find ingredients with search and category filters
![Inventory Tab](https://github.com/user-attachments/assets/c901f63c-7574-45ef-bf1b-ffdb850b007e)

**3. Recipes**
- Video-Enhanced Recipes: Integration with YouTube cooking tutorials to make recipes easy to follow
- Smart Filtering: Filter recipes by calories, protein content, cuisine type, and cook time to instantly find meals that you like and are the best for you
- Ingredient Matching: See which recipes you can make with your current inventory
- Nutrition Information: Detailed nutritional breakdown for each recipe
![Recipes Tab](https://github.com/user-attachments/assets/92f22284-cf59-403f-8237-81f5ca606dc0)

**3. Calendar**
- Monthly View: Visual calendar showing your planned meals
- Meal Details: Click any date to view detailed meal information
- Top Picks: Track your most frequently cooked meals
- Progress Tracking: Monitor daily calorie and nutrition goals
![Calendar Tab](https://github.com/user-attachments/assets/aa3a4060-e7dd-4b65-bcd8-30e02208e5c8)

**4. Goals**
- Personal Goals: Set custom daily targets for calories, protein, carbs, and fat but when you input profile details at the start, the backend would have already suggested ideal dietary goals for you, so even novice users have something to start with :)
- Weekly Insights: Visual charts showing your nutrition trends over the week
- Progress Analytics: Track your consistency and average intake
- Personalized Recommendations: Exercise and recipe suggestions based on your profile
![Goals Tab](https://github.com/user-attachments/assets/07055a52-1610-4ddc-b93e-bddb8d80cd5e)

**5. Admin**
- Custom Recipe Manager: Add my own recipes with ingredients, instructions, and nutrition info so I can keep adding new recipes to this web app!
- Secret page: In order to not make the interface too messy and so only restricted individuals can edit the recipes tab, I made the admin page password protected, only accessible by the consol.
![Admin Tab](https://github.com/user-attachments/assets/38a17030-d247-4b97-b611-36b0b1223336)

**6. Onboarding**
- To get user profile details that will be used for recipe suggestions and reccommendations in the goal tab
- Once off form to fill up when users first access the web app
![Onboarding](https://github.com/user-attachments/assets/71d64ddc-5be8-4499-ad2b-7067d8cb2deb)

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
<div align="center">
<img src="https://github.com/user-attachments/assets/f5729263-94bb-4cc9-89b0-b78bcb40c878" width="300" alt="Mobile App">
</div>

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
<pre>
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
</pre>
**Recipe Object**
<pre>
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
</pre>
**Contributing**
1. Fork the repository
2. Create a feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

🤍 Thank you for viewing this project! 
-Man Teng
