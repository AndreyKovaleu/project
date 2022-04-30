"use strict";

function mainPage() {

    let logoScreen = document.createElement('div');
    logoScreen.style.cssText = 'width: 100%; height: 100%;';
    logoScreen.id = 'startScreen'
    document.body.appendChild(logoScreen);

    let logo = document.createElement('img');
    logo.src = "images/logo.png"
    logo.style.cssText = 'width: 40%; margin-left: 30%;';
    logoScreen.appendChild(logo);

    let nameForm = document.createElement('div');
    nameForm.id = 'nameform';
    nameForm.style.display = 'none';
    nameForm.style.cssText = ''
    logoScreen.appendChild(nameForm);

    let enter = document.createElement('img');
    enter.id = 'enter'
    enter.src = 'images/enter.png'
    nameForm.appendChild(enter);

    let nameInput = document.createElement('input');
    nameInput.id = 'nameInput';
    if(localStorage.getItem('ajname') !== null) {
        nameInput.placeholder = localStorage.getItem('ajname')
    } else {
        nameInput.placeholder = 'Player1'
    }
    nameInput.type = 'text'
    nameInput.name = 'nameinput'
    nameInput.maxLength = 10
    nameForm.appendChild(nameInput);

    let nameSubmit = document.createElement('div');
    nameSubmit.id = 'nameSubmit'
    nameSubmit.innerHTML = 'GO'

    nameSubmit.onclick = function(){
        nameInput.value ? localStorage.setItem('ajname', nameInput.value) : localStorage.setItem('ajname',nameInput.placeholder);
        document.getElementById('startScreen').style.display = 'none';
        gameOn();
    }
    nameForm.appendChild(nameSubmit);
}

mainPage();