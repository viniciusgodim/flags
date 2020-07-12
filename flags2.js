function fetchJSONFile(path, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            }
        }
    };
    httpRequest.open('GET', path);
    httpRequest.send();
}

function getRandomArrayElements(arr, count) {
  var shuffled = arr.slice(0),
    i = arr.length,
    min = i - count,
    temp, index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
}

var progressFraction;

function handleProgress() {
  document.getElementById('bar').style.width = progressFraction*100 + '%'
}

function handleScores() {
  document.getElementById("correctScore").innerText = correctScore;
  document.getElementById("incorrectScore").innerText = incorrectScore;
  progressFraction = correctAnswersAfterContinentFilter/filterdContriesWithTrashLength;
  handleProgress();
}

function handleIncorrectAnswer(key) {
  buttons[key].style.backgroundColor = 'FireBrick';
  incorrectScore++;
}

function handleCorrectAnswer() {
  buttons.forEach(button => button.style.backgroundColor='');
  correctScore++;
  if (!previousTrash.includes(correctOption)){
    correctAnswersAfterContinentFilter++;
  }
  document.getElementById('previousImage').src =  correctOption + '.svg';
  document.getElementById('previousImageContent').innerText = correctOption;
  generateGame();
}

function handleKey(event) {
  pressedKeyIndex = dict[event.key]
  if (pressedKeyIndex <= numberOfOptions) {
    if (pressedKeyIndex == correctOptionIndex) {
      handleCorrectAnswer();
    } else {
      for(key = 0; key < buttons.length; key++){
         if (pressedKeyIndex == key){
           handleIncorrectAnswer(key);
           break;
         }
      }
    }
    handleScores();
  }
}

function handleClick(event){
  button = event.target;
  button.blur();
  if (button.innerText == correctOption) {
    handleCorrectAnswer();
  } else {
    handleIncorrectAnswer(dict[button.id]);
  }
  handleScores();
}

function filterContinents(){
  filteredContinents = [];
  for(i = 0; i < uniqueContinents.length; i++){
    if (checkBoxes[i].checked){
      filteredContinents.push(checkBoxes[i].parentElement.innerText);
    }
  }
}

function filterDataByContinents(){
  filteredData = data.filter(obj => {
    return filteredContinents.includes(obj.continent)
  });
}

function generateGame() {
  oldFilteredContinents = filteredContinents;
  checkBoxes = document.getElementById('checkBoxes').querySelectorAll('input');
  filterContinents();
  if (JSON.stringify(oldFilteredContinents) !== JSON.stringify(filteredContinents)){
    filterDataByContinents();
    countries = filteredData.map(a => a.country);
    countries = countries.filter(unique);
    filterdContriesWithTrashLength = countries.length
  }
  if(!document.getElementById("repeatInput").checked){
    countries = _.difference(countries,trash)
  }
  if(trash.length == 1){
    correctAnswersAfterContinentFilter = 1;
  }
  numberOfOptions = 4;
  if (countries.length < numberOfOptions){
    numberOfOptions = countries.length;
  }
  options = getRandomArrayElements(countries, numberOfOptions);
  correctOptionIndex = Math.floor(Math.random() * numberOfOptions);
  correctOption = options[correctOptionIndex];
  previousTrash = trash.slice(0);
  if (!trash.includes(correctOption)){
    trash.push(correctOption)
  }
  if (numberOfOptions == 1){
    filteredContinents = 0;
    trash = [];
  }
  document.getElementById('correctOptionImage').src = correctOption + '.svg'
  for(i = 0; i < numberOfOptions; i++){
    buttons[i].innerText = options[i]
  }
  for(i = numberOfOptions; i < buttons.length; i++){
    buttons[i].innerHTML = ''
  }
  buttons.forEach(button => button.removeEventListener("click", handleClick));
  buttons.forEach(button => button.addEventListener("click", handleClick));

  document.removeEventListener("keydown", handleKey);
  document.addEventListener("keydown", handleKey);
}

function unique(value, index, self) {
  return self.indexOf(value) === index;
}

var data;
var previousTrash;
var filteredData;

function main() {
  buttons = document.querySelectorAll("button");
  dict = {
    "ArrowUp": 0,
    "ArrowLeft": 1,
    "ArrowRight": 2,
    "ArrowDown": 3
  };
  correctScore = incorrectScore = 0;
  fetchJSONFile('countriesContinents.json', function(dataArgument){
    data = dataArgument;
    var continents = data.map(a => a.continent);
    uniqueContinents = continents.filter(unique);
    for(i = 0; i < uniqueContinents.length ; i++){
      var label = document.createElement("label");
      var continentSpan = document.createElement("div");
      var continentText = document.createTextNode(uniqueContinents[i]);
      continentSpan.appendChild(continentText);
      var continentCheckBox = document.createElement("input");
      continentCheckBox.setAttribute("type", "checkbox");
      continentCheckBox.checked = true;
      continentCheckBox.addEventListener('change',function(){
        trash.pop();
        filterContinents();
        filterDataByContinents();
        var filteredTrashData = filteredData.filter(obj => {
          return trash.includes(obj.country)
        });
        correctAnswersAfterContinentFilter = filteredTrashData.length;
        filteredContinents = 0;
        buttons.forEach(button => button.style.backgroundColor='');
        generateGame();
      });
      label.appendChild(continentCheckBox);
      label.appendChild(continentSpan);
      document.getElementById("checkBoxes").appendChild(label);
    }
    filteredContinents = 0;
    trash = [];
    correctAnswersAfterContinentFilter = 0
    repeatInput = document.getElementById("repeatInput")
    repeatInput.checked = false;
    generateGame();
  });
}
