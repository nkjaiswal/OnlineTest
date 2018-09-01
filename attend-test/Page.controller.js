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
			var id = this.getQueryVariable("id");
			if(id == undefined || id == null || id == ""){
				id = prompt("Enter Test ID");
			}
			var that = this;
			this._loadQuestion(id,function(questions){
				that._createModel(that.getView(), questions, "questionSet");
				that._createModel(that.getView(), questions.questions, "questions");
				that._createModel(that.getView(), questions.categories, "categories");
				that._setQuestion(that.getView(),1);
				that.setTimer();
			});
			
		},
		setTimer : function(){
			var time = this.getView().getModel("questionSet").getData().started_at;
			var duration = this.getView().getModel("questionSet").getData().total_time;
			var sec = parseInt((new Date(new Date(time).getTime() + duration*1000).getTime() - new Date().getTime())/1000);
			var minutes = "0" + Math.floor(sec / 60);
			var seconds = "0" + (sec - minutes * 60);
			var lastTime = minutes.substr(-2) + ":" + seconds.substr(-2);
			var lastTimeData = {
				lastTime: lastTime
			}
			this._createModel(this.getView(), lastTimeData, "lastTime");
			var that = this;
			setTimeout(function(){ 
				that.setTimer(); 
			}, 1000);
		},
		loadCategory : function(oEvent){
			var cat = oEvent.getSource().getBindingContext("categories").getObject();
			var ques = this.getView().getModel("questions").getData();
			for(var i=0; i<ques.length; i++){
				if(cat.id == ques[i].category){
					this._setQuestion(this.getView(), ques[i].id);
					break;
				}
			}
		},
		markNext : function(){
			var id = this.getView().getModel("question").getData().id;
			this._markQuestion("MARKED");
			this._setQuestion(this.getView(), id+1);
		},
		saveNext : function(){
			var id = this.getView().getModel("question").getData().id;
			this._markQuestion("ANSWERED");
			this._setQuestion(this.getView(), id+1);
		},
		submit: function(){
			var q = this.getView().getModel("questions").getData();
			var qs = this.getView().getModel("questionSet").getData();
			qs.is_live = false;
			qs.questions = q;
			console.log(qs);
			this.ajaxPOST("/test/submit",qs,function(){
				alert("Success");
			});
		},
		loadQuestion: function(oEvent){
			var question = oEvent.getSource().getBindingContext("questions").getObject();
			this._setQuestion(this.getView(),question.id);
		},
		_markQuestion: function(flag){
			var question = this.getView().getModel("question").getData();
			question.status = flag;
			this._createModel(this.getView(), question, "question");
		},
		answered: function(oEvent){
			var question = oEvent.getSource().getModel("question").getData();
			var questions = oEvent.getSource().getModel("questions").getData();
			for(var i=0; i<questions.length; i++){
				if(questions[i].id == question.id){
					questions[i] = question;
					break;
				}
			}
			this._createModel(this.getView(), questions, "questions");
		},
		clear : function(oEvent){
			var question = oEvent.getSource().getModel("question").getData();
			for(var i=0; i<question.options.length; i++){
				question.options[i].selected = false;
			}
			this._createModel(this.getView(),question,"question");
			oEvent.getSource().getModel("question").refresh();
		},
		_setQuestion : function(view, qid){
			var modelData = view.getModel("questions").getData();
			var question = null;
			for(var i=0; i<modelData.length; i++){
				if(modelData[i].id == qid){
					question = modelData[i];
					if(modelData[i].status == "NOT_VISITED")
						modelData[i].status = "VISITED";
					break;
				}
			}
			view.getModel("questions").setData(modelData);

			this._createModel(view, question, "question");
			this._createModel(view, question.options, "options");
			this._formatter_set_button_enable();
			if(qid >= modelData.length){
				view.byId("sn").setEnabled(false);
				view.byId("msn").setEnabled(false);
				view.byId("submit").setEnabled(true);
			}
		},
		_createModel : function(view, data, modelName){
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(data);
			view.setModel(oModel, modelName);
		},
		_formatter_set_button_type : function(visited){
			if(visited == "VISITED"){
				return "Reject";
			}else if(visited == "MARKED"){
				return "Emphasized";
			}else if(visited == "ANSWERED"){
				return "Accept";
			}else{
				return "Default";
			}
		},
		_formatter_set_button_enable : function(){
			if(this.getView().getModel("question") == undefined)
				return false;
			var question = this.getView().getModel("question").getData();
			for(var i=0; i<question.options.length; i++){
				if(question.options[i].selected == true)
					return true;
			}
			return false;
		},
		_loadQuestion : function(id, callback){
			this.ajaxGET("/test/get-test/" + id, function(data){
				callback(data[0]);

			});
			return;
			var questionSet = {
				id : id,
				candidate_name : "Nishant Kumar",
				started_at : "2018/09/01 11:22:00",
				total_time : 3600,
				is_live: true,
				categories : [
					{
						id:"TYPE A",
						text: "Type A"
					}, {
						id: "TYPE B",
						text: "Type B"
					}
				],
				questions : [
					{
						id : 1,
						category : "TYPE A",
						question_text : "Question text goes here1",
						options: [
							{
								option_id : 1,
								text : "Option 1",
								selected : false
							},{
								option_id : 2,
								text : "Option 2",
								selected : false
							},{
								option_id : 3,
								text : "Option 3",
								selected : false
							},{
								option_id : 4,
								text : "Option 4",
								selected : false
							}
						],
						answer_given_by_candidate : null,
						positive_marks : 1,
						negative_marks : -0.25,
						status : "NOT_VISITED",
						actual_answer: 1
					},
					{
						id : 2,
						category : "TYPE B",
						question_text : "Question text goes here2",
						options: [
							{
								option_id : 1,
								text : "Option 1",
								selected : false
							},{
								option_id : 2,
								text : "Option 2",
								selected : false
							},{
								option_id : 3,
								text : "Option 3",
								selected : false
							},{
								option_id : 4,
								text : "Option 4",
								selected : false
							}
						],
						answer_given_by_candidate : null,
						positive_marks : 1,
						negative_marks : -0.25,
						status : "NOT_VISITED",
						actual_answer: 1
					},
					{
						id : 3,
						category : "TYPE A",
						question_text : "Question text goes here3",
						options: [
							{
								option_id : 1,
								text : "Option 1",
								selected : false
							},{
								option_id : 2,
								text : "Option 2",
								selected : false
							},{
								option_id : 3,
								text : "Option 3",
								selected : false
							},{
								option_id : 4,
								text : "Option 4",
								selected : false
							}
						],
						answer_given_by_candidate : null,
						positive_marks : 1,
						negative_marks : -0.25,
						status : "NOT_VISITED",
						actual_answer: 1
					},
					{
						id : 4,
						category : "TYPE A",
						question_text : "Question text goes here3",
						options: [
							{
								option_id : 1,
								text : "Option 1",
								selected : false
							},{
								option_id : 2,
								text : "Option 2",
								selected : false
							},{
								option_id : 3,
								text : "Option 3",
								selected : false
							},{
								option_id : 4,
								text : "Option 4",
								selected : false
							}
						],
						answer_given_by_candidate : null,
						positive_marks : 1,
						negative_marks : -0.25,
						status : "NOT_VISITED",
						actual_answer: 1
					},
					{
						id : 5,
						category : "TYPE A",
						question_text : "Question text goes here3",
						options: [
							{
								option_id : 1,
								text : "Option 1",
								selected : false
							},{
								option_id : 2,
								text : "Option 2",
								selected : false
							},{
								option_id : 3,
								text : "Option 3",
								selected : false
							},{
								option_id : 4,
								text : "Option 4",
								selected : false
							}
						],
						answer_given_by_candidate : null,
						positive_marks : 1,
						negative_marks : -0.25,
						status : "NOT_VISITED",
						actual_answer: 1
					},
					{
						id : 6,
						category : "TYPE A",
						question_text : "Question text goes here3",
						options: [
							{
								option_id : 1,
								text : "Option 1",
								selected : false
							},{
								option_id : 2,
								text : "Option 2",
								selected : false
							},{
								option_id : 3,
								text : "Option 3",
								selected : false
							},{
								option_id : 4,
								text : "Option 4",
								selected : false
							}
						],
						answer_given_by_candidate : null,
						positive_marks : 1,
						negative_marks : -0.25,
						status : "NOT_VISITED",
						actual_answer: 1
					},
					{
						id : 7,
						category : "TYPE A",
						question_text : "Question text goes here3",
						options: [
							{
								option_id : 1,
								text : "Option 1",
								selected : false
							},{
								option_id : 2,
								text : "Option 2",
								selected : false
							},{
								option_id : 3,
								text : "Option 3",
								selected : false
							},{
								option_id : 4,
								text : "Option 4",
								selected : false
							}
						],
						answer_given_by_candidate : null,
						positive_marks : 1,
						negative_marks : -0.25,
						status : "NOT_VISITED",
						actual_answer: 1
					},
					{
						id : 8,
						category : "TYPE A",
						question_text : "Question text goes here3",
						options: [
							{
								option_id : 1,
								text : "Option 1",
								selected : false
							},{
								option_id : 2,
								text : "Option 2",
								selected : false
							},{
								option_id : 3,
								text : "Option 3",
								selected : false
							},{
								option_id : 4,
								text : "Option 4",
								selected : false
							}
						],
						answer_given_by_candidate : null,
						positive_marks : 1,
						negative_marks : -0.25,
						status : "NOT_VISITED",
						actual_answer: 1
					},
					{
						id : 9,
						category : "TYPE A",
						question_text : "Question text goes here3",
						options: [
							{
								option_id : 1,
								text : "Option 1",
								selected : false
							},{
								option_id : 2,
								text : "Option 2",
								selected : false
							},{
								option_id : 3,
								text : "Option 3",
								selected : false
							},{
								option_id : 4,
								text : "Option 4",
								selected : false
							}
						],
						answer_given_by_candidate : null,
						positive_marks : 1,
						negative_marks : -0.25,
						status : "NOT_VISITED",
						actual_answer: 1
					},
					{
						id : 10,
						category : "TYPE A",
						question_text : "Question text goes here3",
						options: [
							{
								option_id : 1,
								text : "Option 1",
								selected : false
							},{
								option_id : 2,
								text : "Option 2",
								selected : false
							},{
								option_id : 3,
								text : "Option 3",
								selected : false
							},{
								option_id : 4,
								text : "Option 4",
								selected : false
							}
						],
						answer_given_by_candidate : null,
						positive_marks : 1,
						negative_marks : -0.25,
						status : "NOT_VISITED",
						actual_answer: 1
					},
					{
						id : 11,
						category : "TYPE A",
						question_text : "Question text goes here3",
						options: [
							{
								option_id : 1,
								text : "Option 1",
								selected : false
							},{
								option_id : 2,
								text : "Option 2",
								selected : false
							},{
								option_id : 3,
								text : "Option 3",
								selected : false
							},{
								option_id : 4,
								text : "Option 4",
								selected : false
							}
						],
						answer_given_by_candidate : null,
						positive_marks : 1,
						negative_marks : -0.25,
						status : "NOT_VISITED",
						actual_answer: 1
					},
					{
						id : 12,
						category : "TYPE A",
						question_text : "Question text goes here3",
						options: [
							{
								option_id : 1,
								text : "Option 1",
								selected : false
							},{
								option_id : 2,
								text : "Option 2",
								selected : false
							},{
								option_id : 3,
								text : "Option 3",
								selected : false
							},{
								option_id : 4,
								text : "Option 4",
								selected : false
							}
						],
						answer_given_by_candidate : null,
						positive_marks : 1,
						negative_marks : -0.25,
						status : "NOT_VISITED",
						actual_answer: 1
					},
					{
						id : 13,
						category : "TYPE A",
						question_text : "Question text goes here3",
						options: [
							{
								option_id : 1,
								text : "Option 1",
								selected : false
							},{
								option_id : 2,
								text : "Option 2",
								selected : false
							},{
								option_id : 3,
								text : "Option 3",
								selected : false
							},{
								option_id : 4,
								text : "Option 4",
								selected : false
							}
						],
						answer_given_by_candidate : null,
						positive_marks : 1,
						negative_marks : -0.25,
						status : "NOT_VISITED",
						actual_answer: 1
					},
					{
						id : 14,
						category : "TYPE A",
						question_text : "Question text goes here3",
						options: [
							{
								option_id : 1,
								text : "Option 1",
								selected : false
							},{
								option_id : 2,
								text : "Option 2",
								selected : false
							},{
								option_id : 3,
								text : "Option 3",
								selected : false
							},{
								option_id : 4,
								text : "Option 4",
								selected : false
							}
						],
						answer_given_by_candidate : null,
						positive_marks : 1,
						negative_marks : -0.25,
						status : "NOT_VISITED",
						actual_answer: 1
					},
					{
						id : 15,
						category : "TYPE A",
						question_text : "Question text goes here3",
						options: [
							{
								option_id : 1,
								text : "Option 1",
								selected : false
							},{
								option_id : 2,
								text : "Option 2",
								selected : false
							},{
								option_id : 3,
								text : "Option 3",
								selected : false
							},{
								option_id : 4,
								text : "Option 4",
								selected : false
							}
						],
						answer_given_by_candidate : null,
						positive_marks : 1,
						negative_marks : -0.25,
						status : "NOT_VISITED",
						actual_answer: 1
					},
					{
						id : 16,
						category : "TYPE A",
						question_text : "Question text goes here3",
						options: [
							{
								option_id : 1,
								text : "Option 1",
								selected : false
							},{
								option_id : 2,
								text : "Option 2",
								selected : false
							},{
								option_id : 3,
								text : "Option 3",
								selected : false
							},{
								option_id : 4,
								text : "Option 4",
								selected : false
							}
						],
						answer_given_by_candidate : null,
						positive_marks : 1,
						negative_marks : -0.25,
						status : "NOT_VISITED",
						actual_answer: 1
					},
					{
						id : 17,
						category : "TYPE A",
						question_text : "Question text goes here3",
						options: [
							{
								option_id : 1,
								text : "Option 1",
								selected : false
							},{
								option_id : 2,
								text : "Option 2",
								selected : false
							},{
								option_id : 3,
								text : "Option 3",
								selected : false
							},{
								option_id : 4,
								text : "Option 4",
								selected : false
							}
						],
						answer_given_by_candidate : null,
						positive_marks : 1,
						negative_marks : -0.25,
						status : "NOT_VISITED",
						actual_answer: 1
					}
				]
			};
			callback(questionSet);
		},
		_loadAudits : function(){
			var that = this;
			this.ajaxGET("UTKARSH-BACKEND-APP/v1/utkarsh/audits/",function(res){
				var oModel = new sap.ui.model.json.JSONModel();
				oModel.setData(res);
				that.getView().setModel(oModel, "audits");
			});
		}
		
	});

	return PageController;

});
