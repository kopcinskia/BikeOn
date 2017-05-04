// ON LOAD
google.maps.event.addDomListener(window, 'load', initMap)

//GLOBAL VARIABLE
let map,
    origin = {
        lat: 53,
        lng: 15
    },
    clickHAndler,
    pos

var markers = [];
//initialize Map
function initMap() {


    //MAP
    map = new google.maps.Map(document.getElementById('map'), {
        center: origin,
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
                infowindow.open(map, positionMarker);
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
    var clickHandler = new ClickEventHandler(map, pos),
        //BUTONS
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


var ClickEventHandler = function (map, pos) {
    this.origin = pos;
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
