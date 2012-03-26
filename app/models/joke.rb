class Joke < ActiveRecord::Base
  attr_accessible :content
  
  validates :content, :uniqueness => true, :length => { :minimum => 1 }
  validates :user_id,	:presence => true
  validates_associated :user
	
  belongs_to :user
  has_many :votes, :dependent => :destroy
	has_many :events, :dependent => :destroy
  
  def my_joke?(current_user_id)
	  user_id == current_user_id
  end
  
  def my_vote(current_user_id)
     votes.find { |v| v.user_id == current_user_id && v.joke_id == id }
  end

  def self.jokes_by_what(what, uid)
    conditions = ''
    order = 'total_votes DESC, when_submitted DESC'
    if what == 'recent' || what == 'Recent Jokes' then order = 'when_submitted DESC, total_votes DESC' end
    if what == 'mine' || what == 'My Jokes' then conditions = "user_id = #{uid}" end
    find(:all, :order => order, :conditions => conditions)
  end
end
