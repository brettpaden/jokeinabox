
// Perform jokes initialization
function onJokesLoad() {

  var headerH = $('#header_div').outerHeight(),
      screenH = $(window).outerHeight();

  // Give us a hidden control to manually poll for recent events
  $('#jokes_div').prepend("<a id='poll' href='' style='display:none'>POLL</a>");
  $('#poll').on('click', function() {
    pollRecentEvents();
    return false;
  });

  // Size jokes div to available space on screen
  $('#jokes_div').css({
    top: headerH+1,
    height: screenH - headerH
  });
  
  // Set new joke input to display hint text
  $('.new_joke_field').inputHints(); 
  
  // Handle tab panels
  $('.tabs a').on('click', onTab);
  $('.tabs li:first a').click();
  
  // Handle joke buttons
  $('#new_joke').on('submit', onSubmitJoke);
  
  // Handle vote and remove links
  $pc = $('.panelContainer');
  $pc.on('click', '.vote_button', onVote);
  $pc.on('click', '.remove_joke a', onRemove);
}

// Handle joke tab 
function onTab(e) {
  var $this = $(this);
  var $pc = $('.panelContainer');
  var $tp = $('.tabbedPanels');
  $pc.hide().attr('visibility', false);
  $tp.find('.tabs a.active').removeClass('active');
  $this.attr('class', 'active').blur();
  if (UsingBackbone) {
    App.onWhatChange (whatTab());
    $pc.fadeIn(50);
  } else {
    var url = $this.attr('href');
    $pc.load(url+' .panel', '', function(data, status) {
      $pc.fadeIn(50);
    });
  }
  return false;
}

// Determine which tab is active
function whatTab() {
  var $this = $(this);
  var $tp = $('.tabbedPanels');
  return $tp.find('.tabs a.active').text();  
}

// Jump to joke in open table panel
function jump_to_joke(joke_id) {
  var $mp_div = $('#master_popup');
  var id = 'edit_joke_' + joke_id;
  var $pc = $('.panelContainer');
  var $joke_forms = $pc.find('#'+id);
  if ($joke_forms.length != 0) {
    var $joke_cell = $joke_forms.first().closest('.joke_cell'),
        windowH = $(window).outerHeight(),
        headerH = $('#header_div').outerHeight(),
        pos = $joke_cell.offset().top,
        jokeH = $joke_cell.outerHeight(),
        scrollTop = $('#jokes_div').scrollTop();
    var newScrollTop = scrollTop;
    if (pos<headerH) {
      newScrollTop -= headerH - pos;
    } else if (pos + jokeH > windowH) {
      newScrollTop += pos + jokeH - windowH;
    }
    if (newScrollTop != scrollTop) {
      $('#jokes_div').animate({
        scrollTop: newScrollTop
      }, 500, function(){
        // Clear popup timer
        var timer = $mp_div.data('timerid');
        if (timer != null) {
          window.clearTimeout(timer);
        }
      });
    }
  }
  // Fade out tool tip
  $mp_div.fadeOut(50);
  // Set focus
  $joke_forms.first().find('.joke').first().focus();
}

function doJokeEvents($obj) {
  // Handle vote buttons and 'remove' links
  $obj.find('.vote_button').on('click', onVote);
  $obj.find('.remove_joke a').on('click', onRemove);
}

// Display or hide new joke field, depending on whether user is logged in
function displayHideNewJoke(id) {
  var $new_joke = $('#new_joke_div');
  var $login_to_tell = $('#login_to_tell_div');
  if (id == null) {
    // Hide new joke, show login message
    $new_joke.hide();
    $login_to_tell.show();
  } else {
    // Show new joke, hide login message
    $new_joke.show();
    $login_to_tell.hide();
  }
}
  
