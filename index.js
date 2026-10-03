import { Command } from 'commander';
import fs from 'fs';

const program = new Command();

program
  .name('restaurant-cli')
  .description('CLI application for managing and analyzing a restaurant menu')
  .version('1.0.0')
  .option('-f, --file <path>', 'path to the menu JSON file', 'data.json');

function loadMenu(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File at path "${filePath}" does not exist.`);
      process.exit(1);
    }
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(rawData);
    
    if (!parsed.restaurant_menu || !Array.isArray(parsed.restaurant_menu.categories)) {
      console.error('Error: Invalid JSON structure. Missing "restaurant_menu.categories" property.');
      process.exit(1);
    }
    return parsed.restaurant_menu;
  } catch (error) {
    console.error('Error: Failed to read file or JSON contains syntax errors.');
    process.exit(1);
  }
}

function getAllDishes(menu) {
  const allDishes = [];
  menu.categories.forEach(cat => {
    if (Array.isArray(cat.dishes)) {
      cat.dishes.forEach(dish => {
        allDishes.push({ ...dish, category_name: cat.category_name });
      });
    }
  });
  return allDishes;
}

// Command list
program
  .command('list')
  .description('Display a concise list of all dishes in the menu')
  .option('-l, --limit <number>', 'limit the number of displayed dishes', parseInt)
  .action((options) => {
    const menu = loadMenu(program.opts().file);
    const dishes = getAllDishes(menu);
    
    if (dishes.length === 0) {
      console.log('The menu is empty.');
      return;
    }

    let limit = options.limit || dishes.length;
    if (options.limit && isNaN(options.limit)) {
      console.error('Error: Limit value must be a valid number.');
      process.exit(1);
    }

    console.log(`--- Brief Dishes List (Total: ${dishes.length}, Displayed: ${Math.min(limit, dishes.length)}) ---`);
    dishes.slice(0, limit).forEach((dish, index) => {
      console.log(`${index + 1}. [${dish.category_name}] ${dish.name} — ${dish.price} ${menu.currency || 'USD'}`);
    });
  });

//Command dish
program
  .command('dish <name>')
  .description('Display detailed information about a single dish by its name')
  .action((name) => {
    const menu = loadMenu(program.opts().file);
    const dishes = getAllDishes(menu);
    const dish = dishes.find(d => d.name.toLowerCase() === name.toLowerCase());

    if (!dish) {
      console.error(`Error: Dish named "${name}" was not found in the menu.`);
      process.exit(1);
    }

    console.log(`\n🍲 Dish details: ${dish.name}`);
    console.log(`Category:   ${dish.category_name}`);
    console.log(`Price:      ${dish.price} ${menu.currency}`);
    console.log(`Weight:     ${dish.weight_g} g`);
    console.log(`Spicy:      ${dish.spicy ? 'Yes 🌶️' : 'No'}`);
    console.log(`Vegetarian: ${dish.vegetarian ? 'Yes 🌱' : 'No'}`);
    console.log(`Ingredients:${dish.ingredients.join(', ')}`);
  });

program.parse(process.argv);
