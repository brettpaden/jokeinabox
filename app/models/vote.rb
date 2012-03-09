class Vote < ActiveRecord::Base
  attr_accessible :joke_id, :yesno

  validates :joke_id, :presence => true
  validates :user_id, :presence => true
  validates_inclusion_of :yesno, :in => [true, false]
  validates_associated :joke
  validates_associated :user
	
  belongs_to :joke, :autosave => true
  belongs_to :user
end