// Display or hide 'My Jokes' tab, depending on whether user is logged in
function displayHideMyJokes(id) {
  var $pc = $('.panelContainer');
  var $tp = $('.tabbedPanels');
  var $my_jokes = $tp.find('#my_jokes_tab');
  var $top_jokes = $tp.find('#top_jokes_tab');
  if (id == null) {
    // Make sure 'My Jokes' is hidden
    $my_jokes.hide();
    // If it's active, we need to active 'Top Jokes' instead
    if ($my_jokes.find('a.active').length > 0) {
      $tp.find('a.active').removeClass('active');
      $top_jokes.find('a').attr('class', 'active');
    }
  } else {
    // Make sure 'My Jokes' is visible
    $my_jokes.show();
  }
}

// Handle display of newly added joke
function displayNewJoke() {
  var $mp_div = $('#master_popup');
  var $new_div = $('.newly_added_joke');
  var id = $new_div.attr('id').substring(10);
  $new_div.slideDown(500, function(){
    // If user just submitted this joke, jump to it and restore from 'submitting'
    var $new_joke_content_div = $('#new_joke_content');
    var new_content = $new_div.find('#joke_content').attr('value');
    if ($new_joke_content_div.text() == new_content) {
      jump_to_joke(id);
      $new_joke_content_div.remove();
      $('.new_joke_field').removeClass('submitting').removeAttr('readonly').inputHints(); 
      $mp_div.fadeOut(250);
      $new_div.removeClass('newly_added_joke');
    }
  });
}

// Handle addition of new joke, insert before the joke corresponding to the given id
function onNewJoke(joke, insert_id) {
  var $pc = $('.panelContainer');
  var joke_id = UsingBackbone ? joke.cid : joke.id;
  var content = UsingBackbone ? joke.get('content') : joke.content;

  // Find id of the joke, and the joke to insert before
  if (insert_id != '+') {
    var $prev_joke_form = $pc.find('#edit_joke_'+insert_id);
  }
  var $cur_joke_form = $pc.find('#edit_joke_'+joke_id);
  var fadeOutPacifier = true;
  var $mp_div = $('#master_popup');
  // If user just submitted this joke, we just got a response from the server before the new joke
  // could finish displaying
  var new_content = null;
  var $new_div = $('.newly_added_joke');
  if ($new_div.length > 0) {
    new_content = $new_div.find('#joke_content').attr('value');
  }
  // Insert into list, make sure it hasn't already been inserted
  if (!$cur_joke_form || $cur_joke_form.length == 0 || (new_content && content != new_content)) {
    var insert_str = '<div class="joke_cell" id="joke_cell_'+joke_id+'"></div>';
    if (insert_id == '+') {
      // Append
      $pc.find('.panel').append(insert_str);
      var $new_div = $pc.find('.joke_cell').last();
    } else {
      // Insert
      var $prev_div = $prev_joke_form.closest('.joke_cell');
      $prev_div.before(insert_str);
      var $new_div = $prev_div.prev();
    }
    // Load 
    fadeOutPacifier = false;
    $new_div.hide().addClass('newly_added_joke');
    if (UsingBackbone) {
      App.renderJoke(joke, $new_div);
      displayNewJoke();
    } else {
      $new_div.load('/jokes/'+joke_id+' #one_joke', '', displayNewJoke);
    }
  } else {
    // Already have this joke, but maybe we just need to re-render?
    if (UsingBackbone) {
      changeJoke(joke);
    }
  }
  
  // Fade out pacifier if needed
  if (fadeOutPacifier && $mp_div.attr('class') == 'pacifier_popup') {
    $mp_div.fadeOut(250);
  }
}

// Handle removal of a joke
function onRemoveJoke(joke) {
  var $pc = $('.panelContainer');
  var joke_id = UsingBackbone ? joke.cid : joke.id;
  var $cur_joke_form = $pc.find('#edit_joke_'+joke_id);
  var fadeOutPacifier = true;
  var $mp_div = $('#master_popup');

  // Remove joke from the list
  if ($cur_joke_form && $cur_joke_form.length > 0) {
    var $cell = $cur_joke_form.closest('.joke_cell');
    fadeOutPacifier = false; 
    $cell.slideUp(500, function(){
      $cell.remove();
      $mp_div.fadeOut(250);
    });
  } 

  // Fade out pacifier if needed
  if (fadeOutPacifier && $mp_div.attr('class') == 'pacifier_popup') {
    $mp_div.fadeOut(250);
  }
}

