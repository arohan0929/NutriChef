<script lang="ts">
  let height: number;
  let weight: number;
  let age: number;
  let sex: string = "Male"; // default value
  let activityLevel: string = "sedentary"; // default value
  let healthConditions: string[] = [];
  let mealsPerDay: number = 3; // default value

  const activityLevels = [
    "sedentary",
    "light",
    "moderate",
    "active",
    "very active",
  ];

  const availableHealthConditions = [
    "Diabetes",
    "High Cholesterol",
    "Hypertension",
    "Obesity",
    "Heart disease",
    "Thyroid disorders",
    "None"
  ];

  const sexes = ["Male", "Female", "Non-Binary"];
  const mealOptions = [1, 2, 3, 4, 5, 6];

  let proteinPerMealMin: number = 0;
  let proteinPerMealMax: number = 100;
  let carbohydratesPerMealMin: number = 0;
  let carbohydratesPerMealMax: number = 100;
  let fatsPerMealMin: number = 0;
  let fatsPerMealMax: number = 100;
  let fibrePerMealMin: number = 0;
  let fibrePerMealMax: number = 100;

  function handleCheckboxChange(event: Event, condition: string) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      healthConditions = [...healthConditions, condition];
    } else {
      healthConditions = healthConditions.filter(c => c !== condition);
    }
  }

  function handleSubmit() {
    // Process form data here
    console.log({
      height,
      weight,
      age,
      sex,
      activityLevel,
      healthConditions,
      mealsPerDay,
      proteinPerMealMin,
      proteinPerMealMax,
      carbohydratesPerMealMin,
      carbohydratesPerMealMax,
      fatsPerMealMin,
      fatsPerMealMax,
      fibrePerMealMin,
      fibrePerMealMax
    });
  }
</script>

<style lang="scss">
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 400px;
    margin: auto;
  }

  label {
    font-weight: bold;
  }

  input, select {
    padding: 0.5rem;
    font-size: 1rem;
  }

  .input-group {
    display: flex;
    gap: 0.5rem;
  }

  button {
    padding: 0.5rem;
    font-size: 1rem;
    background-color: #007BFF;
    color: white;
    border: none;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }
</style>

<main>
  <h1>Create Your Health Profile</h1>
  <form on:submit|preventDefault={handleSubmit}>
    <label for="height">Height (cm):</label>
    <input type="number" id="height" bind:value={height} required min="50" max="300" />

    <label for="weight">Weight (kg):</label>
    <input type="number" id="weight" bind:value={weight} required min="10" max="300" />

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

    <label>Health Conditions:</label>
    {#each availableHealthConditions as condition}
      <div>
        <input type="checkbox" value={condition} on:change={(e) => handleCheckboxChange(e, condition)} />
        <label>{condition}</label>
      </div>
    {/each}

    <label for="mealsPerDay">Number of Meals per Day:</label>
    <select id="mealsPerDay" bind:value={mealsPerDay} required>
      {#each mealOptions as option}
        <option value={option}>{option}</option>
      {/each}
    </select>

    <label for="proteinPerMealMin">Protein per Meal (g):</label>
    <div class="input-group">
      <input type="number" id="proteinPerMealMin" bind:value={proteinPerMealMin} min="0" max="100" placeholder="Min" />
      <input type="number" id="proteinPerMealMax" bind:value={proteinPerMealMax} min="0" max="100" placeholder="Max" />
    </div>

    <label for="carbohydratesPerMealMin">Carbohydrates per Meal (g):</label>
    <div class="input-group">
      <input type="number" id="carbohydratesPerMealMin" bind:value={carbohydratesPerMealMin} min="0" max="100" placeholder="Min" />
      <input type="number" id="carbohydratesPerMealMax" bind:value={carbohydratesPerMealMax} min="0" max="100" placeholder="Max" />
    </div>

    <label for="fatsPerMealMin">Fats per Meal (g):</label>
    <div class="input-group">
      <input type="number" id="fatsPerMealMin" bind:value={fatsPerMealMin} min="0" max="100" placeholder="Min" />
      <input type="number" id="fatsPerMealMax" bind:value={fatsPerMealMax} min="0" max="100" placeholder="Max" />
    </div>

    <label for="fibrePerMealMin">Fibre per Meal (g):</label>
    <div class="input-group">
      <input type="number" id="fibrePerMealMin" bind:value={fibrePerMealMin} min="0" max="100" placeholder="Min" />
      <input type="number" id="fibrePerMealMax" bind:value={fibrePerMealMax} min="0" max="100" placeholder="Max" />
    </div>

    <button type="submit">Submit</button>
  </form>
</main>