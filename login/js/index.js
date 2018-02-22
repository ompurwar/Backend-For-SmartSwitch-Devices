/* 

I built this login form to block the front end of most of my freelance wordpress projects during the development stage. 

This is just the HTML / CSS of it but it uses wordpress's login system. 

Nice and Simple

*/
function sendData(Email, usr, pwd) {
    var http = new XMLHttpRequest();
    http.open("POST", "/api/addData", true);

    http.setRequestHeader("Content-type", "application/json");
    var data = JSON.stringify({
        "Email": Email,
        "user": usr,
        "pwd": pwd
    });
    console.log(data);
    http.send(data);
}