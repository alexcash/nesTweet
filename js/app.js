var App = Em.Application.create();

tweet = Ember.Object.extend({
	user: null,
	username: null,
	profileImageUrl: null,
	text: null,
	id: null,
	replied: false,
	retweeted: false,
	favorited: false,
	ctext:function(){
		if (this.text) {
			var curtext = this.get('text').replace(
				/((https?\:\/\/)|(www\.))(\S+)(\w{2,4})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi,
				function(url){
					var full_url = url;
					if (!full_url.match('^https?:\/\/')) {
						full_url = 'http://' + full_url;
					}
					return '<a href="' + full_url + '">' + url + '</a>';
				}
			);
		}
		return curtext;
	}.property('text'),
	
	retweet:function(){
		this.set('retweeted', true);
		return 'https://twitter.com/intent/retweet?tweet_id=' + this.get('id');
	}.property('id')
});

App.searchController = Ember.Object.create({
	term1: null,
	term2: null,
	
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
			curTweet.set('user', this.from_user);
			curTweet.set('username', this.from_user_name);
			curTweet.set('profileImageUrl', this.profile_image_url);
			curTweet.set('text', this.text);
			curTweet.set('id', this.id_str);
			App.display.pushObject(curTweet);
		});
	});
});

App.display = Ember.ArrayProxy.create({
	content: [],
});

App.searchController.set("term1", "nest");
App.searchController.set("term2", "thermostat");

twttr.anywhere(function (T) {
	T("#user").hovercards({
		username: function(node) {
			return node.title;
		}
	});
	T.hovercards();
	T("#tbox").tweetBox();
});