
// Handle joke tab 
function onTab() {
  var $this = $(this);
  var $jokes_frame = window.top.$('#header_and_jokes_frame').contents().find('#jokes_frame');
  var $pc = $jokes_frame.contents().find('.panelContainer');
  var $tp = $jokes_frame.contents().find('.tabbedPanels');
  $pc.hide().attr('visibility', false);
  $tp.find('.tabs a.active').removeClass('active');
  $this.addClass('active').blur();
  var url = $this.attr('href');
  $pc.load(url+' .panel', '', function(data, status) {
    $pc.fadeIn(50);

    // Bind any events for controls within the panel here...
    // Handle vote buttons
    $pc.find('.vote_button').click(onVote);
    // Handle remove links
    $pc.find('#remove_joke').click(onRemove);
  });
  
  return false;
}

// Determine which tab is active
function whatTab() {
  var $this = $(this);
  var $jokes_frame = window.top.$('#header_and_jokes_frame').contents().find('#jokes_frame');
  var $tp = $jokes_frame.contents().find('.tabbedPanels');
  return $tp.find('.tabs a.active').text();  
}

// Display or hide new joke field, depending on whether user is logged in
function displayHideNewJoke(id) {
  var $jokes_frame = window.top.$('#header_and_jokes_frame').contents().find('#jokes_frame');
  var $new_joke = $jokes_frame.contents().find('#new_joke_div');
  var $login_to_tell = $jokes_frame.contents().find('#login_to_tell_div');
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
  var $jokes_frame = window.top.$('#header_and_jokes_frame').contents().find('#jokes_frame');
  var $pc = $jokes_frame.contents().find('.panelContainer');
  var $tp = $jokes_frame.contents().find('.tabbedPanels');
  var $my_jokes = $tp.find('#my_jokes_tab');
  var $top_jokes = $tp.find('#top_jokes_tab');
  if (id == null) {
    // Make sure 'My Jokes' is hidden
    $my_jokes.hide();
    // If it's active, we need to active 'Top Jokes' instead
    if ($my_jokes.find('a.active').length > 0) {
      $tp.find('a.active').removeClass('active');
      $top_jokes.find('a').addClass('active');
    }
  } else {
    // Make sure 'My Jokes' is visible
    $my_jokes.show();
  }
}

// Re-display elements of jokes iframe when user has changed or logged out
function onUserChange(id) {
  // Reload header
  var $hdr_jokes = window.top.$('#header_and_jokes_frame');
  var $hdr = $hdr_jokes.contents().find('#header_frame');
  var $jokes = $hdr_jokes.contents().find('#jokes_frame');
  $hdr.attr('src', $hdr.attr('src'));

  // Dispay/hide new joke field
  displayHideNewJoke(id);
  
  // Change whether 'My Jokes' tab is available, based on whether we are logged in
  displayHideMyJokes(id);
  
  // Reload active jokes tab  
  var $active_tab = $jokes.contents().find('.tabbedPanels').find('.tabs a.active').first();
  $active_tab.click(onTab);  // I don't understand why I have to add this, it should already be there!!!
  $active_tab.click();
}

// Perform logout
function onLogout() {
  // Send logout request to server
  $.post('/users/logout', '', function(data){
    onUserChange(null);
  }, 'JSON');
  return false;
}

// Do popup dialog
function doAjaxPopup($this, url, style_class, submit_fn) {
  var $mp_div = top.window.$('#master_popup');
  $mp_div.empty();
  $mp_div.load(url, '', function(){
    var dlgLeft,
        dlgTop,
        linkPos = $this.offset(),
        linkW = $this.outerWidth(),
        linkH = $this.outerHeight(),
        dlgW = $mp_div.outerWidth(),
        dlgH = $mp_div.outerHeight();
    dlgLeft = linkPos.left + linkW - dlgW;
    if (dlgLeft < 0) {
      dlgLeft = 0;
    }
    dlgTop = linkPos.top + linkH + 1;
    if (dlgTop < 0) {
      dlgTop = 0;
    }
    $mp_div.find('.new_user').submit(submit_fn);
    $mp_div.attr('class', style_class).css({
      left: dlgLeft,
      top: dlgTop,
      position: 'absolute'
      }).mouseleave(function(){
        $(this).fadeOut(100);
    }).fadeIn(250);
    $mp_div.find('.user_field').first().focus();
  });
  return $mp_div;
}

// Display login popup
function onLoginPopup() {
  doAjaxPopup($(this), '/users/login .indented', 'login_popup', onLogin);
  return false;
}

// Handle login error
function loginError(msg) {
  var html = 'You must be joking!<br/>'+msg+'<br/>Try again, joker.'
  var $mp_div = top.window.$('#master_popup');
  if ($mp_div.find('.login_error').length == 0) {
    $mp_div.prepend('<div class="login_error"></div>');
    $mp_div.find('.login_error').hide().html(html).slideDown(250);
  } else {
    $mp_div.find('.login_error').fadeOut(100).html(html).fadeIn(100).fadeTo(100,0.4).fadeTo(200,1);
  }
}

