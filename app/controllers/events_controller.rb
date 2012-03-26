class EventsController < ApplicationController
  before_filter :authenticate

  # GET /events	
  # GET /events.json
  def index    
    if (params[:ts])
      t = Time.at(params[:ts].to_i)
      condition = "created_at > '#{t.gmtime}'"
    else 
      condition = ''
    end
    
    @events = Event.find(:all, :order => 'created_at DESC', :conditions => condition, :limit => 50)

    # For each event concerning a joke, get the id of the following joke, 
    # according to the passed sort method
    events_plus_insert = []
    if (params[:what])
      jokes = Joke.jokes_by_what(params[:what], session[:user] ? session[:user].id : nil)
      @events.each do |e|
        insert_id = -1
        if e.joke && e.joke.id
          ndx = jokes.find_index{|j| j.id == e.joke.id}
          if ndx
            if ndx < jokes.length-1
              insert_id = jokes[ndx+1].id
            else
              insert_id = '+'
            end
          end
        end
        events_plus_insert << { :insert_id => insert_id, :event => e }
      end
    end

   respond_to do |format|
      format.html # index.html.erb
      format.json { render json: events_plus_insert }
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
