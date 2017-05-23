// ON LOAD

google.maps.event.addDomListener(window, 'load', initMap)

//GLOBAL VARIABLE
let map,
    clickHAndler,
    pos,
    markers = [],
    marker = [],
    directionsDisplay = new google.maps.DirectionsRenderer,
    directionsService = new google.maps.DirectionsService
//initialize Map
function initMap() {

    //MAP
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 53,
            lng: 15
        },
        zoom: 13,
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
                    color: "#6cd07c"
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
                    title: 'Your position',
                    icon: 'img/special.png'
                });
            //function on click matker
            positionMarker.addListener('click', function () {
                infowindow.open(map, positionMarker)
            });

        }, function () {
            handleLocationError(true, marker, map.getCenter())
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, marker, map.getCenter())
    }

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos)
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.')
        infoWindow.open(map);
    }

    //SEARCH
    // Create the search box and link it to the UI element.
    let inputFinish = document.getElementById('pac-input'),
        searchBox = new google.maps.places.SearchBox(inputFinish)

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    });
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function () {
        let places = searchBox.getPlaces()
        if (places.length == 0) {
            return;
        }
        // For each place, get the icon, name and location.
        let bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry")
                return;
            }
            

            marker.push(new google.maps.Marker({
                icon: 'img/like.png',
                map: map,
                title: place.name,
                position: place.geometry.location
            }));
            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport)
            } else {
                bounds.extend(place.geometry.location)
            }

        });

        map.fitBounds(bounds);
    });

    //DRAW ROAD
    directionsDisplay.setMap(map);
    //W tym elemęci wyswetlamy przebieg trasy
    directionsDisplay.setPanel(document.getElementById('legendPanel'))

    const onChangeHandler = function () {
        calculateAndDisplayRoute(directionsService, directionsDisplay)
    };
    document.getElementById('start').addEventListener('click', onChangeHandler)

    function calculateAndDisplayRoute(directionsService, directionsDisplay) {
        let start = pos,
            end = marker[marker.length - 1].position
        directionsService.route({
            origin: start,
            
            destination: end,
            travelMode: 'BICYCLING'
        }, function (response, status) {
            if (status === 'OK') {
                directionsDisplay.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status)
            }
        });
        let fixedMap = document.getElementById('map')
        fixedMap.style.position = "fixed";
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
    let script = document.createElement('script')
    script.src = 'http://10.200.4.42:8080/a/BikeOn/www/js/JSON/bikeStation.json'
    document.getElementsByTagName('head')[0].appendChild(script)

    //JSON display
    window.eqfeed_callback = function (results) {
        for (var i = 0; i < results.favourite.length; i++) {
            let title = results.favourite[i].name,
                icon = results.favourite[i].iconType,
                coords = results.favourite[i].geometry.coordinates,
                latLng = new google.maps.LatLng(coords[0], coords[1]),
                marker = new google.maps.Marker({
                    icon: 'img/love.png',
                    position: latLng,
                    map: map,
                    title: title
                });
            markers.push(marker)
        }
    }

    // Sets the map on all markers in the array.
    function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }


    let buttonShow = document.getElementById('show'),
        buttonHide = document.getElementById('hide')
    $('#show').click(function () {
        setMapOnAll(map);
        buttonShow.style.display = "none"
        buttonHide.style.display = "block"

    })
    $('#hide').click(function () {
        setMapOnAll(null);
        buttonShow.style.display = "block"
        buttonHide.style.display = "none"
    })
    buttonShow.style.display = "none"
}
