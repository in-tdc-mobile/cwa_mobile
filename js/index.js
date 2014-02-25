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
    if($("#contentLayer:visible").length>0){
        $('#contentLayer').trigger('click');
    }
    $('#btnBack').hide();
    $('#navbar').hide();
    hide_spinner();
    $('#index_content').hide();
    $('#ajax_error').hide();
    $('#view_title').hide();
    $('#owners').hide();
    $('#dashboard').hide();
    $('#pms').hide();
    $('body').scrollTop(0);
}

var step_back = function() {};

var current_step = function() {};

var pal_user_id;
var cwa_app_id;
var pal_user_name;
var owners_array;
var owner_vessels;
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
    try{
        pal_user_name = $.jStorage.get("pal_user_name");
        // $.jStorage.set("pal_user_email", '');
        if (pal_user_name == null) {
          hide_all();
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
    options.url = 'https://getVesselTracker.com/cwa_mobile_dev/' + options.url + "&pal_user_email=" + $.jStorage.get("pal_user_name");
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
                $.jStorage.set("pal_user_id", pal_user_id);
                $.jStorage.set("cwa_app_id", cwa_app_id);
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

function show_owners(){
    hide_all();
    $.ajax({
      url: "get_user_owners.php?" +
      "userid=" + pal_user_id + "&appid=" + cwa_app_id ,
      datatype: 'json',
      beforeSend: function() {
        show_spinner();
    },
    success: function(data){
        owners_array = data["owners_array"];
        if($.isArray(owners_array) == false){
            owners_array = $.makeArray(data["owners_array"]);
        }
        if(owners_array.length!=1){
            var results_array = new Array();
            results_array.push("<ul data-role='listview' data-divider-theme='b' data-inset='true' id='listview'>");
            for(var i=0; i< owners_array.length; i++) {
                results_array.push("<li data-theme='c'>");
                results_array.push("<a data-transition='slide' href='javascript:show_dashboard_ajax(\""+ owners_array[i]['ID'] +"\")' id='"+ owners_array[i]['ID'] +"'>"+ owners_array[i]['label']);
                results_array.push("</a></li>");
            }
            results_array.push("</ul>");

            hide_spinner();
            
            $('#view_title').show();
            $('#view_title').html('Owners');

            $('#owners').html(results_array.join(""));
            $('#owners').show();

            $('#listview').listview();
        }
        else{
            owner_vessels = data['owner_vessels'];
            dashboard_settings = data['dashboard_settings'];
            user_rights_settings = data['user_rights_settings'];

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

    results_array.push("<select id='sel_owner_vessel' onchange='owner_vessel_selected()'>");
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

    $('#sel_owner_vessel').selectmenu();

    $('#dashboard').show();
    show_vessel_tracker = $.grep(dashboard_settings , function(e){ return e.code == 'VSLTRK'; });
    if(show_vessel_tracker.length > 0){
        GetMap();
        get_imo("O");
    }
    else{
        $('#vsltrk_tile').hide();
    }

}
var temp ;
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
            var len = noon_report_data.length;
            var chartDs = [];
            var dates = [];
            var slipData = [];
            var EngineRPMData = [];
            var speedData = [];
            var FoConsumptionData = [];

            for (var x = 0; x < len; x++) {
                var dataitem = noon_report_data[x];
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

            var results_array = new Array();
            results_array.push("<div class='dashboard_tiles' id='contact_info_tile'><h3 style='text-align: center;'>Contact Info</h3>");
            results_array.push("<div style='padding: 5px'> <ul id='ol_contact' data-role='listview'> ");
            results_array.push("<li class='dashboard-list'> Manager : " + data["vessel_info"].primary_manager_name + "</li>");
            results_array.push("<li class='dashboard-list'> Email : <span> <a href='mailto:" + data["vessel_info"].email + "'>" + data["vessel_info"].email + "</a></span></li>");
            results_array.push("<li class='dashboard-list'> Phone : ");
            if(data["vessel_info"].telephone_1 != null){
                results_array.push("<span> <a href='tel:00870" + data["vessel_info"].telephone_1 + "'>00870-" + data["vessel_info"].telephone_1 + "</a></span>");
            }
            if(data["vessel_info"].telephone_1 != null){
                results_array.push("<span> <a href='tel:00870" + data["vessel_info"].telephone_1 + "'>00870-" + data["vessel_info"].telephone_1 + "</a></span>");
            }
            if(data["vessel_info"].telephone_1 != null){
                results_array.push("<span> <a href='tel:00870" + data["vessel_info"].telephone_1 + "'>00870-" + data["vessel_info"].telephone_1 + "</a></span>");
            }
            results_array.push("</li>");
            results_array.push("</ul></div></div>");

            results_array.push("<div class='dashboard_tiles' id='vslperf_tile'><h3 style='text-align: center;'>Noon Report</h3><div style='width:100%'><div id='noon_report_chart'></div></div></div>");
            // results_div += "<div style='background:black' height='5px'/>"
            results_array.push("<div class='dashboard_tiles' id='crew_tile'><h3 style='text-align: center;'>Crew List</h3><div id='crew_list' style='padding:10px;' class='my-navbar-content'></div></div>");

            var crew_array = new Array();

            crew_array.push("<ul id='ol_crew_list' data-role='listview'>");
            for (var i = 0; i < data["crew_list"].length; i++) {
                dataitem = data["crew_list"][i];
                crew_array.push("<li>");
                crew_array.push("<span class='dashboard-list'> <span style='color:rgb(15,15,15); font-weight: normal'>" + toTitleCase(dataitem.rank) + "</span> - <span style='font-weight: bold;'>" + toTitleCase(dataitem.emp_name) + "</span> (" + toTitleCase(dataitem.nationality) + ")</span>");
                crew_array.push("</li>");
            };
            crew_array.push("</ul>");

            $('#accordion').html(results_array.join(""));
            $('#crew_list').html(crew_array.join(""));
            $('#ol_crew_list').listview();
            $('#ol_contact').listview();

            createNoonChart(chartDs, dates);
            
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
                        // GetMap();
                        //var loc = new google.maps.LatLng(vessel_location[i].latitude, vessel_location[i].longitude);
                        var marker = create_marker(vessel_location[i].Name, vessel_location[i].latitude, vessel_location[i].longitude, vessel_location[i].speed, vessel_location[i].datetime, vessel_location[i].imo, vessel_location[i].degree, vessel_location[i].highlight)
                        popup_data(marker, vessel_location[i].Name, vessel_location[i].latitude, vessel_location[i].longitude, vessel_location[i].speed, vessel_location[i].datetime, vessel_location[i].imo, vessel_location[i].degree);
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
        results_div = "<div class='dashboard_tiles'><div id='trackerMap'></div></div>";
        results_div += "<div id='accordion'></div>";
        $('#dashboard_tiles').html(results_div);
        if(show_vessel_tracker.length > 0){
            GetMap();
            get_imo("O");
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
            style: "smooth"
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
                visible: true,
                template: "<span style='color:white'>#= series.name #: #= value #</span>"
            },
            axisDefaults: {
                labels: {
                    font: "10px Arial,Helvetica,sans-serif"
                }
            }
        });       
}


/*-----Start Bing Map-------*/

var map, myLayer, infobox;

function GetMap() {
    map = new google.maps.Map(document.getElementById('trackerMap'), {
      zoom: 2,
      center: new google.maps.LatLng(20,20),
      mapTypeId: google.maps.MapTypeId.HYBRID,
      labels: true,
    });
}

function create_marker(name, latitude, longitude, speed, datetime, imo, degree, highlight){
    var marker;
    if (highlight) {
        marker_highlighted = true;
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(latitude, longitude),
            icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 4,
                fillColor: "red",
                fillOpacity: 1,
                flat: true,
                strokeWeight: 2,
                rotation: degrees //this is how to rotate the pointer
            },
            map: map,
            title: name,
            size: new google.maps.Size(10, 10),
        });
        path_vessel_imo = imo;
        
        /*vessel_markers.push(marker);
        if (markerCluster) {
            markerCluster.clearMarkers();
        }
        markerCluster = new MarkerClusterer(map, vessel_markers, mcOptions);*/
    } else {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(latitude, longitude),
            title: name,
            size: new google.maps.Size(10, 10),
        });
    }
    marker.setMap(map);
    map.setCenter(new google.maps.LatLng(latitude,longitude));

    google.maps.event.addListener(marker, 'click', function() {
        show_popup_at_marker(marker, name, latitude, longitude, speed, datetime, imo, degree);

    });
    
    return marker;
}

