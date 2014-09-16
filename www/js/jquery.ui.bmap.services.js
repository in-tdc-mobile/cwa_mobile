 /*!
 * jQuery Bing Map 1.0
 * http://jquery-bing-maps.googlecode.com
 * Copyright (c) 2010 - 2012 Johan Säll Larsson
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 *
 * Depends:
 *		jquery.ui.bmap.js
 */
( function($) {
	
	var GEOCODE_URL = 'http://dev.virtualearth.net/REST/v1/Locations/{0}?output=json&jsonp=?&key={1}';
	var DIRECTIONS_URL = 'http://dev.virtualearth.net/REST/v1/Routes?wp.0={0}&wp.1={1}&routePathOutput=Points&output=json&jsonp=?&key={2}';
	
	function _callback(a, b) {
		$.getJSON( a, function(c) {
			if ( c.authenticationResultCode === 'ValidCredentials' && c.resourceSets && c.resourceSets.length > 0 && c.resourceSets[0].estimatedTotal > 0 ) {
				b(c.resourceSets, 'OK');
			} else {
				b(null, 'ZERO_RESULTS');
			}
		}).error( function() { 
			b(null, 'ERROR'); 
		});
	}
	
	$.extend($.ui.gmap.prototype, {
		
		/**
		 * A service for converting between an address and a LatLng.
		 * geocoderRequest {
		 *		address: string (optional)
		 *		location: Microsoft.Maps.Location (optional)
		 * }
		 */
		search: function(geocoderRequest, callback) {
			var query = ( geocoderRequest.address ) ? geocoderRequest.address : ( geocoderRequest.point.latitude + ','+ geocoderRequest.point.longitude );
			_callback( GEOCODE_URL.replace('{0}', query).replace('{1}', this.options.credentials), callback);
		},
		
		/** 
		 * @param request:object (origin, destination)
		 * 
		 */
		loadDirections: function(directionsRequest, callback) {
			_callback( DIRECTIONS_URL.replace('{0}', directionsRequest.origin).replace('{1}', directionsRequest.destination).replace('{2}', this.options.credentials), callback);
		},
		
		displayDirections: function(directionsRequest, renderOptions) {
			var self =this;
			var directionCallback = function() {
				var directionManager = self.get('services > DirectionsManager', new Microsoft.Maps.Directions.DirectionsManager(self.get('map')));
				var origin = ( typeof directionsRequest.origin === 'string' ) ? { 'address': directionsRequest.origin } : { 'location': directionsRequest.origin };
				var destination = ( typeof directionsRequest.destination === 'string' ) ? { 'address': directionsRequest.destination } : { 'location': directionsRequest.destination };
				directionManager.resetDirections();
				directionManager.setRequestOptions(directionsRequest.routeMode);
				directionManager.addWaypoint(new Microsoft.Maps.Directions.Waypoint(origin));
				directionManager.addWaypoint(new Microsoft.Maps.Directions.Waypoint(destination));
				if (renderOptions) {
					directionManager.setRenderOptions({'itineraryContainer': renderOptions.panel});
				}
				directionManager.calculateDirections();
			}
			if ( !self.get('services > DirectionsManager') ) {
				Microsoft.Maps.loadModule('Microsoft.Maps.Directions', { callback: directionCallback });
			} else {
				directionCallback();
			}
		}

	
	});
	
} (jQuery) );