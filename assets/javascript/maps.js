var map;
var markers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 40.7413549, lng: -73.9980244},
        zoom: 17,
        mapTypeControl: false
    });

    var zoomAutocomplete = new google.maps.places.Autocomplete(
        document.getElementById("zoom-to-area-text"));
    var searchBox = new google.maps.places.SearchBox(
      document.getElementById("buttonSearch"));
    searchBox.setBounds(map.getBounds());
    document.getElementById("zoom-to-area").addEventListener("click", function() {
        zoomToArea();
    });
    document.getElementById("search-within-time").addEventListener("click", function() {
        searchWithinTime();
    });
    document.getElementById("grocery").addEventListener("click", grocerySearch);
    document.getElementById("restaurant").addEventListener("click", restaurantSearch);
}

function zoomToArea() {
  var geocoder = new google.maps.Geocoder();
  var address = document.getElementById("zoom-to-area-text").value;
  if (address === "") {
    console.log("You must enter an area, or address.")
  } else {
    geocoder.geocode(
      { address: address,
        // componentRestrictions: {locality: "United States"}
      }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          map.setZoom(17);
          $("#address-field").text(results[0].formatted_address)
        } else {
         console.log("We cold not find that location.  Try entering a more specific place!");
        }
      });
  }
}

function hideMarkers(markers) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

function grocerySearch() {
  var bounds = map.getBounds();
  hideMarkers(markers);
  markers = [];
  var placesService = new google.maps.places.PlacesService(map);
  placesService.textSearch({
    query: "grocery store",
    bounds: bounds
  }, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      createMarkersForPlaces(results);
    }
  });
}

function restaurantSearch() {
  var bounds = map.getBounds();
  hideMarkers(markers);
  markers = [];
  var placesService = new google.maps.places.PlacesService(map);
  placesService.textSearch({
    query: "restaurant",
    bounds: bounds
  }, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      createMarkersForPlaces(results);
    }
  });
}

function createMarkersForPlaces(places) {
    console.log(markers);
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < 10; i++) {
      var place = places[i];
      var icon = {
        url: place.icon,
        size: new google.maps.Size(35, 35),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(15, 34),
        scaledSize: new google.maps.Size(25, 25)
      };
      var marker = new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location,
        id: place.place_id
      });
      var placeInfoWindow = new google.maps.InfoWindow();
      marker.addListener("click",function() {
        if (placeInfoWindow.marker == this) {
          console.log("this infowindow already is on this marker!");
        } else {
        getPlacesDetails(this, placeInfoWindow);
          }
      });

      markers.push(marker);
      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    }
    map.fitBounds(bounds);
  }

function getPlacesDetails(marker, infowindow) {
      var service = new google.maps.places.PlacesService(map);
      service.getDetails({
        placeId: marker.id
      }, function (place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          infowindow.marker = marker;
          var innerHTML = "<div>";
          if (place.name) {
            innerHTML += "<strong>" + place.name + "</strong>";
          }
          if (place.formatted_address) {
            innerHTML += "<br>" + place.formatted_address;
          }
          if (place.formatted_phone_number) {
            innerHTML += "<br>" + place.formatted_phone_number;
          }
          if (place.opening_hours) {
            innerHTML += "<br><br><strong>Hours:</strong><br>" +
              place.opening_hours.weekday_text[0] + "<br>" +
              place.opening_hours.weekday_text[1] + "<br>" +
              place.opening_hours.weekday_text[2] + "<br>" +
              place.opening_hours.weekday_text[3] + "<br>" +
              place.opening_hours.weekday_text[4] + "<br>" +
              place.opening_hours.weekday_text[5] + "<br>" +
              place.opening_hours.weekday_text[6];
          }
          if (place.photos) {
            innerHTML += '<br><br><img src="' + place.photos[1].getUrl(
                {maxHeight: 100, maxWidth: 200}) + '">';
          }
          innerHTML += "</div>";
          infowindow.setContent(innerHTML);
          infowindow.open(map, marker);
          infowindow.addListener("closeclick", function() {
            infowindow.marker = null;
          });

        }
      });
}

function searchWithinTime() {
      var distanceMatrixService = new google.maps.DistanceMatrixService;
      var address = document.getElementById("zoom-to-area-text").value;
        if (address === "") {
          console.log("you must enter an address.");
        } else {
          hideMarkers(markers);
          var origins = [];
          for (var i = 0; i < markers.length; i++) {
            origins[i] = markers[i].position;
          }
          var destination = address;
          var mode = document.getElementById("mode").value;
          distanceMatrixService.getDistanceMatrix({
            origins: origins,
            destinations: [destination],
            travelMode: google.maps.TravelMode[mode],
            unitSystem: google.maps.UnitSystem.IMPERIAL,
          }, function(response, status) {
            if (status !== google.maps.DistanceMatrixStatus.OK) {
              window.alert("Error was: " + status);
            } else {
              displayMarkersWithinTime(response);
              }
          });
        }
}

function displayMarkersWithinTime(response) {
      var maxDuration = document.getElementById("max-duration").value;
      var origins = response.originAddresses;
      var destinations = response.destinationAddresses;
      var atLeastOne = false;
      for (var i = 0; i < origins.length; i++) {
        var results = response.rows[i].elements;
        for (var j = 0; j < results.length; j++) {
          var element = results[j];
          if (element.status === "OK") {
            var distanceText = element.distance.text;
            var duration = element.duration.value / 60;
            var durationText = element.duration.text;
            if (duration <= maxDuration) {
              markers[i].setMap(map);
              atLeastOne = true;
              var infowindow = new google.maps.InfoWindow({
                content: durationText + " away " + distanceText +
                "<div><input type=\'button\' value=\'View Route\' onclick=" +
                "\'displayDirections(&quot;" + origins[i] + "&quot;);\'></input></div>"
              });
              infowindow.open(map, markers[i]);
              markers[i].infowindow = infowindow;
              google.maps.event.addListener(markers[i], "click", function() {
                this.infowindow.close();
              });
            }
          }
        }
      }
    }

function displayDirections(origin) {
      hideMarkers(markers);
      var directionsService = new google.maps.DirectionsService;
      var destinationAddress =
        document.getElementById("zoom-to-area-text").value;
      var mode = document.getElementById("mode").value;
      directionsService.route({
        origin: origin,
        destination: destinationAddress,
        travelMode: google.maps.TravelMode[mode]
      }, function(response, status) {
          if (status === google.maps.DirectionsStatus.OK) {
            var directionsDisplay = new google.maps.DirectionsRenderer({
              map: map,
              directions: response,
              draggable: true,
              polylineOptions: {
                strokeColor: "green"
              }
            });
          } else {
            window.alert("Direction request failed due to " + status);
          }
      });
    }

