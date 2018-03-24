var menu = document.getElementById('menu'),
    panelMenu = menu.querySelectorAll('li'),
    panelBoxes = document.querySelectorAll('.panel__box'),
    signUp = document.getElementById('signUp'),
    signIn = document.getElementById('signIn'),
    signUpBtn = document.getElementById('signUpBtn'),
    signInBtn = document.getElementById('signInBtn');

function removeSelection(){
    for(var i = 0, len = panelBoxes.length; i < len; i++){panelBoxes[i].classList.remove('active');
    }
}


signIn.onclick = function(e){
  e.preventDefault();
  removeSelection();
  panelBoxes[0].classList.add('active');
  menu.classList.remove('second-box');
};

signUp.onclick = function(e){
  e.preventDefault();
  removeSelection();
  panelBoxes[1].classList.add('active');
  menu.classList.add('second-box');
};

signUpBtn.onclick = function(){
  var data={
    Email : document.getElementById('Email').value,
    password : document.getElementById('password').value,
    passwordConf : document.getElementById('passwordConf').value
  };
  console.log(JSON.stringify(data));
  var http = new XMLHttpRequest();
  http.open('POST', '/signUp', true);
  http.setRequestHeader("Content-type", "application/json");
  http.send(JSON.stringify(data));
};