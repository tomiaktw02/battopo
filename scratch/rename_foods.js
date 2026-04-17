const fs = require('fs');
const path = require('path');
const FOOD_DATA = require('./foods_config.js');

const imagesDir = path.join(__dirname, 'images', 'foods');
const files = fs.readdirSync(imagesDir);

// Flat map of all foods: zh -> id
const zhToId = {};
Object.values(FOOD_DATA).forEach(category => {
    category.forEach(food => {
        zhToId[food.zh] = food.id;
    });
});

// Special cases for slight variations in filenames
zhToId['甜椒'] = 'bellpepper';
zhToId['紫蘇葉'] = 'perilla';
zhToId['海苔'] = 'seaweed';

files.forEach(file => {
    if (!file.endsWith('.png')) return;
    
    // Extract Chinese part
    // Format is like "001.稻米.png" or "057甜椒.png"
    let zhPart = '';
    const match = file.match(/\d+[.．]?([^.]+)\.png/);
    if (match) {
        zhPart = match[1];
    }

    if (zhPart && zhToId[zhPart]) {
        const oldPath = path.join(imagesDir, file);
        const newPath = path.join(imagesDir, `${zhToId[zhPart]}.png`);
        console.log(`Renaming: ${file} -> ${zhToId[zhPart]}.png`);
        fs.renameSync(oldPath, newPath);
    } else {
        console.log(`Skipping: ${file} (No match for "${zhPart}")`);
    }
});
