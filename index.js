require([
	"dojo/parser", 
	"dojo/on",
	"dojo/query",
	"dojo/dom",
	"dojo/topic", 
	"dojo/dom-class", 
	"dojo/dom-construct", 
	"dojo/_base/lang", 
	"dojo/_base/array",
	"dijit/registry", 
	"dojox/layout/GridContainer",
	"dijit/layout/ContentPane",
	"dijit/TitlePane",
	"dojo/topic",
	"dijit/form/Button",
	"dijit/form/DropDownButton",
	"esri/Map",
	"esri/views/MapView",
	"esri/layers/MapImageLayer",
	"esri/layers/FeatureLayer",
	"esri/layers/support/Field",
	"esri/Color",
	"esri/symbols/SimpleFillSymbol",
	"esri/request",
	"./DynamicMapPane.js", 
	"dojo/ready"],
function(parser, on, query, dom, topic, domClass, domConstruct, lang, array, registry, 
	GridContainer, ContentPane, TitlePane,
	topic, Button, DropDownButton,
	Map, MapView, MapImageLayer, FeatureLayer, Field, 
	Color, SimpleFillSymbol, esriRequest, 
	DynMapPane, ready){
			
	var attrFields = []; // Numeric attributes suitable for mapping choropleth-style
	var mapPanes = [];	 // List of maps open
	var bcCenter = null; // Border container containing maps
	var lyrFeatures, symNoData; // Parameters needed to create a new map pane
	
	ready(function(){
		bcCenter = registry.byId("bcCenter");

		getAttributeInfo();
		
		setupColorRamps();
		
		setupBreakAlgorithms();
		
		on(registry.byId("btnAddMap"), "click", function(evt) {
			createMapPane("", lyrFeatures, symNoData);
		});
/* 		var cpane2 = new DynMapTitlePane({title:"cpane2", content: "Content Pane 2 : Drag Me !"});
		var cpane3 = new DynMapTitlePane({title:"cpane3", content: "Content Pane 3 : Drag Me !"});

		// Listen to drag and drop events
		topic.subscribe("dojox/mdnd/drop", function(data) {
			console.log("dropped");
		}); */
		
	});
	
	function getAttributeInfo() {
		var lyr = new MapImageLayer({
			portalItem: {
				id: settings.mapService.itemId,
				portal: {
					url: settings.mapService.portalUrl
				}
			}
		});
		var prmAttrsRetrieved = null;
		
		lyr.load().then(function(lyrLoaded) {
			// Sublayers array is not sorted as you might expect; search for id 0
			var lyrNeeded = array.filter(lyrLoaded.sublayers.items, function(lyrTest) {
				return lyrTest.id == settings.mapService.attrLyrId;
			})[0];
			var url = lyrNeeded.url;

			lyrFeatures = new FeatureLayer({url: url});
			prmAttrsRetrieved = lyrFeatures.load();
			prmAttrsRetrieved.then(function(flyr) {
				var fields = flyr.fields;
				attrFields = array.filter(fields, function(field) {
					// Only use fields that are numeric and don't match certain blacklisted names
					return	( field.type === "integer" || field.type === "small-integer" || field.type === "single" || field.type === "double" )
						&&	!array.some(settings.fieldsToIgnore, function(fldNameToIgnore) {
							return field.alias.toLowerCase().startsWith(fldNameToIgnore.toLowerCase());
						});
				});
				console.log(attrFields.length + ":\n" + attributeNames().join(",\n"));
				var fillColor = new Color(settings.noDataSymbol.color);
				fillColor.a = settings.noDataSymbol.alpha;
				var outlineColor = new Color(settings.noDataSymbol.outlineColor);
				outlineColor.a = settings.noDataSymbol.outlineAlpha;
				symNoData = new SimpleFillSymbol({
					"style"	: settings.noDataSymbol.style,
					"color"	: fillColor,
					"outline" : {
						"color"	: outlineColor,
						"width"	: settings.noDataSymbol.outlineWidth
					}
				});
				
				createMapPane("", lyrFeatures, symNoData);
			})
			.otherwise(function(err) {
				alert("Error loading feature attributes: " + err.message);
			});			
		});
	}
	
	function createMapPane(title, attrFeatLyr, noDataSymbol) {
		var cPane1 = new DynMapPane({
			title:title, 
			"portalUrl":settings.mapService.portalUrl, "mapId":settings.mapService.itemId,
			"attrSubLyrId":settings.mapService.attrLyrId, "attrFeatLyr":attrFeatLyr, "attrFields":attrFields,
			"noDataSymbol":noDataSymbol
		});
		bcCenter.addChild(cPane1);
		mapPanes.push(cPane1);
	}
	
	// Return an array of the usable attribute aliases
	function attributeNames() {
		return array.map(attrFields, function(fld) {
			return fld.alias;
		});
	}
	
	function setupColorRamps() {
		query(".colorRamp").on("click", function(evt) {
			query("#pnlCurrentColorRamp")[0].innerHTML = evt.currentTarget.innerHTML;
			reRenderAllMaps();
		});
		// Get colors from config and add to rendering panel
		
		// Listen to ramp expand button events
/* 		on(dojo.byId("btnExpandColorRamp"), "click", function(event) {
			console.log("ramp button click");
		}); */
	}
	
	function setupBreakAlgorithms() {
		on(registry.byId("ddlAlgorithms"), "change", function(evt) {
			reRenderAllMaps();
		});
	}
	
	function reRenderAllMaps() {
		array.forEach(mapPanes, function(mapPane) {
			mapPane.reRender();
		});
	}
});
