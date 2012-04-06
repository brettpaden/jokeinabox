class EventsController < ApplicationController
  before_filter :authenticate

  # GET /events	
  # GET /events.json
  def index    
    # Get 50 most recent events, or events since timestamp provided in params
    @events = Event.events_by_ts(params[:ts], 50)

    # Get other items of interest...
    if params[:need_pos] || params[:need_jokes] || params[:need_users]
      info = {:events_plus_insert => [], :jokes => [], :events => [], :users => [], :votes => []}
      if params[:need_pos]
       cur_jokes = Joke.jokes_by_what(params[:what], session[:user] ? session[:user].id : nil)
      end
      @events.each do |e|
        if params[:need_pos]
          # For each event concerning a joke, get the id of the following joke, 
          # according to the passed sort method
          insert_id = -1
          if e.joke && e.joke.id
            ndx = cur_jokes.find_index{|j| j.id == e.joke.id}
            if ndx
              if ndx < cur_jokes.length-1
                insert_id = cur_jokes[ndx+1].id
              else
                insert_id = '+'
              end
            end
          end
          info[:events_plus_insert] << { :insert_id => insert_id, :event => e }
        end
                    
        # Collect joke for each event
        if params[:need_jokes] && e.joke_id
          joke = info[:jokes].find {|j| j.id == e.joke_id} 
          if !joke 
            joke = Joke.find(e.joke_id) unless !Joke.exists?(e.joke_id)
            info[:jokes] << joke if joke
          end
          # Also collect my vote for this joke
          if joke && e.yesno != nil && e.user_id && session[:user] && e.user_id == session[:user].id
            vote = joke.my_vote(session[:user].id);
            info[:votes] << vote if vote
          end
        end
        
        # Collect user for each event
        if params[:need_users] && e.user_id
          user = info[:users].find {|u| u.id == e.user_id}
          if !user
            info[:users] << User.find(e.user_id) unless !User.exists?(e.user_id) 
          end
        end
      end
    end
    
    respond_to do |format|
      format.html # index.html.erb
      if params[:need_pos] || params[:need_jokes] || params[:need_users]
        format.json { render json: info }
      else 
        format.json { render json: @events }
      end
    end
  end

  # GET /events/1
  # GET /events/1.json
  def show
    @event = Event.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @event }
    end
  end

  # GET /events/new
  # GET /events/new.json
  def new
    @event = Event.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @event }
    end
  end

  # GET /events/1/edit
  def edit
    @event = event.find(params[:id])
  end

  # POST /events
  # POST /events.json
  def create
    @event = Event.new(params[:event])
    @event.timewhen = Time.now
    respond_to do |format|
      if @event.save
        format.html { redirect_to events_path }
        format.json { render json: @event, status: :created, location: @event }
      else
        format.html { render action: "new" }
        format.json { render json: @event.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /events/1
  # PUT /events/1.json
  def update
    @event = Event.find(params[:id])
    @event.timewhen = Time.now

    respond_to do |format|
      if @event.update_attributes(params[:event])
        format.html { redirect_to @event, notice: 'event was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @event.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /events/1
  # DELETE /events/1.json
  def destroy
    @event = Event.find(params[:id])
    @event.destroy

    respond_to do |format|
      format.html { redirect_to events_url }
      format.json { head :ok }
    end
  end
end
