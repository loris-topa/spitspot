async function init() {
    await domReady();
    let box;
    return await ajax_get('/box', function (box) {
        return ajax_get('/spots', function (spots) {
            let lat = (parseFloat(box.lat1) + parseFloat(box.lat2)) / 2;
            let lon = (parseFloat(box.lon1) + parseFloat(box.lon2)) / 2;
            let zoom = spots.items.length ? 13 : 6;
            map = L.map('map').setView([lat, lon], zoom);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 20,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>; <a href="https://doi.org/10.13127/tinitaly/1.1">Tarquini S., I. Isola, M. Favalli, A. Battistini, G. Dotta, (2023). TINITALY, a digital elevation model of Italy with a 10 meters cell size (Version 1.1). Istituto Nazionale di Geofisica e Vulcanologia (INGV)</a>'
            }).addTo(map);
            let bounds = L.latLngBounds([box.lat1, box.lon1], [box.lat2, box.lon2]);
            let rectangleOverlay = L.rectangle(bounds, {
                opacity: 0.7,
                interactive: true
            }).addTo(map);

            drawingLayerGroup = L.layerGroup();
            drawingLayerGroup.addTo(map);
            for (let ev of mapEvents) {
                map.on('click', ev);
            }
            spotMarkers(spots.items);
            updateApproach();
            initCustomControls(map);
        }, console.error)
    }, console.error);
}

function updateSpots() {
    ajax_get('/spots', function (spots) {
        spotMarkers(spots.items);
    });
}

function updateApproach() {
    ajax_get('/approach', function (path) {
        approachMarkers(path.items);
    });
}

/**
 * This IIFE returns a function that given a spot list cleans up the map and recreates the layer containing the spots.
 * Could be easily parametrized to handle different kinds of spots
 */
let spotMarkers = (function() {
    let spotLayer = null;
    return function (spots) {
        if (spotLayer) {
            map.removeLayer(spotLayer);
        }
        spotLayer = L.layerGroup().addTo(map);
        for (let spot of spots) {
            let popup_div = document.createElement('div');
            let info_div = document.createElement('div');
            let readableCoords = makeReadableCoords(spot.coords);
            info_div.appendChild(document.createTextNode("coords: " + readableCoords + " altitude: " + spot.altitude + "m"));
            popup_div.appendChild(info_div);
            link = document.createElement('button');
            link.onclick = populateLines.bind(populateLines, spot.elem);
            link.appendChild(document.createTextNode("Trova linee"));
            popup_div.appendChild(link);
            L.marker(spot.coords.reverse()).addTo(spotLayer).bindPopup(popup_div);
        }
    }
})()
/**
 * This IIFE returns a function that given an approach list cleans up the map and recreates the layer containing the approach path.
 */
let approachMarkers = (function() {
    let approachLayer = null;
    return function (approaches) {
        if (approachLayer) {
            map.removeLayer(approachLayer);
        }
        approachLayer = L.layerGroup().addTo(map);
        for (let path of approaches) {
            let marker = L.marker(path.coords.reverse());
            marker.addTo(approachLayer);
            marker._icon.classList.add('approach-marker');
        }
    }
})()

async function populateLines(point_index) {
    return await ajax_get('/find-lines?ind=' + point_index, function (res) {
        for (let line of res.lines) {
            let start = line.points[0];
            let end = line.points[1];
            let polyline = L.polyline([start.reverse(), end.reverse()], {color: 'red'}).addTo(map);
        }
    }, console.error);
}

function initCustomControls(map) {
    let container = '';
    for (let x in customControls) {
        let opts = customControls[x];
        let onClick = function () {};
        if (opts.onClick) {
            onClick = opts.onClick;
            delete opts.onClick;
        }
        map.addControl(
            addCustomControl(x, opts, context, onClick)
        )
    }
}

function createCustomOptionsContext() {
    let toggles = {};
    return function (toggleName) {
        if (toggleName) {
            if (!toggles.hasOwnProperty(toggleName)) {
                toggles[toggleName] = false;
            }
            toggles[toggleName] = !toggles[toggleName];
        }
        return toggles;
    }
}

