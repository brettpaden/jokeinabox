// Joke view
var JokeView = Backbone.View.extend({
 
  set_tpl:function(tpl_data) {
    JokeView.template_data = tpl_data;
    return this;
  },
  
  initialize:function () {
  },

  render:function (joke, $el) {
    $(this.el).html(_.template(JokeView.template_data, { joke: joke, session_user: SessionUser}));
    return this;
  },

  events:{
  },
});

// Jokes view
var JokesView = Backbone.View.extend({

  set_tpl:function(tpl_data) {
    JokesView.template_data = tpl_data;
    return this;
  },
  set_panel_tpl:function(tpl_data) {
    JokesView.panel_template_data = tpl_data;
    return this;
  },
  initialize:function () {
  },

  // Render jokes panel
  render_panel:function (jokes) {
    $('#jokes_panel').html(_.template(JokesView.panel_template_data, { jokes: jokes, session_user: SessionUser}));
    _.each(jokes.models, function(j) {
      var $cell = $('#joke_cell_'+j.cid);
      $cell.html(new JokeView().render(j).el);
      if (typeof(j.hide) != 'undefined' && j.hide) {
        $cell.hide();
      } else {
        $cell.show();
      }
    });
    return this;
  },
  
  // Render jokes div
  render:function (jokes, no_panel) {
    $('#jokes_div').html(_.template(JokesView.template_data, { jokes: jokes, session_user: SessionUser}));
    if (!no_panel) {
      this.render_panel(jokes);
    } 
    return this;
  },

  events:{
  },
});

