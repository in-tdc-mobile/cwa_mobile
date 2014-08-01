 /*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
 "use strict";
 var vessel_markers_with_imo = new Array();
 var vessel_markers = new Array();
 var markerCluster;
 var open_info_window;
var mcOptions = {minimumClusterSize: 3,gridSize: 75, maxZoom:15, minZoom:2};//gridSize: 600, maxZoom:15, minimumClusterSize: 10};
var infowindow;
var marker, i,position;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener("backbutton", this.onBackKeyDown, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        navigator.splashscreen.show();
        // if (parseFloat(window.device.version) === 7.0) {
        //   document.body.style.marginTop = "20px";
        // }
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        // var parentyearent = document.getyearentById(id);
        // var listeningyearent = parentyearent.querySelector('.listening');
        // var receivedyearent = parentyearent.querySelector('.received');

        // listeningyearent.setAttribute('style', 'display:none;');
        // receivedyearent.setAttribute('style', 'display:block;');

        // console.log('Received Event: ' + id);
    }
};

// Handle the back button
//
function onBackKeyDown() {
    alert('hi');
    step_back();
}


function toTitleCase(str)
{ if(str)
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) +
        $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +
        $(window).scrollLeft()) + "px");
    return this;
};

Number.prototype.formatMoney = function(c, d, t){
    var n = this, 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
    j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};
$('#hamburger').hide();

function hide_all() {    
    // if($("#contentLayer:visible").length>0){
    //     $('#contentLayer').trigger('click');
    // }
    if($("#container").hasClass( "opened" )){
        var container = document.querySelector('#container');
        var slidemenu = document.querySelector('#sidemenu');
        var content = document.querySelector('#content');
        var contentlayer = document.querySelector('#contentLayer');

        container.classList.toggle('opened');
        slidemenu.classList.toggle('sidemenu--opened');
        content.style.height = "auto";
        contentlayer.classList.toggle('contentlayer-opened');
    }
    // $('#btnBack').hide();
    // $('#navbar').hide();
    hide_spinner();
    $('#index_content').hide();
    $('#ajax_error').hide();
    $('#view_title').hide();
    $('#owners').hide();
    $('#dashboard').hide();
    $('#vessel_details').hide();
    $('#crew').hide();
    $('#crew_cv').hide();
    $('#pms').hide();
    $('body').scrollTop(0);
}

// var slider = new PageSlider($("#container"));
$(window).on('hashchange', route);
$(window).on('load', route_to_dashboard);

function route_to_dashboard (event) {
    window.location.replace("#");
}

// Basic page routing
function route(event) {
    // $('body').scrollTop(0);
    $('body, html').animate({scrollTop : 0}, 0);
    var page,
    hash = window.location.hash.split('/')[0];

    if (hash === "#pms") {
        show_pms();
    } else if (hash === "#vdetails") {
        show_vessel_details();
    } else if (hash === "#crew") {
        show_crew_list();
    } else if (hash === "#crew_cv") {
        show_crew_cv(window.location.hash.split('/')[1]);
    } else if (hash === "#back_crewcv") {
        hide_all();
        $('#crew').show();
        // $('html, body').animate({scrollTop: $('#crew_tile').position().top-50}, 'slow');
        // $('body').scrollTop(0);
    }
    else if (hash === "#multiowners"){
        hide_all();
        show_multi_owners();
    }
    else if (hash === "#logout") {
        // hide_all();
        // $('#hamburger').hide();
        $.jStorage.set("pal_user_name", null);
        // $('.login').show();
        location.reload(true);
    }
    else if (hash === "#dashboard") {
        show_dashboard_ajax(window.location.hash.split('/')[1]);
    }
    else {
        // show_dashboard();
        if (pal_user_name == null) {
            return;
        }
        page = show_owners();
    }
    // slider.slidePage($(page));

}

var step_back = function() {window.history.back()};

var current_step = function() {};

var temp;
var pal_user_id;
var cwa_app_id;
var pal_user_name;
var owners_array;
var owner_vessels;
var owner_crew;
var dashboard_settings;
var user_rights_settings;
var selected_owner_id;
var selected_vessel_id;
var vessel_location;
var show_vessel_tracker;

window.addEventListener('load', function () {
    FastClick.attach(document.body);
}, false);

$(document).ready(function() {
    var menuBtn = document.querySelector('#hamburger-btn');
    var container = document.querySelector('#container');
    var slidemenu = document.querySelector('#sidemenu');
    var content = document.querySelector('#content');
    var contentlayer = document.querySelector('#contentLayer');
    menuBtn.addEventListener('click', showSidemenu, false);
    contentlayer.addEventListener('click', showSidemenu, false);

    function showSidemenu () {
      container.classList.toggle('opened');
      slidemenu.classList.toggle('sidemenu--opened');
      contentlayer.classList.toggle('contentlayer-opened');
      content.style.height = "auto";
      $('#container').resize();
      
  }
  try{
    pal_user_name = $.jStorage.get("pal_user_name");
        // $.jStorage.set("pal_user_email", '');
        if (pal_user_name == null) {
          hide_all();
          $("#btnBack").hide();
          $('.login').show();
      } else {
        pal_user_id = $.jStorage.get("pal_user_id");
        cwa_app_id = $.jStorage.get("cwa_app_id");
        $('#hamburger').show();
        $('.login').hide();
        show_owners();
    }
}
catch(err){    
}

});

 function login_failure() {
  $(".spinner").css('display','none');
  $("#ajax_error").show();
  $("#ajax_error").html('Wrong Email or Password. Please try again.');
  $("#ajax_error").attr('style','display:block; text-align:center;');
}

$.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
    options.url = 'https://getVesselTracker.com/cwa_mobile_prod/' + options.url + "&pal_user_email=" + $.jStorage.get("pal_user_name");
});

$('#login_form').submit(function(){
    var username = $('#login_email').val();
    var password = $('#login_password').val();

    $.jStorage.set("pal_user_name", username);
    var form_data= {
        'username': username,
        'password': password
    };
    var req = $.ajax({
        url: 'ldap_test_cwa.php?a=1',
        type: "post",
        data: form_data,
        beforeSend: function() {
            show_spinner();
        },

        success : function(response) {
            if (response != '' && response != 'failed') {
                $('#hamburger').show();
                $('.login').hide();
                var str = response.split(",")
                pal_user_id = str[0];
                cwa_app_id = str[1];
                pal_user_name = $.jStorage.get("pal_user_name");
                $.jStorage.set("pal_user_id", pal_user_id);
                $.jStorage.set("cwa_app_id", cwa_app_id);
                // window.location.replace("#");
                // $('body').scrollTop(0);
                // document.documentElement.scrollTop = 0;
                $('body, html').animate({scrollTop : 0}, 0);
                show_owners();
            // location.reload();
        } else {
            login_failure();
            hide_spinner();
        }
    }
});
    //}
    $('#login_password').blur();
    $('#login_email').blur();
    return false;
});

 function show_multi_owners () {

    var results_array = new Array();
    results_array.push("<ul class='topcoat-list__container' id='listview'>");
    for(var i=0; i< owners_array.length; i++) {
        results_array.push("<li class='topcoat-list__item'>");
        results_array.push("<a data-transition='slide' href='javascript:show_dashboard_ajax_from_multi_owners(\""+ owners_array[i]['ID'] +"\")' id='"+ owners_array[i]['ID'] +"'>"+ owners_array[i]['label']);
        results_array.push("</a></li>");
    }
    results_array.push("</ul>");
    
    $('#view_title').show();
    //$('#view_title').html('Owners');

    $('#owners').html(results_array.join(""));
    $('#owners').show();
    if(!selected_owner_id){
        set_user_rights(owners_array[0].ID);
        selected_owner_id = owners_array[0].ID;
        // window.location = "#dashboard/"+owners_array[0].ID;
    }
    $("#hamburger").hide();
}

function show_dashboard_ajax_from_multi_owners (owner_id) {
    
    set_user_rights(owner_id);

    window.location = "#dashboard/"+owner_id;
}

function set_user_rights (owner_id) {
    $.ajax({
      url: "get_owner_rights.php?" +
      "userid=" + pal_user_id + "&appid=" + cwa_app_id + "&ownerid=" + owner_id ,
      datatype: 'json',
      beforeSend: function() {
        show_spinner();
    },
    success: function(data){
        hide_spinner();

        user_rights_settings = data['user_rights_settings'];
        $('#lnk_pms').removeClass('a_disabled');
        $('#lnk_crew').removeClass('a_disabled');
        // user_rights_settings = $.grep(user_rights_settings, function(e) {return e.page_header_name != 'PMS / Purchase'});

        var show_pms = $.grep(user_rights_settings, function(e) {return e.page_header_name == 'PMS / Purchase'});
        
        if(show_pms.length == 0){
            $('#lnk_pms').addClass('a_disabled');
        }

        // user_rights_settings = $.grep(user_rights_settings, function(e) {return e.page_header_name != 'Crewing'});

        var show_crew = $.grep(user_rights_settings, function(e) {return e.page_header_name == 'Crewing'});
        
        if(show_crew.length == 0){
            $('#lnk_crew').addClass('a_disabled');
        }

        if($.isArray(owner_vessels) == false){
            owner_vessels = $.makeArray(data['owner_vessels']);
        }
        if($.isArray(dashboard_settings) == false){
            dashboard_settings = $.makeArray(data['dashboard_settings']);
        }
    },
    error: function() {        
        alert('Please try again in a minute.');
        hide_spinner();
    }
});
}

$('#lnk_pms').click(function () {
    if($('#lnk_pms').hasClass('a_disabled')){ return false;}
});
$('#lnk_crew').click(function () {
    if($('#lnk_crew').hasClass('a_disabled')){ return false;}
});

function show_owners(){
    hide_all();
    $("#btnBack").show();
    $.ajax({
      url: "get_user_owners.php?" +
      "userid=" + pal_user_id + "&appid=" + cwa_app_id ,
      datatype: 'json',
      beforeSend: function() {
        show_spinner();
    },
    success: function(data){
        hide_spinner();
        owners_array = data["owners_array"];
        if(!owners_array){
            return;
        }
        if($.isArray(owners_array) == false){
            owners_array = $.makeArray(data["owners_array"]);
        }
        if(owners_array.length!=1){

            window.location = '#multiowners';
            
        }
        else{
            owner_vessels = data['owner_vessels'];
            dashboard_settings = data['dashboard_settings'];
            user_rights_settings = data['user_rights_settings'];

            // user_rights_settings = $.grep(user_rights_settings, function(e) {return e.page_header_name != 'PMS / Purchase'});

            var show_pms = $.grep(user_rights_settings, function(e) {return e.page_header_name == 'PMS / Purchase'});
            
            if(show_pms.length == 0){
                $('#lnk_pms').css('color', 'grey');
                $('#lnk_pms').click(function (e) {e.preventDefault();});
            }

            // user_rights_settings = $.grep(user_rights_settings, function(e) {return e.page_header_name != 'Crewing'});

            var show_crew = $.grep(user_rights_settings, function(e) {return e.page_header_name == 'Crewing'});
            
            if(show_crew.length == 0){
                $('#lnk_crew').css('color', 'grey');
                $('#lnk_crew').click(function (e) {e.preventDefault();});
            }

            if($.isArray(owner_vessels) == false){
                owner_vessels = $.makeArray(data['owner_vessels']);
            }
            if($.isArray(dashboard_settings) == false){
                dashboard_settings = $.makeArray(data['dashboard_settings']);
            }

            show_dashboard(owners_array[0].ID);
        }

    },
    error: function() {        
        alert('Please try again in a minute.');
        hide_spinner();
    }
});
}

function show_dashboard_ajax(owner_id){
    hide_all();
    $("#hamburger").show();
    selected_owner_id = owner_id;
    $.ajax({
      url: "get_owner_vessel.php?" +
      "owner_id=" + owner_id  + "&userid=" + pal_user_id + "&appid=" + cwa_app_id,
      datatype: 'json',
      beforeSend: function() {
        show_spinner();
    },
    success: function(data){
        owner_vessels = data['owner_vessels'];
        dashboard_settings = data['dashboard_settings'];

        if($.isArray(owner_vessels) == false){
            owner_vessels = $.makeArray(data['owner_vessels']);
        }
        if($.isArray(dashboard_settings) == false){
            dashboard_settings = $.makeArray(data['dashboard_settings']);
        }

        show_dashboard(owner_id);

    },
    error: function() {        
        alert('Please try again in a minute.');
        hide_spinner();
    }
});
}

function show_dashboard(owner_id){
    hide_all();
    selected_owner_id = owner_id;
    var results_array = new Array();

    results_array.push("<select id='sel_owner_vessel' class='topcoat-select' onchange='owner_vessel_selected()'>");
    results_array.push("<option value='-1'>Select Vessel</option>");
    for (var i = 0; i < owner_vessels.length; i++) {
        results_array.push("<option value='" + owner_vessels[i].object_id + "'>" + owner_vessels[i].name + "</option>");
    };
    results_array.push("</select>");
    results_array.push("<div id='dashboard_tiles' style='width:100%;'>");
    results_array.push("<div class='dashboard_tiles' id='vsltrk_tile'><h3 style='text-align: center;'>Vessel Tracker</h3><div id='trackerMap'></div></div>");
    results_array.push("<div id='accordion'></div>");
    results_array.push("</div>");
    // $("#accordion").accordion();

    hide_spinner();
    
    // $('#view_title').show();
    // $('#view_title').html('Dashboard');
    $('#dashboard').html(results_array.join(""));

    // $('#sel_owner_vessel').selectmenu();

    $('#dashboard').show();
    show_vessel_tracker = $.grep(dashboard_settings , function(e){ return e.code == 'VSLTRK'; });
    if(show_vessel_tracker.length > 0){
        GetMap();
        RequestData("O");
    }
    else{
        $('#vsltrk_tile').hide();
    }

    if(selected_vessel_id>0){    
        $('#sel_owner_vessel').val(selected_vessel_id);
        // $('#sel_owner_vessel_crew').selectmenu('refresh', true);
        owner_vessel_selected();
    }

}

function owner_vessel_selected(){
    var selected_vessel = document.getElementById("sel_owner_vessel").value;
    if(selected_vessel > 0){
        selected_vessel_id = selected_vessel;
        $.ajax({
          url: "get_owner_dashboard.php?" +
          "owner_id=" + selected_owner_id + "&vessel_object_id=" + selected_vessel_id ,
          datatype: 'json',
          beforeSend: function() {
            show_spinner();
        },
        success: function(data){
            var noon_report_data = data["noon_report"];

            var chartDs = [];
            var dates = [];
            var slipData = [];
            var EngineRPMData = [];
            var speedData = [];
            var FoConsumptionData = [];

            var results_array = new Array();
            if(data["vessel_info"]){
                results_array.push("<div class='dashboard_tiles' id='contact_info_tile'><h3 style='text-align: center;'>Contact Info</h3>");
                results_array.push("<div style='padding: 5px'> <ul id='ol_contact' class='topcoat-list list'> ");
                results_array.push("<li class='topcoat-list__item dashboard-list'> Manager : " + data["vessel_info"].primary_manager_name + "</li>");
                results_array.push("<li class='topcoat-list__item dashboard-list'> Email : <span> <a style='text-decoration: underline' href='mailto:" + data["vessel_info"].email + "'>" + data["vessel_info"].email + "</a></span></li>");
                results_array.push("<li class='topcoat-list__item dashboard-list'> Phone : ");
                if(data["vessel_info"].telephone_1 != null){
                    results_array.push("<span> <a style='text-decoration: underline' href='tel:00870" + data["vessel_info"].telephone_1 + "'>00870-" + data["vessel_info"].telephone_1 + "</a></span>");
                }
                if(data["vessel_info"].telephone_2 != null){
                    results_array.push("<span> <a style='text-decoration: underline' href='tel:00870" + data["vessel_info"].telephone_2 + "'>00870-" + data["vessel_info"].telephone_2 + "</a></span>");
                }
                if(data["vessel_info"].telephone_3 != null){
                    results_array.push("<span> <a style='text-decoration: underline' href='tel:00870" + data["vessel_info"].telephone_3 + "'>00870-" + data["vessel_info"].telephone_3 + "</a></span>");
                }
                results_array.push("</li>");
                results_array.push("</ul></div></div>");
            }
            if(noon_report_data){
                // temp = noon_report_data;
                results_array.push("<div class='dashboard_tiles' id='vslperf_tile'><h3 style='text-align: center;'>Noon Report</h3><div style='width:100%'><div id='noon_report_chart'></div></div></div>");
                
                var len = noon_report_data.length;

                // for (var x = 0; x < len; x++) {
                    for (var x = 0; x < 15; x++) {
                        var dataitem = noon_report_data[x];
                        if(!dataitem)
                            continue;
                        dates.push(kendo.format('{0:dd-MM-yyyy}', dataitem.report_date.split("T")[0]));
                        slipData.push(dataitem.slip);
                        FoConsumptionData.push(dataitem.me_fo_consumption);
                        speedData.push(dataitem.speed);
                        EngineRPMData.push(dataitem.engine_rpm);
                    }

                    dates.reverse();
                    slipData.reverse();
                    FoConsumptionData.reverse();
                    speedData.reverse();
                    EngineRPMData.reverse();

                    chartDs.push({ name: "Engine RPM", data: EngineRPMData, color: "#00004A" }, { name: "Speed Knots", data: speedData, color: "Brown" }, { name: "FO Consumption", data: FoConsumptionData, color: "#6A5ACD" }, { name: "Slip(%)", data: slipData, color: "DarkGreen" });
                    $('#accordion').html(results_array.join(""));

                // temp = dates;
                createNoonChart(chartDs, dates);
            }
            else{
                $('#accordion').html(results_array.join(""));
            }
            

            if($.grep(dashboard_settings , function(e){ return e.code == 'CREW'; }).length == 0){
                $('#crew_tile').hide();
            }
            if($.grep(dashboard_settings , function(e){ return e.code == 'VSLPERF'; }).length == 0){
                $('#vslperf_tile').hide();
            }
            if($.grep(dashboard_settings , function(e){ return e.code == 'VSLTRK'; }).length == 0){
                $('#contact_info_tile').hide();
            }

            if(show_vessel_tracker.length > 0){
                for (var i = 0; i < vessel_location.length; i++) {
                    if(vessel_location[i].Name.split('(')[0].toLowerCase() == $('#sel_owner_vessel option:selected').text().toLowerCase()){

                        /*map = new Microsoft.Maps.Map(document.getElementById("trackerMap"), { credentials: "AvOyltb0YAu_Ldagk8wP_XiQQGfXkHo5rlWlLs-mIpsB3Gcvt87UC-BIZdgc3QbL",
                           showDashboard:false, showScalebar:false, showMapTypeSelector:false, enableSearchLogo: false });*/
 var pushpin = new Microsoft.Maps.Pushpin(map.getCenter(), { text: '' });
 pushpin.setLocation(new Microsoft.Maps.Location(vessel_location[i].latitude, vessel_location[i].longitude));
 pushpin.title =  vessel_location[i].Name;
 pushpin.description = [vessel_location[i].latitude,vessel_location[i].longitude,vessel_location[i].datetime,vessel_location[i].speed,vessel_location[i].imo, vessel_location[i].degree, vessel_location[i].eta, vessel_location[i].destination, vessel_location[i].traildate, vessel_location[i].trailtime];

 closeInfobox();
                        // var pin = e.target;
                        var description = pushpin.description;
                        var html_array = new Array();
                        html_array.push("<span class='infobox_title'>" + vessel_location[i].Name + "</span> ("+description[8]+" : "+description[9]+")<br/>") ;
                        html_array.push("<b>Lat / Lon:&nbsp</b>"+prsflt(description[0])+"/"+prsflt(description[1])+"<br/> <b>Speed / Course:&nbsp</b>"+description[2]+"<br/>");
                        html_array.push("<b>Destination / ETA:&nbsp</b>"+description[7]+" / "+description[6]+"<br/>");
                        html_array.push('<span class="popup_label"><button onclick="show_vessel_path('+description[4]+','+description[5]+')" style="color:#00303f;font:bold 12px verdana; padding:5px;" title="click to see track">Show Track</button></span>');
                        
                        infobox.setLocation(new Microsoft.Maps.Location(vessel_location[i].latitude, vessel_location[i].longitude));

                        infobox.setOptions({
                            visible:true,
                            offset: new Microsoft.Maps.Point(-33, 20),
                            htmlContent: pushpinFrameHTML.replace('{content}', html_array.join(""))
                        });
                        
                        map.entities.push(pushpin); 
                        Microsoft.Maps.Events.addHandler(pushpin, 'click', displayEventInfo);
                        map.setView({ center: new Microsoft.Maps.Location(vessel_location[i].latitude+20, vessel_location[i].longitude+32), zoom  : 2});
                        /*var marker = create_marker(vessel_location[i].Name, vessel_location[i].latitude, vessel_location[i].longitude, vessel_location[i].speed, vessel_location[i].datetime, vessel_location[i].imo, vessel_location[i].degree, vessel_location[i].highlight)
                        temp = vessel_location[i];
                        popup_data(marker, vessel_location[i].Name, vessel_location[i].latitude, vessel_location[i].longitude, vessel_location[i].speed, vessel_location[i].datetime, vessel_location[i].imo, vessel_location[i].degree);*/
                    }
                };
            }

            hide_spinner();
        },

        error: function() {        
            alert('Please try again in a minute.');
            hide_spinner();
        }
    });

} else {
   $('#accordion').html("")
        //$('#dashboard_tiles').html(results_div);
        if(show_vessel_tracker.length > 0){
            GetMap();
            RequestData("O");
        }
    }
}

