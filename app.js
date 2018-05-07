"use-strict";


var myPage = (function(page) {

    /* variables
    -------------------------------*/
    var usda_api = {
      key: "krBcPpdX6JTkBNyzXjJU8a65fzYQxOEZbFOzxHQT",
      searchURL: "https://api.nal.usda.gov/ndb/search/?format=json",
      nutrientURL: "https://api.nal.usda.gov/ndb/nutrients/?format=json"
    };

    var nutrients = {
      protein: "203",
      fat: "204",
      carbs: "205",
      fiber: "291",
      sugars: "269",
      calories: "208"
    };


    /* url functions
    -------------------------------*/
    var getSearchURL = function(query) {
      var URL = usda_api.searchURL;
      URL += "&api_key=" + usda_api.key;
      URL += "&q=" + query;

      return URL;
    }


    var getNutrientURL = function(id) {
      var URL = usda_api.nutrientURL;
      URL += "&api_key=" + usda_api.key;
      URL += "&nutrients=" + nutrients.protein;
      URL += "&nutrients=" + nutrients.fat;
      URL += "&nutrients=" + nutrients.carbs;
      URL += "&nutrients=" + nutrients.fiber;
      URL += "&nutrients=" + nutrients.sugars;
      URL += "&nutrients=" + nutrients.calories;
      URL += "&ndbno=" + id;

      return URL;
    }


    /* html functions
    -------------------------------*/
    var getResultsHTML = function(data) {
      var HTML = "";
      
      // loop through data and build HTML
      $.each(data["list"]["item"], function (i, obj) {
        var foodName, foodID;
        $.each(obj, function (key, value) {
          switch(key) {
            case "name":
              foodName = value;
              break;
            case "ndbno":
              foodID = value;
              break;
          }
        }); 

        HTML += "<div class='searchItem' data-ndbno='" + foodID + "' data-name='" + foodName + "'>";
        HTML += foodName;
        HTML += "</div>"

      }); 

      return HTML;
    }


    var getNutrientHTML = function(data) {
      // format the header
      var header = data["report"]["foods"][0]["name"];
      
      // append header and severing size
      $(".js-nutrient-header").html(header);
      $("js-nutrient-serving").html("Serving Size: " + data["report"]["foods"][0]["measure"]);

      var HTML = "";
      $.each(data["report"]["foods"][0]["nutrients"], function (i, obj) {
        var nutrientName, nutrientValue;
        $.each(obj, function (key, value) {
          switch(key) {
            case "nutrient":
              switch(value) {
                case "Total lipid (fat)":
                  nutrientName = "Fat";
                  break;

                case "Carbohydrate, by difference":
                  nutrientName = "Carbs";
                  break;

                case "Fiber, total dietary":
                  nutrientName = "Fiber";
                  break;
                  
                case "Energy":
                  nutrientName = "Calories";
                  break;
                  
                case "Sugars, total":
                  nutrientName = "Sugars";
                  break;

                default:
                  nutrientName = value;
                  break;
              }
              break;

            case "value":
              if (isNaN(value)) {
                nutrientValue = "";
              }
              else {
                nutrientValue = parseFloat(value).toFixed(1) + " g";
              }
              break;

          } 
        }); 

        HTML += "<div class='nutrients' >" + nutrientName + ": " + nutrientValue + "</div>";
      });  

      return HTML;
    }


    var getErrorHTML = function() {
      return "<div style='text-align:center;'>Oops! No results were found.</div>"
    }


    /* ajax calls
    -------------------------------*/
    var search = function(query) {
      $.ajax({
        type: "GET",
        url: getSearchURL(query),
        success: function (data) {
          if (data["list"]["item"].length > 0) {
            $(".js-search-results").html(getResultsHTML(data));
          }
          else {
            $(".js-search-results").html(getErrorHTML());
          }
        },
        error: function (jqxhr, error) {
          $(".js-search-results").html(getErrorHTML());
        }
      });
    }
    

    var getNutrients = function(id) {
      $.ajax({
        type: "GET",
        url: getNutrientURL(id),
        success: function (data) {
          if (data["report"]["foods"].length > 0) {
            $(".js-nutrient-list").html(getNutrientHTML(data));
          }
          else {
            $(".js-nutrient-list").html(getErrorHTML());
          }
        },
        error: function (jqxhr, error) {
          $(".js-nutrient-list").html(getErrorHTML());
        }
      });
    }


    /* create usda namespace
    -------------------------------*/
    page.usda = {
      search: search,
      getNutrients: getNutrients
    };

    return page;

  })(myPage || {});


/*=================================
  page_events.js
  =================================*/
  !function(page) {
    "use strict";

    /* txtSearch
    -------------------------------*/
    $(".js-query").on("keypress", function(e) {
      // pressed enter key
      if (e.keyCode === 13) {
        e.preventDefault();

        // search usda database
        var query = $(".js-query").val();
        page.usda.search(query);

        // remove focus
        $(".js-query").blur();
      }
    });


    /* results
    -------------------------------*/
    $(".js-search-results")
      // fetch nutrient data
      .on("click", ".searchItem", function() {
        $('.show-nutrients').removeClass('hidden');
        var id = $(this).attr('data-ndbno');
        page.usda.getNutrients(id);
      });

  }(myPage);

