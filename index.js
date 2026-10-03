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

program.parse(process.argv);