// Handle change of joke, without changing position
function changeJoke(joke) {
  var $pc = $('.panelContainer');
  var joke_id = UsingBackbone ? joke.cid : joke.id;
  var $cur_joke_form = $pc.find('#edit_joke_'+joke_id);
  var fadeOutPacifier = true;
  var $mp_div = $('#master_popup');

  // Make sure it is displayed
  if ($cur_joke_form && $cur_joke_form.length > 0) {
    var $cell = $cur_joke_form.closest('.joke_cell');
    // Do a quick fadeOut and fadeIn
    fadeOutPacifier = false;
    $cell.fadeTo(10, 0.5, function(){
      if (UsingBackbone) {
        App.renderJoke(joke, $cell);
        $cell.fadeTo(10, 1, function(){
          $mp_div.fadeOut(250);
        });
      } else {
        $cell.load('/jokes/'+joke_id+' #one_joke', '', function(){ 
          $cell.fadeTo(10, 1, function(){
            $mp_div.fadeOut(250);
          });
        });
      }
    });
  }
  // Fade out pacifier if needed
  if (fadeOutPacifier && $mp_div.attr('class') == 'pacifier_popup') {
    $mp_div.fadeOut(250);
  }
}

// Handle change of vote for a joke
function onChangeVote(joke, insert_id) {
  if (whatTab() != 'Top Jokes' || insert_id == -1) {
    // Not changing position, just update the joke in place
    changeJoke(joke);
  } else {
    
    moveJoke(joke, insert_id);
  }
}

// Display newly moved joke
function displayMovedJoke() {
  var $mp_div = $('#master_popup');
  var $new_div = $('.newly_moved_joke');
  $new_div.removeClass('newly_moved_joke');
  var joke_id = $new_div.attr('id').substring(10);
  $new_div.slideDown(500, function(){
    // If user voted on this joke, jump to it
    var $voted_joke_div = $('#voted_joke_id');
    if ($voted_joke_div.text() == joke_id) {
      $voted_joke_div.remove();
      // Remove submitting popup, then jump to the new joke
      $mp_div.fadeOut(250, function(){
        // Jump to it
        jump_to_joke(joke_id);
      });
    }
  });
}

// Get id of next displayed joke
function getNextJokeId($cur_joke_form) {
  $next_joke_cell = $cur_joke_form.closest('.joke_cell').next();
  if ($next_joke_cell.length > 0) {
    id = $next_joke_cell.find('.edit_joke').attr('id');
    return id.substring(10);
  } else {
    return '+';
  }
}

