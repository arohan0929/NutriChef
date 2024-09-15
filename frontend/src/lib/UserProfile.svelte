<script lang="ts">
  import { onMount } from "svelte";

  const defaultNutrientRanges = {
    carbohydrates: { min: 225, max: 325 }, // grams
    protein: { min: 60, max: 100 }, // grams
    fat: { min: 44, max: 77 }, // grams
    saturatedFat: { min: 0, max: 22 }, // grams
    fiber: { min: 25, max: 38 }, // grams
    sodium: { min: 1500, max: 2300 }, // mg
    cholesterol: { min: 0, max: 300 }, // mg
    sugar: { min: 0, max: 37.5 }, // grams
  };

  let height: number;
  let weight: number;
  let age: number;
  let sex: string = "Male"; // default value
  let activityLevel: string = "Moderate"; // default value
  let healthCondition: string = "None"; // default value
  let mealsPerDay: number = 3; // default value

  onMount(() => {
    // Fetch user data from the server here
    // and populate the form fields
    chrome.storage.local.get(["userProfile"], (result) => {
      const userProfile = result.userProfile;
      if (userProfile) {
        height = userProfile.height;
        weight = userProfile.weight;
        age = userProfile.age;
        sex = userProfile.sex;
        activityLevel = userProfile.activityLevel;
        healthCondition = userProfile.healthCondition;
        nutrientRanges = userProfile.nutrientRanges;
        mealsPerDay = userProfile.mealsPerDay;
      }
    });
  });

  let nutrientRanges = JSON.parse(JSON.stringify(defaultNutrientRanges));
  let perMealNutrientRanges = JSON.parse(JSON.stringify(nutrientRanges));



  const activityLevels = [
    "Sedentary",
    "Light",
    "Moderate",
    "Active",
    "Very active",
  ];

  const availableHealthConditions = [
    "Diabetes",
    "High Cholesterol",
    "Hypertension",
    "Obesity",
    "Heart disease",
    "Thyroid disorders",
    "None",
  ];

  const sexes = ["Male", "Female", "Non-Binary"];
  const mealOptions = [1, 2, 3, 4, 5, 6];

  function adjustNutrientRangesForHealthCondition(condition: string) {
    nutrientRanges = JSON.parse(JSON.stringify(defaultNutrientRanges));


    if (condition === "Diabetes") {
      nutrientRanges.carbohydrates.min = 130; // minimum needed for brain function
      nutrientRanges.carbohydrates.max = 180; // controlled max for blood glucose management
      nutrientRanges.fiber.min = 30; // Increase fiber for glucose control
      nutrientRanges.sugar.max = 25; // Reduce sugar intake
    } else if (condition === "High Cholesterol") {
      nutrientRanges.fat.max = 60; // Lower fat intake
      nutrientRanges.saturatedFat.max = 20; // Limit saturated fat
      nutrientRanges.cholesterol.max = 150; // Strict cholesterol limit
      nutrientRanges.fiber.min = 30; // Increase fiber to reduce LDL cholesterol
    } else if (condition === "Hypertension") {
      nutrientRanges.sodium.max = 1500; // Recommended sodium limit for hypertension
      nutrientRanges.fat.max = 70; // Limit fat, focusing on unsaturated fat
      nutrientRanges.fiber.min = 30; // Fiber helps in blood pressure regulation
    } else if (condition === "Obesity") {
      nutrientRanges.fat.max = 55; // Reduce fat to control caloric intake
      nutrientRanges.carbohydrates.min = 150; // Lower carbs for calorie reduction
      nutrientRanges.fiber.min = 30; // High fiber intake to increase satiety
    } else if (condition === "Heart Disease") {
      nutrientRanges.cholesterol.max = 150; // Strict cholesterol control
      nutrientRanges.fat.max = 60; // Limit unhealthy fat
      nutrientRanges.fiber.min = 30; // Increase fiber for heart health
    } else if (condition === "Thyroid Disorders") {
      nutrientRanges.protein.min = 60; // Increase protein for metabolism support
      nutrientRanges.fiber.min = 30; // Support digestion with fiber
    }

    perMealNutrientRanges = Object.fromEntries(
      Object.entries(nutrientRanges).map(
        ([key, value]: [string, { min: number; max: number }]) => [
          key,
          {
            min: Math.round(value.min / mealsPerDay),
            max: Math.round(value.max / mealsPerDay),
          },
        ]
      )
    );
  }

  $: adjustNutrientRangesForHealthCondition(healthCondition);

  function handleSubmit() {
    const userProfile = {
      height,
      weight,
      age,
      sex,
      activityLevel,
      healthCondition,
      nutrientRanges,
      mealsPerDay,
    };
    chrome.storage.local.set({ userProfile });
    alert("Profile saved successfully!");
  }

  function updateMealsPerDay(e){
    mealsPerDay = parseInt(e.target.value);
    perMealNutrientRanges = Object.fromEntries(
      Object.entries(nutrientRanges).map(
        ([key, value]: [string, { min: number; max: number }]) => [
          key,
          {
            min: Math.round(value.min / mealsPerDay),
            max: Math.round(value.max / mealsPerDay),
          },
        ]
      )
    );
    console.log(perMealNutrientRanges);
  }

