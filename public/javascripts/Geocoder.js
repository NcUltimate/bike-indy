var Geocoder = {	
	find_station_by: function(address){
		Geocoder.geocoder = new google.maps.Geocoder();
		var sw = new google.maps.LatLng(39.72173,-86.213689);
		var ne = new google.maps.LatLng(39.819366,-86.104855);
		var bounds = new google.maps.LatLngBounds(sw, ne);
		var ops = { 'address': address, 'bounds': bounds, 'location': BikeShare.indy };

		Geocoder.geocoder.geocode( ops , function(results, status) {
		    if (status == google.maps.GeocoderStatus.OK) {
		    	var loc = results[0].geometry.location;
		    	var ltlng = new google.maps.LatLng(loc.k, loc.A);
				Geocoder.calc_route(ltlng);
		 	} else {
		    	alert('Sorry, could not find that location. Try being more specific.');
		  	}
			$('#loading-overlay').fadeOut();
		});
	},
	closest_to: function(pt) {
		var end;
		var min_dist;
		var index;
		for(var idx in BikeShare.stations) {
			var stat = BikeShare.stations[idx];
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
	},
	calc_route: function(start) {
		var closest = Geocoder.closest_to(start);
		var end = closest[0];
		var request = {
			origin: start,
			destination: end,
			travelMode: google.maps.TravelMode.WALKING
		};
		BikeShare.directionsService.route(request, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				BikeShare.directionsDisplay.setDirections(response);

				var station = $('#station-'+closest[2]).clone();
				BikeShare.display_station_overlay(station);
			}
		});
	}
}