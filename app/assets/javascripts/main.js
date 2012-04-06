function main() {
  // Master popup seems to need to display once or it gives incorrect size
  // on first real display, not sure why...
  $('#master_popup').hide().text('x');
  
  // Load header 
  $('#header_div').load('/header #header_bar', '', function(){
    // Handle header javascript
    onHeaderLoad();
    
    // Load jokes
    $('#jokes_div').load('/jokes #jokes', '', function(){
      onJokesLoad();
    });
  });

  // Load events
  $('#events_div').load('/events #events', '', function(){
    onEventsLoad();    
  });
}