// Handle change of joke, including change of position
function moveJoke(joke, insert_id) {
  var $pc = $('.panelContainer');
  var joke_id = UsingBackbone ? joke.cid : joke.id;
  if (insert_id != '+') {
    var $prev_joke_form = $pc.find('#edit_joke_'+insert_id);
  }
  var $cur_joke_form = $pc.find('#edit_joke_'+joke_id);
  var fadeOutPacifier = true;
  var $mp_div = $('#master_popup');

  // Make sure we don't really want to just do a change
  if ($cur_joke_form.length > 0 && getNextJokeId($cur_joke_form) == insert_id) {
    changeJoke(joke);
    return;
  }
      
  // Insert into list
  var insert_str = '<div class="joke_cell" id="joke_cell_'+joke_id+'"></div>';
  if (insert_id == '+') {
    // Append
    $pc.find('.panel').append(insert_str);
    var $new_div = $pc.find('.joke_cell').last();
  } else {
    // Insert
    var $prev_div = $prev_joke_form.closest('.joke_cell');
    $prev_div.before(insert_str);
    var $new_div = $prev_div.prev();
  }
  // Remove from list, make sure it exists in list
  if ($cur_joke_form && $cur_joke_form.length > 0) {
    var $joke_cell = $cur_joke_form.closest('.joke_cell');
    fadeOutPacifier = false;
    $joke_cell.slideUp(250, function() {
      // If user voted on this joke, update the popup
      var $voted_joke_div = $('#voted_joke_id');
      if ($voted_joke_div.text() == joke_id) {
        $mp_div.text('Re-ranking...');
      } 
      $joke_cell.remove();
      // Show joke in new position
      $new_div.hide().addClass('newly_moved_joke');
      if (UsingBackbone) {
        App.renderJoke(joke, $new_div);
        displayMovedJoke();
      } else {
        $new_div.hide().load('/jokes/'+joke_id+' #one_joke', '', displayMovedJoke);
      }
    });
  }
  // Fade out pacifier if needed
  if (fadeOutPacifier && $mp_div.attr('class') == 'pacifier_popup') {
    $mp_div.fadeOut(250);
  }
}

// Handle a joke event by updating jokes list
function onJokeEvent(event, joke, insert_id) {
  var joke_id = event.joke_id || event.get('joke_id');
  var user_id = event.user_id || event.get('user_id');
  var yesno = event.yesno || event.get('yesno');
  var withdraw = event.withdraw || event.get('withdraw');
  if (joke_id && !user_id) {
    onNewJoke(joke, insert_id);
  } else if (yesno != null || withdraw) {
    onChangeVote(joke, insert_id);
  } else if (joke_id) {
    onRemoveJoke(joke);
  }
}

// Do a popup for vote submission
function doVotingPopup($button, withdraw) {
  var $mp_div = $('#master_popup');
  var button_pos = $button.offset();
  var buttonW = $button.outerWidth();
  var popupLeft,
      popupTop;
  if ($button.closest('#master_popup').length > 0) {
    // Means button pressed from event popup, since the popup floats above all frames,
    // we can just use the raw position of the button
    popupLeft = button_pos.left + buttonW + 5;
    popupTop = button_pos.top;
  } else {
    var scrollTop = $(document).scrollTop();
    popupLeft = button_pos.left + buttonW + 5;
    popupTop = button_pos.top - scrollTop;
  }
  $mp_div.empty().attr('class', 'pacifier_popup');
  if (withdraw) {
    $mp_div.text('Withdrawing your vote, please wait...');
  } else {
    $mp_div.text('Submitting your vote, please wait...');
  }
  $mp_div.unbind('mouseleave');
  $mp_div.css({
    left: popupLeft,
    top: popupTop,
    position: 'absolute'
  });
  $mp_div.hide().fadeIn(100);
}

// Do a popup for joke deletion
function doRemovePopup(left, top) {
  var $mp_div =$('#master_popup');
  $mp_div.empty().attr('class', 'pacifier_popup');
  $mp_div.text('Deleting, please wait...');
  $mp_div.css({
    left: left,
    top: top,
    position: 'absolute'
  });
  $mp_div.unbind('mouseleave');
  $mp_div.hide().fadeIn(100);
}

// Handle joke submission
function onSubmitJoke() {
  var $this = $(this);
  var url = $this.attr('action');
  var $joke_input = $('#joke_content');
  var content = $joke_input.attr('value');
  $joke_input.addClass('submitting').attr('value', 'Submitting, please wait...').attr('readonly', 'readonly');
  $('#jokes').prepend('<div id="new_joke_content" style="display:none">'+content+'</div>');
  if (UsingBackbone) {
    App.onAddJoke (content);
    // Get recent events, this should precipitate the appropriate screen update
    pollRecentEvents(true);
  } else {
    $.post(url, { joke: { content: content }}, function(){
      // Get recent events, this should precipitate the appropriate screen update
      pollRecentEvents(true);
    });
  }
  return false;
}

