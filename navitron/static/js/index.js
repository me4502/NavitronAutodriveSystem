let ROUGH_MIDDLEMOUNT_LAT = -23.032194;
let ROUGH_MIDDLEMOUNT_LNG = 148.760222;

let MIDDLEMOUNT_OVERLAY_SRC = 'https://image.ibb.co/dQgVNT/Lake_Lindsay_RGB_test.png';
let MIDDLEMOUNT_OVERLAY_WIDTH = 14188;
let MIDDLEMOUNT_OVERLAY_HEIGHT = 15058;
let MIDDLEMOUNT_X_UNIT = 0.5;
let MIDDLEMOUNT_Y_UNIT = 0.5;

let MIDDLEMOUNT_LEFT = 675250;
let MIDDLEMOUNT_TOP = 7456250;
let MIDDLEMOUNT_RIGHT = MIDDLEMOUNT_LEFT + MIDDLEMOUNT_OVERLAY_WIDTH * MIDDLEMOUNT_X_UNIT;
let MIDDLEMOUNT_BOTTOM = MIDDLEMOUNT_TOP - MIDDLEMOUNT_OVERLAY_HEIGHT * MIDDLEMOUNT_Y_UNIT;
let MIDDLEMOUNT_ZONE_NUM = 55;
let MIDDLEMOUNT_ZONE_LETTER = 'K';

google.maps.event.addDomListener(window, 'load', init_map);

var overlay;
MiddlemountOverlay.prototype = new google.maps.OverlayView();
var map;
function init_map() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        // Default to the Middlemount mine site
        center: new google.maps.LatLng(ROUGH_MIDDLEMOUNT_LAT, ROUGH_MIDDLEMOUNT_LNG),
        mapTypeId: 'satellite'
    });

    var {latitude: left, longitude: top} = toLatLon(MIDDLEMOUNT_LEFT,
                                                    MIDDLEMOUNT_TOP,
                                                    MIDDLEMOUNT_ZONE_NUM,
                                                    MIDDLEMOUNT_ZONE_LETTER);
    var {latitude: right, longitude: bottom} = toLatLon(MIDDLEMOUNT_RIGHT,
                                                        MIDDLEMOUNT_BOTTOM,
                                                        MIDDLEMOUNT_ZONE_NUM,
                                                        MIDDLEMOUNT_ZONE_LETTER);
    var bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(right, top),
        new google.maps.LatLng(left, bottom)
    );

    overlay = new MiddlemountOverlay(bounds, MIDDLEMOUNT_OVERLAY_SRC, map);
};






/** @constructor */
function MiddlemountOverlay(bounds, image, map) {
    // Initialize all properties.
    this.bounds_ = bounds;
    this.image_ = image;
    this.map_ = map;

    // Define a property to hold the image's div. We'll
    // actually create this div upon receipt of the onAdd()
    // method so we'll leave it null for now.
    this.div_ = null;

    // Explicitly call setMap on this overlay.
    this.setMap(map);
}

/**
* onAdd is called when the map's panes are ready and the overlay has been
* added to the map.
*/
MiddlemountOverlay.prototype.onAdd = function() {
    var div = document.createElement('div');
    div.style.borderStyle = 'none';
    div.style.borderWidth = '0px';
    div.style.position = 'absolute';

    // Create the img element and attach it to the div.
    var img = document.createElement('img');
    img.src = this.image_;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.position = 'absolute';
    div.appendChild(img);

    this.div_ = div;

    // Add the element to the "overlayLayer" pane.
    var panes = this.getPanes();
    panes.overlayLayer.appendChild(div);
};

MiddlemountOverlay.prototype.draw = function() {
    // We use the south-west and north-east
    // coordinates of the overlay to peg it to the correct position and size.
    // To do this, we need to retrieve the projection from the overlay.
    var overlayProjection = this.getProjection();

    // Retrieve the south-west and north-east coordinates of this overlay
    // in LatLngs and convert them to pixel coordinates.
    // We'll use these coordinates to resize the div.
    var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
    var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

    // Resize the image's div to fit the indicated dimensions.
    var div = this.div_;
    div.style.left = sw.x + 'px';
    div.style.top = ne.y + 'px';
    div.style.width = (ne.x - sw.x) + 'px';
    div.style.height = (sw.y - ne.y) + 'px';
};

