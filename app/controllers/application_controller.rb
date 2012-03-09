class ApplicationController < ActionController::Base
  protect_from_forgery

  def authenticate
#   ['jeff', 'jim', 'pez'].each do |u|
#     uu = User.new
#     uu.name = u
#     uu.save or throw "unable to save user #{u}"
#   end
    session[:user] = User.all[2]
  end
end
