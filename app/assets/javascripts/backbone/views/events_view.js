// Event view
var EventView = Backbone.View.extend({
 
  set_tpl:function(tpl_data) {
    EventView.template_data = tpl_data;
    return this;
  },
  
  initialize:function () {
  },

  render:function (event) {
    $(this.el).html(_.template(EventView.template_data, { event: event, session_user: SessionUser}));
    return this;
  },

  events:{
  },
});

// Events view
var EventsView = Backbone.View.extend({

  set_tpl:function(tpl_data) {
    EventsView.template_data = tpl_data;
    return this;
  },
  
  initialize:function () {
  },

  render:function (events) {
    $('#events_div').html(_.template(EventsView.template_data, { events: events, session_user: SessionUser}));
    _.each(events.models, function(e) {
      $('#event_div'+e.get('id')).html(new EventView().render(e).el);
    });
    return this;
  },

  events:{
  },
});

