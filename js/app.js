var App = Em.Application.create();

tweet = Ember.Object.extend({
	user: null,
	username: null,
	profileImageUrl: null,
	text: null,
});

App.tweetController = Ember.ArrayProxy.create({
    content: []
});

var url = "http://search.twitter.com/search.json?q=nest%20thermostat&rpp=20&include_entities=true&result_type=mixed&callback=?";
$.getJSON( url, function(data){
	$(data.results).each(function(){
		var curTweet = tweet.create();
		curTweet.user = this.from_user;
		curTweet.username = this.from_user_name;
		curTweet.profileImageUrl = this.profile_image_url;
		curTweet.text = this.text;
		App.tweetController.pushObject(curTweet);
	});
});