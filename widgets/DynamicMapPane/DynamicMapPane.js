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
	"dijit/_WidgetBase",
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
	"esri/Color",
	"esri/symbols/SimpleFillSymbol",
	"esri/renderers/ClassBreaksRenderer",
	"esri/renderers/smartMapping/statistics/classBreaks",
	"esri/renderers/smartMapping/statistics/histogram",
	"esri/tasks/QueryTask",
	"esri/tasks/support/Query",
	"./utility/Util.js",
	"dojo/domReady!"],
function(
	declare, lang, array, dom, domConstruct, domStyle, domClass, on, query, _WidgetBase,
	dojoColor, MemoryStore, ObjectStore,
	registry,
	ContentPane, TitlePane, FilteringSelect, Select, ComboBox, Tooltip,
	Map, MapView, Home, MapImageLayer, 
	Color, SimpleFillSymbol, ClassBreaksRenderer, classBreaks, esriHistogram,
	QueryTask, Query,
	Util) {
	
	
	/* Class declaration in JSON form */
	return declare("apl.DynamicMapPane", [ContentPane], {

		/* Class vars here */
		baseClass:	"DynamicMapPane",
		cboAttrs:		null,
		mapId:			null,
		portalUrl:	null,
		attrFields:	null,
		attrSubLyr:	null,
		attrSubLyrId:null,
		attrFeatLyr:null,
		noDataSymbol:null,
		imgClose:		null,
		mapView:		null,
		mapImageLyr:null,
		queryTask:	null,
		histogram:	null,
		utils:			new Util(),
		
		/* Constructor */
		constructor: function(parameters) {
			this.mapId = parameters.mapId;
			this.portalUrl = parameters.portalUrl;
			this.attrFields = parameters.attrFields;
			this.attrSubLyrId = parameters.attrSubLyrId;
			this.attrFeatLyr = parameters.attrFeatLyr;

			var fillColor = new Color(settings.noDataSymbol.color);
			fillColor.a = settings.noDataSymbol.alpha;
			var outlineColor = new Color(settings.noDataSymbol.outlineColor);
			outlineColor.a = settings.noDataSymbol.outlineAlpha;
			this.noDataSymbol = new SimpleFillSymbol({
				"style"	: settings.noDataSymbol.style,
				"color"	: fillColor,
				"outline" : {
					"color"	: outlineColor,
					"width"	: settings.noDataSymbol.outlineWidth
				}
			});
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
				this.queryTask = new QueryTask({"url": this.attrSubLyr.url});
			}));
			
			var map = new Map({
				"layers"			: [this.mapImageLyr],
				"sliderOrientation"	: "horizontal"
			});
			this.mapView = new MapView({
				map: map,
				container: this.containerNode // DOM element to hold the map view
			});
			this.mapView.on("layerview-destroy", lang.hitch(this, onLayerViewDestroy));
			this.mapView.on("click", lang.hitch(this, onIdentify));
			
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
			
			// Add dropdown and close button along top of map
			var topBar = domConstruct.create("div", {"class":"mapPaneTopBar"}, this.containerNode, "first");
			
			var store = new MemoryStore({"data":this.attrFields, "idProperty":"name"});
			var objStore = new ObjectStore({"objectStore":store});
			this.cboAttrs = new FilteringSelect({"store":objStore, "searchAttr":"alias", "labelAttr":"alias",
					"autoComplete":true, "autoWidth":true, "mapView":this.mapView, "class":"ddlAttrs"});
			on(this.cboAttrs, "change", lang.hitch(this, onAttrChange));
			domConstruct.place(this.cboAttrs.domNode, topBar);			
			this.cboAttrs.startup();

			this.imgClose = domConstruct.create("img", {"class":"mapPaneCloseButton", "title":"Close", "src":"img/close_red.png"}, topBar);
			on(this.imgClose, "click", lang.hitch(this, function() {
				this.emit("closeMap");
			}));
			
			// this.startup();
		},
		
		startup: function() {
			this.inherited(arguments);
/* 			var tooltip = new Tooltip({
				"connectId"	:	[this.cboAttrs.domNode],
				"label"		:	"Choose an attribute to map."
			}); */
			Tooltip.show("Choose an attribute to map.", this.cboAttrs.domNode);
		},
		
		reRender: function() {
			var attrFldName = this.cboAttrs.getValue();
			console.log("attribute change: " + attrFldName);

			var colors = [];
			var imgs = dojo.query("#pnlCurrentColorRamp>img");
			imgs.forEach(function(img, index) {
				var sColor = (domStyle.get(img, "background-color"));
				var color = dojoColor.fromRgb(sColor);
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
					"defaultSymbol"		: this.noDataSymbol
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
		// Get statistics
		esriHistogram({"layer":this.attrFeatLyr, "field":this.cboAttrs.getValue(), "classificationMethod":"equal-interval", "numBins":HISTOSLIDER_BARS})
			.then(function(result) {
				console.log("histogram success");
				this.histogram = result;
			}).otherwise(function(err) {
				console.error("Histogram generation error: " + err.message);
			});
	}
	
	function onLayerViewDestroy() {
		console.log("layerview destroy");
	}
	
	function onIdentify(evtClick) {
		// attrSubLyr = the layer to query
		var query = new Query({"geometry":evtClick.mapPoint, "outFields":["*"], "num":1});
		this.queryTask.execute(query).then(lang.hitch(this, function(result) {
			console.log("query complete");
			if (result.features.length <= 0) return;
			var feat = result.features[0];
			// var title = feat.attributes[settings.popupTitleField];
			var title = feat.attributes.NAME + ", " + feat.attributes.ST_ABBREV;
			var content = "<table>"
			content += "<tr> <td><b>Field Name</b></td> <td><b>Value</b></td> </tr>"
			var ignoreList = settings.fieldsToIgnore;
			
			for (fieldName in feat.attributes) {
				var bFieldInIgnoreList = this.utils.isFieldIgnored(fieldName, ignoreList);
				if (!bFieldInIgnoreList) {
					content += "<tr><td title='" + fieldName + "'>";
					// Find the field's alias
					var thisField = array.filter(result.fields, function(f) {
						return f.name === fieldName;
					});
					var fieldAlias = thisField[0].alias;
					content += fieldAlias;
					content += "</td><td>";
					content += feat.attributes[fieldName];
					content += "</td></tr>";
				}
			}
			content += "</table>";
			this.mapView.popup.open({"title":title, "location":evtClick.mapPoint});
			this.mapView.popup.content = content;
		})).otherwise(function(err) {
			console.error("Problem with identify: " + err.message);
		});
	}
});