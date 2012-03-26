class Events < ActiveRecord::Base
  belongs_to :user
  belongs_to :joke
end
