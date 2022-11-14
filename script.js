function createNode(element) {
    return document.createElement(element);
}

function append(parent, el) {
    return parent.appendChild(el);
}

const mealDisplay = document.getElementById('main-meals-display');
const categoryDisplay = document.getElementById('main-meals-header-categories');
var searchBar = document.getElementById("input-food-search")

if((window.location.pathname == "/recipie/") || (window.location.pathname == "/recipie/index.html")){
    function headerCategories(){
        fetch("https://www.themealdb.com/api/json/v1/1/categories.php")
        .then((resp) => resp.json())
        .then(function(data) {
            let categories = data.categories;
            categories.map(function(category) {
                let label = createNode('label')
                label.setAttribute("for", category.idCategory)
                label.innerText = category.strCategory
                label.className = "categories-header"
                let btn = createNode('input')
                btn.id = category.idCategory
                btn.type = "radio"
                btn.setAttribute("name", "categories")
                btn.className = "hidden"
                btn.value = category.strCategory
                btn.setAttribute("onchange", `apiReqs()`)
                append(categoryDisplay, label)
                append(label, btn)
                })
            })
            .catch(function(error) {
                console.log(error);
            });
    }
headerCategories()

    function searchFilter(){
        var selectedOption = document.querySelector("input[name=categories]:checked").value
        if(selectedOption === ""){
            selectedOption = `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchBar.value}`;
            document.getElementById("0").checked = true;
            return selectedOption
        }else{
            if(searchBar != ""){
                document.getElementById("0").checked = true;
            }else{
                document.getElementById("0").checked = false;
            }
            selectedOption = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${selectedOption}`;
            searchBar.value = ""
            return selectedOption
        }
    }

    function getSelectedUrl(){
        var radios = document.querySelectorAll('input[type=radio]');
        var radioLabels = document.getElementsByTagName(`label`)
        for(let i = 0; i < radios.length; i++){
            if(radioLabels[i].childNodes[1].checked == true){
                radioLabels[i].className = "categories-header active"
            }else{
                radioLabels[i].className = "categories-header"
            }
        }
        return selectedOption = searchFilter()
    }

    function apiReqs(){
        var newUrl = getSelectedUrl();
        fetch(newUrl)
        .then(response => response.json())
        .then(result => {
        let meals = result.meals
        let html = "";
        let htmlOUTPUT = "";
        if(meals == null){
            htmlOUTPUT = `
            <h2>No meals found...</h2>
            `
            html += htmlOUTPUT
        }else{
            meals.forEach(element => {
                htmlOUTPUT = `
                <div class="meal">
                    <div class="meal-image">
                        <a href="assets/pages/meal.html#${element.idMeal}" title="${element.strMeal}"><img src="${element.strMealThumb}" alt="${element.strMeal}" onerror="this.onerror=null; this.src='/recipie/assets/imgs/pattern.svg'" loading="lazy"></a>
                    </div>
                    <div class="meal-info">
                        <a href="assets/pages/meal.html#${element.idMeal}" title="${element.strMeal}" class="meal-title">${element.strMeal}</a>
                    </div>
                </div> `;
                    html += htmlOUTPUT
            });
        }
            mealDisplay.innerHTML = html
        })
        .catch(err => {
            console.error('Failed retrieving information', err);
        }); 
    }
    apiReqs()
}

function clearSearch(event){
    event.preventDefault();
    searchBar.value = "";
    apiReqs()
}

function getSelectedMeal(){
    var url = window.location.hash
    var mealUrl = url.replace("#", "")
    var urlMeal = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealUrl}`;
    return urlMeal
}

function getRandomMeal(){
    fetch('https://www.themealdb.com/api/json/v1/1/random.php').then(response => response.json())
    .then(result => {
        var mealID = result.meals[0].idMeal
        if((window.location.pathname == "/recipie/index.html") || (window.location.pathname == "/recipie/")){
            window.location.href = "/recipie/assets/pages/meal.html#" + mealID 
        }
        if(window.location.pathname == "/recipie/assets/pages/meal.html"){
            modal.style.display = "none"
            window.location.hash = mealID
        }
    })
}

var mealImageHeader = document.getElementById("meal-image-header")
var mealTitle = document.getElementById("meal-title")
var mealCategory = document.getElementById("meal-category")
var mealArea = document.getElementById("meal-area")
var mealInstructions = document.getElementById("instructions-meal")
var btnFavorite = document.getElementById("btn-favorite")
var ul = document.getElementById("meal-ingredients-ul")
var modal = document.getElementById("myModal");
var progressBar = document.getElementById("progress-bar")
var modalText = document.getElementById("modal-text")

function mealSpecificApi(){
    var meal = getSelectedMeal();
    fetch(meal)
    .then(response => response.json())
    .then(result => {
        document.title = result.meals[0].strMeal + " - Reci.Pie" 
        let meals = result.meals[0]
        let html = ""
        var mealsRecipeTutorial = new Array()
        var mealsIngredientsTutorial = new Array()

        for(var i = 1; i < 21; i++){
            var mealIngredients = meals['strIngredient'+[i]]
            var mealRecipe = meals['strMeasure'+[i]]
            mealsIngredientsTutorial.push(mealRecipe)
            mealsRecipeTutorial.push([mealIngredients])
        }
        
        function createList(measure, ingredients){
            var htmlOUTPUT = `
                <li><div class="ingredients-meal-image-name">${ingredients}</span></div> <span class="ingredients-meal-qnty">${measure}</span></li>
                `;
            return html += htmlOUTPUT
        }

        mealsRecipeTutorial.map((ingredients, i) => {
            if(ingredients != ""){
                createList(mealsIngredientsTutorial[i], mealsRecipeTutorial[i])
            }
        });
        ul.innerHTML = html

        var mealData = JSON.parse(localStorage.getItem('favorite_data') || '[]');
        var url = window.location.hash
        var mealID = url.replace("#", "")
        var btnChecked = checkFavorite()
        function checkFavorite(){
            btnChecked =  false;
            for (let i = 0; i < mealData.length; i++) {
                const element = mealData[i];
                if(element.mealID == mealID){
                    document.getElementById("labelFavorite").classList.add("favorite")
                    return btnChecked = true;
                }else{
                    document.getElementById("labelFavorite").classList.remove("favorite")
                    btnChecked = false;
                }
            }
        }

        let strInstructions = meals.strInstructions
        let strInstructionsFormated = strInstructions.replaceAll(".", ".<br>")

        var mealInfo = 
        [mealImageHeader.setAttribute('src', meals.strMealThumb), 
        mealImageHeader.setAttribute('alt', meals.strMeal),
        mealTitle.innerHTML = meals.strMeal, 
        mealCategory.innerHTML = meals.strCategory,
        mealArea.innerHTML = meals.strArea,
        mealInstructions.innerHTML = strInstructionsFormated,
        btnFavorite.value = meals.idMeal,
        btnFavorite.key = meals.strMeal,
        btnFavorite.checked = btnChecked]
        return mealInfo;
    })
    .catch(err => {
        console.error('Failed retrieving information', err);
    }); 
}
window.onhashchange = mealSpecificApi;

function favoriteModal(arg){
    modal.style.display = "block";
    var percent = 0
    var timerId;
    if(arg == true){
        modalText.innerHTML = "Added to your favorites!"
    }
    else{
        modalText.innerHTML = "Removed from your favorites!"
    }
    timerId = setInterval(function() {
        percent += 5;
        progressBar.style.width = percent + "%"
        if(percent >= 105) {
            modal.style.display = "none";
            progressBar.style.width = "0%"
            clearInterval(timerId)
          }
 }, 100);
}

function favoriteMeal(){
    var favoriteList = [];
    var mealID = document.getElementById('btn-favorite').value
    var mealName = document.getElementById("meal-title").textContent
    var mealCategory = document.getElementById("meal-category").textContent
    var mealArea = document.getElementById("meal-area").textContent
    let mealInfo = {
        "mealID": mealID,
        "mealName": mealName,
        "mealCategory" : mealCategory,
        "mealArea": mealArea
    }
    if(btnFavorite.checked == true){
        favoriteModal(true)
        favoriteList.push(mealInfo);
        favoriteList = favoriteList.concat(JSON.parse(localStorage.getItem('favorite_data') || '[]'));
        localStorage.setItem("favorite_data", JSON.stringify(favoriteList));
        document.getElementById("labelFavorite").classList.add("favorite")
    }else{
        favoriteModal(false)
        var items = JSON.parse(localStorage.getItem("favorite_data"));
        for (var i = 0; i < items.length; i++) {
            if(items[i].mealID == mealID){
                items.splice(i, 1);
            }
        }
        localStorage.setItem("favorite_data", JSON.stringify(items));
        document.getElementById("labelFavorite").classList.remove("favorite")
    }
    btnFavorite.disabled = true;
    setTimeout(() => {
        btnFavorite.disabled = false;
    }, 2200);
}

function favoriteList(){
    var localStorageFavorites = JSON.parse(localStorage.getItem('favorite_data') || '[]');
    var divFavorites = document.getElementById("favorites")
    var html = ""
    if(localStorageFavorites.length > 0){
        localStorageFavorites.forEach((element) => {
            var outPut = `
            <div class="favorite-card">
                <a href="meal.html#${element.mealID}" id="favorite-card-goTo" class="favorite-card-button"><i class="fa-solid fa-arrow-up-right-from-square" title="Redirect to ${element.mealName}"></i></a>
            <div class="favorite-card-meal-dashed">
                <a href="meal.html#${element.mealID}" class="favorite-card-meal-name">${element.mealName}</a>
            </div>
            <div class="favorite-card-meal-dashed categories">
                <p id="favorite-card-meal-category">${element.mealCategory}</p>
                <p id="favorite-card-meal-area">${element.mealArea}</p>
            </div>
                <button type="button" id="favorite-card-delete" class="favorite-card-button" title="Delete this favorite" onclick="deleteFavorite(${element.mealID}, event)">-</button>
            </div>
            `
            html += outPut
        })
        divFavorites.innerHTML = html
    }
    checkListFavorites();
}

var btnClear = document.getElementById("btn-clear")
function checkListFavorites(){
    var localStorageFavorites = JSON.parse(localStorage.getItem('favorite_data') || '[]');
    document.getElementById("favorites-length").innerHTML = localStorageFavorites.length
    var favoritesCard = document.querySelectorAll(".favorite-card")
    if(favoritesCard.length > 0){
        document.getElementById("zeroFavorites").style.display = "none"
        btnClear.style.display = "block !important";
    }else{
        btnClear.style.display = "none";
        document.getElementById("zeroFavorites").style.display = "block"
    }
}

function deleteFavorite(arg, event){
    var localStorageFavorites = JSON.parse(localStorage.getItem('favorite_data'));
    var items = JSON.parse(localStorage.getItem("favorite_data"));
    var targetElement = event.target.parentNode
    for(var i = 0; i < localStorageFavorites.length; i++){
        if(localStorageFavorites[i].mealID == arg){
            for (var i =0; i< items.length; i++) {
                if(items[i].mealID == arg){
                    items.splice(i, 1);
                }
            }
            localStorage.setItem("favorite_data", JSON.stringify(items));
            targetElement.remove()
        }
    }
    checkListFavorites();
}

function clearAllFavorites(){
    var favoritesCard = document.querySelectorAll(".favorite-card")
    for (var i = 0; i < favoritesCard.length; i++) {
        favoritesCard[i].remove()
    }
    localStorage.setItem("favorite_data", '[]');
    checkListFavorites();
}