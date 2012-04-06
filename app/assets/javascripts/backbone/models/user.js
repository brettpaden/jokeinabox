User = Backbone.Model.extend({
  urlRoot:"/users",
  defaults:{
      "id":null,
      "name":"",
      "password":"",
  },
  initialize: function(){
  },
});

var Users = Backbone.Collection.extend({
  url: "/users",
  model: User,
  
  intitalize: function(){
  },
});
    