function createNoonChart(chartDs, dates) {
    $("#noon_report_chart").kendoChart({
        title: {
            text: ""
        },
        legend: {
            position: "bottom"
        },
        chartArea: {
            background: ""
        },
        seriesDefaults: {
            type: "line",
            style: "smooth",
            highlight: {visible:false}
        },
        series: chartDs,
        valueAxis: {
            line: {
                visible: false
            },
                //axisCrossingValue: -15,
                //majorUnit: 15,
                title: {
                    text: "Performance",
                    font: "12px Arial,Helvetica,sans-serif",
                    fontweight:"bold"
                },
            },
            categoryAxis: {
                categories: dates,
                majorGridLines: {
                    visible: false
                },
                labels: {
                    rotation: -45
                }
            },
            tooltip: {
                visible: false,
                template: "<span style='color:white'>#= series.name #: #= value #</span>"
            },
            axisDefaults: {
                labels: {
                    font: "10px Arial,Helvetica,sans-serif"
                }
            }
        });       
}

function show_vessel_details() {
    hide_all();

    var results_array = new Array();

    results_array.push("<select class='topcoat-select' id='sel_owner_vessel_det' onchange='get_vessel_details()'>");
    results_array.push("<option value='-1'>Select Vessel</option>");
    for (var i = 0; i < owner_vessels.length; i++) {
        results_array.push("<option value='" + owner_vessels[i].object_id + "'>" + owner_vessels[i].name + "</option>");
    };
    results_array.push("</select>");

    results_array.push("<div class='dashboard_tiles' id='crew_tile'>");
    results_array.push("<h3 style='text-align: center;'>Vessel Details</h3>");
    results_array.push("<div id='vesdetails' style='padding:10px;' class='my-navbar-content'>");
    results_array.push("</div></div>");

    $('#vessel_details').html(results_array.join(""));
    $('#vessel_details').show();

    if(selected_vessel_id>0){    
        $('#sel_owner_vessel_det').val(selected_vessel_id);
        // owner_vessel_crew_selected();
        get_vessel_details()
    }
}
function get_vessel_details() {
    var sel_val = document.getElementById('sel_owner_vessel_det');
    selected_vessel_id = document.getElementById("sel_owner_vessel_det").value;
    var sel_text = sel_val.options[sel_val.selectedIndex].innerHTML;
    for (var i = 0; i < owner_vessels.length; i++) {
        if(owner_vessels[i].name == sel_text){
            (owner_vessels[i].name + " "+ sel_text);
        }
        if(owner_vessels[i].name == sel_text){
            var results_array = new Array();
            var url = 'get_vessel_wiki.php?imo='+owner_vessels[i].imo;
            var req = $.ajax({
                url: url,
                datatype: 'text',
                beforeSend: function() {
                    show_spinner();
                },
                success : function(data) { 
                    results_array.push("<ul class='topcoat-list list'>");
                    results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span style='font-weight: bold;'>Vessel Type:</span> "+nullcheck(data['VSLTYPE'])+" (" + nullcheck(data['VSLSUBTYPE']) +")</span></li>");
                    results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span style='font-weight: bold;'>Management Type:</span> "+nullcheck(data['MGTTYPE'])+"</span></li>");
                    results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span style='font-weight: bold;'>Class Type, Number:</span> "+nullcheck(data['CLASSTYPE'])+", "+nullcheck(data['CLASS_NO'])+"</span></li>");
                    results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span style='font-weight: bold;'>Flag:</span> "+nullcheck(data['asset-parameter-flag'])+"</span></li>");
                    results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span style='font-weight: bold;'>Registered Owner:</span> "+nullcheck(data['REGOWN'])+"</span></li>");
                    results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span style='font-weight: bold;'>Ultimate Owner:</span> "+nullcheck(data['ULTIMATEOWN'])+"</span></li>");
                    results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span style='font-weight: bold;'>IMO, MMSI, Call sign, Hull number:</span> "+nullcheck(data['imo'])+", "+nullcheck(data['asset-parameter-mmsi'])+", "+nullcheck(data['CALL_SIGN'])+", "+data['HULL_NO']+"</span></li>");

                    results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span style='font-weight: bold;'>Maiden Name:</span> "+nullcheck(data['MAIDEN_NAME'])+"</span></li>");
                    results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span style='font-weight: bold;'>Built On:</span> "+dateformat(data['BUILT_ON'].split("T")[0])+"</span></li>");
                    results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span style='font-weight: bold;'>Yard:</span> "+nullcheck(data['YARD'])+"</span></li>");
                    results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span style='font-weight: bold;'>Dead Weight:</span> "+nullcheck(data['DWT']).formatMoney(0)+"</span></li>");
                    results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span style='font-weight: bold;'>Gross Tonnage:</span> "+nullcheck(data['GRT']).formatMoney(0)+"</span></li>");
                    
                    results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span style='font-weight: bold;'>Speed:</span> "+nullcheck(data['VESSEL_SPEED'])+"</span></li>");
                    results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span style='font-weight: bold;'>Main Engine:</span> "+nullcheck(data['MAIN_ENGINE_NO_OF_UNITS'])+" x "+nullcheck(data['MAIN_ENGINE_KW']).formatMoney(0)+"KW </span></li>");
                    results_array.push("</ul>");
                    $('#vesdetails').html(results_array.join(""));
                    hide_spinner();
                },
                error: function (request, status, error) {
                    hide_spinner();
                }

            });
}
}
}

