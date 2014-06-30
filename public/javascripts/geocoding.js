var geocoder;

function find_station_by(address){
	geocoder = new google.maps.Geocoder();
	var sw = new google.maps.LatLng(39.72173,-86.213689);
	var ne = new google.maps.LatLng(39.819366,-86.104855);
	var bounds = new google.maps.LatLngBounds(sw, ne);

	geocoder.geocode( { 'address': address, 'bounds': bounds, 'location': indy}, function(results, status) {
	    if (status == google.maps.GeocoderStatus.OK) {
	    	var loc = results[0].geometry.location;
	    	var ltlng = new google.maps.LatLng(loc.k, loc.A);
				console.log(results[0]);
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

			var station = $('#station-'+closest[2]).clone();
			display_station_overlay(station);
		}
	});
}