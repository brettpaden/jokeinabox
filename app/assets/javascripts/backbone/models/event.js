var Event = Backbone.Model.extend({
  urlRoot:"/events",
  defaults:{
      "id":null,
      "user_id":null,
      "joke_id":null,
      "yesno":null,
      "withdraw":false,
  },
  
  initialize: function(){
  },
});

var Events = Backbone.Collection.extend({
  url: "/events",
  model: Event,
  
  intitalize: function(){
  },
  
  index: function(callback) {
    this.fetch({
      success: callback
    });
  },
  
});