function show_popup_at_marker(marker, name, latitude, longitude, speed, datetime, imo, degree) {
    // popup_data(marker, name, latitude, longitude, speed, datetime, imo, degree);
    show_vessel_dashbord(name);
    return false;
}

function popup_data(marker, name, latitude, longitude, speed, datetime, imo, degree) {
    var content = "<h2><b>" + name + "</b></h2>" ;
    content += "<b>Lag / Log: </b>"+prsflt(latitude)+"/"+prsflt(longitude)+"("+datetime+")<br/> <b>Speed / Course: </b>"+speed+"<br/>";
    content +='<span class="popup_label"><button onclick="show_vessel_path('+imo+','+degree+')" style="color:#00303f;font:bold 12px verdana; padding:5px;" title="click to see track">Show Track</button></span>';
        //html = "<div class='star'><a class='star_a' id='"+ description[4] +"' href='javascript:void(0)' onclick='add_bookmark(this.id);'><img src='img/star.png' class='star_i' id='i_"+ description[4] +"' width=25 height=25 /></a></div>";
/*        html += '<span class="popup_label"><button onclick="fetch_vessel_wiki('+description[4]+')" style="color:#00303f;font:bold 12px verdana;padding:5px;" title="vessel wiki">Additional Details</button></span>';
        html +='<span class="popup_label"><button onclick="show_vessel_path('+description[4]+','+description[5]+')" style="color:#00303f;font:bold 12px verdana; padding:5px;" title="click to see track">Show Track</button></span>';*/
    var infowindow = new google.maps.InfoWindow({
        content:content,
        maxWidth: 450
    });

    if (open_info_window) {
        open_info_window.close();
    }

    infowindow.setContent(content);
    infowindow.open(map, marker);
    open_info_window = infowindow;
}

