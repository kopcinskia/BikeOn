 google.maps.event.addDomListener(window, 'load', initAutocomplete)

 let map

 //initialize Map
 function initAutocomplete() {
     var map = new google.maps.Map(document.getElementById('map'), {
         center: {
             lat: -3.8688,
             lng: 111.2195
         },
         zoom: 5,
     });

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
