import fs from 'fs';

// Load existing enriched data
const enrichedLines = fs.readFileSync('database_enriched.csv', 'utf-8').split('\n');
const basicLines = fs.readFileSync('database.csv', 'utf-8').split('\n');

// Get enriched dish names
const enrichedDishes = new Set();
for (let i = 1; i < enrichedLines.length; i++) {
    const line = enrichedLines[i].trim();
    if (!line) continue;
    const dishName = line.split('\t')[0];
    if (dishName) enrichedDishes.add(dishName);
}

// Collect dishes needing enrichment
const missing = [];
for (let i = 1; i < basicLines.length; i++) {
    const line = basicLines[i].trim();
    if (!line) continue;
    const parts = line.split('\t');
    const dishName = parts[0];
    const category = parts[1];
    const type = parts[2];
    if (dishName && !enrichedDishes.has(dishName)) {
        missing.push({ name: dishName, category, type });
    }
}

console.log(`Found ${missing.length} dishes to enrich\n`);

// Generate enriched data for each dish
const enrichedData = missing.map(dish => {
    const name = dish.name;
    const category = dish.category;
    const type = dish.type;

    // Generate description, ingredients, times, difficulty, and tags
    const enrichment = generateEnrichment(name, category, type);

    return `${name}\t${category}\t${type}\t${enrichment.description}\t${enrichment.ingredients}\t${enrichment.prepTime}\t${enrichment.cookTime}\t${enrichment.difficulty}\t${enrichment.servings}\t${enrichment.tags}`;
});

// Append to enriched database
const currentEnriched = fs.readFileSync('database_enriched.csv', 'utf-8').trim();
const newContent = currentEnriched + '\n' + enrichedData.join('\n') + '\n';
fs.writeFileSync('database_enriched.csv', newContent);

console.log(`\n✅ Successfully enriched ${missing.length} dishes!`);
console.log(`Updated database_enriched.csv`);

