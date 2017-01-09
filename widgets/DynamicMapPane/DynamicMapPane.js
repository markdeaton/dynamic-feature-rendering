/* DynamicMapPane - A Content pane with Esri map for use in a GridContainer. */
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/dom",
	"dojo/dom-construct",
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/on",
	"dojo/query",
	"dojo/_base/Color",
	"dojo/store/Memory",
	"dojo/data/ObjectStore",
	"dijit/registry",
	"dijit/layout/ContentPane",
	"dijit/TitlePane",
	"dijit/form/FilteringSelect",
	"dijit/form/Select",
	"dijit/form/ComboBox",
	"dijit/Tooltip",
	"esri/Map",
	"esri/views/MapView",
	"esri/widgets/Home",
	"esri/layers/MapImageLayer",
	"esri/symbols/SimpleFillSymbol",
	"esri/renderers/ClassBreaksRenderer",
	"esri/renderers/smartMapping/statistics/classBreaks",
	"dojo/domReady!"],
function(
	declare, lang, array, dom, domConstruct, domStyle, domClass, on, query, Color,
	MemoryStore, ObjectStore,
	registry,
	ContentPane, TitlePane, FilteringSelect, Select, ComboBox, Tooltip,
	Map, MapView, Home, MapImageLayer, 
	SimpleFillSymbol, ClassBreaksRenderer, classBreaks) {
	
	
	/* Class declaration in JSON form */
	return declare("apl.DynamicMapPane", ContentPane, {

		/* Class vars here */
		baseClass:	"DynamicMapPane",
		cboAttrs:	null,
		mapId:		null,
		portalUrl:	null,
		attrFields:	null,
		attrSubLyr:	null,
		attrSubLyrId:null,
		attrFeatLyr:null,
		noDataSymbol:null,
		imgClose:	null,
		mapView:	null,
		mapImageLyr:null,
		
		
		/* Constructor */
		constructor: function(parameters) {
			this.mapId = parameters.mapId;
			this.portalUrl = parameters.portalUrl;
			this.attrFields = parameters.attrFields;
			this.attrSubLyrId = parameters.attrSubLyrId;
			this.attrFeatLyr = parameters.attrFeatLyr;
			this.noDataSymbol = parameters.noDataSymbol;
		},
		

		postCreate: function() {
			this.inherited(arguments);
			this.mapImageLyr = new MapImageLayer({
				portalItem: {
					id: this.mapId,
					portal: {
						url: this.portalUrl
					}
				}
			});
			this.mapImageLyr.load().then(lang.hitch(this, function(lyrLoaded) {
				// Sublayers array is not sorted as you might expect; search for id 0
				var aLyrNeeded = array.filter(lyrLoaded.sublayers.items, lang.hitch(this, function(lyrTest) {
					return lyrTest.id == this.attrSubLyrId;
				}));
				this.attrSubLyr = aLyrNeeded[0];
			}));
			
			var map = new Map({
				"layers"			: [this.mapImageLyr],
				"sliderOrientation"	: "horizontal"
			});
			this.mapView = new MapView({
				map: map,
				container: this.containerNode // DOM element to hold the map view
			});
			
			var home = new Home({"view":this.mapView});
			this.mapView.ui.add(home, "top-left");
			
			this.mapView.whenLayerView(this.mapImageLyr)
				.then(function(layerView) {
					/* Set up initial rendering params here */
					console.log("loaded mapView");
					
				}, function(error) {
					alert("Error loading the layer: " + error)
				})
				.otherwise(function(error) {
					alert("Problem loading the layer: " + error);
				});
			
			var store = new MemoryStore({"data":this.attrFields, "idProperty":"name"});
			var objStore = new ObjectStore({"objectStore":store});
			this.cboAttrs = new FilteringSelect({"store":objStore, "searchAttr":"alias", "labelAttr":"alias",
					"autoComplete":true, "autoWidth":true, "mapView":this.mapView});
			on(this.cboAttrs, "change", lang.hitch(this, onAttrChange));
			this.addChild(this.cboAttrs, 0);
			this.cboAttrs.startup();

			this.imgClose = domConstruct.create("img", {"class":"mapPaneCloseButton", "title":"Close", "src":"img/close_red.png"}, this.domNode);
			// this.startup();
		},
		
		startup: function() {
			this.inherited(arguments);
			Tooltip.show("Choose an attribute to map.", this.cboAttrs.domNode);
		},
		
		reRender: function() {
			var attrFldName = this.cboAttrs.getValue();
			console.log("attribute change: " + attrFldName);

			var colors = [];
			var imgs = dojo.query("#pnlCurrentColorRamp>img");
			imgs.forEach(function(img, index) {
				var sColor = (domStyle.get(img, "background-color"));
				var color = Color.fromRgb(sColor);
				colors.push(color);
			});
			
			var ddlAlgorithms = registry.byId("ddlAlgorithms");
			var sAlgorithm = ddlAlgorithms.getValue();

			classBreaks({"layer":this.attrFeatLyr, "field":attrFldName, "classificationMethod":sAlgorithm, "numClasses":colors.length}
			).then(lang.hitch(this, function(response) {
				var breakInfos = response.classBreakInfos;
				
				for (var i = 0; i < colors.length; i++) {
					var sym = new SimpleFillSymbol({"color":colors[i]});
					breakInfos[i].symbol = sym;
				}
				var cbr = new ClassBreaksRenderer({
					"field"				: attrFldName,
					"classBreakInfos"	: breakInfos,
					defaultSymbol		: this.noDataSymbol
				});
				this.attrSubLyr.renderer = cbr;
			}))
			.otherwise(function(err) {
				console.log(err.toString());
			});
		},
		
		setCloseButtonVisibility(bVisible) {
			
		}
		
	});
	
	/* Class methods here */

	function onAttrChange() {
		this.reRender();
	}
});