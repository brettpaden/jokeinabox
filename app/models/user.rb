class User < ActiveRecord::Base
  attr_accessible :name, :password

  validates :name,  :presence => true, :uniqueness => true
  validates :password, :presence => true
  
	has_many :votes, :dependent => :destroy
  has_many :jokes, :dependent => :destroy  
  has_many :events, :dependent => :destroy
end