</script>

<main>
  <h1>Create Your Profile</h1>
  <form on:submit|preventDefault={handleSubmit}>
    <label for="height">Height (cm):</label>
    <input
      type="number"
      id="height"
      bind:value={height}
      required
      min="50"
      max="300"
    />

    <label for="weight">Weight (lbs):</label>
    <input
      type="number"
      id="weight"
      bind:value={weight}
      required
      min="0"
      max="1000"
    />

    <label for="age">Age:</label>
    <input type="number" id="age" bind:value={age} required min="1" max="120" />

    <label for="sex">Sex:</label>
    <select id="sex" bind:value={sex} required>
      {#each sexes as sexOption}
        <option value={sexOption}>{sexOption}</option>
      {/each}
    </select>

    <label for="activityLevel">Activity Level:</label>
    <select id="activityLevel" bind:value={activityLevel} required>
      {#each activityLevels as level}
        <option value={level}>{level}</option>
      {/each}
    </select>

    <label for="healthCondition">Health Condition:</label>
    <select id="healthCondition" bind:value={healthCondition} required>
      {#each availableHealthConditions as condition}
        <option value={condition}>{condition}</option>
      {/each}
    </select>

    <label for="mealsPerDay">Number of Meals per Day:</label>
    <select id="mealsPerDay" required on:change={updateMealsPerDay} value={mealsPerDay}>
      {#each mealOptions as option}
        <option value={option}>{option}</option>
      {/each}
    </select>

    <hr />

    <h2>Recommended Nutrient Ranges per meal:</h2>

    <div class="label-per-meal-input">
      <p>Min Value</p>
      <p>Max Value</p>
    </div>

    <label for="proteinPerMealMin">Protein per Meal (g):</label>
    <div class="input-group">
      <input
        type="number"
        id="proteinPerMealMin"
        bind:value={perMealNutrientRanges.protein.min}
        placeholder="Min"
      />
      <input
        type="number"
        id="proteinPerMealMax"
        bind:value={perMealNutrientRanges.protein.max}
        placeholder="Max"
      />
    </div>

    <label for="carbohydratesPerMealMin">Carbohydrates per Meal (g):</label>
    <div class="input-group">
      <input
        type="number"
        id="carbohydratesPerMealMin"
        bind:value={perMealNutrientRanges.carbohydrates.min}
        placeholder="Min"
      />
      <input
        type="number"
        id="carbohydratesPerMealMax"
        bind:value={perMealNutrientRanges.carbohydrates.max}
        placeholder="Max"
      />
    </div>

    <label for="fatPerMealMin">fat per Meal (g):</label>
    <div class="input-group">
      <input
        type="number"
        id="fatPerMealMin"
        bind:value={perMealNutrientRanges.fat.min}
        placeholder="Min"
      />
      <input
        type="number"
        id="fatPerMealMax"
        bind:value={perMealNutrientRanges.fat.max}
        placeholder="Max"
      />
    </div>

    <label for="fibrePerMealMin">Fibre per Meal (g):</label>
    <div class="input-group">
      <input
        type="number"
        id="fibrePerMealMin"
        bind:value={perMealNutrientRanges.fiber.min}
        placeholder="Min"
      />
      <input
        type="number"
        id="fibrePerMealMax"
        bind:value={perMealNutrientRanges.fiber.max}
        placeholder="Max"
      />
    </div>

    <label for="sodiumPerMealMin">Sodium per Meal (mg):</label>
    <div class="input-group">
      <input
        type="number"
        id="sodiumPerMealMin"
        bind:value={perMealNutrientRanges.sodium.min}
        placeholder="Min"
      />
      <input
        type="number"
        id="sodiumPerMealMax"
        bind:value={perMealNutrientRanges.sodium.max}
        placeholder="Max"
      />
    </div>

    <label for="cholesterolPerMealMin">Cholesterol per Meal (mg):</label>
    <div class="input-group">
      <input
        type="number"
        id="cholesterolPerMealMin"
        bind:value={perMealNutrientRanges.cholesterol.min}
        placeholder="Min"
      />
      <input
        type="number"
        id="cholesterolPerMealMax"
        bind:value={perMealNutrientRanges.cholesterol.max}
        placeholder="Max"
      />
    </div>

    <label for="sugarPerMealMin">Sugar per Meal (g):</label>
    <div class="input-group">
      <input
        type="number"
        id="sugarPerMealMin"
        bind:value={perMealNutrientRanges.sugar.min}
        placeholder="Min"
      />
      <input
        type="number"
        id="sugarPerMealMax"
        bind:value={perMealNutrientRanges.sugar.max}
        placeholder="Max"
      />
    </div>

    <button class="submit-button" type="submit">Submit</button>
  </form>
</main>

<style lang="scss">
  h1 {
    text-align: center;
    margin-bottom: 1rem;
    // dark green color
  }

  h2 {
    text-align: center;
    font-size: 1.1em;
    font-weight: normal;
    margin-bottom: 1rem;
  }

  .submit-button{
    width: 50%;
    height: 50px;
    border-radius: 7px;
    background-color: #bcf4b3(0, 0%, 90%);
    border: none;
    font-size: 1.1em;
    cursor: pointer;
    padding: 5px 10px;
    font-size: 1em;
    box-sizing: border-box;
    box-shadow: 2px 2.5px 0 #598033;
    transition: ease 0.20s; // Changed 'hover' to 'transition'
    margin: 0 auto;
    display: block; /* Ensures margin: auto works */
  }
  .label-per-meal-input {
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-family: "SF Pro";
    padding: 0.875rem;
    margin-bottom: 1rem;
    width: 100%;
    height: 50px;
    border-radius: 0.5rem;
    background-color: transparent;
    border: 1px solid hsl(120, 100%, 10%);
    padding: 5px 10px;
    font-size: 1em;
    box-sizing: border-box;
    box-shadow: 0.5px 0.5px 0 #598033;
    transition: ease 0.20s;

    p {
      text-align: center;
      margin-bottom: 0;
    }
  }

  hr {
    margin: 1rem 0;
    border: 0;
    height: 1.5px;
    background-image: linear-gradient(
      to right,
      transparent,
      #05b548,
      #05b548,
      transparent
    );
  }

  button {
  width: 50%;
  height: 50px;
  border-radius: 14px;
  background-color: #bcf4b3; /* Updated line */
  border: none;
  font-size: 1.1em;
  cursor: pointer;
  padding: 5px 10px;
  font-size: 1em;
  box-sizing: border-box;
  box-shadow: 2px 2.5px 0 #598033;
  transition: ease 0.20s;
  margin: 0 auto;
}


  main {
    max-width: 500px;
    margin: 0 auto;
    padding: 1rem;
    font-family: "SF Pro";
    

    

    @media (max-width: 500px) {
      padding: 1rem;
    }

    margin-top: 2rem;
    margin-bottom: 2rem;

    border-radius: 1.75rem;
    background-color: #c6f8a530;
    box-shadow: 0 0  #598033;
    backdrop-filter: blur(5px);
    border: 1.66px solid #000;
    outline: none;

  }


  input {
    font-family: "SF Pro";
    padding: 0.875rem;
    margin-bottom: 1rem;
    width: 100%;
    height: 50px;
    border-radius: 0.5rem;
    background-color: transparent;
    border: 1px solid hsl(120, 100%, 10%);
    padding: 5px 10px;
    font-size: 1em;
    box-sizing: border-box;
    box-shadow: 0.5px 0.5px 0 #598033;
    transition: ease 0.20s;
  }

  input:focus {
    box-shadow: 4.5px 6px 0 #598035;
  }

  input:focus-visible {
    outline: none;
  }
  select {
    font-family: "SF Pro";
    padding: 0.875rem;
    margin-bottom: 1rem;
    width: 100%;
    height: 50px;
    border-radius: 0.5rem;
    background-color: transparent;
    border: 1px solid hsl(120, 100%, 10%);
    padding: 5px 10px;
    font-size: 1em;
    box-sizing: border-box;
    box-shadow: 0.5px 0.5px 0 #598035;
    transition: ease 0.20s;
  }

  select:focus {
    box-shadow: 4.5px 6px 0 #598035;
  }

  select:focus-visible {
    outline: none;
  }
  option {
    font-size: 1em;
  }
  .input-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;

    input {
      width: unset;
    }
  }

  label {
    margin-bottom: 5rem;
  }
</style>