function generateEnrichment(name, category, type) {
    const nameLower = name.toLowerCase();

    // Breakfast dishes
    if (nameLower.includes('paratha') || nameLower.includes('parath')) {
        const variant = name.split(' ')[0];
        return {
            description: `Stuffed Indian flatbread filled with spiced ${variant.toLowerCase()} mixture`,
            ingredients: `Wheat Flour, ${variant}, Ghee, Spices, Fresh Coriander`,
            prepTime: '15',
            cookTime: '20',
            difficulty: 'Medium',
            servings: '4',
            tags: 'North Indian|Stuffed Bread'
        };
    }

    if (nameLower.includes('dosa')) {
        return {
            description: 'Crispy South Indian rice crepe served with chutney and sambar',
            ingredients: 'Rice, Urad Dal, Fenugreek Seeds, Oil',
            prepTime: '20',
            cookTime: '15',
            difficulty: 'Medium',
            servings: '4',
            tags: 'South Indian|Fermented|Crispy'
        };
    }

    if (nameLower.includes('chilla')) {
        return {
            description: 'Savory Indian gram flour pancake with spices',
            ingredients: 'Gram Flour (Besan), Onion, Green Chili, Coriander, Spices',
            prepTime: '10',
            cookTime: '20',
            difficulty: 'Easy',
            servings: '4',
            tags: 'Protein-Rich|Quick|Gluten-Free'
        };
    }

    // Lunch/Dinner curries
    if (nameLower.includes('rajma')) {
        return {
            description: 'Hearty red kidney bean curry in spiced tomato gravy',
            ingredients: 'Rajma (Kidney Beans), Onion, Tomato, Ginger-Garlic, Spices',
            prepTime: '10',
            cookTime: '40',
            difficulty: 'Easy',
            servings: '4',
            tags: 'North Indian|Protein-Rich|Comfort Food'
        };
    }

    if (nameLower.includes('chole')) {
        return {
            description: 'Spicy chickpea curry with aromatic spices',
            ingredients: 'Chickpeas, Onion, Tomato, Ginger-Garlic, Chole Masala',
            prepTime: '10',
            cookTime: '30',
            difficulty: 'Easy',
            servings: '4',
            tags: 'North Indian|Spicy|Protein-Rich'
        };
    }

    if (nameLower.includes('dal') && !nameLower.includes('rice')) {
        if (nameLower.includes('makhani')) {
            return {
                description: 'Creamy black lentils slow-cooked with butter and cream',
                ingredients: 'Black Lentils (Urad Dal), Kidney Beans, Butter, Cream, Tomato, Spices',
                prepTime: '15',
                cookTime: '60',
                difficulty: 'Medium',
                servings: '4',
                tags: 'North Indian|Rich|Creamy'
            };
        }
        return {
            description: 'Comforting lentil soup seasoned with spices',
            ingredients: 'Lentils (Toor/Moong Dal), Turmeric, Cumin, Garlic, Ghee',
            prepTime: '5',
            cookTime: '25',
            difficulty: 'Easy',
            servings: '4',
            tags: 'Comfort Food|Protein-Rich|Healthy'
        };
    }

    if (nameLower.includes('paneer')) {
        if (nameLower.includes('do pyaza')) {
            return {
                description: 'Cottage cheese curry with double the onions in spiced gravy',
                ingredients: 'Paneer, Onion, Tomato, Ginger-Garlic, Capsicum, Spices',
                prepTime: '15',
                cookTime: '25',
                difficulty: 'Medium',
                servings: '4',
                tags: 'North Indian|Rich|Vegetarian'
            };
        }
        if (nameLower.includes('chilli')) {
            return {
                description: 'Indo-Chinese style spicy paneer stir-fried with peppers',
                ingredients: 'Paneer, Bell Peppers, Onion, Soy Sauce, Chili Sauce, Cornflour',
                prepTime: '15',
                cookTime: '20',
                difficulty: 'Easy',
                servings: '4',
                tags: 'Indo-Chinese|Spicy|Party Favorite'
            };
        }
        return {
            description: 'Soft cottage cheese cubes in flavorful curry',
            ingredients: 'Paneer, Onion, Tomato, Cream, Spices',
            prepTime: '10',
            cookTime: '25',
            difficulty: 'Medium',
            servings: '4',
            tags: 'North Indian|Rich|Protein-Rich'
        };
    }

    if (nameLower.includes('aloo')) {
        const veggie = nameLower.match(/(jeera|gajar|gobhi|baigan|methi|parwal|shimla)/)?.[1];
        const veggieNames = {
            jeera: 'cumin-spiced',
            gajar: 'carrot',
            gobhi: 'cauliflower',
            baigan: 'eggplant',
            methi: 'fenugreek',
            parwal: 'pointed gourd',
            shimla: 'bell pepper'
        };

        if (veggie) {
            return {
                description: `Potato and ${veggieNames[veggie]} curry with aromatic spices`,
                ingredients: `Potato, ${veggieNames[veggie].charAt(0).toUpperCase() + veggieNames[veggie].slice(1)}, Onion, Tomato, Spices`,
                prepTime: '10',
                cookTime: '25',
                difficulty: 'Easy',
                servings: '4',
                tags: 'North Indian|Homestyle|Comfort Food'
            };
        }

        return {
            description: 'Classic potato curry with traditional spices',
            ingredients: 'Potato, Onion, Tomato, Turmeric, Cumin, Spices',
            prepTime: '10',
            cookTime: '25',
            difficulty: 'Easy',
            servings: '4',
            tags: 'North Indian|Comfort Food|Easy'
        };
    }

    if (nameLower.includes('bhindi')) {
        if (nameLower.includes('bharwa')) {
            return {
                description: 'Stuffed okra filled with spiced masala mixture',
                ingredients: 'Okra (Bhindi), Spice Mix, Onion, Amchur, Oil',
                prepTime: '20',
                cookTime: '25',
                difficulty: 'Medium',
                servings: '4',
                tags: 'North Indian|Stuffed|Special'
            };
        }
        return {
            description: 'Crispy okra stir-fried with spices',
            ingredients: 'Okra (Bhindi), Onion, Spices, Oil',
            prepTime: '15',
            cookTime: '20',
            difficulty: 'Easy',
            servings: '4',
            tags: 'North Indian|Dry Curry'
        };
    }

    if (nameLower.includes('kadhi')) {
        return {
            description: 'Tangy yogurt-based curry with crispy pakoras',
            ingredients: 'Yogurt, Gram Flour (Besan), Turmeric, Curry Leaves, Fenugreek',
            prepTime: '15',
            cookTime: '30',
            difficulty: 'Medium',
            servings: '4',
            tags: 'North Indian|Tangy|Comfort Food'
        };
    }

    if (nameLower.includes('kofta')) {
        if (nameLower.includes('lauki')) {
            return {
                description: 'Bottle gourd dumplings in creamy tomato gravy',
                ingredients: 'Bottle Gourd (Lauki), Gram Flour, Onion, Tomato, Cream, Spices',
                prepTime: '25',
                cookTime: '35',
                difficulty: 'Medium',
                servings: '4',
                tags: 'North Indian|Special|Rich'
            };
        }
        if (nameLower.includes('malai')) {
            return {
                description: 'Rich creamy kofta balls in white cashew gravy',
                ingredients: 'Paneer, Potato, Cashews, Cream, Spices',
                prepTime: '30',
                cookTime: '30',
                difficulty: 'Hard',
                servings: '4',
                tags: 'North Indian|Rich|Special|Party Favorite'
            };
        }
    }

    if (nameLower.includes('matar') || nameLower.includes('peas')) {
        return {
            description: 'Green peas and mushroom curry in spiced gravy',
            ingredients: 'Green Peas, Mushroom, Onion, Tomato, Cream, Spices',
            prepTime: '15',
            cookTime: '25',
            difficulty: 'Easy',
            servings: '4',
            tags: 'North Indian|Healthy|Light'
        };
    }

    if (nameLower.includes('pulao')) {
        let variant = 'vegetable';
        if (nameLower.includes('veg ')) variant = 'vegetable';
        else if (nameLower.includes('peas')) variant = 'peas';
        else if (nameLower.includes('masala')) variant = 'spiced';
        else if (nameLower.includes('soya')) variant = 'soya chunk';

        return {
            description: `Aromatic ${variant} rice pilaf with whole spices`,
            ingredients: `Basmati Rice, ${variant.charAt(0).toUpperCase() + variant.slice(1)}, Whole Spices, Ghee`,
            prepTime: '10',
            cookTime: '25',
            difficulty: 'Easy',
            servings: '4',
            tags: 'North Indian|Rice Dish|One Pot'
        };
    }

    if (nameLower.includes('rice') && nameLower.includes('jeera')) {
        return {
            description: 'Fragrant cumin-scented basmati rice',
            ingredients: 'Basmati Rice, Cumin Seeds, Ghee, Bay Leaf',
            prepTime: '5',
            cookTime: '20',
            difficulty: 'Easy',
            servings: '4',
            tags: 'North Indian|Rice Dish|Simple'
        };
    }

    if (nameLower.includes('chana') || nameLower.includes('chole')) {
        if (nameLower.includes('kala') || nameLower.includes('desi')) {
            return {
                description: 'Boiled black chickpeas seasoned with spices',
                ingredients: 'Black Chickpeas (Kala Chana), Onion, Tomato, Lemon, Spices',
                prepTime: '10',
                cookTime: '40',
                difficulty: 'Easy',
                servings: '4',
                tags: 'Protein-Rich|Healthy|High-Fiber'
            };
        }
    }

    if (nameLower.includes('gatte')) {
        return {
            description: 'Gram flour dumplings in spiced yogurt curry',
            ingredients: 'Gram Flour (Besan), Yogurt, Onion, Tomato, Spices',
            prepTime: '20',
            cookTime: '30',
            difficulty: 'Medium',
            servings: '4',
            tags: 'Rajasthani|Traditional|Unique'
        };
    }

    if (nameLower.includes('dum aloo')) {
        return {
            description: 'Baby potatoes slow-cooked in rich cashew gravy',
            ingredients: 'Baby Potatoes, Cashews, Yogurt, Tomato, Cream, Spices',
            prepTime: '15',
            cookTime: '35',
            difficulty: 'Medium',
            servings: '4',
            tags: 'North Indian|Rich|Special|Mughlai'
        };
    }

    if (nameLower.includes('arbi')) {
        return {
            description: 'Spiced colocasia (taro root) curry',
            ingredients: 'Colocasia (Arbi), Onion, Tomato, Spices',
            prepTime: '15',
            cookTime: '30',
            difficulty: 'Medium',
            servings: '4',
            tags: 'North Indian|Unique|Festive'
        };
    }

    if (nameLower.includes('baigan') || nameLower.includes('baingan')) {
        if (nameLower.includes('bharta')) {
            return {
                description: 'Smoky mashed eggplant curry with tomatoes and spices',
                ingredients: 'Eggplant (Baingan), Onion, Tomato, Green Chili, Spices',
                prepTime: '10',
                cookTime: '30',
                difficulty: 'Medium',
                servings: '4',
                tags: 'North Indian|Smoky|Rustic'
            };
        }
    }

    if (nameLower.includes('kaddu')) {
        return {
            description: 'Sweet and spiced pumpkin curry',
            ingredients: 'Pumpkin (Kaddu), Onion, Jaggery, Spices',
            prepTime: '10',
            cookTime: '25',
            difficulty: 'Easy',
            servings: '4',
            tags: 'North Indian|Sweet-Savory|Comfort Food'
        };
    }

    if (nameLower.includes('bharwa') && nameLower.includes('shimla')) {
        return {
            description: 'Bell peppers stuffed with spiced potato filling',
            ingredients: 'Bell Peppers (Shimla Mirch), Potato, Spices, Paneer',
            prepTime: '20',
            cookTime: '30',
            difficulty: 'Medium',
            servings: '4',
            tags: 'North Indian|Stuffed|Special'
        };
    }

    // Default fallback
    return {
        description: `Delicious ${category.toLowerCase()} dish prepared with traditional spices`,
        ingredients: 'Mixed Vegetables, Onion, Tomato, Spices',
        prepTime: '15',
        cookTime: '25',
        difficulty: type === 'Heavy' ? 'Medium' : 'Easy',
        servings: '4',
        tags: category === 'Breakfast' ? 'Quick|Healthy' : 'Homestyle|Vegetarian'
    };
}