// Process login error
function processLoginError(data, name) {
  if (data['name']) {
    loginError('Name(\''+name+'\') '+data['name'][0]);
  } else if (data['password']) {
    loginError('Password '+data['password'][0]);
  } else {
    loginError('A server error occurred.');
  }
}

// Handle login
function onLogin() {
  var $this = $(this);

  // Send login request to server
  var name = $this.find('#user_name').attr('value');
  var data = { user: {
      name: name,
      password: $this.find('#user_password').attr('value')
  }}; 
  $.post('/users/do_login', data, function(data){
    var user_id = parseInt(data);
    if (user_id > 0) {
      onUserChange(user_id);
    } else {
      processLoginError(data, name);
    }
  }, 'JSON').error(function(){
    processLoginError(null, '');
  });
  return false;
}

// Display join popup
function onJoinPopup() {
  doAjaxPopup($(this), '/users/new .indented', 'login_popup', onJoin);
  return false;
}

// Handle join
function onJoin() {
  var $this = $(this);
  
  // Send login request to server
  var name = $this.find('#user_name').attr('value');
  var data = { confirm: $this.find('#confirm').attr('value'),
    user: {
      name: name,
      password: $this.find('#user_password').attr('value')
    }
  };   
  $.post('/users', data, function(data){
    var user_id = parseInt(data);
    if (user_id > 0) {
      onUserChange(user_id);
    } else {
      processLoginError(data, name);
    }
  }, 'JSON').error(function(){
    processLoginError(null, name);
  });
  return false;
}

// Handle a joke event by updating jokes list
function onJokeEvent(event, insert_id) {
  var $jokes_frame = window.top.$('#header_and_jokes_frame').contents().find('#jokes_frame');
  var $pc = $jokes_frame.contents().find('.panelContainer');
 
  // Find id of the joke, and the joke to insert before
  if (insert_id != '+' && insert_id >= 0) {
    var $prev_joke_form = $pc.find('#edit_joke_'+insert_id);
  }
  if (event.joke_id) {
    var $cur_joke_form = $pc.find('#edit_joke_'+event.joke_id);
  }

  var remove = false;
  var add = false;  
  if (event.yesno != null || event.withdraw) {
    // User voted on a joke, or withdrew a vote
    // Possibly move the joke to a new order
    remove = true;
    add = true;
  } else if (!event.user_id) {
    // User added a joke
    // Add to jokes list
    add = true;
  } else {
    // User removed a joke
    // Remove it from jokes list
    remove = true;
  }
  
  var $mp_div = window.top.$('#master_popup');
  if (remove && !add) {
    // Remove joke from the list
    if ($cur_joke_form && $cur_joke_form.length > 0) {
      var $cell = $cur_joke_form.closest('.joke_cell'); 
      $cell.slideUp(500, function(){
        $cell.remove();
        $mp_div.fadeOut(250);
      });
    } else {
      $mp_div.fadeOut(250);
    }
  } else if (add) {
    // Make sure it hasn't already been inserted
    if (remove || !$cur_joke_form || $cur_joke_form.length == 0) {
      var insert_str = '<div class="joke_cell"></div>';
      if (insert_id == '+') {
        // Append
        $pc.find('.panel').append(insert_str);
        var $new_div = $pc.find('.joke_cell').last();
      } else if (insert_id >= 0) {
        // Insert
        var $prev_div = $prev_joke_form.closest('.joke_cell');
        $prev_div.before(insert_str);
        var $new_div = $prev_div.prev();
      } else {
        $mp_div.fadeOut(250);
      }
      if (remove) {
        if ($cur_joke_form.length > 0) {
          var $joke_cell = $cur_joke_form.closest('.joke_cell');
          $joke_cell.slideUp(250, function() {
            // If user voted on this joke, update the popup
            var userSubmitted = false;
            var $voted_joke_div = $jokes_frame.contents().find('#voted_joke_id');
            if ($voted_joke_div.text() == event.joke_id) {
              userSubmitted = true;
              $voted_joke_div.remove();
              var $mp_div = window.top.$('#master_popup');
              $mp_div.text('Re-ranking...');
            } 
            $joke_cell.remove();
            $new_div.hide().load('/jokes/'+event.joke_id+' #one_joke', '', function(){
              $new_div.slideDown(500, function(){
                // Handle vote buttons
                $new_div.find('.vote_button').click(onVote);
                // Handle remove links
                $new_div.find('#remove_joke').click(onRemove);
                // If user voted on this joke, jump to it
                if (userSubmitted) {
                  // Remove submitting popup
                  var $mp_div = window.top.$('#master_popup');
                  $mp_div.fadeOut(250, function(){
                    // Jump to it
                    jump_to_joke(event.joke_id);
                  });
                }
              });
            });
          });
        } else {
          $mp_div.fadeOut(250);
        }
      } else {
        if (insert_id != -1) {
          $new_div.hide().load('/jokes/'+event.joke_id+' #one_joke', '', function(){
            $new_div.slideDown(500, function(){
               // Handle vote buttons
               $new_div.find('.vote_button').click(onVote);
               // Handle remove links
               $new_div.find('#remove_joke').click(onRemove);
              // If user just submitted this joke, jump to it
              var $new_joke_content_div = $jokes_frame.contents().find('#new_joke_content');
              var new_content = $new_div.find('#joke_content').attr('value');
              if ($new_joke_content_div.text() == new_content) {
                jump_to_joke(event.joke_id);
                $new_joke_content_div.remove();
                $jokes_frame.contents().find('.new_joke_field').removeClass('please_wait').removeAttr('readonly').inputHints(); 
              }
            });
          });
        } else {
          $mp_div.fadeOut(250);
        }
      }
    }
  }
}

