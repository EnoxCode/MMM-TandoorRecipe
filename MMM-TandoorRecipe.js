Module.register("MMM-TandoorRecipe", {
  defaults: {
    width: "100%",
    height: "100%",
    volume: 100,
    suspended: false,
    showOnlyWhileRecipe: false,
    tandoorHostname: "",
    tandoorBearerToken: "",
  },

  getStyles: function () {
    return ["MMM-TandoorRecipe.css"]
  },

  start: function () {
    this.suspended = false
    this.openRecipe = false
    this.retrieveRecipe({ id: 7 })

  },
  getCommands: function (commander) {

  },



  getDom: function () {
    var dom = document.createElement("div")
    dom.id = "TANDOOR"
    if (this.config.showOnlyWhileRecipe) dom.style.display = "none"
    dom.style.width = this.config.width
    dom.style.height = this.config.height
    return dom
  },

  suspend: function () {
    this.suspended = true
  },

  resume: function () {
    this.suspended = false
  },

  notificationReceived: function (noti, payload) {
    if (noti == "DOM_OBJECTS_CREATED") {
      this.prepare()
    }
    if (noti == "RECIPE_LOAD") {
      this.retrieveRecipe(payload)
      console.log("RECIPE_LOAD", payload);
    }
    if (noti == "RECIPE_NEXT_STEP") {
      this.nextStep()
    }
    if (noti == "RECIPE_PREV_STEP") {
      this.previousStep()
    }
    if (noti == "RECIPE_TIMER") {
      this.setTimer()
    }
  },

  retrieveRecipe: function (payload) {
    this.fetchRecipe(payload.id);
  },

  fetchRecipe: function (id) {
    fetch(this.config.tandoorHostname + '/api/recipe/' + id, {
      headers: {
        'Authorization': 'Bearer ' + this.config.tandoorBearerToken
      }
    })
      .then(response => response.json())
      .then(data => {
        this.recipeContent = data;
        this.recipeStep = 0;
        this.showRecipe();
      })
      .catch(error => {
        console.error('Error fetching recipe:', error);
      });
  },

  nextStep: function () {
    // Find the current step div and remove the highlight class
    var currentStepDiv = document.getElementById("step-" + this.recipeStep);
    if (currentStepDiv) {
      currentStepDiv.classList.remove("step-highlight");
      // currentStepDiv.classList.add("step-complete");
    }

    // Increase the recipeStep by one
    this.recipeStep += 1;

    // Find the next step div and add the highlight class
    var nextStepDiv = document.getElementById("step-" + this.recipeStep);
    if (nextStepDiv) {
      nextStepDiv.classList.add("step-highlight");
      this.showCurrentStep();
    }
  },

  previousStep: function () {
    // Find the current step div and remove the highlight class
    var currentStepDiv = document.getElementById("step-" + this.recipeStep);
    if (currentStepDiv) {
      currentStepDiv.classList.remove("step-highlight");
      // currentStepDiv.classList.add("step-complete");
    }

    // Decrease the recipeStep by one
    this.recipeStep = this.recipeStep - 1;

    // Find the previous step div and add the highlight class
    var nextStepDiv = document.getElementById("step-" + this.recipeStep);
    if (nextStepDiv) {
      nextStepDiv.classList.add("step-highlight");
      // nextStepDiv.classList.remove("step-complete");
      this.showCurrentStep();
    }
  },

  setTimer: function () {
    let currentStepDiv = document.getElementById("step-" + this.recipeStep);
    let timer = currentStepDiv.attributes["timer"];
    let title = currentStepDiv.attributes["title"] || "Step " + this.recipeStep;
    console.log("Timer: ", timer);
    this.sendNotification("COOKING_TIMER_ADD", { name: "step-" + this.recipeStep, title: title, timeInSeconds: timer * 60 });
  },

  showRecipe: function () {
    let recipeData = this.recipeContent;
    var dom = document.getElementById("TANDOOR");
    dom.style.display = "block";

    // Remove existing recipe elements
    var existingRecipe = document.getElementById("TANDOOR_RECIPE");
    if (existingRecipe) {
      dom.removeChild(existingRecipe);
    }

    var recipeContainer = document.createElement("div");
    recipeContainer.id = "TANDOOR_RECIPE";

    // Header div
    var headerDiv = document.createElement("div");
    headerDiv.className = "recipe-header";

    // Title div
    var titleDiv = document.createElement("div");
    titleDiv.className = "recipe-title";
    titleDiv.innerText = recipeData.name;
    headerDiv.appendChild(titleDiv);

    // Image div
    var imageDiv = document.createElement("div");
    imageDiv.className = "recipe-image";
    var img = document.createElement("img");
    img.src = recipeData.image;
    imageDiv.appendChild(img);
    headerDiv.appendChild(imageDiv);

    recipeContainer.appendChild(headerDiv);

    var stepInstructionContainer = document.createElement("div");
    stepInstructionContainer.id = "step-instructions";
    stepInstructionContainer.className = "recipe-instructions";

    recipeContainer.appendChild(stepInstructionContainer);

    // Divs for each step
    var stepContainer = document.createElement("div");
    stepContainer.className = "recipe-steps";
    recipeData.steps.forEach((step, index) => {
      let stepDiv = document.createElement("div");
      stepDiv.className = "recipe-step";
      // add step-highlight class if index = 0
      if (index === 0) {
        stepDiv.classList.add("step-highlight");
      }
      stepDiv.id = "step-" + (index);
      stepDiv.innerText = "Step " + (index + 1) + ": " + step.name;
      stepContainer.appendChild(stepDiv);
    });

    recipeContainer.appendChild(stepContainer);
    dom.appendChild(recipeContainer);

    this.showCurrentStep();
  },
  showCurrentStep: function () {
    let currentStep = this.recipeContent.steps[this.recipeStep];
    var stepContainer = document.getElementById("step-instructions");
    stepContainer.innerText = currentStep.instruction;

    // // Ingredients div
    // var ingredientsDiv = document.createElement("div");
    // ingredientsDiv.className = "recipe-ingredients";

    // // recipeData.ingredients.forEach(ingredient => {
    // //     var ingredientDiv = document.createElement("div");
    // //     ingredientDiv.className = "ingredient";

    // //     var amountDiv = document.createElement("div");
    // //     amountDiv.className = "ingredient-amount";
    // //     amountDiv.innerText = ingredient.amount + " " + ingredient.unit.name;

    // //     var foodDiv = document.createElement("div");
    // //     foodDiv.className = "ingredient-food";
    // //     foodDiv.innerText = ingredient.food.name;

    // //     ingredientDiv.appendChild(amountDiv);
    // //     ingredientDiv.appendChild(foodDiv);
    // //     ingredientsDiv.appendChild(ingredientDiv);
    // // });

    // recipeContainer.appendChild(ingredientsDiv);

    // // Instructions div
    // var instructionsDiv = document.createElement("div");
    // instructionsDiv.className = "recipe-instructions";

    // recipeData.steps.forEach((step, index) => {
    //     var stepContainer = document.createElement("div");
    //     stepContainer.className = "recipe-step";
    //     stepContainer.id = "step-" + (index + 1);
    //     stepContainer.attributes["timer"] = step.time;
    //     stepContainer.attributes["title"] = step.name;

    //     if (this.recipeStep === index + 1) {
    //         stepContainer.classList.add("step-highlight");
    //     }

    //     var stepTitleDiv = document.createElement("div");
    //     stepTitleDiv.className = "step-title";
    //     stepTitleDiv.innerText = "Step " + (index + 1);
    //     stepContainer.appendChild(stepTitleDiv);

    //     var descriptionDiv = document.createElement("div");
    //     descriptionDiv.className = "step-description";
    //     descriptionDiv.innerText = step.instruction;
    //     stepContainer.appendChild(descriptionDiv);

    //     instructionsDiv.appendChild(stepContainer);
    // });

    // recipeContainer.appendChild(instructionsDiv);

    // // Steps carousel div
    // var stepsCarouselDiv = document.createElement("div");
    // stepsCarouselDiv.className = "steps-carousel";

    // recipeData.steps.forEach((step, index) => {
    //     var stepIndicator = document.createElement("div");
    //     stepIndicator.className = "step-indicator";
    //     stepIndicator.id = "indicator-" + (index + 1);

    //     if (this.recipeStep === index + 1) {
    //         stepIndicator.classList.add("indicator-highlight");
    //     }

    //     stepsCarouselDiv.appendChild(stepIndicator);
    // });

    // recipeContainer.appendChild(stepsCarouselDiv);
  },
  prepare: function () {
  },
})
