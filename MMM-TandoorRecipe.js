Module.register("MMM-TandoorRecipe", {
    defaults: {
      width: "150%",
      height: "100%",
      volume: 100,
      tandoorHostname: "",
      tandoorBearerToken: "",
    },
  
    getStyles: function() {
      return ["MMM-TandoorRecipe.css"]
    },
  
    start: function() {
      this.suspended = false
      this.openRecipe = false
      this.recipeStep = 1
  
    },
    getCommands: function(commander) {

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
    //   var ret = this.controlPlayer("getPlayerState")
    //   if (ret == 1) {
    //     this.controlPlayer("pauseVideo")
    //   }
    },
  
    resume: function () {
      this.suspended = false
    //   var ret = this.controlPlayer("getPlayerState")
    //   if (ret == 1) {
    //     this.controlPlayer("playVideo")
    //   }
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
    },

    retrieveRecipe: function(payload) {
        this.fetchRecipe(payload.id);
    },
  
    fetchRecipe: function(id) {
        fetch(this.config.tandoorHostname+ '/api/recipe/'+id, {
            headers: {
                'Authorization': 'Bearer ' + this.config.tandoorBearerToken
            }
        })
        .then(response => response.json())
        .then(data => {
            this.showRecipe(data);
        })
        .catch(error => {
            console.error('Error fetching recipe:', error);
        });
    },

    nextStep: function() {
        // Find the current step div and remove the highlight class
        var currentStepDiv = document.getElementById("step-" + this.recipeStep);
        if (currentStepDiv) {
            currentStepDiv.classList.remove("step-highlight");
            currentStepDiv.classList.add("step-complete");
        }
    
        // Increase the recipeStep by one
        this.recipeStep += 1;
    
        // Find the next step div and add the highlight class
        var nextStepDiv = document.getElementById("step-" + this.recipeStep);
        if (nextStepDiv) {
            nextStepDiv.classList.add("step-highlight");
        }
    },

    previousStep: function() {
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
            nextStepDiv.classList.remove("step-complete");
        }
    },

    showRecipe: function(recipeData) {
        this.recipeStep = 1;
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
    
        // Steps div
        var stepsDiv = document.createElement("div");
        stepsDiv.className = "recipe-steps";
    
        recipeData.steps.forEach((step, index) => {
            // Step container div
            var stepContainer = document.createElement("div");
            stepContainer.className = "recipe-step";
            stepContainer.id = "step-" + (index + 1);

            // Add step-highlight class if currentStep is the same as the step index
            if (this.recipeStep === index + 1) {
                stepContainer.classList.add("step-highlight");
            }            

            // row div
            var columnsDiv = document.createElement("div");
            columnsDiv.className = "step-rows";
            
            // Step title div
            var stepTitleDiv = document.createElement("div");
            stepTitleDiv.className = "step-title";
            stepTitleDiv.innerText = "Step " + (index + 1);
            columnsDiv.appendChild(stepTitleDiv);
    
            // Ingredients div
            var ingredientsDiv = document.createElement("div");
            ingredientsDiv.className = "step-ingredients";
            // ingredientsDiv.innerText = "Ingredients: ";
            
            step.ingredients.forEach(ingredient => {
                var ingredientDiv = document.createElement("div");
                ingredientDiv.className = "ingredient";

                var amountDiv = document.createElement("div");
                amountDiv.className = "ingredient-amount";
                amountDiv.innerText = ingredient.amount + " " + ingredient.unit.name;

                var foodDiv = document.createElement("div");
                foodDiv.className = "ingredient-food";
                foodDiv.innerText = ingredient.food.name;

                ingredientDiv.appendChild(amountDiv);
                ingredientDiv.appendChild(foodDiv);
                ingredientsDiv.appendChild(ingredientDiv);
            });

            columnsDiv.appendChild(ingredientsDiv);
            stepContainer.appendChild(columnsDiv);

            // Description div
            var descriptionDiv = document.createElement("div");
            descriptionDiv.className = "step-description";
            descriptionDiv.innerText = step.instruction;
            stepContainer.appendChild(descriptionDiv);

            stepsDiv.appendChild(stepContainer);
        });
    
        recipeContainer.appendChild(stepsDiv);
        dom.appendChild(recipeContainer);
    },
    prepare: function() {
    },
  })
