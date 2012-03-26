class Event < ActiveRecord::Base
  attr_accessible :user_id, :joke_id, :yesno, :withdraw

  validates_associated :user, :joke
  
  belongs_to :user
  belongs_to :joke
end
