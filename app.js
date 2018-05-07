"use-strict";

var loadPage = (function(page) {

/* variables-------------------------------*/
const usda_api = {
      key: "krBcPpdX6JTkBNyzXjJU8a65fzYQxOEZbFOzxHQT",
      searchURL: "https://api.nal.usda.gov/ndb/search/?format=json",
      nutrientURL: "https://api.nal.usda.gov/ndb/nutrients/?format=json"
    };

const nutrients = {
      protein: "203",
      fat: "204",
      carbs: "205",
      fiber: "291",
      sugars: "269",
      calories: "208"
    };


/* url functions-------------------------------*/
function getSearchURL(query) {
      var URL = usda_api.searchURL;
      URL += "&api_key=" + usda_api.key;
      URL += "&q=" + query;

      return URL;
    }


function getNutrientURL(id) {
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


/* html functions-------------------------------*/
function getResultsHTML(data) {
      var HTML = "";
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


function getNutrientHTML(data) {
      var header = data["report"]["foods"][0]["name"];
      
      $(".js-nutrient-header").html(header);
      $(".js-nutrient-serving").html("Serving Size: " + data["report"]["foods"][0]["measure"]);

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


function getErrorHTML() {
      return "<div style='text-align:center;'>No results found</div>"
    }


/* ajax calls-------------------------------*/
function getSearchData(query) {
      $.ajax({
        type: "GET",
        url: getSearchURL(query),
        success: function (data) {
          $(".js-search-results").html(getResultsHTML(data));
        },
        error: function (xhr, error) {
          $(".js-search-results").html(getErrorHTML());
        }
      });
    }
    

function getNutrientData(id) {
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
        error: function (xhr, error) {
          $(".js-nutrient-list").html(getErrorHTML());
        }
      });
    }


/* create usda namespace-------------------------------*/
    page.usda = {
      getSearchData: getSearchData,
      getNutrientData: getNutrientData
    };
    return page;
  })(loadPage || {});


/*event listeners---------------------------------*/
  !function(page) {
    $(".js-query").on("keypress", function(e) {
      if (e.keyCode === 13) {
        e.preventDefault();
        var query = $(".js-query").val();
        page.usda.getSearchData(query);
        $(".js-query").blur();
      }
    });

    $(".js-search-results")
      .on("click", ".searchItem", function() {
        $('.show-nutrients').removeClass('hidden');
        var id = $(this).attr('data-ndbno');
        page.usda.getNutrientData(id);
      });

  }(loadPage);

