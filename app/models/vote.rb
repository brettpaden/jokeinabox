class Vote < ActiveRecord::Base
  attr_accessible :joke_id, :yesno

  validates :joke_id, :presence => true
  validates :user_id, :presence => true
  validates_inclusion_of :yesno, :in => [true, false]
  validates_associated :joke, :user
	
  belongs_to :joke, :autosave => true
  belongs_to :user

  def vote_text
    yesno ? 'Yes' : 'No'
  end

  def self.votes_by_user(uid)
    find(:all, :conditions => "user_id = #{uid}")
  end
end
