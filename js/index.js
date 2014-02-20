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
    $('#btnBack').hide();
    $('#navbar').hide();
    $('.spinner_index').hide();
    $('#index_content').hide();
    $('#ajax_error').hide();
    $('#view_title').hide();
    $('#owners').hide();
    $('#dashboard').hide();

}

var step_back = function() {};

var current_step = function() {};

var pal_user_id;
var cwa_app_id;
var pal_user_name;
var owners_array;
var owner_vessels;
var dashboard_settings;
var selected_owner_id;
var selected_vessel_id;
var vessel_location;
var show_vessel_tracker;

try{
    pal_user_name = $.jStorage.get("pal_user_id");
    $.jStorage.set("pal_user_id", '');
}
catch(err){    
}
if (pal_user_name == null) {
  hide_all();
  $('.login').show();
} else {
  show_owners();
}

function login_failure() {
  $(".spinner").css('display','none');
  $("#ajax_error").show();
  $("#ajax_error").html('Wrong Email or Password. Please try again.');
  $("#ajax_error").attr('style','display:block; text-align:center;');
}

$('#login_form').submit(function(){
    var username = $('#login_email').val();
    var password = $('#login_password').val();

    $.jStorage.set("pal_user_id", username);
    var form_data= {
        'username': username,
        'password': password
    };
    req = $.ajax({
        url: 'https://getVesselTracker.com/cwa_mobile_dev/ldap_test_cwa.php',
        type: "post",
        data: form_data,
        beforeSend: function() {
            $(".spinner_index").css('display','inline');
            $(".spinner_index").center();
        },

        success : function(response) {
            if (response != '') {
                // $('#hamburger').show();
                $('.login').hide();
                var str = response.split(",")
                pal_user_id = str[0];
                cwa_app_id = str[1];
                show_owners();
            // location.reload();
        } else {
            login_failure();
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
      url: "https://www.getvesseltracker.com/cwa_mobile_dev/get_user_owners.php?" +
      "pal_user_id=" + $.jStorage.get("pal_user_id") + "&userid=" + pal_user_id + "&appid=" + cwa_app_id ,
      datatype: 'json',
      beforeSend: function() {
        $(".spinner_index").css('display','block');
        $(".spinner_index").center();
    },
    success: function(data){
        owners_array = data;
        if($.isArray(owners_array) == false){
            owners_array = $.makeArray(data);
        }

        var results_div = "<ul data-role='listview' data-divider-theme='b' data-inset='true' id='listview'>";
        for(var i=0; i< owners_array.length; i++) {
         results_div += "<li data-theme='c'>";
         results_div += "<a data-transition='slide' href='javascript:show_dashboard(\""+ owners_array[i]['ID'] +"\")' id='"+ owners_array[i]['ID'] +"'>"+ owners_array[i]['label'];
         results_div += "</a></li>";
     }
     results_div += "</ul>";

            // console.log(owners_array.length);

            $('.spinner_index').hide();
            
            $('#view_title').show();
            $('#view_title').html('Owners');

            $('#owners').html(results_div);
            $('#owners').show();

            $('#listview').listview();

        },
        error: function() {        
            alert('Please try again in a minute.');
            $('.spinner_index').hide();
        }
    });
}

function show_dashboard(owner_id){
    hide_all();
    selected_owner_id = owner_id;
    $.ajax({
      url: "https://www.getvesseltracker.com/cwa_mobile_dev/get_owner_vessel.php?" +
      "pal_user_id=" + $.jStorage.get("pal_user_id") + "&owner_id=" + owner_id  + "&userid=" + pal_user_id + "&appid=" + cwa_app_id,
      datatype: 'json',
      beforeSend: function() {
        $(".spinner_index").css('display','block');
        $(".spinner_index").center();
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

        var results_div = "<select id='sel_owner_vessel' onchange='owner_vessel_selected()'>";
        results_div += "<option value='-1'>Select Vessel</option>";
        for (var i = 0; i < owner_vessels.length; i++) {
            results_div += "<option value='" + owner_vessels[i].object_id + "'>" + owner_vessels[i].name + "</option>"
        };
        results_div += "</select>";
        results_div += "<div id='dashboard_tiles' style='width:100%;'>";
        results_div += "<div class='dashboard_tiles' id='vsltrk_tile'><h3 style='text-align: center;'>Vessel Tracker</h3><div id='trackerMap'></div></div>";
        results_div += "<div id='accordion'></div>";
        results_div += "</div>";
        // $("#accordion").accordion();
        
        $('.spinner_index').hide();
        
        // $('#view_title').show();
        // $('#view_title').html('Dashboard');
        $('#dashboard').html(results_div);

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
        },
        error: function() {        
            alert('Please try again in a minute.');
            $('.spinner_index').hide();
        }
    });
}
var temp ;
function owner_vessel_selected(){
    var selected_vessel = document.getElementById("sel_owner_vessel").value;
    if(selected_vessel > 0){
        selected_vessel_id = selected_vessel;
        $.ajax({
          url: "https://www.getvesseltracker.com/cwa_mobile_dev/get_owner_dashboard.php?" +
          "pal_user_id=" + $.jStorage.get("pal_user_id") + "&owner_id=" + selected_owner_id  
          + "&vessel_object_id=" + selected_vessel_id ,
          datatype: 'json',
        beforeSend: function() {
            $(".spinner_index").css('display','block');
            $(".spinner_index").center();
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
            
            var results_div ="<div class='dashboard_tiles' id='contact_info_tile'><h3 style='text-align: center;'>Contact Info</h3>";
            results_div += "<div style='padding: 5px'> <ul id='ol_contact' data-role='listview'> ";
            results_div += "<li class='dashboard-list'> Manager : " + data["vessel_info"].primary_manager_name + "</li>"
            results_div += "<li class='dashboard-list'> Email : <span> <a href='mailto:" + data["vessel_info"].email + "'>" + data["vessel_info"].email + "</a></span></li>";
            results_div += "<li class='dashboard-list'> Phone : ";
            if(data["vessel_info"].telephone_1 != null){
                results_div += "<span> <a href='tel:00870" + data["vessel_info"].telephone_1 + "'>00870-" + data["vessel_info"].telephone_1 + "</a></span>";
            }
            if(data["vessel_info"].telephone_1 != null){
                results_div += "<span> <a href='tel:00870" + data["vessel_info"].telephone_1 + "'>00870-" + data["vessel_info"].telephone_1 + "</a></span>";
            }
            if(data["vessel_info"].telephone_1 != null){
                results_div += "<span> <a href='tel:00870" + data["vessel_info"].telephone_1 + "'>00870-" + data["vessel_info"].telephone_1 + "</a></span>";
            }
            results_div += "</li>"
            results_div += "</ul></div></div>";

            results_div += "<div class='dashboard_tiles' id='vslperf_tile'><h3 style='text-align: center;'>Noon Report</h3><div style='width:100%'><div id='noon_report_chart'></div></div></div>";
            // results_div += "<div style='background:black' height='5px'/>"
            results_div += "<div class='dashboard_tiles' id='crew_tile'><h3 style='text-align: center;'>Crew List</h3><div id='crew_list' style='padding:10px;' class='my-navbar-content'></div></div>";

            var crew_div = "<ul id='ol_crew_list' data-role='listview'>";
            for (var i = 0; i < data["crew_list"].length; i++) {
                dataitem = data["crew_list"][i];
                crew_div += "<li>";
                crew_div += "<span class='dashboard-list'> <span style='color:rgb(15,15,15); font-weight: normal'>" + toTitleCase(dataitem.rank) + "</span> - <span style='font-weight: bold;'>" + toTitleCase(dataitem.emp_name) + "</span> (" + toTitleCase(dataitem.nationality) + ")</span>";
                crew_div += "</li>"
            };
            crew_div += "</ul>";

            $('#accordion').html(results_div);
            $('#crew_list').html(crew_div);
            $('#ol_crew_list').listview();
            $('#ol_contact').listview();

            createNoonChart(chartDs, dates);
            
            // $("#accordion").accordion({
            //   heightStyle: "fill"
            // });

            $("#noon_report_chart").data("kendoChart").options.chartArea.width = $('#dashboard_tiles').width();
            $("#noon_report_chart").data("kendoChart").options.chartArea.height = 300;
            // $("#noon_report_chart").data("kendoChart").options.chartArea.refresh();
            // GetMap();
            // RequestData(selected_owner_id);

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

            $('.spinner_index').hide();
        },

        error: function() {        
            alert('Please try again in a minute.');
            $('.spinner_index').hide();
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
        content+= "<b>Lag / Log: </b>"+prsflt(latitude)+"/"+prsflt(longitude)+"("+datetime+")<br/> <b>Speed / Course: </b>"+speed+"<br/>";
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
        url: 'https://www.getvesseltracker.com/cwa_mobile_dev/get_vessel_positions_cwa.php?'+imodata,
        datatype: 'text',
        beforeSend: function() {
            $(".spinner_index").css('display','block');
            $(".spinner_index").center();
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
        $('.spinner_index').hide();
    },
    error: function() {        
        alert('Please try again in a minute.');
        $('.spinner_index').hide();
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