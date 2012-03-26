// Poll server for recent events
function pollRecentEvents(oneTime) {
  var $eventsFrame = window.top.$('#events_frame');
  
  // Get most recent event time
  var evtTime = $eventsFrame.contents().find('.events').find('.event_time').first();
  if (evtTime) {
    evtTime = evtTime.text();
  } else {
    evtTime = '1/1/69 12:00';
  } 
  evtTime = (Date.parse(evtTime)-60)/1000; // Allow 60 second time diff between server and client
  
  // What tab are we on?
  what = whatTab();
  
  // Poll for events more recent
  $.getJSON('/events', 'ts='+evtTime+'&what='+what, processRecentEvents);
  
  // Repeat again
  if (!oneTime) {
    setTimeout(pollRecentEvents, 3000);
  }
}

// Respond to recent events from server
function processRecentEvents(data) {
  var $eventsFrame = window.top.$('#events_frame');

  for (var i in data) {
    var e = data[i];
    var events = $eventsFrame.contents().find('.events');
    if (events.find('#event_div'+e.event.id).length == 0) {
      // Insert this event in the event list
      events.prepend('<div id="event_div'+e.event.id+'" class="event_div"></div>');
      var newElem = events.find('.event_div').first();
      newElem.hide();
      newElem.load('/events/'+e.event.id+' #one_event', '', function(data, status) {
        newElem.find('.event_joke_tooltip').hide();
        newElem.find('.trigger').hover(mouseOverEvent, mouseOutEvent);
        newElem.find('.trigger a').click(onEventJoke);
        newElem.slideDown(250);
      });
      // Update jokes list
      onJokeEvent(e.event, e.insert_id);   
    }
  }
}

// Handle mouseover on an event
function mouseOverEvent() {
  $this=$(this);
  $this.data('timer', null);
  var timer = window.setTimeout(function() {
    var $mp_div = window.top.$('#master_popup'),
        $events_frame = window.top.$('#events_frame');
    $mp_div.empty();
    $tip=$($this.attr('data-tooltip'));
    $link=$this.find('a');
    var url = $link.attr('href');
    $tip.load(url+' .one_joke', '', function(data, status) {
      var ttTop,
          ttLeft,
          eventsPos=$events_frame.offset(),
          triggerPos=$this.offset(),
          triggerH=$this.outerHeight(),
          triggerW=$this.outerWidth(),
          screenH=$(window).height(),
          scrollTop=$(document).scrollTop();
      var $new_tip = $mp_div.prepend($tip.html());
      $new_tip.attr('class', 'event_joke_tooltip');
      var tipW=$new_tip.outerWidth(),
          tipH=$new_tip.outerHeight();
      ttLeft = eventsPos.left + triggerPos.left - tipW - 5;
      ttTop = eventsPos.top + triggerPos.top - tipH/2 - scrollTop;
      if (ttTop + tipH >= screenH) {
        ttTop = screenH - tipH;
      }
      if (ttTop < 0) {
        ttTop = 0;
      }
      if (ttLeft < 0) {
        ttLeft = 0;
      }
      $new_tip.css({
        left: ttLeft,
        top: ttTop,
        position: 'absolute'
      });
      $mp_div.mouseleave(function(){
        var $mp_div = window.top.$('#master_popup');
        $mp_div.fadeOut(50);
      });
      $mp_div.fadeIn(50);
      // Handle vote buttons
      $mp_div.find('.vote_button').click(onVote);
      // Handle remove links
      $mp_div.find('#remove_joke').click(onRemove);
    });
  }, 50);
  $this.data('timerid', timer);
}

// Handle mouseout on an event
function mouseOutEvent(e) {
  var $this = $(this);
  var mp_div = window.top.$('#master_popup');
  var timer = $this.data('timerid');
  if (timer != null) {
    window.clearTimeout(timer);
  }
  var triggerPos=$this.offset();
  if (e.pageX > triggerPos.left + $this.outerWidth()/2) {
    mp_div.fadeOut(50);
  }
}

// Jump to joke in open table panel
function jump_to_joke(joke_id) {
  var $jokes_frame = window.top.$('#header_and_jokes_frame').contents().find('#jokes_frame');
  var id = 'edit_joke_' + joke_id;
  var $pc = $jokes_frame.contents().find('.panelContainer');
  var $joke_forms = $pc.find('#'+id);
  if ($joke_forms.length != 0) {
    var $mp_div = window.top.$('#master_popup');
    $mp_div.fadeOut(50);
    var $joke_div = $joke_forms.first().closest('.one_joke');
    var pos = $joke_div.offset();
    var jokeH = $joke_div.outerHeight();
    var scrollTop = $jokes_frame.contents().scrollTop();
    var frameOffset = $jokes_frame.offset().top;
    var windowH = window.innerHeight;
    var windowSpace = scrollTop + frameOffset + windowH;
    if ((pos.top < scrollTop) || (pos.top + jokeH > windowSpace)) {
      $jokes_frame.contents().find('html, body').animate({
        scrollTop: pos.top 
      }, 500);
    }
    $joke_forms.first().find('.joke').first().focus();
  }
}

// Click event for event-joke link
function onEventJoke() {
  var $this = $(this);
  
  // Extract joke id and jump to it if possible
  var parts = $(this).parent().attr('id').split('_');
  var joke_id = parts[1].substr(1);
  jump_to_joke(joke_id);
  return false;
}

