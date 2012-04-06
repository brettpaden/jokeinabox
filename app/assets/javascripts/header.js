
// Perform header initialization
function onHeaderLoad() {
  // Handle logout/login/join links
  $('#logout').on('click', onLogout);
  $('#login').on('click', onLoginPopup);
  $('#join').on('click', onJoinPopup);
}

// Perform display changes after user change
function displayUserChange(user_id) {
  // Dispay/hide new joke field
  displayHideNewJoke(user_id);
  
  // Change whether 'My Jokes' tab is available, based on whether we are logged in
  displayHideMyJokes(user_id);
  
  // Reload active jokes tab  
  var $active_tab = $('.tabbedPanels').find('.tabs a.active').first();
  $active_tab.click();
  
  // Initialize header
  onHeaderLoad();
}

// Perform changes based on user change or logout
function onUserChange(user) {
  // Remove popup
  $('#master_popup').fadeOut(250);

  if (UsingBackbone) {
    // Notify router
    App.onUserChange();
  } else {
    // Reload header
    $('#header_div').load('/header #header_bar', '', function(){
      displayUserChange(user ? user.id : null);
    });
  }
}

// Perform logout
function onLogout() {
  // Send logout request to server
  $.post('/users/logout', '', function(data){
    onUserChange(null);
  }, 'JSON');
  return false;
}

// Display (already rendered) login popup dialog
function  displayLoginPopup ($mp_div, submit_fn) {
  var $link = $('#header_login');
  var dlgLeft,
      dlgTop,
      linkPos = $link.offset(),
      linkW = $link.outerWidth(),
      linkH = $link.outerHeight(),
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
  $mp_div.attr('class', 'login_popup').css({
    left: dlgLeft,
    top: dlgTop,
    position: 'absolute'
    }).mouseleave(function(){
      $mp_div.fadeOut(100);
  }).fadeIn(250);
  $mp_div.find('.user_field').first().focus();
}

// Do login popup dialog
function doLoginPopup(url, submit_fn, is_login) {
  var $mp_div = $('#master_popup');
  $mp_div.empty();
  if (UsingBackbone) {
    $mp_div.html(new LoginView().render(is_login).el);
    displayLoginPopup ($mp_div, submit_fn);
  } else {
    $mp_div.load(url, '', function(){
      displayLoginPopup ($mp_div, submit_fn);
    });
  }
}

// Display login popup
function onLoginPopup() {
  doLoginPopup('/users/login .indented', onLogin, true);
  return false;
}

// Display join popup
function onJoinPopup() {
  doLoginPopup('/users/new .indented', onJoin, false);
  return false;
}

// Handle login error
function loginError(msg) {
  var html = 'You must be joking!<br/>'+msg+'<br/>Try again, joker.'
  var $mp_div = $('#master_popup');
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
  // Send login request to server
  var name = $('#user_name').attr('value');
  var data = { user: {
      name: name,
      password: $('#user_password').attr('value')
  }}; 
  $.post('/users/do_login', data, function(data){
    if (typeof(data['id']) != 'undefined') {
      onUserChange(data);
    } else {
      processLoginError(data, name);
    }
  }, 'JSON').error(function(){
    processLoginError(null, '');
  });
  return false;
}

// Handle join
function onJoin() {
  var name = $('#user_name').attr('value');
  var pwd = $('#user_password').attr('value');
  var confirm = $('#confirm').attr('value');

  // Make sure password matches confirm, before we even send to the server
  if (pwd != confirm) {
    loginError('Your password doesn\'t match your confirmation.');
  } else {
    // Send login request to server
    var data = { confirm: confirm,
      user: {
        name: name,
        password: pwd,
      }
    };   
    $.post('/users', data, function(data){
      if (typeof(data['id']) != 'undefined') {
        onUserChange(data);
      } else {
        processLoginError(data, name);
      }
    }, 'JSON').error(function(){
      processLoginError(null, name);
    });
  }
  return false;
}

