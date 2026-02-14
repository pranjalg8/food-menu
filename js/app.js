import { FOOD_DATA } from './data.js';

// Random item picker
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// DOM Elements
const els = {
    bfLightName: document.getElementById('bf-light-name'),
    bfLightRecipe: document.getElementById('bf-light-recipe'),
    bfHeavyName: document.getElementById('bf-heavy-name'),
    bfHeavyRecipe: document.getElementById('bf-heavy-recipe'),

    lunchLightName: document.getElementById('lunch-light-name'),
    lunchLightRecipe: document.getElementById('lunch-light-recipe'),
    lunchHeavyName: document.getElementById('lunch-heavy-name'),
    lunchHeavyRecipe: document.getElementById('lunch-heavy-recipe'),

    dinnerLightName: document.getElementById('dinner-light-name'),
    dinnerLightRecipe: document.getElementById('dinner-light-recipe'),
    dinnerHeavyName: document.getElementById('dinner-heavy-name'),
    dinnerHeavyRecipe: document.getElementById('dinner-heavy-recipe'),

    extraName: document.getElementById('extra-name'),
    fruitName: document.getElementById('fruit-name'),

    regenerateBtn: document.getElementById('regenerate-btn'),
    cards: document.querySelectorAll('.menu-card')
};

function updateSlot(nameEl, recipeEl, itemName) {
    // Animate text update
    nameEl.style.opacity = '0';

    setTimeout(() => {
        nameEl.textContent = itemName;
        nameEl.style.opacity = '1';

        // Check for recipe
        const recipe = FOOD_DATA.recipes[itemName] ||
            FOOD_DATA.recipes[itemName.split(',')[0].trim()]; // Try partial match

        if (recipe && recipe.url) {
            recipeEl.href = recipe.url;
            recipeEl.classList.remove('hidden');
        } else {
            recipeEl.classList.add('hidden');
        }
    }, 200);
}

function generateMenu() {
    // Re-trigger card animations
    els.cards.forEach(card => {
        card.style.animation = 'none';
        card.offsetHeight; /* trigger reflow */
        card.style.animation = null;
    });

    // 1. Breakfast
    const bfLight = getRandom(FOOD_DATA.breakfast.light);
    const bfHeavy = getRandom(FOOD_DATA.breakfast.heavy);
    updateSlot(els.bfLightName, els.bfLightRecipe, bfLight);
    updateSlot(els.bfHeavyName, els.bfHeavyRecipe, bfHeavy);

    // 2. Lunch
    const lunchLight = getRandom(FOOD_DATA.lunch.light);
    const lunchHeavy = getRandom(FOOD_DATA.lunch.heavy);
    updateSlot(els.lunchLightName, els.lunchLightRecipe, lunchLight);
    updateSlot(els.lunchHeavyName, els.lunchHeavyRecipe, lunchHeavy);

    // 3. Dinner
    const dinnerLight = getRandom(FOOD_DATA.dinner.light);
    const dinnerHeavy = getRandom(FOOD_DATA.dinner.heavy);
    updateSlot(els.dinnerLightName, els.dinnerLightRecipe, dinnerLight);
    updateSlot(els.dinnerHeavyName, els.dinnerHeavyRecipe, dinnerHeavy);

    // 4. Extras
    const extra = getRandom(FOOD_DATA.extras);
    updateSlot(els.extraName, { classList: { add: () => { }, remove: () => { } } }, extra); // No recipe slot for extras yet

    const fruit = getRandom(FOOD_DATA.fruits);
    updateSlot(els.fruitName, { classList: { add: () => { }, remove: () => { } } }, fruit);
}

// Event Listeners
els.regenerateBtn.addEventListener('click', generateMenu);

// Initial Load
window.addEventListener('DOMContentLoaded', generateMenu);
