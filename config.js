    /* The map service behind this app should have two layers:
         1. (Topmost):    The features of interest with the attributes you want to render dynamically;
         2. (Underneath): More generalized geographies to give the user a reference when topmost features
                          are hidden or filtered out
         For example, U.S. counties may be the features of interest, and the background layers would be
         U.S. state outlines in muted colors, just to provide reference and context. */
  /* Image format to be generated & returned by the server 
		 see http://help.arcgis.com/en/arcgisserver/10.0/apis/rest/export.html 
		 N.B.: If you see white outlines around shapes on a dark background, try these workarounds:
		       1. Make sure your map frame background color is set to black before publishing your service; or
		       2. Use png32 as the format here */
	/* "publishingFeatureService:
      This app can publish results to ArcGIS Online. Here's where you can specify a layer that's symbolized
	     in a way appropriate for display in ArcGIS Online. */
	/* "noDataSymbol":
      How to symbolize features with no associated data (for the attribute of interest).
	     Valid fill styles: solid, null, horizontal, vertical, cross, 
	                        forwarddiagonal, backwarddiagonal, diagonalcross
	     Valid outline styles: solid, null, dot, dashdotdot,
	                           dashdot, dash */
var settings = {
  "mapService"  : {
    "svcUrl"			: "",
	"itemId"			: "cf40ab11f3844998ab6e2b0429c0c98e",
	"portalUrl"			: "https://maps2.esri.com/portal",
    "attrLyrId"			: 0,
    "bgLyrId"			: 1
  },
  "proxy"       : {
    "relativeUrl" : "",
    "absoluteUrl" : ""
  },
  
  "title" : "Dynamic Layers",
  
  "initialExtent" : {
    "xmin"  : -11452216.0805146,
    "ymin"  : -2154256.93970356,
    "xmax"  : 4224377.77267315,
    "ymax"  : 10281184.5978462
  },
  
  "initialMapDataset" : "2010 Total Population (U.S. Census)",
  "fieldsToIgnore"	  : ["Shape_Length*", "Shape_Area*", "FIPS", "FIPS_INT", "OBJECTID*", "ID"],
  "popupTitleField"		: "NAME",
	
	"imageFormat"   : "png8",
  
	"publishingFeatureService"  : "http://maps.esri.com/apl12/rest/services/DynamicLayers/HealthIndicators/MapServer/2",
	
	"noDataSymbol"  : {
      "color"     : "#777777",
      "alpha"     : 1.0,
      "style"     : "forward-diagonal",
      "outlineColor"  : "#000000",
      "outlineAlpha"  : 0.25,
      "outlineWidth"  : 0,
      "outlineStyle"  : "solid"
  },
	
	"attrBreaks"  : {
		"colorRamps"  : [
			{ "outlineColor"  : "#000000",
        "outlineAlpha"  : 0.25,
        "colors"  : [
          "#EEE3C2",
          "#F1C67B",
          "#B0A8A0",
          "#5687B4",
          "#125194"
        ]
      },
			{ "outlineColor" : "#000000",
        "outlineAlpha" : 0.25,
				"colors" : [
          "#D7191C",
          "#FDAE61",
          "#FFFFBF",
          "#A6D96A",
          "#1A9641"
        ]
			},
			{ "outlineColor" : "000000",
				"outlineAlpha" : "0.25",
				"colors" : [
          "#A6611A",
          "#DFC27D",
          "#F5F5F5",
          "#80CDC1",
          "#018571"
				]
      },
			{ "outlineColor" : "000000",
        "outlineAlpha" : "0.25",
        "colors" : [
          "#EFF3FF",
          "#BDD7E7",
          "#6BAED6",
          "#3182BD",
          "#08519C"
				]
			},
			{ "outlineColor" : "000000",
				"outlineAlpha" : "0.25",
        "colors" : [
          "#D73027",
          "#FC8D59",
          "#FEE08B",
          "#FFFFBF",
          "#D9EF8B",
          "#91CF60",
          "#1A9850"
				]
			},
			{ "outlineColor" : "000000",
				"outlineAlpha" : "0.25",
        "colors" : [
				"#8C510A",
				"#D8B365",
				"#F6E8C3",
				"#F5F5F5",
				"#C7EAE5",
				"#5AB4AC",
				"#01665E"
				]
			},
			{ "outlineColor" : "000000",
				"outlineAlpha" : "0.25",
				"colors" : [
          "#EFF3FF",
          "#C6DBEF",
          "#9ECAE1",
          "#6BAED6",
          "#4292C6",
          "#2171B5",
          "#084594"
				]
			},

			{ "outlineColor" : "000000",
				"outlineAlpha" : "0.25",
				"colors" : [
          "#D73027",
          "#F46D43",
          "#FDAE61",
          "#FEE08B",
          "#FFFFBF",
          "#D9EF8B",
          "#A6D96A",
          "#66BD63",
          "#1A9850"
				]
			},
			{ "outlineColor" : "000000",
				"outlineAlpha" : "0.25",
				"colors" : [
          "#8C510A",
          "#BF812D",
          "#DFC27D",
          "#F6E8C3",
          "#F5F5F5",
          "#C7EAE5",
          "#80CDC1",
          "#35978F",
          "#01665E"
				]
			},			
			{ "outlineColor" : "000000",
				"outlineAlpha" : "0.25",
				"colors" : [
          "#F7FBFF",
          "#DEEBF7",
          "#C6DBEF",
          "#9ECAE1",
          "#6BAED6",
          "#4292C6",
          "#2171B5",
          "#08519C",
          "#08306B"
				]
			}
		]
	}
  

};

// These shouldn't ever need to change...
const MAX_MAPS = 4;
// # bars in the bar chart above the range histo slider
const HISTOSLIDER_BARS = 20;