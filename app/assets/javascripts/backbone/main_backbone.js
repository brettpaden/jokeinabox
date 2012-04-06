// Current user
var SessionUser = null;

// Indicate we are running backbone
var UsingBackbone = true;

// Javascript templates
var Templates = {
  HeaderTPL: '/assets/header.html.jst',
  JokesTPL: '/assets/jokes.html.jst',
  JokesPanelTPL: '/assets/jokes_panel.html.jst',
  JokeTPL: '/assets/one_joke.html.jst',
  EventsTPL: '/assets/events.html.jst',
  EventTPL: '/assets/one_event.html.jst',
  LoginTPL: '/assets/login.html.jst',
};
var TemplatesArray = [];
for (var tpl in Templates) { TemplatesArray.push(tpl); }

// Fetch all templates in TemplatesArray, starting at n if provided, execute calllback when finished 
function fetch_templates(callback, n) {
  if (typeof(n) == 'undefined') {
    n = 0;
  }
  if (n < TemplatesArray.length) {
    $.get(Templates[TemplatesArray[n]], '', function(data){
      Templates[TemplatesArray[n]] = data;
      fetch_templates (callback, n+1);
    });
  } else {
    callback();
  }
}

// Router
var AppRouter = Backbone.Router.extend({
 
  routes:{
    "/":"",
    "top":"top",
    "mine":"mine",
    "recent":"recent",
  },

  what:'top', 
  jokes:null,
  events:null,
  votes:null,
  users:null,
  
  initialize:function () {
    this.jokes = new Jokes();
    this.events = new Events();
    this.votes = new Votes();
    this.users = new Users();
  },

  main:function() {
    $('#main').html(new MainView().render().el);
  },
  
  top:function() {
    $('#top_jokes_tab a').click();
  },
  
  mine:function() {
    $('#my_jokes_tab a').click();
  },
  
  recent:function() {
    $('#recent_jokes_tab a').click();
  },
  
  // Called in response to change of logged in user
  onUserChange:function() {
    // Re-render everything
    App.what = 'top';
    this.renderAll();
  },
  
  // Render jokes view per new 'what'
  onWhatChange:function(what) {
    App.what = what;
    
    // Sort and show/hide according to what
    if (what == 'mine' || what == 'My Jokes') {
      this.jokes.showMyJokes(SessionUser.id);
      this.jokes.sortByVotes();
      App.navigate('mine');
    } else if (what == 'recent' || what == 'Recent Jokes') {
      this.jokes.showAllJokes();
      this.jokes.sortByMostRecent();
      App.navigate('recent');
    } else {
      this.jokes.showAllJokes();
      this.jokes.sortByVotes();
      App.navigate('top');
    }
    
    // Re-render
    this.renderJokesPanel();
  },

  // Render header
  renderHeader:function() {
    $('#header_div').html(new HeaderView().render().el);
  },
  
  // Render everything
  renderAll:function() {
    // Fetch all displayed data
    $.getJSON('/data', {what: App.what}, function(data){

      // Populate our collections
      App.jokes.reset();
      App.jokes.add (data.jokes);
      App.votes.reset();
      App.votes.add (data.votes);
      App.users.reset();
      App.users.add (data.users);
      App.events.reset();
      App.events.add (data.events);
          
      // Establish current user
      if (data.user_id) {
        SessionUser = _.find(App.users.models, function(u){
          return u.id == data.user_id;
        });
      } else {
        SessionUser = null;
      }
      
      // Render header
      App.renderHeader ();
      
      // Connect joke objects to other objects
      App.connectJokes (App.jokes.models);
      
      // Render jokes
      App.renderJokes (true);
      
      // Connect event objects to other objects
      App.connectEvents (App.events.models);
      
      // Render events
      App.renderEvents ();

      // Initialize 
      onHeaderLoad ();
      onJokesLoad ();
      onEventsLoad ();
    });
  },
  
  // Connect a single joke to other objects
  connectJoke:function(j) {
    j.user = App.users.get(j.get('user_id'));
    if (SessionUser) {
      j.my_vote = _.find (App.votes.models, function(v){
        return v.get('joke_id') == j.id && v.get('user_id') == SessionUser.id;
      }) || null;
    } else {
      j.my_vote = null;
    }
  },
  
  // Connect jokes to other objects
  connectJokes:function(jokes) {
    _.each(jokes, function(j) {
      App.connectJoke(j);
    });
  },
    
  // Render a single joke
  renderJoke:function(joke, $cell) {
    if (typeof(joke) == 'string') {
      joke = this.jokes.getByCid(joke);
    }
    $cell.html(new JokeView().render(joke).el);
  },
  
  // Render jokes portion
  renderJokes:function(no_panel) {
    new JokesView().render(App.jokes, no_panel);
  },
  
  // Render jokes panel
  renderJokesPanel:function() {
    new JokesView().render_panel(App.jokes);
  },

  // Connect a single event to other objects
  connectEvent:function(e) {
    e.user = App.users.get(e.get('user_id'));
    e.joke = App.jokes.get(e.get('joke_id'));
  },
    
  // Connect events to other objects
  connectEvents:function(events) {
   // Connect to other objects and render individual events
    _.each(events, function(e) {
      App.connectEvent(e);
    });
  },
  
  // Render a single event
  renderEvent:function(event, $div) {
    if (typeof(event) == 'string') {
      event = this.events.getByCid(event);
    }
    $div.html(new EventView().render(event).el);
  },
  
  // Render events portion
  renderEvents:function() {
    new EventsView().render(App.events);
  },
  
  // Get the joke in the collection following the passed joke
  // Returns the cid of the next joke, or '+' if the joke is the last one, -1 if the joke isn't found at all
  getNextJoke:function(cid) {
    var len = this.jokes.models.length;
    var next_id = -1;
    for (var i = 0; i < len; i++) {
      var j = this.jokes.models[i];
      if (j.cid == cid) {
        if (i < len-1) {
          next_id = this.jokes.models[i+1].cid;
        } else {
          next_id = '+';
        }
        break;
      }
    }
    return next_id;
  },
  
  // On submission of joke
  onAddJoke:function(content) {
    // Add the joke, this adds at the server too
    var now = new Date(Date.now()).toJSON();
    var newJoke = this.jokes.create({user_id: SessionUser.id, content: content, when_submitted: now});
    // Search for the joke in the collection, we need to know the id of the 
    // joke to insert before, so we know how to display
    var insert_id = this.getNextJoke(newJoke.cid);
    // Add it to our display
    onNewJoke (newJoke, insert_id);
  },
  
  // On removal of joke
  onRemoveJoke:function(cid) {
    // Search for it and get its real id
    var joke = this.jokes.getByCid(cid);
    if (joke.id) {
      // Remove it, including server removal
      joke.destroy();
    } else {
      // This must be a newly added joke for which we haven't yet received an id from the server
      // Not much we can do here except remove it at the client end...
    }
    // Remove it from our display
    onRemoveJoke (joke);
    // Update events referring to this joke
    onEventDeleteJoke (joke.cid);
  },
  
  // On user vote
  onVote:function(cid, vote) {
    // Get the current joke that is next after this one
    var curr_next_id = this.getNextJoke(cid);
    // Search for the joke and get its real id
    var joke = this.jokes.getByCid(cid);
    // Find existing vote, if any
    var joke_id = joke.id;
    var user_id = SessionUser.id;
    var my_vote = _.find(App.votes.models, function(v) { return v.get('joke_id') == joke_id && v.get('user_id') == user_id; });
    // Update joke's vote count (this is done independently on the server), and resort
    joke.update_votes(my_vote ? my_vote.get('yesno') : null, vote);
    App.jokes.sort();
    // Get new "next" joke, this is the position we need to insert to in our display
    var new_next_id = this.getNextJoke(cid);
    if (joke_id) {
      // Perform the vote action
      if (my_vote != null && vote != null) {
        // Changing existing vote, change it, including server update
        my_vote.save({yesno: vote});
      } else if (my_vote == null && vote != null) {
        // Creating a new vote
        joke.my_vote = App.votes.create({joke_id: joke_id, user_id: SessionUser.id, yesno: vote});
      } else if (my_vote != null && vote == null) {
        // Withdrawing a vote
        my_vote.destroy();
        joke.my_vote = null;
      } else {
        // Shouldn't happen, withdrawing non-existing vote
      }
    } 
    // Update the joke in our display
    onChangeVote(joke, curr_next_id == new_next_id ? -1 : new_next_id);
  },
  
  // Respond to new event
  onJokeEvents:function(data) {
    // Add any new users
    _.each(data.users, function(u) {
      var user = App.users.get(u.id);
      if (!user) {
        App.users.add(u);
      } else {
        user.set(u);
      }
    });
    
    // Add any new votes
    _.each(data.votes, function(v) {
      var vote = App.votes.get(v.id);
      if (!vote) {
        // Maybe just submitted and not yet assigned an id by the server
        vote = _.find(App.votes.models, function(vv) {
          return vv.id == null && vv.get('joke_id') == v.joke_id;
        });
        if (!vote) {
          App.votes.add(v);
          vote = App.votes.get(v.id);
        }
      }
      vote.set(v);
    });
    
    // Add any new jokes
    _.each(data.jokes, function(j) {
      var joke = App.jokes.get(j.id);
      if (!joke) {
        // Maybe just submitted and not yet assigned an id by the server
        joke = _.find(App.jokes.models, function(jj) {
          return jj.id == null && jj.get('content') == j.content;
        });
        if (!joke) {
          App.jokes.add(j);
          joke = App.jokes.get(j.id);
        }
      }
      joke.set(j);
      App.connectJoke(joke);
    });
    
    // Add any new events
    _.each(data.events_plus_insert, function(e) {
      var event = App.events.get(e.event.id);
      if (!event) {
        App.events.add(e.event);
        event = App.events.get(e.event.id);
        App.connectEvent(event);
        // Insert in displayed events list
        insertEvent(event, e.insert_id);
        // Get associated joke
        var joke = null;
        if (e.event.joke_id) {
          joke = App.jokes.get(e.event.joke_id);
        }
        if (joke) {
          // Make sure the joke is connected to its vote
          App.connectJoke(joke);
          // Remove joke if this is a withdrawal
          if (e.event.withdraw) {
            vote = _.find(App.votes.models, function(v) {
              return v.get('user_id') == e.event.user_id && v.get('joke_id') == joke.id;
            });
            if (vote) {
              App.votes.remove(vote);
            }
            joke.my_vote = null;
          }
          // The insert_id is a real id, we need the cid (client id)
          var insert_id = e.insert_id;
          if (insert_id != '+' && insert_id >= 0) {
            var next_joke = App.jokes.get(insert_id);
            if (next_joke) {
              insert_id = next_joke.cid;
            }
          }
          // Handle joke event, unless this is my already-registered vote
          onJokeEvent(event, joke, insert_id);
          // Remove the joke if needed
          if (insert_id == -1) {
            App.jokes.remove(joke);
          }
        }
      }
    });
  },
});
var App;

// Main function for backbone rendering
function main_backbone() {

  // Instantiate application router and start history
  App = new AppRouter();
  Backbone.history.start();

  // Fetch all templates
  fetch_templates(function() {
  
    // Establish templates
    new HeaderView().set_tpl(Templates['HeaderTPL']);
    new JokesView().set_tpl(Templates['JokesTPL']).set_panel_tpl(Templates['JokesPanelTPL']);
    new JokeView().set_tpl(Templates['JokeTPL']);
    new EventsView().set_tpl(Templates['EventsTPL']);
    new EventView().set_tpl(Templates['EventTPL']);
    new LoginView().set_tpl(Templates['LoginTPL']);
    
    // Render
    App.renderAll ();
  });

  // Master popup seems to need to display once or it gives incorrect size
  // on first real display, not sure why...
  $('#master_popup').hide().text('x');
}