/*-----Start Bing Map-------*/

var map, myLayer, infobox;
var pushpinFrameHTML = '<div class="infobox"><a class="infobox_close" href="javascript:closeInfobox()"><div class="close-button">x</div></a><div class="infobox_content">{content}</div></div><img src="./img/infoarrow.png" class="infobox_pointer">';


function GetMap() { 
    map = new Microsoft.Maps.Map(document.getElementById("trackerMap"), { credentials: "AvOyltb0YAu_Ldagk8wP_XiQQGfXkHo5rlWlLs-mIpsB3Gcvt87UC-BIZdgc3QbL",
        showDashboard:false, showScalebar:false, showMapTypeSelector:false, enableSearchLogo: false });

    //Register and load the Point Based Clustering Module
    Microsoft.Maps.registerModule("PointBasedClusteringModule", "scripts/PointBasedClustering.js");
    Microsoft.Maps.loadModule("PointBasedClusteringModule", { callback: function () {
      myLayer = new PointBasedClusteredEntityCollection(map, {
        singlePinCallback: createPin,
        clusteredPinCallback: createClusteredPin
    });

            //Add infobox layer that is above the clustered layers.
            var infoboxLayer = new Microsoft.Maps.EntityCollection();
            infobox = new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(0, 0), { 
              visible: false, offset: new Microsoft.Maps.Point(0,15) 
          });
            infoboxLayer.push(infobox);
            map.entities.push(infoboxLayer);
            map.setView({zoom:2});
        }
    });

    //Define custom properties for the pushpin class (this is needed for the infobox and not the clustering) 
    Microsoft.Maps.Pushpin.prototype.title = null;
    Microsoft.Maps.Pushpin.prototype.description = null;
}

