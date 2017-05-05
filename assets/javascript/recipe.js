
$( document ).ready(function(){

        //user input function
        $("#ingredientSearch").on("click", function() {
            event.preventDefault();
            var userInput = myArray.toString();
            console.log(userInput);
            addIngredients(userInput);
            //return false;
        });

        //Search function button
        function addIngredients(userInput) {
                var p = $(this).data("name");
                var queryURL = "https://api.edamam.com/search?q= " + userInput + " &app_id=694da05d&app_key=56d6789992fbe1f17a7c2ce8cbc3fc62"
console.log(userInput);
                //ajax call
                $.ajax({ url: queryURL, method: "GET" })
                    .done(function(response) {
                        var hits = response.hits;

                        for (var i = 0; i < hits.length; i++) {
                            var recipe = hits[i].recipe;
                            console.log(recipe);

                            var recipesDiv = $('<div class="item">');

                            var label = recipe.label;
                            var header = $("<h1>").text(label)
                            var image = $("<img>");
                            image.attr("src", recipe.image);


                            recipesDiv.append(image);

                            recipesDiv.prepend(header);




                            $("#recipeList").prepend(recipesDiv);

                        }

                });
            // });
    }
});