// Handle votes
function onVote() {
  var $this = $(this);
  var text = $this.attr('value');
  var vote = (text=='Vote Yes') ? true : ((text=='Vote No') ? false : null);
  var joke_id = $this.parent().find('#vote_joke_id').attr('value');
  $('#jokes').prepend('<div id="voted_joke_id" style="display:none">'+joke_id+'</div>');
  doVotingPopup($this, vote==null);
  if (UsingBackbone) {
    App.onVote(joke_id, vote);
    // Get recent events, this should precipitate the appropriate screen update
    pollRecentEvents(true);
  } else {
    var $parent_joke = $this.closest('.one_joke');
    var method = 'PUT';
    var $parent = $this.closest('.edit_vote');
    if ($parent.length == 0) {
      $parent = $this.closest('.new_vote');
      method = 'POST';
    }
    if (text == 'Withdraw') {
      method = 'DELETE';
      data = '';
    } else {
      data = { vote: { yesno: vote, joke_id: joke_id }};
    }  
    var url = $parent.attr('action');
    $.ajax({
      type: method,
      url: url,
      data: data,
      success: function(){
        // Get recent events, this should precipitate the appropriate screen update
        pollRecentEvents(true);
      }
    });
  }
  return false;
}

// Handle joke removal confirmation popup
function onRemove() {
  var $this=$(this);
  var $mp_div = $('#master_popup');
  var dlgLeft, dlgTop;
  var linkPos = $this.offset(),
      linkW = $this.innerWidth(),
      dlgW = $mp_div.outerWidth(),
      dlgH = $mp_div.outerHeight(),
      screenH=$(window).height();
  var master_popup = $this.closest('#master_popup').length > 0;
  $mp_div.empty();
  $delete_confirm = $('#delete_confirm_popup');
  $mp_div.hide().html($delete_confirm.html());
  if (master_popup) {
    // Means button pressed from event popup, since the popup floats above all frames,
    // we can just use the raw position of the button
    dlgLeft = linkPos.left + linkW + 5;
    dlgTop = linkPos.top;
    if (dlgTop + dlgH > screenH) {
      dlgTop = screenH - dlgH;
    } else if (dlgTop < 0) {
      dlgTop = 0;
    }
  } else {
    scrollTop=$(document).scrollTop();      
    dlgLeft = linkPos.left + linkW + 5;
    dlgTop = linkPos.top - scrollTop;
    if (dlgTop + dlgH > screenH) {
      dlgTop = screenH - dlgH;
    }
  }
  $mp_div.data('url', $this.attr('href'));
  $td = $this.closest('.remove_joke');
  $mp_div.data('joke_id', $td.attr('id').substring(12));
  $mp_div.attr('class', 'pacifier_popup').css({
    left: dlgLeft,
    top: dlgTop,
    position: 'absolute'
  });
  $mp_div.find('#remove_yes').click(onYesRemove);
  $mp_div.find('#remove_no').click(function(){
    $mp_div.fadeOut(250);
  });
  $mp_div.mouseleave(function(){
    $mp_div.fadeOut(250);
  });
  $mp_div.hide().fadeIn(100);
  $mp_div.data('left', dlgLeft);
  $mp_div.data('top', dlgTop);
  return false;
}

// Handle joke removal
function onYesRemove() {
  var $mp_div = $('#master_popup');
  var url = $mp_div.data('url');
  var left = $mp_div.data('left');
  var top = $mp_div.data('top');
  var joke_id = $mp_div.data('joke_id');
  $mp_div.fadeOut(250);
  doRemovePopup(left, top);
  if (UsingBackbone) {
    App.onRemoveJoke(joke_id);
    // Get recent events, this should precipitate the appropriate screen update
    pollRecentEvents(true);
  } else {
    $.ajax({
      type: 'DELETE',
      url: url,
      success: function(){
        // Get recent events, this should precipitate the appropriate screen update
        pollRecentEvents(true);
      }
    });
  }
}