function addCustomControl(controlName, extraOpts, context, onClick) {
    let options = Object.assign({
        position: 'topright',
    }, extraOpts)
    L.Control[controlName] = L.Control.extend({
        options,
        onAdd(map) {
            let content = '';

            if (!customControlContainer) {
                customControlContainer = L.DomUtil.create('div', 'leaflet-bar');
            }

            this._createButton(this.options.title, controlName, content, customControlContainer, context, onClick);
            this._map[controlName] = this;

            return customControlContainer;
	    },
	    _createButton(title, controlName, content, container, context, onClick) {
            let className = 'leaflet-control-show-' + controlName + ' leaflet-' + controlName + '-icon';
            this.link = L.DomUtil.create('a', className, container);
            this.link.href = '#';
            this.link.title = title;
            this.link.innerHTML = content;

            this.link.setAttribute('role', 'button');
            this.link.setAttribute('aria-label', title);

            L.DomEvent.disableClickPropagation(container);

            L.DomEvent
                .on(this.link, 'click', L.DomEvent.stop)
                .on(this.link, 'click', onClick.bind(this.link, controlName, context));

            return this.link;
	    },
    });
    return new L.Control[controlName]();
}

function initScan(_, __, e) {
    e.target.setAttribute('disabled', 'disabled');
    let scanIntervalId = setInterval(updateSpots, 3000);
    ajax('/populate-spots', 'POST', getScanData(), function () {
        e.target.removeAttribute('disabled');
        clearInterval(scanIntervalId);
        updateSpots();
    }, noop);
}

function initApproachScan(_, __, e) {
    e.target.setAttribute('disabled', 'disabled');
    let scanIntervalId = setInterval(updateApproach, 3000);
    ajax('/populate-approach', 'POST', getScanData(), function () {
        e.target.removeAttribute('disabled');
        clearInterval(scanIntervalId);
        updateApproach();
    }, noop);
}

function getScanData() {
    const container = document.getElementById('scan-data-container');
    let res = {};
    Array.from(container.getElementsByTagName('input')).forEach(function (el) {
        res[el.id.replaceAll('-', '_')] = el.type !== "checkbox" ? Number(el.value) : el.checked;
    });
    return res;
}

/**
 * By appending N and E at the end of the coords we eliminate ambiguity for GIS softwares or map applications
 */
function makeReadableCoords(coords) {
    return `${coords[1]}N ${coords[0]}E`;
}

/**
 * This function changes the controls context variable - updating it based on what is selected.
 * It allows trivial activation of buttons and easy retrieval of their state via context()['control-name']
 */
function defaultOnClick(controlName, context) {
    let c = context(controlName);
    this.classList.toggle('leaflet-active', c[controlName]);
    return c;
}

let drawingLayerGroup;
let drawingMarkers = 0;
function drawingControls(e) {
    if (!context()["initial-area-scan"]) {
        drawingLayerGroup.clearLayers();
        drawingMarkers = 0;
        return;
    };
    if (drawingMarkers === 2) {
        drawingMarkers = 0;
        drawingLayerGroup.clearLayers();
    }
    drawingMarkers++;
    drawingLayerGroup.addLayer(
        L.marker(e.latlng).addTo(map)
    );

}
let map;
let mapEvents = [
    drawingControls
];
let customControls = {
//    'sic': {
//        "onClick": defaultOnClick
//    },
    "initial-area-scan": {
        "onClick": defaultOnClick,
        "title": "Disegna un'area da caricare da file"
    },
    "line-scan": {
        "onClick": initScan,
        "title": "Spot Scan - Trova le soste"
    },
    "approach-scan": {
        "onClick": initApproachScan,
        "title": "Approach Scan - Trova la strada dell'avvicinamento"
    },
//    "reset-drawers": {
//        "onclick": noop
//    }
};
let customControlContainer = "";
let context = createCustomOptionsContext();
init();
