 google.maps.event.addDomListener(window, 'load', initAutocomplete)

 let map

 //initialize Map
 function initAutocomplete() {
     let origin = {
         lat: 53,
         lng: 15
     }
     let map = new google.maps.Map(document.getElementById('map'), {
         center: origin,
         zoom: 6
     });
     let clickHandler = new ClickEventHandler(map, origin);
     //GEOLOCATION
     infoWindow = new google.maps.InfoWindow;

     // Try HTML5 geolocation.
     if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(function (position) {
             var pos = {
                 lat: position.coords.latitude,
                 lng: position.coords.longitude
             };

             infoWindow.setPosition(pos);
             infoWindow.setContent('Location found.');
             infoWindow.open(map);
             map.setCenter(pos);
         }, function () {
             handleLocationError(true, infoWindow, map.getCenter());
         });
     } else {
         // Browser doesn't support Geolocation
         handleLocationError(false, infoWindow, map.getCenter());
     }


     function handleLocationError(browserHasGeolocation, infoWindow, pos) {
         infoWindow.setPosition(pos);
         infoWindow.setContent(browserHasGeolocation ?
             'Error: The Geolocation service failed.' :
             'Error: Your browser doesn\'t support geolocation.');
         infoWindow.open(map);
     }
     //SZUKAJKA
     // Create the search box and link it to the UI element.
     var input = document.getElementById('pac-input');
     var searchBox = new google.maps.places.SearchBox(input);
     map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
     // Bias the SearchBox results towards current map's viewport.
     map.addListener('bounds_changed', function () {
         searchBox.setBounds(map.getBounds());
     });
     var markers = [];
     // Listen for the event fired when the user selects a prediction and retrieve
     // more details for that place.
     searchBox.addListener('places_changed', function () {
         var places = searchBox.getPlaces();
         if (places.length == 0) {
             return;
         }
         // Clear out the old markers.
         markers.forEach(function (marker) {
             marker.setMap(null);
         });
         markers = [];
         // For each place, get the icon, name and location.
         var bounds = new google.maps.LatLngBounds();
         places.forEach(function (place) {
             if (!place.geometry) {
                 console.log("Returned place contains no geometry");
                 return;
             }
             var icon = {
                 url: place.icon,
                 size: new google.maps.Size(71, 71),
                 origin: new google.maps.Point(0, 0),
                 anchor: new google.maps.Point(17, 34),
                 scaledSize: new google.maps.Size(25, 25)
             };
             // Create a marker for each place.
             markers.push(new google.maps.Marker({
                 map: map,
                 icon: icon,
                 title: place.name,
                 position: place.geometry.location
             }));

             if (place.geometry.viewport) {
                 // Only geocodes have viewport.
                 bounds.union(place.geometry.viewport);
             } else {
                 bounds.extend(place.geometry.location);
             }
         });
         map.fitBounds(bounds);
     });
     //Main marker
     //     let marker = new google.maps.Marker({
     //         position: hire,
     //         map: map,
     //         title: 'jestem tutaj',
     //         icon: 'img/pin.png',
     //         animation: google.maps.Animation.BOUNCE,
     //         draggable: true
     //     });


     //Buttons
     let trafficLayer = new google.maps.TrafficLayer()
     let bikeLayer = new google.maps.BicyclingLayer()

     $('#trafficDisplay').click(function () {
         trafficLayer.setMap(map)
         bikeLayer.setMap(null)
     })
     $('#bikeDisplay').click(function () {
         trafficLayer.setMap(null)
         bikeLayer.setMap(map)
     })
     $('#add').click(function () {


         google.maps.event.addListener(map, 'click', function (event) {
             addMarker(event.latLng, map);
         })


     })
     $('#save').click(function () {

     })
     //LOAD JSON
     let script = document.createElement('script');
     script.src = 'http://192.168.2.91:8080/Cycling/js/JSON/marker.json'
     document.getElementsByTagName('head')[0].appendChild(script);

     //JSON display
     window.eqfeed_callback = function (results) {
         for (var i = 0; i < results.favourite.length; i++) {
             let coords = results.favourite[i].geometry.coordinates
             let title = results.favourite[i].name
             let icon = results.favourite[i].iconType
             let latLng = new google.maps.LatLng(coords[1], coords[0])
             let marker = new google.maps.Marker({
                 icon: icon,
                 position: latLng,
                 map: map,
                 title: title
             });
         }
     }
 }
 // Adds a marker to the map.
 function addMarker(location, map) {

     selectIcon = document.querySelector('#iconType'),
         selectName = document.querySelector('#markerName')

     var marker = new google.maps.Marker({
         position: location,
         map: map,
         title: selectName.value,
         icon: selectIcon.value
     });
 }
 // Drawing Road To origin
 /**
  * @constructor
  */
 var ClickEventHandler = function (map, origin) {
     this.origin = origin;
     this.map = map;
     this.directionsService = new google.maps.DirectionsService;
     this.directionsDisplay = new google.maps.DirectionsRenderer;
     this.directionsDisplay.setMap(map);
     this.placesService = new google.maps.places.PlacesService(map);
     this.infowindow = new google.maps.InfoWindow;
     this.infowindowContent = document.getElementById('infowindow-content');
     this.infowindow.setContent(this.infowindowContent);

     // Listen for clicks on the map.
     this.map.addListener('click', this.handleClick.bind(this));
 };

 ClickEventHandler.prototype.handleClick = function (event) {
     console.log('You clicked on: ' + event.latLng);
     // If the event has a placeId, use it.
     if (event.placeId) {
         console.log('You clicked on place:' + event.placeId);

         // Calling e.stop() on the event prevents the default info window from
         // showing.
         // If you call stop here when there is no placeId you will prevent some
         // other map click event handlers from receiving the event.
         event.stop();
         this.calculateAndDisplayRoute(event.placeId);
         this.getPlaceInformation(event.placeId);
     }
 };

 ClickEventHandler.prototype.calculateAndDisplayRoute = function (placeId) {
     var me = this;
     this.directionsService.route({
         origin: this.origin,
         destination: {
             placeId: placeId
         },
         travelMode: 'WALKING'
     }, function (response, status) {
         if (status === 'OK') {
             me.directionsDisplay.setDirections(response);
         } else {
             window.alert('Directions request failed due to ' + status);
         }
     });
 };

 ClickEventHandler.prototype.getPlaceInformation = function (placeId) {
     var me = this;
     this.placesService.getDetails({
         placeId: placeId
     }, function (place, status) {
         if (status === 'OK') {
             me.infowindow.close();
             me.infowindow.setPosition(place.geometry.location);
             me.infowindowContent.children['place-icon'].src = place.icon;
             me.infowindowContent.children['place-name'].textContent = place.name;
             me.infowindowContent.children['place-id'].textContent = place.place_id;
             me.infowindowContent.children['place-address'].textContent =
                 place.formatted_address;
             me.infowindow.open(me.map);
         }
     });
 };
