 google.maps.event.addDomListener(window, 'load', initialize)

 let map

 //initialize Map
 function initialize() {

     let hire = {
         lat: -0.789,
         lng: 113.921
     }
     let map = new google.maps.Map(document.getElementById('map'), {
         center: hire,
         zoom: 5,
         zoomControlOptions: {
             //pozycja paska zoom 
             position: google.maps.ControlPosition.RIGHT_TOP
         }

     });
     //Main marker
     let marker = new google.maps.Marker({
         position: hire,
         map: map,
         title: 'jestem tutaj',
         icon: 'img/pin.png',
         animation: google.maps.Animation.BOUNCE,
         draggable: true
     });


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
     let ninia = 'img/ninja.png',
         samurai = 'img/samurai.png',
         pin = 'img/pin.png',
         selectIcon = document.querySelector('#iconType'),
         selectName = document.querySelector('#markerName')

     var marker = new google.maps.Marker({
         position: location,
         map: map,
         title: selectName.value,
         icon: selectIcon.value
     });
 }
