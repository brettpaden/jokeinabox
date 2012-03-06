class Joke < ActiveRecord::Base
  attr_accessible :content
  
  validates :content, :uniqueness => true, :length => { :minimum => 1 }
  validates :user_id,	:presence => true
  validates_associated :user
	
  belongs_to :user
  has_many :votes, :dependent => :destroy
	
  def my_joke?(curr_id)
	user_id == curr_id
  end
  
  def my_vote(curr_id)
	if v = votes.find { |v| v.user_id == curr_id && v.joke_id == id }
		v.yesno
	else
		nil
	end
  end
end
