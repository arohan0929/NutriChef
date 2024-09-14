<script lang="ts">
  let height: number;
  let weight: number;
  let age: number;
  let activityLevel: string = "sedentary"; // default value
  let healthConditions: string[] = [];

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
    "None",
  ];

  function handleCheckboxChange(event: Event, condition: string) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      healthConditions = [...healthConditions, condition];
    } else {
      healthConditions = healthConditions.filter((c) => c !== condition);
    }
  }

  function handleSubmit() {
    // Process form data here
    console.log({
      height,
      weight,
      age,
      activityLevel,
      healthConditions,
    });
  }
</script>

<main>
  <h1>Create Your Health Profile</h1>
  <form on:submit|preventDefault={handleSubmit}>
    <label>Height (cm):</label>
    <input type="number" bind:value={height} required min="50" max="300" />

    <label>Weight (kg):</label>
    <input type="number" bind:value={weight} required min="10" max="300" />

    <label>Age:</label>
    <input type="number" bind:value={age} required min="1" max="120" />

    <label>Activity Level:</label>
    <select bind:value={activityLevel} required>
      {#each activityLevels as level}
        <option value={level}>{level}</option>
      {/each}
    </select>

    <label>Health Conditions:</label>
    {#each availableHealthConditions as condition}
      <div>
        <input
          type="checkbox"
          value={condition}
          on:change={(e) => handleCheckboxChange(e, condition)}
        />
        <label>{condition}</label>
      </div>
    {/each}

    <button type="submit">Submit</button>
  </form>
</main>
