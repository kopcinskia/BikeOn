// ON LOAD
google.maps.event.addDomListener(window, 'load', initMap)

//GLOBAL VARIABLE
let map,
    clickHAndler,
    pos,
    test = {
        lat: 53,
        lng: 15
    }

var markers = [];

var directionsDisplay = new google.maps.DirectionsRenderer;
var directionsService = new google.maps.DirectionsService;
//initialize Map
function initMap() {


    //MAP
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 53,
            lng: 15
        },
        zoom: 6,
        styles: [{
                featureType: "administrative",
                elementType: "all",
                stylers: [{
                        visibility: "on"
                            },
                    {
                        lightness: 33
                            }
                        ]
                    },
            {
                featureType: "landscape",
                elementType: "all",
                stylers: [{
                    color: "#f2e5d4"
                        }]
                    },
            {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{
                    color: "#c5dac6"
                        }]
                    },
            {
                featureType: "poi.park",
                elementType: "labels",
                stylers: [{
                        visibility: "on"
                            },
                    {
                        lightness: 20
                            }
                        ]
                    },
            {
                featureType: "road",
                elementType: "all",
                stylers: [{
                    lightness: 20
                        }]
                    },
            {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{
                    color: "#c6c5c5"
                        }]
                    },
            {
                featureType: "road.arterial",
                elementType: "geometry",
                stylers: [{
                    color: "#e4d7c6"
                        }]
                    },
            {

                //DROGI ROWEROWE
                featureType: "road.local",
                elementType: "geometry",
                stylers: [{
                    color: "#ff0000"
                        }]
                    },
            {
                featureType: "water",
                elementType: "all",
                stylers: [{
                        visibility: "on"
                            },
                    {
                        color: "#acbcc9"
                            }
                        ]
                    }
                ]
    });

    //GEOLOCATION
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            //search position
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(pos);
            //set marker with info window on your pozition
            let contentString = '<h1>Your<br>Position</h1>',
                infowindow = new google.maps.InfoWindow({
                    content: contentString
                }),
                positionMarker = new google.maps.Marker({
                    position: pos,
                    map: map,
                    title: 'Your position'
                });
            //function on click matker
            positionMarker.addListener('click', function () {
                infowindow.open(map, positionMarker)
            });

        }, function () {
            handleLocationError(true, marker, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, marker, map.getCenter());
    }

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
    }

    //SEARCH
    // Create the search box and link it to the UI element.
    let inputFinish = document.getElementById('pac-input')
    var searchBox = new google.maps.places.SearchBox(inputFinish)

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    });
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
            return;
        }
        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            //push marker on ARR
            let selectIcon = document.querySelector('#iconType')

            markers.push(new google.maps.Marker({
                icon: selectIcon.value,
                map: map,
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
    //DRAW ROAD


    directionsDisplay.setMap(map);
    //W tym elemęci wyswetlamy przebieg trasy
    directionsDisplay.setPanel(document.getElementById('legendPanel'));

    var onChangeHandler = function () {
        calculateAndDisplayRoute(directionsService, directionsDisplay);
    };
    document.getElementById('start').addEventListener('click', onChangeHandler);





    function calculateAndDisplayRoute(directionsService, directionsDisplay) {
        var start = pos
        var end = markers[0].position
        directionsService.route({
            origin: start,
            destination: end,
            travelMode: 'BICYCLING'
        }, function (response, status) {
            if (status === 'OK') {
                directionsDisplay.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
        var d = document.getElementById('map');
        d.style.position = "fixed";
    }


    //BUTONS
    let
        trafficLayer = new google.maps.TrafficLayer(),
        bikeLayer = new google.maps.BicyclingLayer()

    $('#trafficDisplay').click(function () {
            trafficLayer.setMap(map)
            bikeLayer.setMap(null)
        }),
        $('#bikeDisplay').click(function () {
            trafficLayer.setMap(null)
            bikeLayer.setMap(map)
        }),
        $('#MapDisplay').click(function () {
            trafficLayer.setMap(null)
            bikeLayer.setMap(null)
        })
    //LOAD JSON
    let script = document.createElement('script');
    script.src = 'http://192.168.0.102:8080/BikeOn_FrontEnd/js/JSON/marker.json'
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