// The onRemove() method will be called automatically from the API if
// we ever set the overlay's map property to 'null'.
MiddlemountOverlay.prototype.onRemove = function() {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
};









// Utility stuff

// Bidirectional UTM-WGS84 converter
// Credit to Timothy Gu at https://github.com/TimothyGu/utm

var K0 = 0.9996;

var E = 0.00669438;
var E2 = Math.pow(E, 2);
var E3 = Math.pow(E, 3);
var E_P2 = E / (1 - E);

var SQRT_E = Math.sqrt(1 - E);
var _E = (1 - SQRT_E) / (1 + SQRT_E);
var _E2 = Math.pow(_E, 2);
var _E3 = Math.pow(_E, 3);
var _E4 = Math.pow(_E, 4);
var _E5 = Math.pow(_E, 5);

var M1 = 1 - E / 4 - 3 * E2 / 64 - 5 * E3 / 256;
var M2 = 3 * E / 8 + 3 * E2 / 32 + 45 * E3 / 1024;
var M3 = 15 * E2 / 256 + 45 * E3 / 1024;
var M4 = 35 * E3 / 3072;

var P2 = 3 / 2 * _E - 27 / 32 * _E3 + 269 / 512 * _E5;
var P3 = 21 / 16 * _E2 - 55 / 32 * _E4;
var P4 = 151 / 96 * _E3 - 417 / 128 * _E5;
var P5 = 1097 / 512 * _E4;

var R = 6378137;

var ZONE_LETTERS = 'CDEFGHJKLMNPQRSTUVWXX';

function toLatLon(easting, northing, zoneNum, zoneLetter, northern, strict) {
  strict = strict !== undefined ? strict : true;

  if (!zoneLetter && northern === undefined) {
    throw new Error('either zoneLetter or northern needs to be set');
  } else if (zoneLetter && northern !== undefined) {
    throw new Error('set either zoneLetter or northern, but not both');
  }

  if (strict) {
    if (easting < 100000 || 1000000 <= easting) {
      throw new RangeError('easting out of range (must be between 100 000 m and 999 999 m)');
    }
    if (northing < 0 || northing > 10000000) {
      throw new RangeError('northing out of range (must be between 0 m and 10 000 000 m)');
    }
  }
  if (zoneNum < 1 || zoneNum > 60) {
    throw new RangeError('zone number out of range (must be between 1 and 60)');
  }
  if (zoneLetter) {
    zoneLetter = zoneLetter.toUpperCase();
    if (zoneLetter.length !== 1 || ZONE_LETTERS.indexOf(zoneLetter) === -1) {
      throw new RangeError('zone letter out of range (must be between C and X)');
    }
    northern = zoneLetter >= 'N';
  }

  var x = easting - 500000;
  var y = northing;

  if (!northern) y -= 1e7;

  var m = y / K0;
  var mu = m / (R * M1);

  var pRad = mu +
             P2 * Math.sin(2 * mu) +
             P3 * Math.sin(4 * mu) +
             P4 * Math.sin(6 * mu) +
             P5 * Math.sin(8 * mu);

  var pSin = Math.sin(pRad);
  var pSin2 = Math.pow(pSin, 2);

  var pCos = Math.cos(pRad);

  var pTan = Math.tan(pRad);
  var pTan2 = Math.pow(pTan, 2);
  var pTan4 = Math.pow(pTan, 4);

  var epSin = 1 - E * pSin2;
  var epSinSqrt = Math.sqrt(epSin);

  var n = R / epSinSqrt;
  var r = (1 - E) / epSin;

  var c = _E * pCos * pCos;
  var c2 = c * c;

  var d = x / (n * K0);
  var d2 = Math.pow(d, 2);
  var d3 = Math.pow(d, 3);
  var d4 = Math.pow(d, 4);
  var d5 = Math.pow(d, 5);
  var d6 = Math.pow(d, 6);

  var latitude = pRad - (pTan / r) *
                 (d2 / 2 -
                  d4 / 24 * (5 + 3 * pTan2 + 10 * c - 4 * c2 - 9 * E_P2)) +
                  d6 / 720 * (61 + 90 * pTan2 + 298 * c + 45 * pTan4 - 252 * E_P2 - 3 * c2);
  var longitude = (d -
                   d3 / 6 * (1 + 2 * pTan2 + c) +
                   d5 / 120 * (5 - 2 * c + 28 * pTan2 - 3 * c2 + 8 * E_P2 + 24 * pTan4)) / pCos;

  return {
    latitude: toDegrees(latitude),
    longitude: toDegrees(longitude) + zoneNumberToCentralLongitude(zoneNum)
  };
}

