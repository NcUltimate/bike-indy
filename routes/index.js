var express = require('express');
var router = express.Router();
var http = require('http');
var request = require('request');
var cheerio = require('cheerio');

/* GET home page. */
router.get('/', function(req, res) {
     request('https://www.pacersbikeshare.org', function(error, resp, body){
          var stations = loadStationInfo(body);
          var rules = getAboutRules();
          res.render('index', { title: 'Pacers Bikeshare' , stations: stations, rules: rules});
     });
});

/* Use this to acquire station images */
/*
function img_str(lat, lng) {
    var clat = parseFloat(lat) + 0.0001;
    var clng = parseFloat(lng) + 0.0001;
    var map = "http://maps.googleapis.com/maps/api/staticmap?key=AIzaSyCq0rYM7CdDmbBfHgrGT5_1kUwBPjnYlQU";
     return map+"&name="+stat.name+"&size=400x120&center="+clat+","+clng+"&maptype=satellite&zoom=17";
}
*/
function getLatLng(str) {
  var latlng_reg = /([0-9]+\.[0-9]+), ([0-9\-]+\.[0-9]+)/;
  var point = latlng_reg.exec(str);

  if(point == null) return [];
  
  return [point[1], point[2]];
}
function getMarkerText(str) {
  var text_reg  = /createMarker\(point, "(.+)",/;
  var marker    = text_reg.exec(str)

  if(marker == null) return '';

  return marker[1];
}
function idFromName(name){
  return name.split(/[\' \-\.]/).join('').toLowerCase();
}
function stationData(latLng, marker) {
  return {
    'lat'     : latLng[0],
    'lng'     : latLng[1],
    'name'    : marker[2],
    'id'      : idFromName(marker[2]),
    'address' : marker[9],
    'bikes'   : marker[14],
    'docks'   : marker[18]
  }
}
function loadStationInfo(body) {
     $ = cheerio.load(body);
     var saved = [];
     var script = $('script:last-of-type').text();
     var split = script.split(/var icon =/);
     for(var idx in split) {
        var station = split[idx].split("\n")
        var latLng  = getLatLng(station[2]);
        if(latLng == []) continue;

        var markerText  = getMarkerText(station[4])
        if(markerText == '') continue;

        var marker = markerText.split(/<.+?>/)
        var data = stationData(latLng, marker);
        console.log(data);
        saved.push(data)
     }
     saved.sort(function(a,b) { return ( a['name'] <  b['name'] ? -1 : (a['name'] > b['name'] ? 1 : 0)); });
     return saved;
}

function getAboutRules() {
     return [
          {'img_id':'map-img', 'img_src': 'map.png', 'title' : 'About This App', 'rules': [
               "To check the availability, name, and address of a station, simply tap a bike icon on the map.",
               "Each station displays its bike availability in the <strong>blue</strong> box and dock availability in the <strong>orange</strong> box.",
               "For a complete list of stations and availabilities, click on the 'stations' tab. You can click on any station there to be shown where it is on the map.",
               "To find a route to the station nearest to you, press the crosshairs button farthest to the left.",
               "To find the closest station to a place other than where you currently are, use the 'locate' tab to the left of the timer. This feature works best with landmarks, street-crossings, addresses, etc.",
               "This app provides a 30-minute timer for your convenience. It will sound when you have 10, 5, 1, and 0 minutes remaining to remind you to re-dock your bicycle."
          ]},
          {'img_id':'pricing-img', 'img_src': 'pricing.png', 'title' : 'Getting Started', 'rules': [
               "To begin using the bikeshare, you need either a 24-Hour Pass or an Annual Membership. This can only be purchased with a credit or debit card.",
               "After purchasing either a 24-Hour Pass or an Annual Membership, you have access to unlimited 30 minute rides during your Pass or Membership period. ",
               "All trips 30 minutes or less are included with your Pass or Membership, and trips longer than 30 minutes will incur the usage fees above.",
               "When a bike is checked out, the station will beep for 30 seconds. The bike must be removed from the dock before this time expires or it will become available for rent again.",
               "When returning a bike, push it firmly into the station until you hear a beeping sound. If the bike is not pushed in all the way, it will not register with the system and it will still be considered checked out!",
               "You may only check out one bike at a time with any given membership.",
               "Station hours of operation are 5:30am - 12:00am 365 days a year."
          ]},
          {'img_id':'lock-img', 'img_src': 'bcyclelock.jpg', 'title' : 'Safety and Security', 'rules': [
               "You must be 18 years of age or older to rent or ride a bicycle.",
               "A bike lock and cable are provided for security when leaving your bike unattended. See the diagram above for how to use them.",
               "Unfortunately, helmets are not provided. Please use extreme caution and provide your own safety equipment for riding.",
               "Please do not use this app while in motion on a bicycle. For your safety, only use this app when at a complete standstill.",
               "If you have a flat tire, the bike becomes damaged, or you are unable to return the bike to a station for any other reason, call customer service at (317) 653-1947. They will ask for the 4-digit number on the left side of the frame near the pedals."
          ]},

     ];
}
module.exports = router;
