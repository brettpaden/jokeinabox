class Joke < ActiveRecord::Base
  attr_accessible :content
  
  validates :content, :uniqueness => true, :length => { :minimum => 1 }
  validates :user_id,	:presence => true
  validates_associated :user
	
  belongs_to :user
  has_many :votes, :dependent => :destroy
	
  def my_joke?(current_user_id)
	user_id == current_user_id
  end
  
  def my_vote(current_user_id)
     votes.find { |v| v.user_id == current_user_id && v.joke_id == id }
  end
end
