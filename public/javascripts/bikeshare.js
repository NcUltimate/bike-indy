var stations = [];
var map;
var timer_active = false;
var notify_times = [29, 9,4,0,-1];
var time_mins = 30;
var time_secs = 0;
var states = ['start', 'stop', 'reset'];
var snd = snd = new Audio('/images/time_up.mp3');
var ticker;
var state = 0;

var search_active = false;
var directionsDisplay;
var directionsService = new google.maps.DirectionsService()

$(function() {
	var ops = { center: new google.maps.LatLng(39.770565,-86.159272), zoom: 14, mapTypeControl: false};
	map = new google.maps.Map(document.getElementById("map"), ops);
	directionsDisplay = new google.maps.DirectionsRenderer()
	directionsDisplay.setMap(map);
	load_stations();
	add_station_markers(map);
	list_all_stations();
	
	$('.footer-button, #search-button').on('mousedown', function() {
		$(this).addClass('ui-selecting');
	});
	$('body').on('mouseup', function() {
		$('.ui-selecting').removeClass('ui-selecting');
	});
	
	$('.nav-button:not(.nav-button:first-of-type)').click(function(event) {
		$('.active').removeClass('active');
		$(this).addClass('active');
	});
	$('#map-view').click(function() {
		$('#about-pane').css('display','none');
		$('#station-pane').css('display','none');
		$('#map-pane').css('display','block');
	});
	$('#station-view').click(function() {
		$('#about-pane').css('display','none');
		$('#map-pane').css('display','none');
		$('#station-pane').css('display','block');
	});
	$('#about-view').click(function() {
		$('#map-pane').css('display','none');
		$('#station-pane').css('display','none');
		$('#about-pane').css('display','block');
	});
	$('#nearest').click(function(event) {
		$('#loading-overlay').fadeIn();
		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				var lat = position.coords.latitude;
				var lng = position.coords.longitude;
				find_nearest(new google.maps.LatLng(lat, lng).toString());
			});
		}
		else
			alert('Please click \'allow\' when the page prompts for your location to use that feature.');
	});
	$('#search').click(function(event) {
		if(search_active) {
			$('#search-container').slideUp(300);
		}
		else {
			$('#search-container').slideDown(300);
		}
		search_active = !search_active;
	})
	
	$('#search-button').click(function() {
		var query = $('#search-bar').val();
		if(query.trim() == '') return;
    	
		$('#search').click();
		$('#loading-overlay').fadeIn();
		setTimeout(function() {
			find_nearest(query);	
		}, 500);
	});

	$(window).on('resize', function() {
		scale_to_screen();
		google.maps.event.trigger(map, 'resize');
	});
	scale_to_screen();

	$('#timer').click(function() {
		if(state == 0) {
			ticker = setInterval(update_timer, 1000);
		}
		else if(state == 1) {
			clearInterval(ticker);
			dismiss_alarm();
		}
		else {
			time_mins = 30;
			time_secs = 1;
			update_timer();
		}
		state += 1;
		state %= 3;
		$('#timer .msg-text').html('Tap to '+states[state]);
	});

});

function find_nearest(address){
	var geocoder = new google.maps.Geocoder();
	var sw = new google.maps.LatLng(39.72173,-86.213689);
	var ne = new google.maps.LatLng(39.819366,-86.104855);
	var bounds = new google.maps.LatLngBounds(sw, ne);
	var city = new google.maps.LatLng(39.770565,-86.159272);

	geocoder.geocode( { 'address': address, 'bounds': bounds, 'location': city}, function(results, status) {
	    if (status == google.maps.GeocoderStatus.OK) {
	    	var loc = results[0].geometry.location;
	    	var ltlng = new google.maps.LatLng(loc.k, loc.A);
			calcRoute(ltlng);
	 	} else {
	    	alert('Sorry, could not find that location. ' + status);
	  	}
		$('#loading-overlay').fadeOut();
	});
}

function calcRoute(start) {
  var end;
  var min_dist;
  for(var idx in stations) {
  	var stat = stations[idx];
  	var spl = stat[0].split(', ');
  	var lat = parseFloat(spl[0]);
  	var lng = parseFloat(spl[1]);
  	var dist = Math.sqrt(Math.pow(lat - start.lat(), 2) + Math.pow(lng - start.lng(), 2));
  	if(min_dist == undefined || dist < min_dist) {
  		min_dist = dist;
  		end = new google.maps.LatLng(lat, lng);
  	}
  }
  var request = {
      origin:start,
      destination:end,
      travelMode: google.maps.TravelMode.WALKING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);

    }
  });
}

function sound_alarm() {  snd.play(); }
function dismiss_alarm() { snd.pause(); }

function update_timer() {
	time_secs--;
	if(time_secs == -1) {
		time_secs = 59;
		time_mins--;
		if(notify_times.indexOf(time_mins) != -1) {
				sound_alarm();
		}
		if(time_mins == -1) {
			clearInterval(ticker);
			return;
		}
	}
	$('#timer .time-text').html((time_mins < 10 ? '0' : '') + time_mins + ':'+(time_secs < 10 ? '0' : '')+time_secs);
}

