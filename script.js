(function() {

/******** Load Leaflet css *********/
window.onload = function() {
var fileref=document.createElement("link")
		fileref.setAttribute("rel", "stylesheet")
		fileref.setAttribute("href", "http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.css" )
		fileref.onload = loadproj4leaflet;
		document.getElementsByTagName("head")[0].appendChild(fileref)
};

/******** Load Leaflet js *********/
    var leaflet = document.createElement('script');
    leaflet.setAttribute("src","http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet-src.js");
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(leaflet);


	var proj4 = document.createElement('script');
    proj4.setAttribute("src","https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.14/proj4.js");
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(proj4);


function loadproj4leaflet() {
    var proj4leaflet = document.createElement('script');
    proj4leaflet.setAttribute("src","https://cdnjs.cloudflare.com/ajax/libs/proj4leaflet/0.7.2/proj4leaflet.min.js");
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(proj4leaflet);
	proj4leaflet.onload = createMap;
}

	
/******** Called Leaflet css loaded ******/
function createMap() {
	if(L){

		/******** Add Geoserver data ******/
		L.TileLayer.Common = L.TileLayer.extend({
			initialize: function (options) {
				L.TileLayer.prototype.initialize.call(this, this.url, options);
			}
		});		
		(function () {
		var login = document.getElementById('KORTxyz').getAttribute("login");
		var password = document.getElementById('KORTxyz').getAttribute("password");

			L.TileLayer.Geodatastyrelsen = L.TileLayer.Common.extend({
				url: 'http://{s}.kortforsyningen.kms.dk/{service}?login='+login+'&password='+password+'&request=GetTile&version=1.0.0&service=WMTS&Layer={layer}&style=default&format=image/jpeg&TileMatrixSet=View1&TileMatrix={zoom}&TileRow={y}&TileCol={x}',
				options: {attribution: 'Geodatastyrelsen',
					opacity: 1,
					continuousWorld: true,
					zIndex: 1,
					maxZoom: 13,
					zoom: function () {
						var zoom = KORTxyz.getZoom();
						if (zoom < 10)
							return 'L0' + zoom;
						else
							return 'L' + zoom;
					}}
			});	
			
		}());
		
	var crs = new L.Proj.CRS.TMS(
		'EPSG:25832',
    	'+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs', 
    	[120000, 5900000, 1000000, 6500000], 
    	{
        resolutions: [1638.4, 819.2, 409.6, 204.8, 102.4, 51.2, 25.6, 12.8, 6.4, 3.2, 1.6, 0.8, 0.4]
		}),
		
		KORTxyz = L.map('KORTxyz',{crs: crs}).fitBounds([[57,13],[55,8]]),
		
		basemaps = {
		"Ortofoto"	: new L.TileLayer.Geodatastyrelsen({service:'orto_foraar', layer: 'orto_foraar'}),
		"Skærmkort"	: new L.TileLayer.Geodatastyrelsen({service:'topo_skaermkort', layer: 'dtk_skaermkort'}),  
		"Skærmkort Dæmpet"	: new L.TileLayer.Geodatastyrelsen({service:'topo_skaermkort_daempet', layer: 'dtk_skaermkort_daempet'}).addTo(KORTxyz),
		"Skærmkort Grå"	: new L.TileLayer.Geodatastyrelsen({service:'topo_skaermkort_graa', layer: 'dtk_skaermkort_graa'})
		},
		
		overlays = {}; 
		
	/******** Add Geoserver data ******/
    xmlhttp=new XMLHttpRequest();
	var url = document.getElementById('KORTxyz').getAttribute("url");

	var ws = document.getElementById('KORTxyz').getAttribute("ws");
	xmlhttp.open("GET",url+"wms?request=getCapabilities",false);
				
	L.TileLayer.WMTS = L.TileLayer.Common.extend({
		url: url+'gwc/service/wmts?request=GetTile&version=1.0.0&service=WMTS&Layer={layer}&format=image/png&TileMatrixSet=GST&TileMatrix={zoom}&TileRow={y}&TileCol={x}',
		options: {attribution: 'NaturErhvervStyrelsen',
			opacity: 0.9,
			continuousWorld: true,
			zIndex: 1,
			maxZoom: 13,
			zoom: function () {
				var zoom = KORTxyz.getZoom();
				if (zoom < 10)
					return 'L0' + zoom;
				else
					return 'L' + zoom;
			}}
	});
	
	xmlhttp.send();
	var capabilities = xmlhttp.responseXML.getElementsByTagName("Layer").length
	for (i=1;i<capabilities;i++){
		overlays[xmlhttp.responseXML.getElementsByTagName("Layer")[i].getElementsByTagName("Name")[0].textContent] = new L.TileLayer.WMTS({
			layer: xmlhttp.responseXML.getElementsByTagName("Layer")[i].getElementsByTagName("Name")[0].textContent
		});
	}	
	L.control.layers(basemaps,overlays).addTo(KORTxyz);
	
	var populationLegend = L.control({position: 'bottomright'});

	KORTxyz.on('overlayadd',function(e){
	legendLayer = e.name;
	populationLegend.onAdd = function (KORTxyz) {
		className = 'info legend ' + legendLayer;
		var div = L.DomUtil.create('div');
			div.setAttribute('id',e.name)
			div.innerHTML +=
			'<img src='+url+'wms?REQUEST=GetLegendGraphic&TRANSPARENT=true&VERSION=1.0.0&FORMAT=image/png&WIDTH=40&HEIGHT=12&LAYER=' + legendLayer + '&LEGEND_OPTIONS=forceRule:True;forceLabels:on;fontSize:10;fontAntiAliasing:false;font:Helvetica;" style="box-shadow:0 1px 5px rgba(0,0,0,0.8);border-radius:5px;padding:2px;background-color:rgba(255, 255, 255, 0.8);">';
		return div;
	};

	populationLegend.addTo(KORTxyz);
	});
	
	KORTxyz.on('overlayremove',function(e){
		var x = document.getElementById(e.name)
		x.parentNode.removeChild(x)
	});
    
	
	
	}
	
}


})(); 