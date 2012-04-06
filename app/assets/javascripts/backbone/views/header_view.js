// Header view
var HeaderView = Backbone.View.extend({
 
  set_tpl:function(tpl_data) {
    HeaderView.template_data = tpl_data;
    return this;
  },
  
  initialize:function () {
  },

  render:function () {
    $(this.el).html(_.template(HeaderView.template_data, { session_user: SessionUser}));
    return this;
  },

  events:{
  },
});