function createPin(data, clusterInfo) {
    var pin = new Microsoft.Maps.Pushpin(clusterInfo.center);

    pin.title =  data.Name;
    pin.description = [data.latitude, data.longitude, data.datetime, data.speed, data.imo, data.degree, data.eta, data.destination, data.traildate, data.trailtime];//data.latitude+"@/"+data.longitude+"@/"+data.datetime+"@/"+data.speed+"@/"+data.imo;
    //Add handler for the pushpin click event.

    Microsoft.Maps.Events.addHandler(pin, 'click', displayEventInfo);
    return pin;
}

function createClusteredPin(clusterInfo) {
    var pin = new Microsoft.Maps.Pushpin(clusterInfo.center, { text: '+' });

    pin.title = "Cluster Group";
    //pin.description = "Cluster Index: " + clusterInfo.index + " Cluster Size: " + clusterInfo.dataIndices.length + " Zoom in for more details.";

    //Add handler for the pushpin click event.
    Microsoft.Maps.Events.addHandler(pin, 'click', displayEventClusterInfo);

    return pin;
}

//Makes a request for data
function RequestData(ownerMode) {
/*var size = parseInt(document.getElementById('dataSize').value);
TestDataGenerator.GenerateData(size, RequestDataCallback);*/
get_imo(RequestDataCallback, ownerMode);
}

function RequestDataVesselChange(response) {
    if (response != null) {
        map.setView({center: new Microsoft.Maps.Location(response.latitude, response.longitude)});
        myLayer.SetData(response);
        $(".spinner").hide();
    }
}

function RequestDataCallback(response) {
    if (response != null) {
        map.setView({center: new Microsoft.Maps.Location(response[0].latitude, response[0].longitude)});
        myLayer.SetData(response);
        $(".spinner").hide();
    }
}

function displayEventClusterInfo(e) {
    var z = map.getZoom()+3;
    if (e.targetType == "pushpin") {
        var loc = e.target.getLocation();
        map.setView({zoom:z, center: loc});
    }
}

function displayEventInfo(e) { 
    // console.log(e);
   //  closeInfobox();
   var pin = e.target;
   var description = pin.description;
   //  var html_array = new Array();
   //  html_array.push("<span class='infobox_title'>" + pin.title + "</span> ("+description[8]+" : "+description[9]+")<br/>") ;
   //  html_array.push("<b>Lag / Log:</b>"+prsflt(description[0])+"/"+prsflt(description[1])+"("+description[2]+")<br/> <b>Speed / Course:</b>"+description[3]+"<br/>");
   //  html_array.push("<b>Destination / ETA:</b>"+description[7]+" / "+description[6]+"<br/>");
   // /* html_array.push('<span class="popup_label"><button onclick="fetch_vessel_wiki('+description[4]+')" style="color:#00303f;font:bold 12px verdana;padding:5px;" title="vessel wiki">Additional Details</button></span>');*/
   //  html_array.push('<span class="popup_label"><button onclick="show_vessel_path('+description[4]+','+description[5]+')" style="color:#00303f;font:bold 12px verdana; padding:5px;" title="click to see track">Show Track</button></span>');
   //  /*    html += '<div style="padding-top: 7px;">'+
   //  '<span class="popup_label"><button  onclick="fetch_vessel_wiki('+description[4]+')" style="color:#00303f;font:bold 12px verdana; padding:5px;" title="vessel wiki">Additional Details</a></span>' +
   //  '<span class="popup_label"><button onclick="show_fav_on_map('+description[4]+')" class="show_on_map" id=map_'+description[4]+' style="color:#00303f;font:bold 12px verdana; padding:5px;" title="click to see track">Show On Map</a></span>'+
   //  '</div>';*/


   //  if (e.targetType == "pushpin") {
   //      infobox.setLocation(e.target.getLocation());

   //      infobox.setOptions({
   //          visible:true,
   //          offset: new Microsoft.Maps.Point(-33, 20),
   //          htmlContent: pushpinFrameHTML.replace('{content}', html_array.join(""))
   //      });
   //  }
   show_vessel_dashbord(pin.title);
}

function show_vessel_dashbord(name){
    var vsl;
    for (var i = 0; i < owner_vessels.length; i++) {
        if(name.toLowerCase() == owner_vessels[i].name.toLowerCase()){
            vsl=owner_vessels[i];
        }
    };
    $('#sel_owner_vessel').val(vsl.object_id);
    // $('#sel_owner_vessel').selectmenu('refresh', true);

    owner_vessel_selected();
}

function closeInfobox() {
    $(".infobox").hide();
    $(".infobox_pointer").hide();
}

function hideInfobox(e) {
    $(".infobox").hide();
    $(".infobox_pointer").hide();
}

/*-----Start Map Dataload---------*/

function get_imo(callback, ownerMode) {

    var imodata = 'imo=["';
    if(ownerMode == "O") {
        for (var i = 0; i < owner_vessels.length; i++) {
            if(i<1)
                imodata += owner_vessels[i].imo;
            else
                imodata += ','+owner_vessels[i].imo;
        }
    } else {
        for (var i = 0; i < owner_vessels.length; i++) {
            if(owner_vessels[i].object_id == selected_vessel_id){
                imodata += owner_vessels[i].imo;
            }
        }
    }
    imodata += '"]';
    var url = 'get_vessel_positions_cwa.php?'+imodata;
    // console.log(url);
    $.ajax({
        url: url,
        datatype: 'text',
        beforeSend: function() {
            show_spinner();
        },
        success: function(data){
            if(data!=null){
                var dat = [], randomLatitude, randomLongitude;
                for (var i = 0; i < data.length; i++) {
                // console.log(data[i]['trail-date-time-date-of-value']);
                var lat_lon = parse_lat_lon(data[i]);
                dat.push(new DataModel(data[i]['asset-name'], lat_lon['lat'], lat_lon['lon'], 
                  prsflt(data[i]['speed-value-of-value'])+ " " + data[i]['speed-units-of-value'].toLowerCase(), 
                  prsflt(data[i]['speed-value-of-value']) + " " + data[i]['speed-units-of-value'].toLowerCase()  + " / " + data[i]['heading-value-of-value'] + " " + data[i]['heading-units-of-value'].toLowerCase(),
                  data[i]['i-m-o-number'], data[i]['heading-value-of-value'], data[i]['eta'], data[i]['destination'], data[i]['trail-date-time-date-of-value'], data[i]['trail-date-time-time-of-value'], false));
                vessel_location = dat;
            }

            if (callback) {
                hide_spinner();
                callback(dat);
            }
        }else{
            hide_spinner();
            alert("No data found Please change search criteria");
        }
        
    },
    error: function() {        
        alert('Please try again in a minute.');
        hide_spinner();
    }
});
}

