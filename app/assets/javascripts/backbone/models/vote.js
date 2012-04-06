Vote = Backbone.Model.extend({
  urlRoot:"/votes",
  defaults:{
      "id":null,
      "joke_id":null,
      "user_id":null,
      "yesno":null,
  },
  initialize: function(){
  },
  
  vote_text: function(){
    return this.get('yesno') ? 'YES' : 'NO';
  },
});

var Votes = Backbone.Collection.extend({
  url: "/votes",
  model: Vote,
  
  intitalize: function(){
  },
});
    
