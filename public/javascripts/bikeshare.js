var stations = [];
var map;

var search_active = false;
var directionsDisplay;
var directionsService = new google.maps.DirectionsService()
var indy = new google.maps.LatLng(39.770565,-86.159272);

$(function() {
	var ops = { center: indy, zoom: 14, mapTypeControl: false};
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
		force_map();
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
	$('#station-pane .station').click(function(e) {
			var station = $(e.currentTarget).clone();
			force_map();
			display_station_overlay(station);		

			var sdata = station.data('station');
			var lat = sdata.lat;
			var lng = sdata.lng;
			var center = new google.maps.LatLng(lat, lng);
			map.setCenter(center);
			map.setZoom(18);
	});

	$(window).on('resize', function() {
		scale_to_screen();
		google.maps.event.trigger(map, 'resize');
	});
	scale_to_screen();
});
function force_map() {
	if(!$('#map-view').hasClass('active')) {
		$('#map-view').click();
	}
}
function search_click() {		
	var query = $('#search-bar').val();
	if(query.trim() == '') return;
    	
	force_map();
	$('#search').click();
	$('#loading-overlay').fadeIn();
	find_station_by(query);	
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
	$('#map-pane .station').css('width', window.innerWidth - 10+'px');
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
function display_station_overlay(station) {
	var close_img = $('<img>').attr({'src':'/images/close.png', 'width':'30px', 'height':'30px'});

	close_img.addClass('close-button');
	station.css('width', window.innerWidth - 15+'px');
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
			var station = $('#station-'+nearest[2]).clone();
			display_station_overlay(station);
		});
	}
}





