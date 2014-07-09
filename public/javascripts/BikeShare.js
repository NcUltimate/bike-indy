var BikeShare = {
	stations: [],
	search_active: false,
	initialize: function() {
		BikeShare.directionsDisplay = new google.maps.DirectionsRenderer();
		BikeShare.directionsService = new google.maps.DirectionsService();
		BikeShare.indy = new google.maps.LatLng(39.770565,-86.159272);

		var ops = { center: BikeShare.indy, zoom: 14, mapTypeControl: false};
		BikeShare.map = new google.maps.Map(document.getElementById("map"), ops);
		BikeShare.directionsDisplay.setMap(BikeShare.map);
		BikeShare.load_stations();
		BikeShare.add_station_markers(BikeShare.map);
		
		$('.footer-button, #search-button').on('mousedown', function() {
			$(BikeShare).addClass('ui-selecting');
		});
		$('body').on('mouseup', function() {
			$('.ui-selecting').removeClass('ui-selecting');
		});
		
		$('.nav-button:not(.nav-button:first-of-type)').click(BikeShare.switch_tab);
		$('#station-pane .station').click(BikeShare.station_click);
		$('#search').click(BikeShare.toggle_search_container);
		$('#nearest').click(BikeShare.nearest_to_me);
		$('#search-button').click(BikeShare.search_click);
		$('#search-container').on('submit', function(e) {
			e.preventDefault();
			BikeShare.search_click();
		});

		$(window).on('resize', function() {
			BikeShare.scale_to_screen();
			google.maps.event.trigger(BikeShare.map, 'resize');
		});
		BikeShare.scale_to_screen();
	},
	force_map: function() {
		if(!$('#map-view').hasClass('active')) {
			$('#map-view').click();
		}
	},
	switch_tab: function(event) {
		$('.active').removeClass('active');
		$(event.currentTarget).addClass('active');

		var id = $(event.currentTarget).attr('id');
		var displays = ['none', 'none', 'none'];
		var which_display = 0;
		switch(id){
			case 'map-view':
				which_display = 0;
				break;
			case 'station-view':
				which_display = 1;
				break;
			case 'about-view':
				which_display = 2;
				break;
		}
		displays[which_display] = 'block';
		$('#map-pane').css('display', displays[0]);
		$('#station-pane').css('display', displays[1]);
		$('#about-pane').css('display', displays[2]);

	},
	station_click: function(e) {
		var station = $(e.currentTarget).clone();
		BikeShare.force_map();
		BikeShare.display_station_overlay(station);		

		var sdata = station.data('station');
		var lat = sdata.lat;
		var lng = sdata.lng;
		var center = new google.maps.LatLng(lat, lng);
		BikeShare.map.setCenter(center);
		BikeShare.map.setZoom(18);
	},
	search_click: function() {		
		var query = $('#search-bar').val();
		if(query.trim() == '') return;
	    	
		BikeShare.force_map();
		$('#search').click();
		$('#loading-overlay').fadeIn();
		Geocoder.find_station_by(query);	
	},
	toggle_search_container: function(event) {
		if(BikeShare.search_active) 
			$('#search-container').slideUp(300);
		else 
			$('#search-container').slideDown(300);
		BikeShare.search_active = !BikeShare.search_active;
	},
	nearest_to_me: function(event) {
		BikeShare.force_map();
		$('#loading-overlay').fadeIn();
		if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				var lat = position.coords.latitude;
				var lng = position.coords.longitude;
				Geocoder.find_station_by(new google.maps.LatLng(lat, lng).toString());
			});
		}
		else
			alert('Please click \'allow\' when the page prompts for your location to use that feature.');
	},
	scale_to_screen: function() {
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
		$('#map-container .station').css('width', window.innerWidth - 10+'px');
	},
	load_stations: function() {
		var $stations = $('.station');
		for(var k=0; k < $stations.length; k++) {
			var $stat = $($stations[k]);
			var stat_data = $stat.data('station');
			var lat = stat_data.lat;
			var lng = stat_data.lng;
			BikeShare.stations.push(lat+', '+lng);
		}
	},
	display_station_overlay: function(station) {
		var close_img = $('<img>').attr({'src':'/images/close.png', 'width':'30px', 'height':'30px'});

		close_img.addClass('close-button');
		station.css('width', window.innerWidth - 15+'px');
		station.addClass('station-overlay');
		station.append(close_img);

		$('#map-container .station').remove();
		$('#map-container').append(station);

		$('.close-button').click(function() {
				$('#map-container .station').slideUp(100);
				setTimeout(function() {
					$('#map-container .station').remove();
				}, 200);
		});

		station.slideDown(100);
	},
	add_station_markers: function() {
		for(var idx in BikeShare.stations) {
			var location = BikeShare.stations[idx].split(', ');
			var latLng = new google.maps.LatLng(parseFloat(location[0]), parseFloat(location[1]));
			var image = {url: '/images/icon3.gif', 
									size: new google.maps.Size(30,30), 
									origin: new google.maps.Point(0,0),
									anchor: new google.maps.Point(0,30),
									scaledSize: new google.maps.Size(30,30)};
			var marker = new google.maps.Marker({position: latLng, map: BikeShare.map, title: "Station "+idx, icon: image});
			google.maps.event.addListener(marker, 'click', function(event) {
				var nearest = Geocoder.closest_to(event.latLng);
				var station = $('#station-'+nearest[2]).clone();
				BikeShare.display_station_overlay(station);
			});
		}
	}
};