// Small built-in starter meal library (Phase 1, no AI).
// diets: which diet keys a meal is suitable for.
// contains: allergen tags used to filter out conflicts.
// slot: breakfast | lunch | snack | dinner.

export const MEALS = [
  // Breakfast
  { name: 'Greek yogurt + berries + oats', slot: 'breakfast', diets: ['omnivore','vegetarian','eggetarian','pescatarian'], contains: ['Dairy'] },
  { name: 'Veggie omelette + toast', slot: 'breakfast', diets: ['omnivore','vegetarian','eggetarian','pescatarian'], contains: ['Eggs','Wheat/Gluten'] },
  { name: 'Tofu scramble + sourdough', slot: 'breakfast', diets: ['omnivore','vegetarian','vegan','pescatarian'], contains: ['Soy','Wheat/Gluten'] },
  { name: 'Overnight oats + chia + banana', slot: 'breakfast', diets: ['omnivore','vegetarian','vegan','eggetarian','pescatarian'], contains: [] },
  { name: 'Moong dal chilla + chutney', slot: 'breakfast', diets: ['omnivore','vegetarian','vegan','eggetarian','pescatarian'], contains: [] },

  // Lunch
  { name: 'Grilled chicken + quinoa + greens', slot: 'lunch', diets: ['omnivore'], contains: [] },
  { name: 'Salmon + brown rice + broccoli', slot: 'lunch', diets: ['omnivore','pescatarian'], contains: ['Fish'] },
  { name: 'Chickpea + paneer bowl', slot: 'lunch', diets: ['omnivore','vegetarian','eggetarian'], contains: ['Dairy'] },
  { name: 'Lentil + veg buddha bowl', slot: 'lunch', diets: ['omnivore','vegetarian','vegan','eggetarian','pescatarian'], contains: [] },
  { name: 'Rajma + rice + salad', slot: 'lunch', diets: ['omnivore','vegetarian','vegan','eggetarian','pescatarian'], contains: [] },

  // Snack
  { name: 'Apple + peanut butter', slot: 'snack', diets: ['omnivore','vegetarian','vegan','eggetarian','pescatarian'], contains: ['Peanuts'] },
  { name: 'Roasted chana + buttermilk', slot: 'snack', diets: ['omnivore','vegetarian','eggetarian'], contains: ['Dairy'] },
  { name: 'Hummus + carrot sticks', slot: 'snack', diets: ['omnivore','vegetarian','vegan','eggetarian','pescatarian'], contains: ['Sesame'] },
  { name: 'Mixed nuts + fruit', slot: 'snack', diets: ['omnivore','vegetarian','vegan','eggetarian','pescatarian'], contains: ['Tree nuts'] },
  { name: 'Boiled eggs + cucumber', slot: 'snack', diets: ['omnivore','eggetarian','pescatarian'], contains: ['Eggs'] },

  // Dinner
  { name: 'Stir-fried tofu + veg + rice', slot: 'dinner', diets: ['omnivore','vegetarian','vegan','pescatarian'], contains: ['Soy'] },
  { name: 'Grilled fish + sweet potato', slot: 'dinner', diets: ['omnivore','pescatarian'], contains: ['Fish'] },
  { name: 'Chicken curry + millet', slot: 'dinner', diets: ['omnivore'], contains: [] },
  { name: 'Palak paneer + roti', slot: 'dinner', diets: ['omnivore','vegetarian','eggetarian'], contains: ['Dairy','Wheat/Gluten'] },
  { name: 'Veg + bean chilli', slot: 'dinner', diets: ['omnivore','vegetarian','vegan','eggetarian','pescatarian'], contains: [] }
];

// Pick up to `count` meals for a slot matching the diet and avoiding allergens.
export function pickMeals(slot, diet, allergies = [], count = 3) {
  const avoid = new Set(allergies);
  return MEALS
    .filter((m) => m.slot === slot)
    .filter((m) => m.diets.includes(diet))
    .filter((m) => !m.contains.some((c) => avoid.has(c)))
    .slice(0, count)
    .map((m) => m.name);
}
