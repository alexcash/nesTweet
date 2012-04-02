/*!
 * nesTweet app.js
 * @author Alex Cash
 * @version 1.0
 */


/**
 * @constant App
 * @constructor the ember js global object
 */
var App = Em.Application.create();

//Model

/** A tweet object constructor
*@constructor 
*@property {string} user the screen name of the user i.e. 'Alex Cash' 
*@property {string} username the user name of the user i.e. 'alexcash'
*@property {string} profileImageUrl
*@property {string} text the content of the tweet
*@property {string} id the tweet id number
*@property {string} time the tweet's timestamp
*/
tweet = Ember.Object.extend({
	user: null,
	username: null,
	profileImageUrl: null,
	text: null,
	id: null,
	time: null,
	
	/**
	 *@function timeAbbr emberjs computed property
	 *Takes the time from this.get(time) as returned by the Twitter API, and 
	 *@returns {string} a human readable time. 'day mon yr - hh:mmpm'
	 */
	timeAbbr:function(){	
		var date = new Date(Date.parse(this.get('time'))).toLocaleString().substr(0, 16);
		var hour = date.substr(-5, 2);
		var ampm = hour<12 ? ' AM' : ' PM';
		if (hour>12) hour-= 12;
		if (hour==0) hour = 12;
		return date.substr(0, 11)+' - ' + hour + date.substr(13) + ampm;
	}.property('time'),
	
	/**
	 *@function ctext emberjs computed property
	 *Takes the text from this.get(text) as returned by the Twitter API, and
	 *@returns {string} the text with links as HTML
	 */
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
	
	/**
	 *@function retweet emberjs computed property
	 *@returns {string} URL to retweet web intent fo this tweet
	 */
	retweet:function(){
		return 'https://twitter.com/intent/retweet?tweet_id=' + this.get('id');
	}.property('id'),
	
	/**
	 *@function favorite emberjs computed property
	 *@returns {string} URL to favorite web intent for this tweet
	 */
	favorite:function(){
		return 'https://twitter.com/intent/favorite?tweet_id=' + this.get('id');
	}.property('id'),
	
	/**
	 *@function reply emberjs computed property
	 *@returns {string} URL to reply web intent for this tweet
	 */
	reply:function(){
		return 'https://twitter.com/intent/tweet?in_reply_to=' + this.get('id');
	}.property('id')
	
});

/**
 * @constructor
 * The ArrayProxy object that stores what is currently on the screen
 */
App.display = Ember.ArrayProxy.create({
	content: [],
});


//View

/**
 * @constructor
 * Custom text field for first search term
 */
App.term1View = Ember.TextField.extend(Ember.TargetActionSupport,{
	valueBinding: 'App.searchController.term1',
	
	insertNewline: function(){
		this.triggerAction();
	}
});

/**
 * @constructor
 * Custom text field for second search term
 */
App.term2View = Ember.TextField.extend(Ember.TargetActionSupport,{
	valueBinding: 'App.searchController.term2',
	
	insertNewline: function(){
		this.triggerAction();
	}
});

/**
 * @constructor
 * Custom text field for search by terms page rate
 */
App.rppView = Ember.TextField.extend(Ember.TargetActionSupport,{
	valueBinding: 'App.searchController.rpp',
	
	insertNewline: function(){
		this.triggerAction();
	}
});

/**
 * @constructor
 * Custom text field for user to search for
 */
App.userView = Ember.TextField.extend(Ember.TargetActionSupport,{
	valueBinding: 'App.searchController.user',
	
	insertNewline: function(){
		this.triggerAction();
	}
});

/**
 * @constructor
 * Custom text field for search by user page rate
 */
App.countView = Ember.TextField.extend(Ember.TargetActionSupport,{
	valueBinding: 'App.searchController.count',
	
	insertNewline: function(){
		this.triggerAction();
	}
});

//Controller

/**
 * @constructor searchController
 * @property {number} rpp the rate per page for term search
 * @property {string} term1 the first search term
 * @property {string} term2 the second search term
 * @property {string} user the username to search for
 * @property {number} count the number of tweets per page for user search
 * This controller stores the current search terms, and performs searches
 */
App.searchController = Ember.Object.create({
	rpp: 20,
	term1: 'learning',
	term2: 'thermostat',
	user: '@nest',
	count: 20,
	
	/**
	 * @function allTerms emberjs computed property
	 * @returns space escaped oncatenated string
	 */
	allTerms: function(){
		return this.get('term1') + '%20' + this.get('term2');
	}.property('term1', 'term2'),
	
	
	/**
	 * @function search searchs twitter api with AllTerms and pushes tweets to the arrayproxy
	 */
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
				curTweet.set('time', this.created_at);
				App.display.pushObject(curTweet);
			});
		});
	},
	
	/**
	 * @function search searchs twitter api with username and pushes tweets to the arrayproxy
	 */
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
				curTweet.set('time', this.created_at);
				App.display.pushObject(curTweet);
			});
		});
	}
});


// Call for initial search
App.searchController.search();


//Twitter anywhere javascript tool

twttr.anywhere(function (T) {

	
	// The bold 'title' style user names use the full name, so they have to have hovercards added manually
	//I could not find a (within the twitter Anywhere tool) way to linkify these
	 
	T("#user").hovercards({
		username: function(node) {
			return node.title;
		}
	});
	
	
	 //Linkifies and attaches hover cards to all standard formated usernames
	 
	T.hovercards();
	
	
	// Adds login button fo this app
	 
	T("#login").connectButton({
	  authComplete: function(user) {
		$("#login").hide();
	  },
	  signOut: function() {
		$("#login").show();
	  }
	});

});
