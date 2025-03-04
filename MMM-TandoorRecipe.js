Module.register("MMM-TandoorRecipe", {
    defaults: {
      defaultQuality: "default",
      width: "150%",
      height: "100%",
      volume: 100,
      disableCC: true,
      tandoorHostname: "",
      tandoorBearerToken: "",
      showOnlyWhileRecipe: true,
      onStartPlay: null,
      defaultLoop: false,
      defaultShuffle: false,
      defaultAutoplay: true,
      verbose:true,
      telegramBotCommand: {
        YOUTUBE_LOAD_BY_URL: "yt",
        YOUTUBE_LOAD_PLAYLIST: "yl",
        YOUTUBE_CONTROL: "yc"
      },
      outNotifications: {
        "-1": "UNSTARTED",
        "0": "ENDED",
        "1": "PLAYING",
        "2": "PAUSED",
        "3": "BUFFERING",
        "5": "VIDEO CUED",
      }
    },
  
    getStyles: function() {
      return ["MMM-TandoorRecipe.css"]
    },
  
    start: function() {
    //   this.isYoutubeReady = false
    //   this.YTPlayer = null
      this.suspended = false
      this.openRecipe = false
      this.recipeStep = 1
    //   this.list = false
    //   this.videoLoop = this.config.defaultLoop
    //   this.videoShuffle = this.config.defaultShuffle
    //   this.videoAutoplay = this.config.defaultAutoplay
  
    },
    getCommands: function(commander) {
    //   commander.add({
    //     command: this.config.telegramBotCommand.YOUTUBE_LOAD_BY_URL,
    //     description: "Play youtube clip by url",
    //     callback: "T_yt"
    //   })
    //   commander.add({
    //     command: this.config.telegramBotCommand.YOUTUBE_LOAD_PLAYLIST,
    //     description: "Play youtube playlist by ID",
    //     callback: "T_yl"
    //   })
    //   commander.add({
    //     command: this.config.telegramBotCommand.YOUTUBE_CONTROL,
    //     description: "Youutube player control - https://developers.google.com/youtube/iframe_api_reference#Functions",
    //     callback: "T_yc"
    //   })
    },
  
    // T_yt: function(command, handler) {
    //   if (handler.args) {
    //     this.loadVideo({type:"url", id:handler.args, autoplay:true})
    //   } else {
    //     this.loadVideo(this.config.onStartPlay)
    //   }
    // },
  
    // T_yl: function(command, handler) {
    //   if (handler.args) {
    //     this.loadVideo({type:"playlist", id:handler.args, autoplay:true})
    //   } else {
    //     this.loadVideo(this.config.onStartPlay)
    //   }
    // },
  
    // T_yc: function(command, handler) {
    //   if (!handler.args) {
    //     handler.reply("TEXT", "E: Action Required.")
    //     return
    //   }
    //   var param = handler.args.split(" ")
    //   var ret = this.controlPlayer(param[0], param[1])
    //   if (ret) handler.reply("TEXT", ret.toString())
    // },
  
  
  
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

    //   if (noti == "YOUTUBE_CONTROL") {
    //     /*
    //       {
    //         command: "playVideo",
    //         param: {},
    //         callback: (ret)=<{}
    //       }
    //     */
    //     var ret = this.controlPlayer(payload.command, payload.param)
    //     if (typeof payload.callback == "function") payload.callback(ret)
    //   }
    },

    retrieveRecipe: function(payload) {
        this.fetchRecipe(payload.id);
    },
  
    fetchRecipe: function(id) {
        fetch(this.tandoorHostname+ '/api/recipe/'+id, {
            headers: {
                'Authorization': 'Bearer ' + this.tandoorBearerToken
            }
        })
        .then(response => response.json())
        .then(data => {
            // console.log('Recipe data:', data);
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

    // Ingredients{
    //     "id": 17,
    //     "food": {
    //         "id": 16,
    //         "name": "whole black peppercorns",
    //         "plural_name": null,
    //         "description": "",
    //         "recipe": null,
    //         "url": "",
    //         "properties": [],
    //         "properties_food_amount": 100.0,
    //         "properties_food_unit": null,
    //         "fdc_id": null,
    //         "food_onhand": false,
    //         "supermarket_category": null,
    //         "parent": null,
    //         "numchild": 0,
    //         "inherit_fields": [],
    //         "full_name": "whole black peppercorns",
    //         "ignore_shopping": false,
    //         "substitute": [],
    //         "substitute_siblings": false,
    //         "substitute_children": false,
    //         "substitute_onhand": false,
    //         "child_inherit_fields": [],
    //         "open_data_slug": null
    //     },
    //     "unit": {
    //         "id": 9,
    //         "name": "grams",
    //         "plural_name": "grams",
    //         "description": null,
    //         "base_unit": null,
    //         "open_data_slug": null
    //     },
    //     "amount": 6.0,
    //     "conversions": [
    //         {
    //             "food": "whole black peppercorns",
    //             "unit": "grams",
    //             "amount": 6.0
    //         }
    //     ],
    //     "note": "2 teaspoons",
    //     "order": 0,
    //     "is_header": false,
    //     "no_amount": false,
    //     "original_text": "6 grams whole black peppercorns (2 teaspoons)",
    //     "used_in_recipes": [
    //         {
    //             "id": 2,
    //             "name": "Black Pepper Beef"
    //         }
    //     ],
    //     "always_use_plural_unit": false,
    //     "always_use_plural_food": false
    // },

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

    // loadVideo: function(payload) {
    //   var option = {}
    //   var method = ""
    //   if (!payload) return false
    //   if (typeof payload.id == "undefined") return false
    //   this.list = false
    //   if (payload.type == "id") {
    //     option = {videoId: payload.id}
    //     method = "VideoById"
    //   } else if (payload.type == "url") {
    //     var regulateURL = (url) => {
    //       var regex = new RegExp(/[\/?&]v((=|\/)([^?&#\/]*)|\?|\/|&|#|$)/)
    //       var results = regex.exec(url)
    //       if (!results) {
    //         var shortener = new RegExp(/youtu\.be\/(.+)$/)
    //         var ret = shortener.exec(url)
    //         if (!ret) return null
    //         if (ret[1]) return ret[1]
    //         return null
    //       }
    //       if (!results[3]) return null
    //       return decodeURIComponent(results[3].replace(/\+/g, ' '));
    //     }
    //     var regulated = regulateURL(payload.id)
    //     if (regulated) {
    //       option = {mediaContentUrl: `http://www.youtube.com/v/${regulated}?version=3`}
    //       method = "VideoByUrl"
    //     } else {
    //       return false
    //     }
  
    //   } else if (payload.type == "playlist") {
    //     this.list = true
    //     option = {
    //       list: payload.id,
    //       listType: (payload.listType) ? payload.listType : "playlist",
    //       index: (payload.index) ? payload.index : 0,
    //     }
    //     method = "Playlist"
    //   } else {
    //     return false
    //   }
    //   option.suggestedQuality = this.config.defaultQuality
  
    //   var fn = "cue" + method
    //   this.videoLoop = (payload.hasOwnProperty("loop"))
    //     ? payload.loop : this.config.defaultLoop
    //   this.videoShuffle = (payload.hasOwnProperty("shuffle"))
    //     ? payload.shuffle : this.config.defaultShuffle
    //   this.videoAutoplay = (payload.hasOwnProperty("autoplay"))
    //     ? payload.autoplay : this.config.defaultAutoplay
    //   this.controlPlayer(fn, option)
    // },
  
    // controlPlayer: function(command, param=null) {
    //   if (this.config.verbose) console.log("[YOUTUBE] Control:", command, param)
    //   if (!this.YTPlayer || !command) return false
    //   if (typeof this.YTPlayer[command] == "function") {
    //     var ret = this.YTPlayer[command](param)
    //     if (ret && ret.constructor.name == "Y") ret = null
    //     return ret
    //   }
    // },
  
    prepare: function() {
    //   var tag = document.createElement("script")
    //   tag.src = "https://www.youtube.com/iframe_api"
    //   var firstScriptTag = document.getElementsByTagName("script")[0]
    //   firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    //   window.onYouTubeIframeAPIReady = () => {
    //     this.isYoutubeReady = true
    //     if (this.config.verbose) console.log("[YOUTUBE] API is ready.")
    //     this.initPlayer(this.makeYTOptions())
    //   }
    },
  
    // playerOnReady: function(ev) {
    //   if (this.config.verbose) console.log("[YOUTUBE] Player is ready.")
    //   this.controlPlayer("setVolume", this.config.volume);
    //   if (this.config.onStartPlay) {
    //     this.loadVideo(this.config.onStartPlay)
    //   }
    // },
  
    // playerOnStateChange: function(ev) {
    //   if (this.config.verbose) console.log("[YOUTUBE] Status Changed:", ev.data)
    //   this.sendNotification(this.config.outNotifications[ev.data])
    //   if (this.config.disableCC && ev.data == 1) {
    //     ev.target.unloadModule("captions");  //Works for html5 ignored by AS3
    //     ev.target.unloadModule("cc");
    //   }
  
    //   if (this.config.showPlayingOnly) {
    //     var dom = document.getElementById("YOUTUBE")
    //     switch(ev.data) {
    //       case -1:
    //       case 0:
    //       case 2:
    //         dom.style.display = "none"
    //         break
    //       default:
    //         dom.style.display = "block"
    //         break
    //     }
    //   }
    //   if (ev.data == 5) {
    //     var id = 0
    //     if (this.list) {
    //       var list = this.controlPlayer("getPlaylist")
    //       if (!Array.isArray(list)) return false
    //       if (this.config.verbose) console.log("[YOUTUBE] Playlist count:", list.length)
    //       if (list.length > 0) {
    //         if (this.videoShuffle) {
    //           id = Math.floor(Math.random()*list.length)
    //         }
    //         this.controlPlayer("setShuffle", this.videoShuffle)
    //       }
    //     }
    //     this.controlPlayer("setLoop", this.videoLoop)
    //     if (this.videoAutoplay) {
    //       if (id > 0) {
    //         this.controlPlayer("playVideoAt", id)
    //       } else {
    //         this.controlPlayer("playVideo")
    //       }
    //     }
    //   }
    // },
  
//     playerOnError: function(ev) {
//       var kind = "Unknown Error"
//       switch(ev.data) {
//         case 2 :
//           kind = "Invalid Parameter"
//           break
//         case 5 :
//           kind = "HTML5 Player Error"
//           break
//         case 100 :
//           kind = "Video Not Found (removed or privated)"
//           break
//         case 101 :
//         case 150 :
//           kind = "Not Allowed By Owner"
//           break
//         default:
//           break
//       }
//       if (this.config.verbose) console.log(`[YOUTUBE] Player Error: (${ev.data})`, kind)
//       this.sendNotification("YOUTUBE_PLAYER_ERROR", {
//         kind: kind,
//         code: ev.data
//       })
//   // Avoid race condition - stop an already stopped video loops this function indefinitely
//   //    if (ev.data == 2) {
//   //      ev.target.stopVideo()
//   //    }
//   // Work around, 150 unavailable, try to load next video in playlist to keep going
//       if (ev.data == 150) {
//         ev.target.nextVideo()
//       }
  
//     },
  
    // makeYTOptions: function(options={}) {
    //   if (options.hasOwnProperty("playerVars")) {
    //     options.playerVars = Object.assign({}, this.config.playerVars, options.playerVars)
    //   } else {
    //     options.playerVars = Object.assign({}, this.config.playerVars)
    //   }
  
    //   //options = Object.assign({}, this.config.playerVars, options)
    //   options.events = {}
    //   options.events.onReady = (ev) => {
    //     this.playerOnReady(ev)
    //   }
    //   options.events.onStateChange = (ev) => {
    //     this.playerOnStateChange(ev)
    //   }
    //   options.events.onError = (ev) => {
    //     this.playerOnError(ev)
    //   }
    //   options.events.onAPIChanged = (ev) => {
    //     //nothing to do...
    //   }
    //   return options
    // },
  
    // initPlayer: function(options) {
    //   this.YTPlayer = new YT.Player("YOUTUBE_PLAYER", options)
    // }
  })
