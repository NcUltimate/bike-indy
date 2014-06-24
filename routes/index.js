var express = require('express');
var router = express.Router();
var http = require('http');
var request = require('request');
var cheerio = require('cheerio');

/* GET home page. */
router.get('/', function(req, res) {
	request('https://www.pacersbikeshare.org/header-nav/station-map/', function(error, resp, body){
     	$ = cheerio.load(body);
     	var script = $('script:last-of-type').text();
     	var split = script.split(/<.+?>/);
     	var saved = [];
     	var built = {};
     	for(var idx in split) {
     		var idxn = parseInt(idx);
     		var idxn2 = idxn+1;
     		if(split[idx].indexOf('var point = new google.maps.LatLng') != -1) {
     			var latlng_reg = /\([0-9]+\.[0-9]+, [0-9\-]+\.[0-9]+\)/;
     			var match = latlng_reg.exec(split[idx]);
     			if(match != null) {
	     			var coord_split = match.toString().split(', ');
	     			var lat = coord_split[0].substring(1);
	     			var lng = coord_split[1].substring(0, coord_split[1].length - 1);
	     			built['lat'] = lat;
	     			built['lng'] = lng;
	     			built['name'] = split[idxn+2];
	     			built['address'] = split[idxn+4];
	     			built['bikes'] = split[idxn + 9];
	     			built['docks'] = split[idxn + 12];
	     			saved.push(built);
	     			built = {};
	     		}
     		}
     	}
     	saved.sort(function(a,b) { return ( a['name'] <  b['name'] ? -1 : (a['name'] > b['name'] ? 1 : 0)); });
  		res.render('index', { title: 'Express' , stations: saved});
 	});
});

module.exports = router;
