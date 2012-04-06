
// Event initialization
function onEventsLoad() {
  var screenH = $(window).outerHeight();
  
  // Size events div to screen
  $('#events_div').css({
    height: screenH
  });

  // Handle event tooltips and joke links  
  $('#events').on('mouseover', '.trigger', mouseOverEvent);
  $('#events').on('mouseout', '.trigger', mouseOutEvent);
  $('#events').on('click', '.trigger a', onEventJoke);
  
  // Begin polling server for recent events
  pollRecentEvents(); 
}

var lastTime = 0;

// Poll server for recent events
function pollRecentEvents(oneTime) {
  var evtTime = 'ts='+(lastTime-60);  // Allow for a one-minute "overlap"    
  
  // What tab are we on?
  var what = whatTab();
  
  // Poll for events more recent
  $.getJSON('/events', evtTime+'&what='+what+'&need_pos=1&need_jokes=1&need_users=1', processRecentEvents);

  // Set time
  lastTime = Date.now()/1000;
  
  // Repeat again
  if (!oneTime) {
    setTimeout(pollRecentEvents, 3000);
  }
}

// Insert event into displayed events list
function insertEvent(e, insert_id) {
  var $events = $('#events');

  // Insert this event in the event list
  $events.prepend('<div id="event_div'+e.id+'" class="event_div"></div>');
  var $newElem = $events.find('.event_div').first();
  $newElem.hide();
  if (UsingBackbone) {
    App.renderEvent(e, $newElem);
    $newElem.slideDown(250);
  } else {
    $newElem.load('/events/'+e.id+' #one_event', '', function(data, status) {
      $newElem.slideDown(250);
    });
  }
  // If this represents the deletion of a joke, replace its tooltip to indicate deletion
  if (e.joke_id && insert_id == -1) {
    // For backbone, need the cid
    if (UsingBackbone) {
      joke = App.jokes.get(e.joke_id);
      joke_id = joke.cid;
    } else {
      joke_id = e.joke_id;
    }
    onEventDeleteJoke(joke_id);
  }
}

// Respond to recent events from server
function processRecentEvents(data) {
  // Update for backbone
  if (UsingBackbone) {
    App.onJokeEvents(data);
  } else {
    var $events = $('#events');
    for (var i in data.events_plus_insert) {
      var e = data.events_plus_insert[i];
      if ($events.find('#event_div'+e.event.id).length == 0) {
        insertEvent(e.event, e.insert_id);
        // Update jokes list
        onJokeEvent(e.event, e.insert_id);   
      }
    }
  }
}

// Find all events referring to a particular deleted joke and mark as deleted
function onEventDeleteJoke(joke_id) {
  $('[id$=_j'+joke_id+']').attr('data-tooltip', 'deleted');
}

// Display joke popup
function onJokePopup($popup, $trigger) {
  var ttTop,
      ttLeft,
      triggerPos=$trigger.offset(),
      triggerH=$trigger.outerHeight(),
      triggerW=$trigger.outerWidth(),
      screenH=$(window).height(),
      scrollTop=$(document).scrollTop();
  var tipW=$popup.outerWidth(),
      tipH=$popup.outerHeight();
  ttLeft = triggerPos.left - tipW - 5;
  ttTop = triggerPos.top - tipH/2 - scrollTop;
  if (ttTop + tipH >= screenH) {
    ttTop = screenH - tipH;
  }
  if (ttTop < 0) {
    ttTop = 0;
  }
  if (ttLeft < 0) {
    ttLeft = 0;
  }
  $popup.css({
    left: ttLeft,
    top: ttTop,
    position: 'absolute'
  });
  doJokeEvents($popup);
  $popup.mouseleave(function(){
    $popup.fadeOut(50);
  });
  $popup.fadeIn(50);
}

// Handle mouseover on an event
function mouseOverEvent() {
  var $this=$(this);
  var $mp_div = $('#master_popup');
  $mp_div.data('timer', null);
  var timer = window.setTimeout(function() {
    $mp_div.empty();
    var tt_text = $this.attr('data-tooltip');
    if (tt_text == 'deleted') {
      $mp_div.attr('class', 'pacifier_popup').text('This joke has been removed.');
      onJokePopup($mp_div, $this);
    } else {
      var $link=$this.find('a');
      var url = $link.attr('href');
      $mp_div.hide().attr('class', 'event_joke_tooltip');
      if (UsingBackbone) {
        var cid = tt_text.substring(4);
        App.renderJoke(cid, $mp_div);
        onJokePopup($mp_div, $this);
      } else {
        $mp_div.load(url+' .one_joke', '', function(data, status) {
          onJokePopup($mp_div, $this);
        });
      }
    }
  }, 50);
  $mp_div.data('timerid', timer);
}

// Handle mouseout on an event
function mouseOutEvent(e) {
  var $this = $(this);
  var $mp_div = $('#master_popup');
  var timer = $mp_div.data('timerid');
  if (timer != null) {
    window.clearTimeout(timer);
  }
  var triggerPos=$this.offset();
  if (e.pageX > triggerPos.left + $this.outerWidth()/2) {
    $mp_div.fadeOut(50);
  }
}

// Click event for event-joke link
function onEventJoke() {
  var $this = $(this);
  
  // Clear popup timer
  var $mp_div = $('#master_popup');
  var timer = $mp_div.data('timerid');
  if (timer != null) {
    window.clearTimeout(timer);
  }
  
  // Extract joke id and jump to it if possible
  var parts = $(this).parent().attr('id').split('_');
  var joke_id = parts[1].substr(1);
  jump_to_joke(joke_id);
  return false;
}