function scale_to_screen() {
	$('body').css('width', window.innerWidth - 20 + 'px');
	$('body').css('height', window.innerHeight+ 'px');
	$('#map').css('width', window.innerWidth - 33 + 'px');
	$('#map').css('height', window.innerHeight-135+ 'px');
	$('#station-container').css('width', window.innerWidth + 'px');
	$('#station-container').css('height', window.innerHeight+ 'px');
	$('#about-container').css('width', window.innerWidth + 'px');
	$('#about-container').css('height', window.innerHeight+ 'px');
	$('#search-container').css('width', window.innerWidth + 'px');
}
function load_stations() {
	stations = [["39.76593, -86.16216", "Convention Center - Maryland and Capitol", "50 S. Capitol Ave.", "Indianapolis", "IN", "46225"],
["39.76595, -86.16689", "Victory Field", "99 S. West St.", "Indianapolis", "IN", "46225"],
["39.76832, -86.17027", "White River State Park", "650 S. Washington St.", "Indianapolis", "IN", "46204"],
["39.78179, -86.16590", "North End of Canal", "1325 Canal Walk", "Indianapolis", "IN", "46202"],
["39.77475, -86.16984", "Michigan and Blackford", "525 N. Blackford St.", "Indianapolis", "IN", "46202"],
["39.77338, -86.17543", "IUPUI Campus Center", "401 University Blvd.", "Indianapolis", "IN", "46202"],
["39.77418, -86.16348", "Michigan and Senate", "300 N. Michigan St.", "Indianapolis", "IN", "46202"],
["39.76722, -86.15416", "City County Building", "200 E. Washington St.", "Indianapolis", "IN", "46204"],
["39.75241, -86.13995", "Fountain Square", "1066 Virginia Ave.", "Indianapolis", "IN", "46225"],
["39.75740, -86.14549", "Fletcher Place - Virginia and Norwood", "749 Virginia Ave.", "Indianapolis", "IN", "46203"],
["39.75893, -86.14700", "Fletcher Place - Virginia and Merrill", "531 Virginia Ave.", "Indianapolis", "IN", "46203"],
["39.76702, -86.16016", "Washington and Illinois", "101 W. Washington St. ", "Indianapolis", "IN", "46204"],
["39.76720, -86.15832", "Washington and Meridian", "2 W. Washington St.", "Indianapolis", "IN", "46204"],
["39.76866, -86.15284", "City Market", "108 N. Alabama St.", "Indianapolis", "IN", "46204"],
["39.77224, -86.15260", "Mass Ave. and Alabama", "372 N. Alabama St.", "Indianapolis", "IN", "46204"],
["39.77964, -86.14212", "North End of Mass Ave.", "949 Massachusetts Ave.", "Indianapolis", "IN", "46202"],
["39.77383, -86.15043", "Athenaeum", "401 E. Michigan St.", "Indianapolis", "IN", "46204"],
["39.76423, -86.16161", "Convention Center at Georgia Street", "151 W. Georgia St.", "Indianapolis", "IN", "46225"],
["39.76481, -86.15650", "Bankers Life Fieldhouse", "169 S. Pennsylvania St.", "Indianapolis", "IN", "46204"],
["39.77803, -86.15631", "Central Library", "40 E. St. Clair St.", "Indianapolis", "IN", "46204"],
["39.77643, -86.14727", "Mass Ave. and Park", "680 Massachusetts Ave.", "Indianapolis", "IN", "46204"],
["39.76885, -86.15736", "Monument Circle", "121 Monument Circle", "Indianapolis", "IN", "46201"],
["39.76737, -86.16474", "Indiana Government Center", "364 W. Washington St. ", "Indianapolis", "IN", "46204"],
["39.77564, -86.15217", "North and Alabama", "605 N. Alabama St.", "Indianapolis", "IN", "46204"],
["39.77669, -86.16119", "Glick Peace Walk", "625 N. Capitol Ave.", "Indianapolis", "IN", "46204"]];
	
	stations.sort(function(a,b) { return ( a[1] <  b[1] ? -1 : (a[1] > b[1] ? 1 : 0)); });
}
function add_station_markers(map) {
	for(var idx in stations) {
		var location = stations[idx][0].split(', ');
		var latLng = new google.maps.LatLng(parseFloat(location[0]), parseFloat(location[1]));
		var image = {url: '/images/icon3.gif', 
								size: new google.maps.Size(20,20), 
								origin: new google.maps.Point(0,0),
								anchor: new google.maps.Point(0,20),
								scaledSize: new google.maps.Size(20,20)};
		var marker = new google.maps.Marker({position: latLng, map: map, title: "Station "+idx, icon: image});
	}
}

function list_all_stations() {
	for(var idx in stations) {
		var stat = stations[idx];
		var $station = create_station(stat);
		$('#station-container').append($station);				
	}
}

function create_station(station) {
	var station_div = $('<div>').addClass('station');
		var station_header = $('<span>').addClass('station-header');
			var station_title = $('<span>').addClass('station-title');
			var station_address = $('<span>').addClass('station-address');
		var station_availability = $('<span>').addClass('station-availability');
			var bikes_available = $('<span>').addClass('bikes-available');
			var docks_available = $('<span>').addClass('docks-available');

	var dav = Math.floor(Math.random() * 25);
	var bav = 25 - dav;
	docks_available.html(dav);
	bikes_available.html(bav);
	station_availability.append(bikes_available);
	station_availability.append(docks_available);
	

	station_address.html(station[2]);
	station_title.html(station[1]);
	station_header.append(station_title);
	station_header.append(station_address);

	station_div.append(station_header);
	station_div.append(station_availability);
	
	return station_div;
}





