var App = Em.Application.create();

tweet = Ember.Object.extend({
	user: null,
	username: null,
	profileImageUrl: null,
	text: null,
	id: null,
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
		return 'https://twitter.com/intent/retweet?tweet_id=' + this.get('id');
	}.property('id'),
	
	favorite:function(){
		return 'https://twitter.com/intent/favorite?tweet_id=' + this.get('id');
	}.property('id'),
	
	reply:function(){
		return 'https://twitter.com/intent/tweet?in_reply_to=' + this.get('id');
	}.property('id')
	
});

App.searchController = Ember.Object.create({
	rpp: 20,
	term1: 'learning',
	term2: 'thermostat',
	user: '@nest',
	count: 20,
	
	search: function(){
		App.display.set("content", []);
		var url = "http://search.twitter.com/search.json?q=" + this.get('allTerms') + "&rpp=" + this.get('rpp') + "&result_type=recent&callback=?";
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
	},
	
	searchByUser: function(){
		App.display.set("content", []);
		var url = "https://api.twitter.com/1/statuses/user_timeline.json?screen_name=" + this.get('user') + "&include_rts=true&count="+  this.get('count') + "&callback=?";
		$.getJSON( url, function(data){
			$(data).each(function(){
				var curTweet = tweet.create();
				curTweet.set('user', this.user.name);
				curTweet.set('username', this.user.screen_name);
				curTweet.set('profileImageUrl', this.user.profile_image_url);
				curTweet.set('text', this.text);
				curTweet.set('id', this.user.id_str);
				App.display.pushObject(curTweet);
			});
		});
	},
	
	
	allTerms: function(){
		return this.get('term1') + '%20' + this.get('term2');
	}.property('term1', 'term2')
});



App.term1View = Ember.TextField.extend(Ember.TargetActionSupport,{
	valueBinding: 'App.searchController.term1',
	
	insertNewline: function(){
		this.triggerAction();
	}
});

App.term2View = Ember.TextField.extend(Ember.TargetActionSupport,{
	valueBinding: 'App.searchController.term2',
	
	insertNewline: function(){
		this.triggerAction();
	}
});

App.rppView = Ember.TextField.extend(Ember.TargetActionSupport,{
	valueBinding: 'App.searchController.rpp',
	
	insertNewline: function(){
		this.triggerAction();
	}
});

App.userView = Ember.TextField.extend(Ember.TargetActionSupport,{
	valueBinding: 'App.searchController.user',
	
	insertNewline: function(){
		this.triggerAction();
	}
});

App.countView = Ember.TextField.extend(Ember.TargetActionSupport,{
	valueBinding: 'App.searchController.count',
	
	insertNewline: function(){
		this.triggerAction();
	}
});

App.display = Ember.ArrayProxy.create({
	content: [],
});

App.searchController.search();


twttr.anywhere(function (T) {
	T("#user").hovercards({
		username: function(node) {
			return node.title;
		}
	});
	
	T.hovercards();
	
	T("#login").connectButton({
	  authComplete: function(user) {
		$("#login").hide();
	  },
	  signOut: function() {
		$("#login").show();
	  }
	});

});
