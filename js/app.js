var App = Em.Application.create();

tweet = Ember.Object.extend({
	user: null,
	username: null,
	profileImageUrl: null,
	text: null,
});

App.searchController = Ember.Object.create({
	term1: "nest",
	term2: "thermostat",
	
	allTerms: function(){
		return this.get('term1') + '%20' + this.get('term2');
	}.property('term1', 'term2'),
});

App.searchController.addObserver("allTerms", function(){
	App.display.set("content", []);
	var url = "http://search.twitter.com/search.json?q=" + this.get('allTerms') + "&rpp=20&include_entities=true&result_type=mixed&callback=?";
	$.getJSON( url, function(data){
		$(data.results).each(function(){
			var curTweet = tweet.create();
			curTweet.user = this.from_user;
			curTweet.username = this.from_user_name;
			curTweet.profileImageUrl = this.profile_image_url;
			curTweet.text = this.text;
			App.display.pushObject(curTweet);
		});
	});
});

App.display = Ember.ArrayProxy.create({
	content: [],
});