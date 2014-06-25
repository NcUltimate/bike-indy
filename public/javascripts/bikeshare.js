var stations = [];
var map;
var timer_active = false;
var notify_times = [9,4,0,-1];
var time_mins = 30;
var time_secs = 0;
var states = ['start', 'stop', 'reset', 'dismiss'];
var snd = snd = new Audio('/images/time_up.mp3');
var ticker;
var alarming;
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
		if(!$('#map-view').hasClass('active')) {
			$('#map-view').click();
		}
		$('#loading-overlay').fadeIn();
		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				var lat = position.coords.latitude;
				var lng = position.coords.longitude;
				find_station_by(new google.maps.LatLng(lat, lng).toString());
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
	});

	$('#search-container').on('submit', function(e) {
		e.preventDefault();
		search_click();
	});
	
	$('#search-button').click(search_click);

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
		else if(state == 2){
			time_mins = 30;
			time_secs = 1;
			update_timer();
		}
		else if(state == 3) {
			dismiss_alarm();
		}
		if(state != 3) {
			state += 1;
			state %= 3;
		}
		else {
			if(time_mins == -1)
				state = 2;
			else
				state = 1;
		}
		$('#timer .msg-text').html('Tap to '+states[state]);
	});

});
function search_click() {		
	if(!$('#map-view').hasClass('active')) {
		$('#map-view').click();
	}
	var query = $('#search-bar').val();
	if(query.trim() == '') return;
    	
	$('#search').click();
	$('#loading-overlay').fadeIn();
	find_station_by(query);	
}

function find_station_by(address){
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
	    	alert('Sorry, could not find that location. Try being more specific.');
	  	}
		$('#loading-overlay').fadeOut();
	});
}
function closest_to(pt) {
  var end;
  var min_dist;
	var index;
	for(var idx in stations) {
		var stat = stations[idx];
		var spl = stat.split(', ');
		var lat = parseFloat(spl[0]);
		var lng = parseFloat(spl[1]);
		var dist = Math.sqrt(Math.pow(lat - pt.lat(), 2) + Math.pow(lng - pt.lng(), 2));
		if(min_dist == undefined || dist < min_dist) {
			min_dist = dist;
			index = idx;
			end = new google.maps.LatLng(lat, lng);
		}
	}
	return [end, min_dist, index];
}
function calcRoute(start) {
  var closest = closest_to(start);
	var end = closest[0];
  var request = {
      origin:start,
      destination:end,
      travelMode: google.maps.TravelMode.WALKING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
			display_station_overlay(closest);
    }
  });
}

function sound_alarm() {  
	snd.play(); 
	alarming = setInterval(function() {
		$('#timer').toggleClass('alarming');
	}, 800);
}
function dismiss_alarm() { 
	snd.pause(); 
	clearInterval(alarming);
	$('#timer').removeClass('alarming');
}

function update_timer() {
	time_secs--;
	if(time_secs == -1) {
		time_secs = 59;
		time_mins--;
		if(notify_times.indexOf(time_mins) != -1) {
			state = 3;
			$('#timer .msg-text').html('Tap to '+states[state]);
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
	$('#loading-overlay img').css('left', window.innerWidth /2 - 15 + 'px');
	$('#loading-overlay img').css('top', 40*window.innerHeight/100 + 'px');
}
function load_stations() {
	var $stations = $('.station');
	for(var k=0; k < $stations.length; k++) {
		var $stat = $($stations[k]);
		var stat_data = $stat.data('station');
		var lat = stat_data.lat;
		var lng = stat_data.lng;
		stations.push(lat+', '+lng);
	}
}
function display_station_overlay(stat) {
	var close_img = $('<img>').attr({'src':'/images/close.png', 'width':'30px', 'height':'30px'});
	var station = $('#station-'+stat[2]).clone();

	close_img.addClass('close-button');
	station.css('width', screen.width - 15+'px');
	station.addClass('station-overlay');
	station.append(close_img);

	$('#map-pane .station').remove();
	$('#map-pane').append(station);

	$('.close-button').click(function() {
			$('#map-pane .station').slideUp(100);
			setTimeout(function() {
				$('#map-pane .station').remove();
			}, 200);
	});

	station.slideDown(100);
}
function add_station_markers(map) {
	for(var idx in stations) {
		var location = stations[idx].split(', ');
		var latLng = new google.maps.LatLng(parseFloat(location[0]), parseFloat(location[1]));
		var image = {url: '/images/icon3.gif', 
								size: new google.maps.Size(30,30), 
								origin: new google.maps.Point(0,0),
								anchor: new google.maps.Point(0,30),
								scaledSize: new google.maps.Size(30,30)};
		var marker = new google.maps.Marker({position: latLng, map: map, title: "Station "+idx, icon: image});
		google.maps.event.addListener(marker, 'click', function(event) {
			var nearest = closest_to(event.latLng);
			display_station_overlay(nearest);
		});
	}
}





