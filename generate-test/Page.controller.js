sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageToast'
	], function(jQuery, Controller, JSONModel, toast) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.TileContainer.Page", {

		ajaxGET : function (url,callback){
			$.ajax({
				url: url,
				dataType: "json",
				success: function(response) {
					callback(response);
				}
			});
		},
		ajaxPOST : function (url,data,callback){
			$.ajax({
				url: url,
				type: "POST",
				data: JSON.stringify(data),
				dataType: "json",
				contentType:"application/json",
				success: function(response) {
					callback(response);
				}
			});
		},
		ajaxPUT : function (url,data,callback){
			$.ajax({
				url: url,
				type: "PUT",
				data: JSON.stringify(data),
				dataType: "json",
				contentType:"application/json",
				success: function(response) {
					callback(response);
				}
			});
		},
		getQueryVariable : function(variable) {
		    var query = window.location.search.substring(1);
		    var vars = query.split('&');
		    for (var i = 0; i < vars.length; i++) {
		        var pair = vars[i].split('=');
		        if (decodeURIComponent(pair[0]) == variable) {
		            return decodeURIComponent(pair[1]);
		        }
		    }
		    console.log('Query variable %s not found', variable);
		},
		onInit : function (evt) {
			this._loadSets();
			
		},
		_loadSets: function(){
			var that =this;
			this.ajaxGET("/test/get-all-test", function(data){
				that._createModel(that.getView(), data, "sets");
			});
		},
		_createModel : function(view, data, modelName){
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(data);
			view.setModel(oModel, modelName);
		},
		generate: function(){
			var that = this;
			var id = this.getView().byId("mysets").getSelectedKey();
			var name = this.getView().byId("candidate-name").getValue();
			var payload = {
				testid: id,
				name: name
			}
			this.ajaxPOST("/test/generate-test",payload, function(data){
				
				that.getView().byId("uid").setValue(data.insertedIds[0]);
			});
		}
	});

	return PageController;

});
