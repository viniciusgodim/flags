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

var correctRatio;

window.addEventListener('resize', function() {
  handleProgress();
})

function handleProgress() {
  document.getElementById('bar').style.width = document.getElementById('progress').offsetWidth * correctRatio + 'px'
}

function handleScores() {
  document.getElementById("correctScore").innerText = correctScore;
  document.getElementById("incorrectScore").innerText = incorrectScore;
  correctRatio = correctScore / (correctScore + incorrectScore);
  handleProgress();
}

function handleIncorrectAnswer(key) {
  buttons[key].style.backgroundColor = 'FireBrick';
  incorrectScore++;
}

function handleCorrectAnswer() {
  buttons.forEach(button => button.style.backgroundColor='');
  correctScore++;
  document.getElementById('previousImage').src =  correctOption + '.svg';
  document.getElementById('previousImageContent').innerText = correctOption;
  generateGame(data);
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

function generateGame(data) {
  oldFilteredContinents = filteredContinents;
  filteredContinents = [];
  var checkBoxes = document.getElementById('checkBoxes').querySelectorAll('input')
  for(i = 0; i < uniqueContinents.length; i++){
    if (checkBoxes[i].checked){
      filteredContinents.push(checkBoxes[i].parentElement.innerText);
    }
  }
  if (JSON.stringify(oldFilteredContinents) !== JSON.stringify(filteredContinents)){
    var filteredData = data.filter(obj => {
      return filteredContinents.includes(obj.continent)
    })
    countries = filteredData.map(a => a.country);
    countries = countries.filter(unique);
  }
  options = getRandomArrayElements(countries, numberOfOptions);
  correctOptionIndex = Math.floor(Math.random() * numberOfOptions);
  correctOption = options[correctOptionIndex];
  document.getElementById('correctOptionImage').src = correctOption + '.svg'
  for(i = 0; i < numberOfOptions; i++){
    buttons[i].innerText = options[i]
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

function main() {

  buttons = document.querySelectorAll("button");
  dict = {
    "ArrowUp": 0,
    "ArrowLeft": 1,
    "ArrowRight": 2,
    "ArrowDown": 3
  };
  numberOfOptions = 4;
  correctScore = incorrectScore = 0;
  fetchJSONFile('countriesContinents.json', function(datum){
    data = datum;
    var continents = data.map(a => a.continent);
    uniqueContinents = continents.filter(unique);
    for(i = 0; i < uniqueContinents.length ; i++){
      var label = document.createElement("label");
      var continentSpan = document.createElement("span");
      var continentText = document.createTextNode(uniqueContinents[i]);
      continentSpan.appendChild(continentText);
      var continentCheckBox = document.createElement("input");
      continentCheckBox.setAttribute("type", "checkbox");
      continentCheckBox.checked = true;
      label.appendChild(continentCheckBox);
      label.appendChild(continentSpan);
      document.getElementById("checkBoxes").appendChild(label);
    }
    filteredContinents = 0;
    generateGame(data);
  });
}
