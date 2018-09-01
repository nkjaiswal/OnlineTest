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
			
			
		},
		createQuestion: function(){
			var json = this.getView().byId("jsonData").getValue();
			this.ajaxPOST("/test/add-test-set",JSON.parse(json), function(data){
				
			});
			alert("done");
		},
		_createModel : function(view, data, modelName){
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(data);
			view.setModel(oModel, modelName);
		}
	});

	return PageController;

});
