
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

// Poll server for recent events
function pollRecentEvents(oneTime) {
  // Get most recent event time
  var evtTime = $('.events .event_time').first();
  if (evtTime.length>0) {
    // Allow 60 second time diff between server and client
    evtTime = 'ts='+(Date.parse(evtTime.text())-60)/1000; 
  } else {
    evtTime = '';
  } 
  
  // What tab are we on?
  var what = whatTab();
  
  // Poll for events more recent
  $.getJSON('/events', evtTime+'&what='+what, processRecentEvents);
  
  // Repeat again
  if (!oneTime) {
    setTimeout(pollRecentEvents, 3000);
  }
}

// Respond to recent events from server
function processRecentEvents(data) {
  var $events = $('#events');
  for (var i in data) {
    var e = data[i];
    if ($events.find('#event_div'+e.event.id).length == 0) {
      // Insert this event in the event list
      $events.prepend('<div id="event_div'+e.event.id+'" class="event_div"></div>');
      var newElem = $events.find('.event_div').first();
      newElem.hide();
      newElem.load('/events/'+e.event.id+' #one_event', '', function(data, status) {
        newElem.slideDown(250);
      });
      // If this represents the deletion of a joke, replace its tooltip to indicate deletion
      if (e.event.joke_id && e.insert_id == -1) {
        $('[id$=_j'+e.event.joke_id+']').attr('data-tooltip', 'deleted');
      }
      // Update jokes list
      onJokeEvent(e.event, e.insert_id);   
    }
  }
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
  $this.data('timer', null);
  var timer = window.setTimeout(function() {
    var $mp_div = $('#master_popup');
    $mp_div.empty();
    var tt_text = $this.attr('data-tooltip');
    if (tt_text == 'deleted') {
      $mp_div.attr('class', 'pacifier_popup').text('This joke has been removed.');
      onJokePopup($mp_div, $this);
    } else {
      var $link=$this.find('a');
      var url = $link.attr('href');
      $mp_div.hide().attr('class', 'event_joke_tooltip').load(url+' .one_joke', '', function(data, status) {
        onJokePopup($mp_div, $this);
      });
    }
  }, 50);
  $this.data('timerid', timer);
}

// Handle mouseout on an event
function mouseOutEvent(e) {
  var $this = $(this);
  var mp_div = $('#master_popup');
  var timer = $this.data('timerid');
  if (timer != null) {
    window.clearTimeout(timer);
  }
  var triggerPos=$this.offset();
  if (e.pageX > triggerPos.left + $this.outerWidth()/2) {
    mp_div.fadeOut(50);
  }
}

// Click event for event-joke link
function onEventJoke() {
  var $this = $(this);
  
  // Clear popup timer
  var timer = $this.parent().data('timerid');
  if (timer != null) {
    window.clearTimeout(timer);
  }
  
  // Extract joke id and jump to it if possible
  var parts = $(this).parent().attr('id').split('_');
  var joke_id = parts[1].substr(1);
  jump_to_joke(joke_id);
  return false;
}

