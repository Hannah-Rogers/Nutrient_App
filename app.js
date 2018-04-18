var myPage = (function(page) {
    "use strict";

//USDA api data______________________________
var USDA_URL = {
	searchURL: 'http://api.nal.usda.gov/ndb/search/?format=json',
	nutrientUrl: 'http://api.nal.usda.gov/ndb/nutrients/?format=json',
	key: 'krBcPpdX6JTkBNyzXjJU8a65fzYQxOEZbFOzxHQT'
};  

var nutrientIDs = {
	protein: '203',
	fat: '204',
	carbs: '205',
	fiber: '291'
};


//url functions______________________________
function getSearchURL(query) {
	var URL = USDA_URL.searchURL;
	URL += '&api_key=' + USDA_URL.key;
	URL += '&q=' + query;

	return URL;
}

function getNutrientURL(id) {
	var URL = USDA_URL.nutrientURL;
	URL += '&api_key=' + USDA_URL.key;
	URL += '&nutrients=' + nutrientIDs.protein;
	URL += '&nutrients=' + nutrientIDs.fat;
	URL += '&nutrients=' + nutrientIDs.carbs;
	URL += '&nutrients=' + nutrientIDs.fiber;
	URL += '&ndbno=' + id; 

	return URL;
}


//html template_________________________________________________
function renderInitialResults(data) {
	var html = "";
	$.each(data['.list']['.item'], function (i, obj) {
        var foodName, foodID, icon;
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

        icon = page.fa.fav_o;
        if (page.favorites.exists(foodID)) {
          icon = page.fa.fav;
        }

		HTML += "<div class='searchItem' data-ndbno='" + foodID + "' data-name='" + foodName + "'>";
        HTML += foodName + "<i class='favorite " + icon + "'></i>";
        HTML += "</div>";
	});
	return html;
}

function renderNutrientResults(data) {
      var header = data['.report']['.foods'][0]['.name'];
      if (header.length > 40) {
        header = header.slice(0,40) + "...";
      }
      
      // append header and severing size
      $('.js-nutrient-header').html(header);

      // loop through data and build html
      var HTML = "";
      $.each(data['.report']['.foods'][0]['.nutrients'], function (i, obj) {
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
        HTML += "<div>" + nutrientName + ": " + nutrientValue + "</div>";

      });   // end of outer loop

      return HTML;
    }

    var _getErrorHTML = function() {
      return "<div style='text-align:center;'>No results found</div>";

};


//get data from API________________________________________
function getSearchDataFromAPI(query) {
	$.ajax({
        type: "GET",
        url: USDA_URL(query),
        success: function (data) {
          $('.js-results').html(getSearchURL(data));
        },
        error: function (xhr, error) {
          //console.debug(xhr); console.debug(error);
        $('.js-results').html(_getErrorHTML());
        }
      });
    }

function getNutrientDataFromAPI(id) {
      $.ajax({
        type: "GET",
        url: getNutrientURL(id),
        success: function (data) {
          if (data['.report']['.foods'].length > 0) {
            // build results html
            $('.js-nutrient-list').html(renderNutrientResults(data));
          }
          else {
            // show no results
            $('.js-nutrient-list').html(_getErrorHTML());
          }
        },
        error: function (xhr, error) {
          //console.debug(xhr); console.debug(error);v
          
          // open the nutrient modal with error message
          $('js-nutrient-list').html(_getErrorHTML());
        }
      });
    }

    $('#button').on('click', function(event) {
    event.preventDefault();
    $('.js-search-results').empty();
    getNutrientDataFromAPI();
  });


//display results______________________________________________________
    page.usda = {
      getSearchDataFromAPI: getSearchDataFromAPI,
      getNutrientDataFromAPI: getNutrientDataFromAPI
    };

    return page;

  })(myPage || {});



