class User < ActiveRecord::Base
  validates :name,  :presence => true, :uniqueness => true

	has_many :jokes
	has_many :votes
end
