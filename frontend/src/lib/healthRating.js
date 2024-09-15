export function calculateHealthScore(ingredients, servings) {

  if (!servings) {
    servings = 1;
  }


  let nutrientRanges = {
    carbohydrates: { min: 225, max: 325 }, // grams
    protein: { min: 50, max: 175 }, // grams
    fat: { min: 44, max: 77 }, // grams
    saturatedFat: { min: 0, max: 22 }, // grams
    fiber: { min: 2, max: 10 }, // grams
    sodium: { min: 1500, max: 2300 }, // mg
    cholesterol: { min: 0, max: 300 }, // mg
    sugar: { min: 10, max: 15.5 }, // grams
  };
 
// standarize
  let recipeNutrients = {
    calories: 0,
    fat: 0,
    saturatedFat: 0,
    cholesterol: 0,
    sodium: 0,
    carbohydrates: 0,
    fiber: 0,
    sugar: 0,
    protein: 0,
  };


  ingredients.forEach((element) => {
    recipeNutrients.calories += element.calor;
    recipeNutrients.fat += element.fat;
    recipeNutrients.saturatedFat += element.saturatedFat;
    recipeNutrients.cholesterol += element.cholesterol;
    recipeNutrients.sodium += element.sodium;
    recipeNutrients.carbohydrates += element.carbohydrates;
    recipeNutrients.fiber += element.fiber;
    recipeNutrients.sugar += element.sugars;
    recipeNutrients.protein += element.protein;
  });



  // divide by servings using a loop and make sure it is anumber
  for (const key in recipeNutrients) {
    recipeNutrients[key] = recipeNutrients[key] / servings;
  }

  

  let score = {
    carbohydrates: 100,
    protein: 100,
    fat: 100,
    saturatedFat: 100,
    fiber: 100,
    sodium: 100,
    cholesterol: 100,
    sugar: 100,
  };

  console.log(recipeNutrients);
  

  const nutrientKeys = Object.keys(nutrientRanges);

  nutrientKeys.forEach((nutrient) => {
    const { min, max } = nutrientRanges[nutrient];
    const value = recipeNutrients[nutrient];
    console.log(nutrient, value);
    

    // Calculate percentage deviations from the optimal ranges
    const maxThreshold = max + 0.08 * max;
    const minThreshold = min - 0.08 * min;

    switch (nutrient) {
      case "carbohydrates":
        // Carbs must be within the range

        if (value < minThreshold) {
          const offBy = Math.abs((value - min) / min);
          score.carbohydrates -= offBy * 100; // Reduce score proportionally
        } else if (value > maxThreshold) {
          const offBy = Math.abs((value - max) / max);
          score.carbohydrates -= offBy * 100; // Reduce score proportionally
        }

        break;

      case "protein":
        
        // More protein is better (can exceed max)
        if (value > minThreshold && value < maxThreshold) {
          score.protein =
            ((value - minThreshold) / (maxThreshold - minThreshold)) * 50 +
            50;
        } else if (value > maxThreshold) {
          score.protein = 100;
        } else if (value < minThreshold) {
          console.log("min", minThreshold);
          console.log("value", value);
          
          const offBy = Math.abs((value - minThreshold) / minThreshold);
          console.log("offBy", offBy);
          
          score.protein = (50 - offBy * 100) < 0 ? 0 : (50 - offBy * 100);
        }
        break;

      case "fats":
        // less fat is better (can be below min)
        if (value > minThreshold && value < maxThreshold) {
          score.fat =
            ((value - maxThreshold) / (minThreshold - maxThreshold)) * 50 +
            50;
        } else if (value > maxThreshold) {
          const offBy = Math.abs((value - max) / max);
          score.fat = (50 - offBy * 100) < 0 ? 0 : (50 - offBy * 100);
        } else if (value < minThreshold) {
          score.fat = 100;
        }
        break;

      case "saturatedFat":
        // less saturated fat is better (can be below min)
        if (value > minThreshold && value < maxThreshold) {
          score.saturatedFat =
            ((value - maxThreshold) / (minThreshold - maxThreshold)) * 50 +
            50;
        } else if (value > maxThreshold) {
          const offBy = Math.abs((value - max) / max);
          score.saturatedFat = (50 - offBy * 100) < 0 ? 0 : (50 - offBy * 100);
        } else if (value < minThreshold) {
          score.saturatedFat = 100;
        }
        break;

      case "fiber":
        // Fiber more is better (can exceed max)
        if (value > minThreshold && value < maxThreshold) {
          score.fiber =
            ((value - minThreshold) / (maxThreshold - minThreshold)) * 50 +
            50;
        } else if (value > maxThreshold) {
          score.fiber = 100;
        } else if (value < minThreshold) {
          const offBy = Math.abs((value - min) / min);
          score.fiber = (50 - offBy * 100) < 0 ? 0 : (50 - offBy * 100);
        }
        break;

      case "sodium":
        //less sodium is better (can be below min)
        if (value > minThreshold && value < maxThreshold) {
          score.sodium =
            ((value - maxThreshold) / (minThreshold - maxThreshold)) * 50 +
            50;
        } else if (value > maxThreshold) {
          const offBy = Math.abs((value - max) / max);
          score.sodium = (50 - offBy * 100) < 0 ? 0 : (50 - offBy * 100);
        } else if (value < minThreshold) {
          score.sodium = 100;
        }
        break;

      case "cholesterol":
        // less cholesterol is better (can be below min)
        if (value > minThreshold && value < maxThreshold) {
          score.cholesterol =
            ((value - maxThreshold) / (minThreshold - maxThreshold)) * 50 +
            50;
        } else if (value > maxThreshold) {
          const offBy = Math.abs((value - maxThreshold) / maxThreshold);
          score.cholesterol = (50 - offBy * 100) < 0 ? 0 : (50 - offBy * 100);
        } else if (value < minThreshold) {
          score.cholesterol = 100;
        }
        break;

      case "sugar":
        // less sugar is better (can be below min)
        if (value > minThreshold && value < maxThreshold) {
          score.sugar =
            ((value - maxThreshold) / (minThreshold - maxThreshold)) * 50 +
            50;
        } else if (value > maxThreshold) {
          const offBy = Math.abs((value - maxThreshold) / maxThreshold);
          score.sugar = (50 - offBy * 100) < 0 ? 0 : (50 - offBy * 100);
        } else if (value < minThreshold) {
          score.sugar = 100;
        }
        break;

      default:
        break;
    }
  });




  const averageScore = Object.values(score).reduce((a, b) => a + b, 0) / 9;
  return {
    score,
    averageScore,
  };

}