function parse_lat_lon(response) {
    var lat = 0.0, lon = 0.0, lat_display = '', lon_display = '';
    if (response['latitude-degrees-of-value']!= null) {
        lat += parseFloat(response['latitude-degrees-of-value']);
    }
    if (response['latitude-minutes-of-value']!= null) {
        lat += parseFloat(response['latitude-minutes-of-value']) / 60;
    }
    if (response['latitude-seconds-of-value']!= null) {
        lat += parseFloat(response['latitude-seconds-of-value']) / 3600;
    }

    if (response['longitude-degrees-of-value']!= null) {
        lon += parseFloat(response['longitude-degrees-of-value']);
    }
    if (response['longitude-minutes-of-value']!= null) {
        lon += parseFloat(response['longitude-minutes-of-value']) / 60;
    }
    if (response['longitude-seconds-of-value']!= null) {
        lon += parseFloat(response['longitude-seconds-of-value']) / 3600;
    }
    // lat = encodeURIComponent(lat);
    // lon = encodeURIComponent(lon);
    if (response['latitude-hemisphere-of-value'] != 'north') {lat = -1 * lat;}
    if (response['longitude-hemisphere-of-value'] != 'east') {lon = -1 * lon;}
    var lat_lon = new Array();
    lat_lon['lat'] = lat;
    lat_lon['lon'] = lon;
    return lat_lon;
}

var DataModel = function (name, latitude, longitude, speed, datetime, imo, degree, eta, destination, traildate, trailtime, highlight) {
  this.Name = name;
  this.latitude = latitude;
  this.longitude = longitude;
  this.speed = speed;
  this.datetime = datetime; //here datetime is combo of speed and course
  this.imo = imo;
  this.highlight = highlight;
  this.degree = degree;
  this.eta = eta;
  this.destination = destination;
  this.traildate = traildate;
  this.trailtime = trailtime;
};


function prsflt(e){
  return parseFloat(e).toFixed(2);
}

/*-----End Map Dataload---------*/

/******************************Start Vessel path*********************************************/

var req;
function show_vessel_path(imo, degrees) {
    map.entities.remove(layer2);
    closeInfobox();
    var url = '../get_vessel_position_history.php?i-m-o-number='+imo;
    req = $.ajax({
        url: url,
        beforeSend: function() {
         show_spinner();
     },

     success : function(response) {
        hide_spinner();
        var previous_positions_lat_lon = new Array();
        var cur_lat_lon = parse_lat_lon(response[0]);
        var cur_lat = cur_lat_lon['lat'];
        var cur_lon = cur_lat_lon['lon'];
            // Starting from index 1 because, skipping the most recent position.
            for (var i=1; i<response.length; ++i) {
            // For each vessel:
            // Parse the lat,lon
            var lat_lon = parse_lat_lon(response[i]);
            previous_positions_lat_lon.push(lat_lon);
        }

        plot_vessel_track(cur_lat_lon, previous_positions_lat_lon);
    }
});
}
var vessel_path_plotted;
var layer2;
// Function to Show ship_track
function plot_vessel_track(current_position_lat_lon,previous_positions_lat_lon) {
    var location1 = new Microsoft.Maps.Location(current_position_lat_lon['lat'], current_position_lat_lon['lon']);
    var lineVertices = new Array();
    lineVertices.push(location1);
    for(var i=0; i<previous_positions_lat_lon.length;++i) {
        lineVertices.push(new Microsoft.Maps.Location(previous_positions_lat_lon[i]['lat'], previous_positions_lat_lon[i]['lon']));
    }
    map.setView({center: new Microsoft.Maps.Location(current_position_lat_lon['lat'], current_position_lat_lon['lon'])});
    var line = new Microsoft.Maps.Polyline(lineVertices);
    layer2 = new Microsoft.Maps.EntityCollection();
    layer2.push(line);
    map.entities.push(layer2);
}

/*function show_vessel_path(imo, degrees) {
    open_info_window.close();
    req = $.ajax({
        url: 'https://getVesselTracker.com/get_vessel_position_history.php?i-m-o-number='+imo,
        beforeSend: function() {
            show_spinner();
        },

        success : function(response) {
            var previous_positions_lat_lon = new Array();

            for (var i=1; i<response.length; ++i) {
                previous_positions_lat_lon.push(parse_lat_lon(response[i]));
            }
            plot_vessel_track(parse_lat_lon(response[0]), previous_positions_lat_lon);
        }
    });
}

var vessel_path_plotted;
function plot_vessel_track(current_position_lat_lon,previous_positions_lat_lon) {
    map.setCenter(new google.maps.LatLng(current_position_lat_lon['lat'], current_position_lat_lon['lon']));
    var cur_pos = new google.maps.LatLng(current_position_lat_lon['lat'], current_position_lat_lon['lon']);
    var path_positions = new Array();
    path_positions.push(cur_pos);

    for(var i=0; i<previous_positions_lat_lon.length;++i) {
        path_positions.push(new google.maps.LatLng(previous_positions_lat_lon[i]['lat'], previous_positions_lat_lon[i]['lon']));
    }

    if (vessel_path_plotted != null) {
        vessel_path_plotted.setMap(null);
    }

    vessel_path_plotted = new google.maps.Polyline({
        path: [path_positions],
        strokeWeight: 2,
        strokeColor: 'red',
        map: map
    });
    hide_spinner();
}*/
/******************************End Vessel path*********************************************/

function show_spinner() {
    $(".spinner_index").css('display','inline');
    $(".spinner_index").center();
}

function hide_spinner() {
    $(".spinner_index").hide();
}

function show_pms(){
    hide_all();

    var results_array = new Array();

    results_array.push("<select class='topcoat-select' id='sel_owner_vessel_pms' onchange='owner_vessel_pms_selected()'>");
    results_array.push("<option value='-1'>Select Vessel</option>");
    for (var i = 0; i < owner_vessels.length; i++) {
        results_array.push("<option value='" + owner_vessels[i].object_id + "'>" + owner_vessels[i].name + "</option>");
    };
    results_array.push("</select>");
    results_array.push("<div class='dashboard_tiles' id='maintenance_analysis'>");
    results_array.push("<h3 style='text-align: center;'>Maintenance Analysis</h3>");
    results_array.push("<div style='width:100%'>");
    results_array.push("<div id='maintenance_analysis_chart_1'></div>");
    results_array.push("<hr>");
    results_array.push("<div id='maintenance_analysis_chart_4'></div>");
    results_array.push("<hr>");
    results_array.push("<div id='maintenance_analysis_chart_2'></div>");
    results_array.push("<hr>");
    results_array.push("<div id='maintenance_analysis_chart_3'></div>");
    results_array.push("<hr>");
    results_array.push("<div id='maintenance_analysis_chart_5'></div>");
    results_array.push("</div>");
    
    results_array.push("</div>");
    results_array.push("<div class='dashboard_tiles' id='crit-equip-tile'>");
    results_array.push("<h3 style='text-align: center;'>Critical Equipments</h3>");
    results_array.push("<div id='crit_equip_list' style='padding:10px;' class='my-navbar-content'>");
    results_array.push("</div></div>");

    $('#pms').html(results_array.join(""));

    $('#maintenance_analysis').hide();
    $('#crit-equip-tile').hide();
    $('#pms').show();
    // $('#sel_owner_vessel_pms').selectmenu();

    if(selected_vessel_id>0){    
        $('#sel_owner_vessel_pms').val(selected_vessel_id);
        // $('#sel_owner_vessel_pms').selectmenu('refresh', true);
        owner_vessel_pms_selected();
    }
    
}

function owner_vessel_pms_selected(){

    // var show_maintenance_analysis = $.grep(user_rights_settings, function(e) {return e.page_header_name == 'Maintenance Analysis'});

    // if(show_maintenance_analysis.length == 0){
    //     return;
    // }

    var selected_vessel = document.getElementById("sel_owner_vessel_pms").value;
    selected_vessel_id = selected_vessel;

    if(selected_vessel_id<=0){
        $('#maintenance_analysis').hide();
        $('#crit-equip-tile').hide();
        return;
    }
    $.ajax({
        url: 'get_owner_pms.php?' + 
        "owner_id=" + selected_owner_id + "&vessel_object_id=" + selected_vessel + "&app_id=" + cwa_app_id,
        datatype: 'text',
        beforeSend: function() {
            show_spinner();
        },
        success: function(data){            
            hide_spinner();
            if(!data["maintenance_analysis"]) {
                return;
            }
            create_maintenance_analysis_chart(data["maintenance_analysis"]);
            $('#maintenance_analysis').show();
            var chart = $("#maintenance_analysis_chart_1").data("kendoChart");
            chart.refresh();
            chart = $("#maintenance_analysis_chart_2").data("kendoChart");
            chart.refresh();
            chart = $("#maintenance_analysis_chart_3").data("kendoChart");
            chart.refresh();
            chart = $("#maintenance_analysis_chart_4").data("kendoChart");
            chart.refresh();
            chart = $("#maintenance_analysis_chart_5").data("kendoChart");
            chart.refresh();

            $('#crit-equip-tile').show();

            var critequip_array = new Array();

            critequip_array.push("<ul id='ol_crew_list' class='topcoat-list list'>");
            for (var i = 0; i < data["critical_equip"].length; i++) {
                var dataitem = data["critical_equip"][i];
                critequip_array.push("<li class='topcoat-list__item'>");
                critequip_array.push(toTitleCase(dataitem.name));
                critequip_array.push("</li>");
            };
            critequip_array.push("</ul>");
            $('#crit_equip_list').html(critequip_array.join(""));
        },
        error: function() {        
            alert('Please try again in a minute.');
            hide_spinner();            
        }
    });
}