function fromLatLon(latitude, longitude, forceZoneNum) {
  if (latitude > 84 || latitude < -80) {
    throw new RangeError('latitude out of range (must be between 80 deg S and 84 deg N)');
  }
  if (longitude > 180 || longitude < -180) {
    throw new RangeError('longitude out of range (must be between 180 deg W and 180 deg E)');
  }

  var latRad = toRadians(latitude);
  var latSin = Math.sin(latRad);
  var latCos = Math.cos(latRad);

  var latTan = Math.tan(latRad);
  var latTan2 = Math.pow(latTan, 2);
  var latTan4 = Math.pow(latTan, 4);

  var zoneNum;

  if (forceZoneNum === undefined) {
    zoneNum = latLonToZoneNumber(latitude, longitude);
  } else {
    zoneNum = forceZoneNum;
  }

  var zoneLetter = latitudeToZoneLetter(latitude);

  var lonRad = toRadians(longitude);
  var centralLon = zoneNumberToCentralLongitude(zoneNum);
  var centralLonRad = toRadians(centralLon);

  var n = R / Math.sqrt(1 - E * latSin * latSin);
  var c = E_P2 * latCos * latCos;

  var a = latCos * (lonRad - centralLonRad);
  var a2 = Math.pow(a, 2);
  var a3 = Math.pow(a, 3);
  var a4 = Math.pow(a, 4);
  var a5 = Math.pow(a, 5);
  var a6 = Math.pow(a, 6);

  var m = R * (M1 * latRad -
               M2 * Math.sin(2 * latRad) +
               M3 * Math.sin(4 * latRad) -
               M4 * Math.sin(6 * latRad));
  var easting = K0 * n * (a +
                          a3 / 6 * (1 - latTan2 + c) +
                          a5 / 120 * (5 - 18 * latTan2 + latTan4 + 72 * c - 58 * E_P2)) + 500000;
  var northing = K0 * (m + n * latTan * (a2 / 2 +
                                         a4 / 24 * (5 - latTan2 + 9 * c + 4 * c * c) +
                                         a6 / 720 * (61 - 58 * latTan2 + latTan4 + 600 * c - 330 * E_P2)));
  if (latitude < 0) northing += 1e7;

  return {
    easting: easting,
    northing: northing,
    zoneNum: zoneNum,
    zoneLetter: zoneLetter
  };
}

function latitudeToZoneLetter(latitude) {
  if (-80 <= latitude && latitude <= 84) {
    return ZONE_LETTERS[Math.floor((latitude + 80) / 8)];
  } else {
    return null;
  }
}

function latLonToZoneNumber(latitude, longitude) {
  if (56 <= latitude && latitude < 64 && 3 <= longitude && longitude < 12) return 32;

  if (72 <= latitude && latitude <= 84 && longitude >= 0) {
    if (longitude <  9) return 31;
    if (longitude < 21) return 33;
    if (longitude < 33) return 35;
    if (longitude < 42) return 37;
  }

  return Math.floor((longitude + 180) / 6) + 1;
}

function zoneNumberToCentralLongitude(zoneNum) {
  return (zoneNum - 1) * 6 - 180 + 3;
}

function toDegrees(rad) {
  return rad / Math.PI * 180;
}

function toRadians(deg) {
  return deg * Math.PI / 180;
}