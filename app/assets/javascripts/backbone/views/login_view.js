// Login view
var LoginView = Backbone.View.extend({
 
  set_tpl:function(tpl_data) {
    LoginView.template_data = tpl_data;
    return this;
  },
  
  initialize:function () {
  },

  render:function (is_login) {
    $(this.el).html(_.template(LoginView.template_data, 
      { 
        button_text: is_login ? 'Login!' : 'Join Up!',
        need_confirm: !is_login,
      }
    ));
    return this;
  },

  events:{
  },
});