function show_vessel_dashbord(name){
    var vsl;
    for (var i = 0; i < owner_vessels.length; i++) {
        if(name.toLowerCase() == owner_vessels[i].name.toLowerCase()){
            vsl=owner_vessels[i];
        }
    };
    $('#sel_owner_vessel').val(vsl.object_id);
    $('#sel_owner_vessel').selectmenu('refresh', true);

    owner_vessel_selected();
}


/*-----Start Map Dataload---------*/

function get_imo( ownerMode) { 

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
    $.ajax({
        url: 'get_vessel_positions_cwa.php?'+imodata,
        datatype: 'text',
        beforeSend: function() {
            show_spinner();
    },
    success: function(data){
        var dat = [], randomLatitude, randomLongitude;
        for (var i = 0; i < data.length; i++) {
            var lat_lon = parse_lat_lon(data[i]);
            create_marker(data[i]['asset-name'], lat_lon['lat'], lat_lon['lon'], 
                      prsflt(data[i]['speed-value-of-value'])+data[i]['speed-units-of-value'], 
                      prsflt(data[i]['speed-value-of-value']) + " " + data[i]['speed-units-of-value'].toLowerCase() + ", " + data[i]['heading-value-of-value'] + " " + data[i]['heading-units-of-value'].toLowerCase(),
                      data[i]['i-m-o-number'], data[i]['heading-value-of-value'], false);

            dat.push(new DataModel(data[i]['asset-name'], lat_lon['lat'], lat_lon['lon'], 
                      prsflt(data[i]['speed-value-of-value'])+data[i]['speed-units-of-value'], 
                      prsflt(data[i]['speed-value-of-value']) + " " + data[i]['speed-units-of-value'].toLowerCase() + ", " + data[i]['heading-value-of-value'] + " " + data[i]['heading-units-of-value'].toLowerCase(),
                      data[i]['i-m-o-number'], data[i]['heading-value-of-value'], false));
            vessel_location = dat;
        }
        hide_spinner();
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

var DataModel = function (name, latitude, longitude, speed, datetime, imo, degree, highlight) {
  this.Name = name;
  this.latitude = latitude;
  this.longitude = longitude;
  this.speed = speed;
  this.datetime = datetime;
  this.imo = imo;
  this.highlight = highlight;
  this.degree = degree;
};


function prsflt(e){
  return parseFloat(e).toFixed(2);
}

/*-----End Map Dataload---------*/

/******************************Start Vessel path*********************************************/
function show_vessel_path(imo, degrees) {
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
}
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

    results_array.push("<select id='sel_owner_vessel_pms' onchange='owner_vessel_pms_selected()'>");
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
    results_array.push("<div id='maintenance_analysis_chart_2'></div>");
    results_array.push("</div>");
    results_array.push("</div>");

    $('#pms').html(results_array.join(""));

    $('#maintenance_analysis').hide();
    $('#pms').show();
    $('#sel_owner_vessel_pms').selectmenu();
    
}

function owner_vessel_pms_selected(){
    var show_maintenance_analysis = $.grep(user_rights_settings, function(e) {return e.page_header_name == 'Maintenance Analysis'});

    if(show_maintenance_analysis.length == 0){
        return;
    }

    var selected_vessel = document.getElementById("sel_owner_vessel_pms").value;
    $.ajax({
        url: 'get_owner_pms.php?' + 
        "owner_id=" + selected_owner_id + "&vessel_object_id=" + selected_vessel + "&app_id=" + cwa_app_id,
        datatype: 'text',
        beforeSend: function() {
            show_spinner();
        },
        success: function(data){            
            hide_spinner();
            create_maintenance_analysis_chart(data["maintenance_analysis"]);
            $('#maintenance_analysis').show();
            var chart = $("#maintenance_analysis_chart_1").data("kendoChart");
            chart.refresh();
            chart = $("#maintenance_analysis_chart_2").data("kendoChart");
            chart.refresh();

        },
        error: function() {        
            alert('Please try again in a minute.');
            hide_spinner();            
        }
    });
}

function create_maintenance_analysis_chart(data){
    // var len = noon_report_data.length;
    temp = data;
    var chartDs = [];
    var chartDs_1 = [];
    var dates = [];
    var due_this_month = [];
    var completed_this_month = [];
    var completed_this_month_non_critical = [];
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
    for (var i = 0; i < 12; i++) {
        dates.push(month[d.getMonth()]);
        d.setMonth(d.getMonth()-1);
        due_this_month.push($.grep(data, function(e) {return e.record_flag == 'DUE_THIS_MONTH'})[0]["m"+(i+1)]);
        completed_this_month.push($.grep(data, function(e) {return e.record_flag == 'COMPLETED_THIS_MONTH'})[0]["m"+(i+1)]);
        completed_this_month_non_critical.push($.grep(data, function(e) {return e.record_flag == 'OVER_DUE_THIS_MONTH_NON_CRITICAL'})[0]["m"+(i+1)]);
        percentage_outstanding.push($.grep(data, function(e) {return e.record_flag == 'PERCENTAGE_OUTSTANDING'})[0]["m"+(i+1)]);
        
        overdue_this_month_critical.push($.grep(data, function(e) {return e.record_flag == 'OVERDUE_THIS_MONTH_CRITICAL'})[0]["m"+(i+1)]);
        overdue_current_month.push($.grep(data, function(e) {return e.record_flag == 'OVERDUE_CURRENT_MONTH'})[0]["m"+(i+1)]);
        overdue_completed.push($.grep(data, function(e) {return e.record_flag == 'OVERDUE_COMPLETED'})[0]["m"+(i+1)]);
        overdue_not_completed.push($.grep(data, function(e) {return e.record_flag == 'OVERDUE_NOT_COMPLETED'})[0]["m"+(i+1)]);
        additional_jobs.push($.grep(data, function(e) {return e.record_flag == 'ADDITIONAL_JOBS'})[0]["m"+(i+1)]);
        outside_pms_jobs.push($.grep(data, function(e) {return e.record_flag == 'OUTSIDE_PMS_JOBS'})[0]["m"+(i+1)]);

    };


    // DUE_THIS_MONTH
    // COMPLETED_THIS_MONTH
    // OVER_DUE_THIS_MONTH_NON_CRITICAL
    // PERCENTAGE_OUTSTANDING

    // OVERDUE_THIS_MONTH_CRITICAL
    // OVERDUE_CURRENT_MONTH
    // OVERDUE_COMPLETED
    // OVERDUE_NOT_COMPLETED
    // ADDITIONAL_JOBS
    // OUTSIDE_PMS_JOBS

    dates.reverse();

    // for (var x = 0; x < 5; x++) {
    //     var dataitem = noon_report_data[x];
    //     dates.push(kendo.format('{0:dd-MM-yyyy}', dataitem.report_date.split("T")[0]));
    //     slipData.push(dataitem.slip);
    //     FoConsumptionData.push(dataitem.me_fo_consumption);
    //     speedData.push(dataitem.speed);
    //     EngineRPMData.push(dataitem.engine_rpm);
    // }

    // dates.reverse();
    // slipData.reverse();
    // FoConsumptionData.reverse();
    // speedData.reverse();
    // EngineRPMData.reverse();


    chartDs.push({ name: $.grep(data, function(e) {return e.record_flag == 'DUE_THIS_MONTH'})[0]['activity'], data: due_this_month, color: "#00004A" }, 
                 { name: $.grep(data, function(e) {return e.record_flag == 'COMPLETED_THIS_MONTH'})[0]['activity'], data: completed_this_month, color: "Brown" }, 
                 { name: $.grep(data, function(e) {return e.record_flag == 'OVER_DUE_THIS_MONTH_NON_CRITICAL'})[0]['activity'], data: completed_this_month_non_critical, color: "#6A5ACD" }, 
                 { name: $.grep(data, function(e) {return e.record_flag == 'PERCENTAGE_OUTSTANDING'})[0]['activity'], data: percentage_outstanding, color: "DarkGreen" });

    chartDs_1.push({ name: $.grep(data, function(e) {return e.record_flag == 'OVERDUE_THIS_MONTH_CRITICAL'})[0]['activity'], data: overdue_this_month_critical, color: "#00004A" }, 
                   { name: $.grep(data, function(e) {return e.record_flag == 'OVERDUE_CURRENT_MONTH'})[0]['activity'], data: overdue_current_month, color: "Brown" }, 
                   { name: $.grep(data, function(e) {return e.record_flag == 'OVERDUE_COMPLETED'})[0]['activity'], data: overdue_completed, color: "#6A5ACD" }, 
                   { name: $.grep(data, function(e) {return e.record_flag == 'OVERDUE_NOT_COMPLETED'})[0]['activity'], data: overdue_not_completed, color: "#6A5ACD" }, 
                   { name: $.grep(data, function(e) {return e.record_flag == 'ADDITIONAL_JOBS'})[0]['activity'], data: additional_jobs, color: "#6A5ACD" }, 
                   { name: $.grep(data, function(e) {return e.record_flag == 'OUTSIDE_PMS_JOBS'})[0]['activity'], data: outside_pms_jobs, color: "DarkGreen" });


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
            style: "smooth"
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
            visible: true,
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
            style: "smooth"
        },
        series: chartDs_1,
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
            visible: true,
            template: "<span style='color:white'>#= series.name #: #= value #</span>"
        },
        axisDefaults: {
            labels: {
                font: "10px Arial,Helvetica,sans-serif"
            }
        }
    });
}