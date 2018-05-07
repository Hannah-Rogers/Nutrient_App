"use-strict";


var myPage = (function(page) {

/* variables -------------------------------*/
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


/* url functions-------------------------------*/
    var _getSearchURL = function(query) {
      var URL = usda_api.searchURL;
      URL += "&api_key=" + usda_api.key;
      URL += "&q=" + query;

      return URL;
    }


    var _getNutrientURL = function(id) {
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
    var _getResultsHTML = function(data) {
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
        }); // end of inner loop



        // concat html string
        HTML += "<div class='searchItem' data-ndbno='" + foodID + "' data-name='" + foodName + "'>";
        HTML += foodName;
        HTML += "</div>"

      }); // end of outer loop

      return HTML;
    }


    var _getNutrientHTML = function(data) {
      // format the header
      var header = data["report"]["foods"][0]["name"];
      
      // append header and severing size
      $(".js-nutrient-header").html(header);
      $(".js-nutrient-serving").html("Serving Size: " + data["report"]["foods"][0]["measure"]);

      // loop through data and build html
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

          } // end of switch
        }); // end of inner loop

        // concat html string
        HTML += "<div class='nutrients' >" + nutrientName + ": " + nutrientValue + "</div>";
      });   // end of outer loop

      return HTML;
    }


    var _getErrorHTML = function() {
      return "<div style='text-align:center;'>No results found</div>"
    }


    /* ajax calls
    -------------------------------*/
    var search = function(query) {
      $.ajax({
        type: "GET",
        url: _getSearchURL(query),
        success: function (data) {
          $(".js-search-results").html(_getResultsHTML(data));
        },
        error: function (xhr, error) {
          //console.debug(xhr); console.debug(error);
          $(".js-search-results").html(_getErrorHTML());
        }
      });
    }
    

    var getNutrients = function(id) {
      $.ajax({
        type: "GET",
        url: _getNutrientURL(id),
        success: function (data) {
          if (data["report"]["foods"].length > 0) {
            // build results html
            $(".js-nutrient-list").html(_getNutrientHTML(data));
          }
          else {
            // show no results
            $(".js-nutrient-list").html(_getErrorHTML());
          }

 
        },
        error: function (xhr, error) {
          //console.debug(xhr); console.debug(error);v
          
          // open the nutrient modal with error message
          $(".js-nutrient-list").html(_getErrorHTML());
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

