class ApplicationController < ActionController::Base
  protect_from_forgery

  def initialize 
    super
    $log = Logger.new("/Users/cstryker/rails.log")
    $log.level = Logger::DEBUG
  end
  
  def authenticate
  end
end
