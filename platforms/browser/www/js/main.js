 google.maps.event.addDomListener(window, 'load', initialize)

 let map
 let markers = []
 //initialize Map
 function initialize() {

     let hire = {
         lat: -0.789,
         lng: 113.921
     }
     let map = new google.maps.Map(document.getElementById('map'), {
         center: hire,
         zoom: 2,
         zoomControlOptions: {
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

     //LOAD JSON
     var script = document.createElement('script');
     script.src = 'http://192.168.2.91:8080/Cycling/js/JSON/marker.json'
     document.getElementsByTagName('head')[0].appendChild(script);
     // Loop through the results array and place a marker for each
     // set of coordinates.
     window.eqfeed_callback = function (results) {
         for (var i = 0; i < results.favourite.length; i++) {
             var coords = results.favourite[i].geometry.coordinates;
             var title = results.favourite[i].name;
             var latLng = new google.maps.LatLng(coords[1], coords[0])
             var marker = new google.maps.Marker({
                 position: latLng,
                 map: map,
                 title: title
             });
         }
     }
 }
