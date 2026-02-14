// Google Sheet Configuration
const SHEET_ID = '1l1GS2HetL5wO3rGUhqbKp_jgpYEmSZdlJ5xgagzHcOk';
const SHEET_NAME = 'Database';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;

// Simple CSV Parser (handles quoted strings)
function parseCSV(text) {
    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentCell += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentCell);
            currentCell = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') i++;
            if (currentRow.length > 0 || currentCell) {
                currentRow.push(currentCell);
                rows.push(currentRow);
            }
            currentRow = [];
            currentCell = '';
        } else {
            currentCell += char;
        }
    }
    if (currentRow.length > 0 || currentCell) {
        currentRow.push(currentCell);
        rows.push(currentRow);
    }
    return rows;
}

export async function fetchMenuData() {
    try {
        const response = await fetch(CSV_URL);
        const text = await response.text();
        const rows = parseCSV(text);

        // Remove header row
        const headers = rows.shift().map(h => h.replace(/^"|"$/g, '')); // Cleanup quotes

        // Transform to App Structure
        const data = {
            breakfast: { light: [], heavy: [] },
            lunch: { light: [], heavy: [] },
            dinner: { light: [], heavy: [] },
            extras: [],
            fruits: [],
            recipes: {}
        };

        rows.forEach(row => {
            if (row.length < 2) return;

            // Columns: Name, Category, Type, Image, Recipe, Ingredients
            const name = row[0].replace(/^"|"$/g, '');
            const category = row[1].replace(/^"|"$/g, '').toLowerCase();
            const type = row[2] ? row[2].replace(/^"|"$/g, '').toLowerCase() : '';
            const image = row[3] ? row[3].replace(/^"|"$/g, '') : '';
            const recipeUrl = row[4] ? row[4].replace(/^"|"$/g, '') : '';
            const ingredients = row[5] ? row[5].replace(/^"|"$/g, '') : '';

            const item = { name, image, ingredients, url: recipeUrl };

            // Add to Recipes map
            if (recipeUrl || image || ingredients) {
                data.recipes[name] = item;
            }

            // Sort into categories
            if (category === 'breakfast' || category === 'lunch' || category === 'dinner') {
                if (type === 'light') data[category].light.push(name);
                else if (type === 'heavy') data[category].heavy.push(name);
            } else if (category === 'side') {
                data.extras.push(name);
            } else if (category === 'fruit') {
                data.fruits.push(name);
            }
        });

        console.log('Fetched Data:', data);
        return data;

    } catch (error) {
        console.error('Error fetching sheet data:', error);
        return null;
    }
}
