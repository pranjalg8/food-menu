import { FOOD_DATA } from '../js/data.js';
import fs from 'fs';

const headers = ['Dish Name', 'Category', 'Type', 'Image URL', 'Recipe Link', 'Ingredients'];
const rows = [];

const pushRow = (row) => rows.push(row.join(','));

// Helper
const processCategory = (items, category, type) => {
    items.forEach(name => {
        // Find recipe
        let recipeUrl = '';
        if (FOOD_DATA.recipes[name]) {
            recipeUrl = FOOD_DATA.recipes[name].url;
        } else {
            // Try split match
            const key = name.split(',')[0].trim();
            if (FOOD_DATA.recipes[key]) recipeUrl = FOOD_DATA.recipes[key].url;
        }

        // CSV Escape
        const safeName = `"${name.replace(/"/g, '""')}"`;
        pushRow([safeName, category, type, '', recipeUrl, '']);
    });
};

processCategory(FOOD_DATA.breakfast.light, 'Breakfast', 'Light');
processCategory(FOOD_DATA.breakfast.heavy, 'Breakfast', 'Heavy');
processCategory(FOOD_DATA.lunch.light, 'Lunch', 'Light');
processCategory(FOOD_DATA.lunch.heavy, 'Lunch', 'Heavy');
processCategory(FOOD_DATA.dinner.light, 'Dinner', 'Light');
processCategory(FOOD_DATA.dinner.heavy, 'Dinner', 'Heavy');
processCategory(FOOD_DATA.extras, 'Side', '');
processCategory(FOOD_DATA.fruits, 'Fruit', '');

const csvContent = headers.join(',') + '\n' + rows.join('\n');
fs.writeFileSync('database_migration.csv', csvContent);
console.log('Done: database_migration.csv');
