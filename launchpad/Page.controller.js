sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Controller, JSONModel) {
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
		onInit : function (evt) {
			var that = this;
			this.ajaxGET("/ui-apps/",function(res){
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(res);
				that.getView().setModel(oModel, "apps");
			})
			
		},

		navigate : function (evt) {
			var appClicked = evt.getSource().getBindingContext("apps").getObject();
			var appId = appClicked.appId;
			location.href = "/" + appId;
		}
	});

	return PageController;

});
