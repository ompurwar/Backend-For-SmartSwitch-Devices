$(document).ready(function () {
    fillgrid();
});

$(document).ajaxStart(function () {
   // ViewModel.pageLoader(true);
});
$(document).ajaxStop(function () {
    //ViewModel.pageLoader(false);
    setTimeout(function () {
        // getState();
        fillgrid();
    }, 5000);
});



function getState() {
    ViewModel.state1(true);
    ViewModel.state2(true);
}




var ViewModel = {
    id: ko.observable(''),
    pass: ko.observable(''),
    state1: ko.observable(true),
    state2: ko.observable(true),
    pageLoader: ko.observable(false),
    DeviceMAC: ko.observable(),
    switchClick: function (id) {
        var reqobj = {};

        if (id == 1) {
            ViewModel.state1(!ViewModel.state1());
            reqobj.params = {
                "STATE": Number(ViewModel.state1())
            };
            reqobj.table = 'STATE_ARRAY';
            reqobj.searchCondition = {
                "ID": id
            };
            reqobj.IUD_Flag = 2;
        } else {
            ViewModel.state2(!ViewModel.state2());
            reqobj.params = {
                "STATE": Number(ViewModel.state2())
            };
            reqobj.table = 'STATE_ARRAY';
            reqobj.searchCondition = {
                "ID": id
            };
            reqobj.IUD_Flag = 2;
        }
        postdata(reqobj);
        console.log(JSON.stringify(reqobj))
    }
};

// Activates knockout.js
ko.applyBindings(ViewModel);


function postdata(reqobj) {

   console.log("calling :/api/postdata");

    //  AJAX POST 

    var rtrObj = false;
    var uri = conn.aws + '/api/postdata';




    $.ajax({
        url: uri,
        type: 'POST',
        data: ko.toJSON(reqobj),
        async: false,
        contentType: "application/json",
        beforeSend: function () {
            $('#pageLoader').show();
        },
        success: function (objErr) {
            console.log(JSON.stringify(objErr));
            $('#pageLoader').hide();
            if (objErr.errFlag != 0) {

                swal('Error', 'We are facing troble in Connecting with Switchgrid database ' + JSON.stringify(objErr.errDesc), 'error');
                console.log(objErr.errDesc);
                rtrObj = false;
            } else {
                // swal('Operation Successful','Please click OK to refresh the page','success');

                rtrObj = false; // True it
            }
        },
        error: function (objHttp) {
            $('#pageLoader').hide();
            swal('Error', 'We are facing troble in reachig  Switchgrid services ' + JSON.stringify(objHttp.errDesc), 'error');
            console.log(objHttp.responseText);
            rtrObj = false;


        }
    });
    //  return rtrObj;



}

function fillgrid() {



    var reqobj = {};

    reqobj.sesionId = localStorage.getItem('validFlag');
    reqobj.params = ["ID", "STATE"];
    reqobj.table = 'STATE_ARRAY';
    reqobj.searchCondition = null;





    //  AJAX POST

    var uri = conn.aws + '/api/getgriddata';


    $.ajax({
        url: uri,
        type: 'POST',
        data: ko.toJSON(reqobj),
        async: false,
        contentType: "application/json",
        success: function (objErr) {

            if (objErr.errFlag != 0) {

                swal('Error', 'We are facing troble in Connecting with Switchgrid database ' + JSON.stringify(objErr.errDesc), 'error');
                console.log(objErr.errDesc);
            } else {
                console.log(JSON.stringify(objErr));
                ViewModel.state1(objErr.data[0].STATE);
                ViewModel.state2(objErr.data[1].STATE);
                console.log('dataFetched')
            }
        },
        error: function (objHttp) {
            ViewModel.pageLoader(false);
            swal('Error', 'Error in Connecting with Switchgrid Services ' + JSON.stringify(objErr.errDesc), 'error');
            console.log(objHttp.responseText);
        }
    });


}
/*localStorage.clear();
       setTimeout(function(){
         window.location.reload(1);
       }, 5000);*/