// Do a popup for vote submission
function doVotingPopup($button, withdraw) {
  var $jokes_frame = window.top.$('#header_and_jokes_frame').contents().find('#jokes_frame');
  var $mp_div = window.top.$('#master_popup');
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
    var jokes_pos = $jokes_frame.offset();
    var scrollTop = $jokes_frame.contents().scrollTop();
    popupLeft = jokes_pos.left + button_pos.left + buttonW + 5;
    popupTop = jokes_pos.top + button_pos.top - scrollTop;
  }
  $mp_div.empty().addClass('submit_popup');
  if (withdraw) {
    $mp_div.text('Withdrawing your vote, please wait...');
  } else {
    $mp_div.text('Submitting your vote, please wait...').addClass('submit_popup');
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
  var $mp_div = window.top.$('#master_popup');
  $mp_div.empty().addClass('submit_popup');
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
  var $jokes_frame = window.top.$('#header_and_jokes_frame').contents().find('#jokes_frame');
  var url = $this.attr('href');
  var $joke_input = $('#joke_content');
  var content = $joke_input.attr('value');
  $joke_input.addClass('please_wait').attr('value', 'Submitting, please wait...').attr('readonly', 'readonly');
  $('#jokes').prepend('<div id="new_joke_content" style="display:none">'+content+'</div>');
  $.post(url, { joke: { content: content }}, function(){
    // Get recent events, this should precipitate the appropriate screen update
    pollRecentEvents(true);
  });
  return false;
}

// Handle votes
function onVote() {
  var $jokes_frame = window.top.$('#header_and_jokes_frame').contents().find('#jokes_frame');
  var $this = $(this);
  var text = $this.attr('value');
  var vote = (text=='Vote Yes') ? true : ((text=='Vote No') ? false : null);
  var joke_id = $this.parent().find('#vote_joke_id').attr('value');
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
  $jokes_frame.contents().find('#jokes').prepend('<div id="voted_joke_id" style="display:none">'+joke_id+'</div>');
  doVotingPopup($this, vote==null);
  $.ajax({
    type: method,
    url: url,
    data: data,
    success: function(){
      // Get recent events, this should precipitate the appropriate screen update
      pollRecentEvents(true);
    }
  });
  return false;
}

// Handle joke removal confirmation popup
function onRemove() {
  var $jokes_frame = window.top.$('#header_and_jokes_frame').contents().find('#jokes_frame');
  var $this=$(this);
  var $mp_div = window.top.$('#master_popup');
  var $link=$this.find('a');
  var dlgLeft, dlgTop;
  var linkPos = $link.offset(),
      linkW = $link.outerWidth(),
      dlgW = $mp_div.outerWidth(),
      dlgH = $mp_div.outerHeight(),
      screenH=$(window).height();
  var master_popup = $link.closest('#master_popup').length > 0;
  $mp_div.empty();
  $delete_confirm = $jokes_frame.contents().find('#delete_confirm_popup');
  $mp_div.html($delete_confirm.html());
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
    jokes_pos = $jokes_frame.offset(),
    scrollTop=$jokes_frame.contents().scrollTop();      
    dlgLeft = jokes_pos.left + linkPos.left + linkW + 5;
    dlgTop = jokes_pos.top + linkPos.top - scrollTop;
    if (dlgTop + dlgH > screenH - jokes_pos.top) {
      dlgTop = screenH - jokes_pos.top - dlgH;
    }
  }
  $mp_div.data('url', $link.attr('href'));
  $mp_div.attr('class', 'delete_confirm_popup').css({
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
  var $mp_div = window.top.$('#master_popup');
  var url = $mp_div.data('url');
  var left = $mp_div.data('left');
  var top = $mp_div.data('top');
  $mp_div.fadeOut(250);
  doRemovePopup(left, top);
  $.ajax({
    type: 'DELETE',
    url: url,
    success: function(){
      // Get recent events, this should precipitate the appropriate screen update
      pollRecentEvents(true);
    }
  });
}

