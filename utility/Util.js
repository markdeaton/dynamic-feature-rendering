/* DynamicMapPane - A Content pane with Esri map for use in a GridContainer. */
define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/domReady!"],
function(
	declare, lang, array) {
	
	
	/* Class declaration in JSON form */
	return declare("apl.DynamicMapPaneUtil", [], {
		isFieldIgnored: function(fieldName, ignoreList) {
			var fieldNameLC = fieldName.toLowerCase();
			
			var bFieldIsIgnored = array.some(ignoreList, function(fieldToIgnore) {
				var fieldToIgnoreLC = fieldToIgnore.toLowerCase();
				if (fieldToIgnoreLC.indexOf("*") > -1) {
				// Handle * wildcard in field ignore settings
				var re = RegExp("^" + fieldToIgnoreLC.split("*").join(".*") + "$");
				return re.test(fieldNameLC);
				} else return fieldNameLC === fieldToIgnoreLC;
			});
			return bFieldIsIgnored;
		}
	});
	}
);