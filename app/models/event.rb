class Event < ActiveRecord::Base
  attr_accessible :user_id, :joke_id, :yesno, :withdraw

  validates_associated :user, :joke
  
  belongs_to :user
  belongs_to :joke
  
  def self.events_by_ts(ts, count)
    if (ts)
      t = Time.at(ts.to_i)
      condition = "created_at > '#{t.gmtime}'"
    else 
      condition = ''
    end
    
    limit = if count then count.to_i else nil end
      
    # Get most recent events
    @events = Event.find(:all, :order => 'created_at DESC', :conditions => condition, :limit => limit)
  end
end
