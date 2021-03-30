
mw.loader.using( [ 'mediawiki.util' ] ).done(function() {

    function get(url) {
        return new Promise(function(resolve, reject) {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function() {
                if(request.readyState !== XMLHttpRequest.DONE) return;
                if(request.status === 200) {
                    resolve(request.responseText);
                } else {
                    reject(new Error('Request failed: ' + request.status));
                }
            }
            request.open('GET', url, true);
            request.send();
        })
    }

    function getMarkers(minLat, minLng, maxLat, maxLng, zoom) {
        var category = mw.config.get('wgLeaflet').markerCategory;
        var conditions = '[[Lat::>' + minLat + ']][[Lat::<' + maxLat + ']][[Lng::>' + minLng + ']][[Lng::<' + maxLng + ']]'
                + '[[MinZoom::<' + zoom + ']][[MaxZoom::>' + zoom + ']]';
        var query = category + conditions + '|?Lat|?Lng|?Name';
        var url = mw.config.get('wgServer') + '/api.php?action=ask&format=json&query=' + encodeURIComponent(query);
        return new Promise(function(resolve, reject) {
            var markers = [];
            get(url).then(function(response) {
                var results = JSON.parse(response).query.results;
                for(var key of Object.keys(results)) {
                    try {
                        var url = results[key].fullurl;
                        var lat = results[key].printouts.Lat[0];
                        var lng = results[key].printouts.Lng[0];
                        var name = (results[key].printouts.Name || [])[0] || key;
                        markers.push({name: name, url: url, lat: lat, lng: lng});
                    } catch(e) {}
                }
                resolve(markers);
            });
        })
    }

    function createMap(div) {
        var map = L.map(div).setView([mw.config.get('wgLeaflet').viewLat, mw.config.get('wgLeaflet').viewLng], mw.config.get('wgLeaflet').viewZoom);
        L.tileLayer(mw.config.get('wgLeaflet').tileUrl, {
            attribution: mw.config.get('wgLeaflet').attribution
        }).addTo(map);
        var markers = L.layerGroup()
        markers.addTo(map)

        function addVisibleMarkers() {
            var bounds = map.getBounds();
            addMarkers(markers, getMarkers(bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast(), map.getZoom()));
        }

        map.on('moveend', addVisibleMarkers);
        addVisibleMarkers()

        map.on('contextmenu', function(e) {
            alert(e.latlng.lat + " " + e.latlng.lng + " " + map.getZoom());
        });
    }

    function addMarkers(group, promise) {
        promise.then(function(markers) {
            group.clearLayers();
            for(var marker of markers) {
                L.marker([marker.lat, marker.lng], {icon: L.icon({
                    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/678111-map-marker-512.png',
                    iconSize: [32, 32],
                    iconAnchor: [15, 31],
                    popupAnchor: [0, -31],
                    tooltipAnchor: [16, -16],
                })}).addTo(group)
                        .bindTooltip(marker.name, {permanent: true})
                        .openTooltip()
                        .on('click', function() {
                            location.href = marker.url;
                        });
            }
        })
    }

    function loadMap() {
        var contentWrapper = document.querySelector('.content-wrapper');
        contentWrapper.innerHTML = '';
        var map = document.createElement('div');
        map.id = 'map';
        contentWrapper.parentNode.appendChild(map);
        adjustHeight();
        createMap(map);
    }

    function adjustHeight() {
        var contentWrapper = document.querySelector('.content-wrapper');
        var map = document.querySelector('#map');
        map.style.height = (window.innerHeight - contentWrapper.getBoundingClientRect().bottom) + 'px';
    }

    function onContent() {
        window.addEventListener('resize', adjustHeight);
        loadMap();
    }

    mw.hook('wikipage.content').add(onContent);
});
