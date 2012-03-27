
// Perform header initialization
function onHeaderLoad() {
  // Handle logout/login/join links
  $('#logout').on('click', onLogout);
  $('#login').on('click', onLoginPopup);
  $('#join').on('click', onJoinPopup);
}