function create_maintenance_analysis_chart(data){
    // var len = noon_report_data.length;    
    var chartDs_1 = [];
    var chartDs_2 = [];
    var chartDs_3 = [];
    var chartDs_4 = [];
    var chartDs_5 = [];
    var dates = [];
    var due_this_month = [];
    var completed_this_month = [];
    var over_due_this_month_non_critical = [];
    var percentage_outstanding = [];

    var overdue_this_month_critical = [];
    var overdue_current_month = [];
    var overdue_completed = [];
    var overdue_not_completed = [];
    var additional_jobs = [];
    var outside_pms_jobs = [];
    
    var d = new Date();
    var month = new Array();
    month[0]="Jan";
    month[1]="Feb";
    month[2]="Mar";
    month[3]="Apr";
    month[4]="May";
    month[5]="Jun";
    month[6]="Jul";
    month[7]="Aug";
    month[8]="Sep";
    month[9]="Oct";
    month[10]="Nov";
    month[11]="Dec";
    for (var i = 7; i < 12; i++) {
        dates.push(month[d.getMonth()]);
        d.setMonth(d.getMonth()-1);

        due_this_month.push($.grep(data, function(e) {return e.record_flag == 'DUE_THIS_MONTH'})[0]["m"+(i+1)]);
        completed_this_month.push($.grep(data, function(e) {return e.record_flag == 'COMPLETED_THIS_MONTH'})[0]["m"+(i+1)]);
        
        overdue_this_month_critical.push($.grep(data, function(e) {return e.record_flag == 'OVERDUE_THIS_MONTH_CRITICAL'})[0]["m"+(i+1)]);
        over_due_this_month_non_critical.push($.grep(data, function(e) {return e.record_flag == 'OVER_DUE_THIS_MONTH_NON_CRITICAL'})[0]["m"+(i+1)]);
        
        overdue_completed.push($.grep(data, function(e) {return e.record_flag == 'OVERDUE_COMPLETED'})[0]["m"+(i+1)]);
        overdue_not_completed.push($.grep(data, function(e) {return e.record_flag == 'OVERDUE_NOT_COMPLETED'})[0]["m"+(i+1)]);
        overdue_current_month.push($.grep(data, function(e) {return e.record_flag == 'OVERDUE_CURRENT_MONTH'})[0]["m"+(i+1)]);
        additional_jobs.push($.grep(data, function(e) {return e.record_flag == 'ADDITIONAL_JOBS'})[0]["m"+(i+1)]);
        outside_pms_jobs.push($.grep(data, function(e) {return e.record_flag == 'OUTSIDE_PMS_JOBS'})[0]["m"+(i+1)]);

        percentage_outstanding.push($.grep(data, function(e) {return e.record_flag == 'PERCENTAGE_OUTSTANDING'})[0]["m"+(i+1)]);
    };

    // DUE_THIS_MONTH
    // COMPLETED_THIS_MONTH
    // PERCENTAGE_OUTSTANDING

    // OVERDUE_THIS_MONTH_CRITICAL
    // OVER_DUE_THIS_MONTH_NON_CRITICAL

    // OVERDUE_COMPLETED
    // OVERDUE_NOT_COMPLETED
    // OVERDUE_CURRENT_MONTH
    // ADDITIONAL_JOBS
    // OUTSIDE_PMS_JOBS

    dates.reverse();

    chartDs_1.push({ name: $.grep(data, function(e) {return e.record_flag == 'DUE_THIS_MONTH'})[0]['activity'], data: due_this_month, color: "#00004A" }, 
     { name: $.grep(data, function(e) {return e.record_flag == 'COMPLETED_THIS_MONTH'})[0]['activity'], data: completed_this_month, color: "Brown" });

    chartDs_2.push({ name: $.grep(data, function(e) {return e.record_flag == 'OVERDUE_THIS_MONTH_CRITICAL'})[0]['activity'], data: overdue_this_month_critical, color: "#00004A" }, 
     { name: $.grep(data, function(e) {return e.record_flag == 'OVER_DUE_THIS_MONTH_NON_CRITICAL'})[0]['activity'], data: over_due_this_month_non_critical, color: "#6A5ACD" });

    chartDs_3.push({ name: $.grep(data, function(e) {return e.record_flag == 'OVERDUE_COMPLETED'})[0]['activity'], data: overdue_completed, color: "#0D74FF" }, 
     { name: $.grep(data, function(e) {return e.record_flag == 'OVERDUE_NOT_COMPLETED'})[0]['activity'], data: overdue_not_completed, color: "#FF0000" }, 
     { name: $.grep(data, function(e) {return e.record_flag == 'OVERDUE_CURRENT_MONTH'})[0]['activity'], data: overdue_current_month, color: "DarkGreen" })

    chartDs_4.push({ name: $.grep(data, function(e) {return e.record_flag == 'PERCENTAGE_OUTSTANDING'})[0]['activity'], data: percentage_outstanding, color: "DarkGreen" });

    chartDs_5.push({ name: $.grep(data, function(e) {return e.record_flag == 'ADDITIONAL_JOBS'})[0]['activity'], data: additional_jobs, color: "#6A5ACD" }, 
     { name: $.grep(data, function(e) {return e.record_flag == 'OUTSIDE_PMS_JOBS'})[0]['activity'], data: outside_pms_jobs, color: "Brown" })

    $("#maintenance_analysis_chart_1").kendoChart({
        title: {
            text: ""
        },
        legend: {
            position: "bottom"
        },
        chartArea: {
            background: ""
        },
        seriesDefaults: {
            type: "line",
            style: "smooth",
            highlight: {visible:false}
        },
        series: chartDs_1,
        valueAxis: {
            line: {
                visible: false
            },
            //axisCrossingValue: -15,
            //majorUnit: 15,
            title: {
                font: "12px Arial,Helvetica,sans-serif",
                fontweight:"bold"
            },
        },
        categoryAxis: {
            categories: dates,
            majorGridLines: {
                visible: false
            },
            labels: {
                rotation: -45
            }
        },
        tooltip: {
            visible: false,
            template: "<span style='color:white'>#= series.name #: #= value #</span>"
        },
        axisDefaults: {
            labels: {
                font: "10px Arial,Helvetica,sans-serif",
            }
        }
    });
 $("#maintenance_analysis_chart_2").kendoChart({
    title: {
        text: ""
    },
    legend: {
        position: "bottom"
    },
    chartArea: {
        background: ""
    },
    seriesDefaults: {
        type: "line",
        style: "smooth",
        highlight: {visible:false}
    },
    series: chartDs_2,
    valueAxis: {
        line: {
            visible: false
        },
            //axisCrossingValue: -15,
            //majorUnit: 15,
            title: {
                font: "12px Arial,Helvetica,sans-serif",
                fontweight:"bold"
            },
        },
        categoryAxis: {
            categories: dates,
            majorGridLines: {
                visible: false
            },
            labels: {
                rotation: -45
            }
        },
        tooltip: {
            visible: false,
            template: "<span style='color:white'>#= series.name #: #= value #</span>"
        },
        axisDefaults: {
            labels: {
                font: "10px Arial,Helvetica,sans-serif"
            }
        }
    });
 $("#maintenance_analysis_chart_3").kendoChart({
    title: {
        text: ""
    },
    legend: {
        position: "bottom"
    },
    chartArea: {
        background: ""
    },
    seriesDefaults: {
        type: "line",
        style: "smooth",
        highlight: {visible:false}
    },
    series: chartDs_3,
    valueAxis: {
        line: {
            visible: false
        },
            //axisCrossingValue: -15,
            //majorUnit: 15,
            title: {
                font: "12px Arial,Helvetica,sans-serif",
                fontweight:"bold"
            },
        },
        categoryAxis: {
            categories: dates,
            majorGridLines: {
                visible: false
            },
            labels: {
                rotation: -45
            }
        },
        tooltip: {
            visible: false,
            template: "<span style='color:white'>#= series.name #: #= value #</span>"
        },
        axisDefaults: {
            labels: {
                font: "10px Arial,Helvetica,sans-serif"
            }
        }
    });
 $("#maintenance_analysis_chart_4").kendoChart({
    title: {
        text: ""
    },
    legend: {
        position: "bottom"
    },
    chartArea: {
        background: ""
    },
    seriesDefaults: {
        type: "line",
        style: "smooth",
        highlight: {visible:false}
    },
    series: chartDs_4,
    valueAxis: {
        line: {
            visible: false
        },
            //axisCrossingValue: -15,
            //majorUnit: 15,
            title: {
                font: "12px Arial,Helvetica,sans-serif",
                fontweight:"bold"
            },
        },
        categoryAxis: {
            categories: dates,
            majorGridLines: {
                visible: false
            },
            labels: {
                rotation: -45
            }
        },
        tooltip: {
            visible: false,
            template: "<span style='color:white'>#= series.name #: #= value #</span>"
        },
        axisDefaults: {
            labels: {
                font: "10px Arial,Helvetica,sans-serif",
            }
        }
    });

 $("#maintenance_analysis_chart_5").kendoChart({
    title: {
        text: ""
    },
    legend: {
        position: "bottom"
    },
    chartArea: {
        background: ""
    },
    seriesDefaults: {
        type: "line",
        style: "smooth",
        highlight: {visible:false}
    },
    series: chartDs_5,
    valueAxis: {
        line: {
            visible: false
        },
            //axisCrossingValue: -15,
            //majorUnit: 15,
            title: {
                font: "12px Arial,Helvetica,sans-serif",
                fontweight:"bold"
            },
        },
        categoryAxis: {
            categories: dates,
            majorGridLines: {
                visible: false
            },
            labels: {
                rotation: -45
            }
        },
        tooltip: {
            visible: false,
            template: "<span style='color:white'>#= series.name #: #= value #</span>"
        },
        axisDefaults: {
            labels: {
                font: "10px Arial,Helvetica,sans-serif",
            }
        }
    });
}

