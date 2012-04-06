var Joke = Backbone.Model.extend({
  urlRoot:"/jokes",
  defaults:{
      "id":null,
      "content":"",
      "user_id":null,
      "yes_votes":0,
      "no_votes":0,
      "total_votes":0,
      "when_submitted":null,
  },
  
  initialize: function(){
  },
  
  // Return whether this joke belongs to the passed user id
  my_joke: function(user_id) {
	  return this.get('user_id') == user_id;
  },

  // Update joke's vote count based on change of vote
  update_votes: function(old_vote, new_vote) {
    var yes_votes = this.get('yes_votes');
    var no_votes = this.get('no_votes');
    var total_votes = this.get('total_votes');
    if (old_vote == true) { 
      yes_votes--; 
      total_votes--; 
    } else if (old_vote == false) {
      no_votes--;
      total_votes++;
    } 
    if (new_vote == true) {
      yes_votes++;
      total_votes++;
    } else if (new_vote == false) {
      no_votes++;
      total_votes--;
    }
    this.set({yes_votes: yes_votes, no_votes: no_votes, total_votes: total_votes});
  },
});

var Jokes = Backbone.Collection.extend({
  url: "/jokes",
  model: Joke,
  
  intitalize: function(){
  },
  
  // Set for showing only jokes that do not belong to passed user
  showMyJokes: function(user_id) {
    _.each (this.models, function(j) {
      j.hide = j.get('user_id') != user_id;
    });
  },

  // Set for showing all jokes
  showAllJokes: function() {
    _.each (this.models, function(j) {
      j.hide = false;
    });
  },

  // Sort jokes by vote count
  sortByVotes: function() {
    this.comparator = function(j) {
      return -j.get('total_votes')-((Date.parse(j.get('when_submitted')))/(0xffffffff*1.0));
    };
    this.sort();
  },
  
  // Sort jokes by most recent
  sortByMostRecent: function() {
    this.comparator = function(j) {
      return -(Date.parse(j.get('when_submitted')))-(j.get('total_votes')/(0xffffffff*1.0));
    };
    this.sort();
  },
  
  // Fetch jokes displayed according to 'what'
  index: function(what, callback) {
    this.fetch({
      url: this.url+'?what='+what,
      success: callback
    });
  },
});
    