function show_crew_list(){
    hide_all();

    var results_array = new Array();

    results_array.push("<select class='topcoat-select' id='sel_owner_vessel_crew' onchange='owner_vessel_crew_selected()'>");
    results_array.push("<option value='-1'>Select Vessel</option>");
    for (var i = 0; i < owner_vessels.length; i++) {
        results_array.push("<option value='" + owner_vessels[i].object_id + "'>" + owner_vessels[i].name + "</option>");
    };
    results_array.push("</select>");

    results_array.push("<div class='dashboard_tiles' id='crew_tile'>");
    results_array.push("<h3 style='text-align: center;'>Crew List</h3>");
    results_array.push("<div id='crew_list' style='padding:10px;' class='my-navbar-content'>");
    results_array.push("</div></div>");

    $('#crew').html(results_array.join(""));

    $('#crew_tile').hide();
    $('#crew').show();
    // $('#sel_owner_vessel_crew').selectmenu();

    if(selected_vessel_id>0){    
        $('#sel_owner_vessel_crew').val(selected_vessel_id);
        // $('#sel_owner_vessel_crew').selectmenu('refresh', true);
        owner_vessel_crew_selected();
    }
}

function owner_vessel_crew_selected (argument) {
    // var show_maintenance_analysis = $.grep(user_rights_settings, function(e) {return e.page_header_name == 'Crewing'});

    // if(show_maintenance_analysis.length == 0){
    //     return;
    // }

    var selected_vessel = document.getElementById("sel_owner_vessel_crew").value;
    selected_vessel_id = selected_vessel;
    if(selected_vessel_id<=0){
        $('#crew_tile').hide();
        return;
    }
    $.ajax({
        url: 'get_vessel_crew_list.php?' + 
        "owner_id=" + selected_owner_id + "&vessel_object_id=" + selected_vessel,
        datatype: 'text',
        beforeSend: function() {
            show_spinner();
        },
        success: function(data){            
            hide_spinner();

            if(data["crew_list"]==null){
                return;
            }

            $('#crew_tile').show();

            var crew_array = new Array();
            owner_crew = data["crew_list"];

            crew_array.push("<ul id='ol_crew_list' class='topcoat-list list'>");
            for (var i = 0; i < data["crew_list"].length; i++) {
                var dataitem = data["crew_list"][i];
                crew_array.push("<li class='topcoat-list__item'>");
                crew_array.push("<a href='#crew_cv/"+ dataitem.emp_id +"'>" +
                    "<div class='dashboard-list'> " +
                    "<span class='li-data-list-small'>" + toTitleCase(dataitem.rank) + "</span>" + 
                    " - <span style='font-weight: bold;'>" + toTitleCase(dataitem.emp_name) + "</span> " + 
                    "(" + toTitleCase(dataitem.nationality) + ")</span><span class='chevron'></div></a>");
                crew_array.push("</li>");
            };
            crew_array.push("</ul>");
            $('#crew_list').html(crew_array.join(""));

        },
        error: function() {        
            alert('Please try again in a minute.');
            hide_spinner();            
        }
    });
}

function show_crew_cv (emp_id) {
    $.ajax({
        url: 'get_crew_cv.php?' + 
        "emp_id=" + emp_id,
        datatype: 'text',
        beforeSend: function() {
            show_spinner();
        },
        success: function(data){    
            temp= data;        
            hide_spinner();
            // $('html, body').animate({scrollTop: $('#crew_tile').offset().top-80}, 'slow');
            $('#btnBack').show();
            $('#crew').hide();
            $('body').scrollTop(0);
            // step_back = function(){
            //     window.location.href = "#back_crewcv"
            // };

            if(!data.crew_cv){
                return;
            }
            data = data.crew_cv;

            var selected_crew = $.grep(owner_crew , function(e){ return e.emp_id == emp_id; })[0];

            var results_array = new Array();

            results_array.push("<div class='dashboard_tiles'>");
            results_array.push("<h3>"+toTitleCase(selected_crew.emp_name)+", "+toTitleCase(selected_crew.rank)+" ("+toTitleCase(selected_crew.nationality)+")</h3>");       
            results_array.push("</div>");

            results_array.push("<div class='dashboard_tiles'>");
            results_array.push("<h3>Experience</h3>");
            results_array.push("<ul class='topcoat-list list' data-role='listview'>");
            
            if($.isArray(data.SummaryByRanks.SummaryEntity)){
                for (var i = 0; i < data.SummaryByRanks.SummaryEntity.length; i++) {
                    var item = data.SummaryByRanks.SummaryEntity[i];
                    results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span class='li-data-list-small'>" + toTitleCase(item.Rank) + " : </span><span style='font-weight: bold;'>"+ item.Duration + "</span></li>");
                };
            }
            else{
                var item = data.SummaryByRanks.SummaryEntity;
                results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span class='li-data-list-small'>" + toTitleCase(item.Rank) + " : </span><span style='font-weight: bold;'>"+ item.Duration + "</span></li>");
            }

            if($.isArray(data.SummaryByVesselTypes.SummaryEntity)){
                for (var i = data.SummaryByVesselTypes.SummaryEntity.length - 1; i >= 0; i--) {

                    var item = data.SummaryByVesselTypes.SummaryEntity[i];
                    results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span class='li-data-list-small'>" + toTitleCase(item.VesselType) + " : </span><span style='font-weight: bold;'>"+ item.Duration + "</span></li>");
                };
            }
            else{
                var item = data.SummaryByVesselTypes.SummaryEntity;
                results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span class='li-data-list-small'>" + toTitleCase(item.VesselType) + " : </span><span style='font-weight: bold;'>"+ item.Duration + "</span></li>");
            }
            
            results_array.push("</ul>");
            results_array.push("</div>");

            results_array.push("<div class='dashboard_tiles'>");
            results_array.push("<h3>Sea Service with Company</h3>");
            results_array.push("<table class='crew_table'>");
            results_array.push("<tr>");
            results_array.push("<th>Company</th>");
            results_array.push("<th>Rank</th>");
            results_array.push("<th class='crew_detail'>Sign-on Date</th>");
            results_array.push("<th class='crew_detail'>Sign-off Date</th>");
            results_array.push("<th class='crew_detail'>Veseel</th>");
            results_array.push("</tr>");
            if($.isArray(data.SeaServiceData.SeaServiceEntity)){
                for (var i = 0; i < data.SeaServiceData.SeaServiceEntity.length; i++) {
                    var dataitem = data.SeaServiceData.SeaServiceEntity[i];
                    results_array.push("<tr class='itemRow'>");
                    results_array.push("<td> <span class='dashboard-list' style='font-weight: bold;'>" + dataitem.Company + "</span></td>");
                    results_array.push("<td> <span class='dashboard-list' style='font-weight: bold;'>" + toTitleCase(dataitem.Rank) + "</span></td>");
                    results_array.push("<td class='crew_detail'>" + ((dataitem.SignOnDate) ? dataitem.SignOnDate.split("T")[0] : "") + "</td>");
                    results_array.push("<td class='crew_detail'>" + ((dataitem.SignOffDate) ? dataitem.SignOffDate.split("T")[0] : "") + "</td>");
                    results_array.push("<td class='crew_detail'>" + dataitem.Vessel + "</td>");
                    results_array.push('<td><img style="height: 25px;width: 25px;" src="css/images/next.svg"></td>');
                    results_array.push("</tr>");
                };
            }
            else{
                var dataitem = data.SeaServiceData.SeaServiceEntity;
                results_array.push("<tr class='itemRow'>");
                results_array.push("<td> <span class='dashboard-list' style='font-weight: bold;'>" + dataitem.Company + "</span></td>");
                results_array.push("<td> <span class='dashboard-list' style='font-weight: bold;'>" + toTitleCase(dataitem.Rank) + "</span></td>");
                results_array.push("<td class='crew_detail'>" + ((dataitem.SignOnDate) ? dataitem.SignOnDate.split("T")[0] : "") + "</td>");
                results_array.push("<td class='crew_detail'>" + ((dataitem.SignOffDate) ? dataitem.SignOffDate.split("T")[0] : "") + "</td>");
                results_array.push("<td class='crew_detail'>" + dataitem.Vessel + "</td>");
                results_array.push('<td><img style="height: 25px;width: 25px;" src="css/images/next.svg"></td>');
                results_array.push("</tr>");
            }

            if(data.SeaServiceOtherData.SeaServiceEntity)
            {
                results_array.push("</table>");
                results_array.push("</div>");

                results_array.push("<div class='dashboard_tiles'>");
                results_array.push("<h3>Sea Service with Other Companies</h3>");            
                results_array.push("<table class='crew_table'>");
                results_array.push("<tr>");
                results_array.push("<th>Company</th>");
                results_array.push("<th>Rank</th>");
                results_array.push("<th class='crew_detail'>Sign-on Date</th>");
                results_array.push("<th class='crew_detail'>Sign-off Date</th>");
                results_array.push("<th class='crew_detail'>Veseel</th>");
                results_array.push("</tr>");
                if($.isArray(data.SeaServiceOtherData.SeaServiceEntity)){
                    for (var i = 0; i < data.SeaServiceOtherData.SeaServiceEntity.length; i++) {
                        var dataitem = data.SeaServiceOtherData.SeaServiceEntity[i];
                        results_array.push("<tr class='itemRow'>");
                        results_array.push("<td> <span class='dashboard-list' style='font-weight: bold;'>" + toTitleCase(dataitem.Company) + "</span></td>");
                        results_array.push("<td> <span class='dashboard-list' style='font-weight: bold;'>" + toTitleCase(dataitem.Rank) + "</span></td>");
                        results_array.push("<td class='crew_detail'>" + ((dataitem.SignOnDate) ? dataitem.SignOnDate.split("T")[0] : "") + "</td>");
                        results_array.push("<td class='crew_detail'>" + ((dataitem.SignOffDate) ? dataitem.SignOffDate.split("T")[0] : "") + "</td>");
                        results_array.push("<td class='crew_detail'>" + dataitem.Vessel + "</td>");
                        results_array.push('<td><img style="height: 25px;width: 25px;" src="css/images/next.svg"></td>');
                        results_array.push("</tr>");
                    };
                }
                else{
                    var dataitem = data.SeaServiceOtherData.SeaServiceEntity;
                    results_array.push("<tr class='itemRow'>");
                    results_array.push("<td> <span class='dashboard-list' style='font-weight: bold;'>" + toTitleCase(dataitem.Company) + "</span></td>");
                    results_array.push("<td> <span class='dashboard-list' style='font-weight: bold;'>" + toTitleCase(dataitem.Rank) + "</span></td>");
                    results_array.push("<td class='crew_detail'>" + ((dataitem.SignOnDate) ? dataitem.SignOnDate.split("T")[0] : "") + "</td>");
                    results_array.push("<td class='crew_detail'>" + ((dataitem.SignOffDate) ? dataitem.SignOffDate.split("T")[0] : "") + "</td>");
                    results_array.push("<td class='crew_detail'>" + dataitem.Vessel + "</td>");
                    results_array.push('<td><img style="height: 25px;width: 25px;" src="css/images/next.svg"></td>');
                    results_array.push("</tr>");                    
                }
            }
            results_array.push("</table>");
            results_array.push("</div>");

            if(data.ExpiryDocumentsData != null && data.ExpiryDocumentsData.ExpiryDocumentsEntity != null) { 
                results_array.push("<div class='dashboard_tiles'>");
                results_array.push("<h3>Documents</h3>");            
                results_array.push("<table class='crew_table'>");

                var temp_name="new";
                var temp_type = "new";
                for (var i = data.ExpiryDocumentsData.ExpiryDocumentsEntity.length - 1; i >= 0; i--) {
                    var item = data.ExpiryDocumentsData.ExpiryDocumentsEntity[i];
                    var doc_tpe= item.doc_type+"";
                    var temp_bool = false;
                    if(temp_type != doc_tpe.slice(1)) {
                        temp_type = doc_tpe.slice(1);
                        temp_bool = true;
                        results_array.push("<tr>");
                        results_array.push('<td id="'+temp_type+'">'+temp_type+'</th>');
                        results_array.push('<td ><img style="height: 25px;width: 25px;" src="css/images/next.svg"></th>');
                        results_array.push("</tr>");
                    }

                    if(doc_tpe.slice(1) != "MEDICALS") { 
                        temp_name = item.name;
                        results_array.push('<tr  class="docRow '+temp_type+'">');
                        results_array.push("<td> <span class='dashboard-list' style='font-weight: bold;'>" + toTitleCase(temp_name)+"</span></td>");
                        results_array.push("<td class='crew_detail'>" + ((item.expiry_date) ? item.expiry_date.split("T")[0] : "")+"</td>");
                        results_array.push("<td class='crew_detail'>" + ((item.issue_date) ? item.issue_date.split("T")[0] : "") + "</td>");
                        results_array.push("<td class='crew_detail'>" + item.document_no + "</td>");
                        results_array.push('<td><img style="height: 25px;width: 25px;" src="css/images/next.svg"></td>');
                        results_array.push("</tr>");
                    }
                };
                results_array.push("</table>");
                results_array.push("</div>");
            }

            $('#crew_cv').html(results_array.join(""));
            $('#crew_cv').show();

            

            // $('.crew_list_view').listview();
            // $('.crew_table').table({ defaults: true });

            $('.itemRow').click(function() {
                $(this).closest('table').find('.temp_tr').remove();
                var results_array = new Array();
                results_array.push('<tr class="temp_tr">');
                results_array.push('<td colspan="100%">');
                results_array.push('<div>');
                results_array.push('<ul class="topcoat-list list">');
                results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span class='li-data-list-small'>Vessel : </span><span style='font-weight: bold;'>"+ $(this).find('td:eq(4)').html() + "</span></li>");
                results_array.push("<li class='t3opcoat-list__item'><span class='dashboard-list'><span class='li-data-list-small'>Sign-on Date : </span><span style='font-weight: bold;'>"+ $(this).find('td:eq(2)').html() + "</span></li>");
                results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span class='li-data-list-small'>Sign-off Date : </span><span style='font-weight: bold;'>"+ $(this).find('td:eq(3)').html() + "</span></li>");
                results_array.push('</ul>');
                results_array.push('</div>');
                results_array.push('</td>');
                results_array.push('</tr>');
                $(this).after(results_array.join(""));
                // $('.temp_ul').listview();
                // alert($(this).find('td:eq(0)').html());
            });

 $('.docRow').click(function() {
    $(this).closest('table').find('.temp_tr').remove();
    var results_array = new Array();
    results_array.push('<tr class="temp_tr">');
    results_array.push('<td colspan="100%">');
    results_array.push('<div>');
    results_array.push('<ul class="topcoat-list list">');
    results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span class='li-data-list-small'>Document No : </span><span style='font-weight: bold;'>"+ $(this).find('td:eq(3)').html() + "</span></li>");
    results_array.push("<li class='t3opcoat-list__item'><span class='dashboard-list'><span class='li-data-list-small'>Expiry Date : </span><span style='font-weight: bold;'>"+ $(this).find('td:eq(1)').html() + "</span></li>");
    results_array.push("<li class='topcoat-list__item'><span class='dashboard-list'><span class='li-data-list-small'>Issue Date : </span><span style='font-weight: bold;'>"+ $(this).find('td:eq(2)').html() + "</span></li>");
    results_array.push('</ul>');
    results_array.push('</div>');
    results_array.push('</td>');
    results_array.push('</tr>');
    $(this).after(results_array.join(""));
                // $('.temp_ul').listview();
                // alert($(this).find('td:eq(0)').html());
            });

 $('#COURSES').click(function() {
    $(this).closest('table').find('.temp_tr').remove();
    $('.COURSES').show();
    $('.TRAVEL').hide();
    $('.MEDICALS').hide();
    $('.LICENSES').hide();
});

 $('#TRAVEL').click(function() {
    $(this).closest('table').find('.temp_tr').remove();
    $('.COURSES').hide();
    $('.TRAVEL').show();
    $('.MEDICALS').hide();
    $('.LICENSES').hide();
});

 $('#MEDICALS').click(function() {
    $(this).closest('table').find('.temp_tr').remove();
    $('.COURSES').hide();
    $('.TRAVEL').hide();
    $('.MEDICALS').show();
    $('.LICENSES').hide();
});

 $('#LICENSES').click(function() {
    $(this).closest('table').find('.temp_tr').remove();
    $('.COURSES').hide();
    $('.TRAVEL').hide();
    $('.MEDICALS').hide();
    $('.LICENSES').show();
});


 $('.crew_detail').hide();
},
error: function() {        
    alert('Please try again in a minute.');
    hide_spinner();            
}
});
}

var months=['','JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function dateformat(dat, format) { 
    if(dat != null && dat != '') {
        var d = new Date(dat);
        //console.log(dat);
        //console.log(d.getDate()+"-"+d.getMonth()+"-"+d.getYear());
        // if(format == "dd-mon-yyyy")
        dat = ("0" + d.getDate()).slice(-2)+"-"+months[d.getMonth()]+"-"+d.getFullYear();
    } else {
        dat = '';
    }
    return dat
}

function nullcheck(data) {
    if(data == null)
        data = '';
    return data;
}



