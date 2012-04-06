class JokesController < ApplicationController
  before_filter :authenticate

  # GET /jokes	
  # GET /jokes.json
  def index    
    if !params[:what] || (params[:what] == 'mine' && !session[:user]) then
      params[:what] = session[:what] || 'top' 
    end
    @jokes = Joke.jokes_by_what(params[:what], session[:user] ? session[:user].id : nil)
    session[:what] = params[:what]

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @jokes }
    end
  end

  # GET /jokes/1
  # GET /jokes/1.json
  def show
    @joke = Joke.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @joke }
    end
  end

  # GET /jokes/new
  # GET /jokes/new.json
  def new
    @joke = Joke.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @joke }
    end
  end

  # GET /jokes/1/edit
  def edit
    @joke = Joke.find(params[:id])
  end

  # POST /jokes
  # POST /jokes.json
  def create
    @joke = Joke.new(params[:joke])
    @joke.user_id = session[:user].id
    @joke.when_submitted = Time.now
    respond_to do |format|
      if @joke.save
        @event = Event.new(:joke_id => @joke.id)
        @event.save
        format.html { redirect_to jokes_path }
        format.json { render json: @joke, status: :created, location: @joke }
      else
        format.html { render action: "new" }
        format.json { render json: @joke.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /jokes/1
  # PUT /jokes/1.json
  def update
    @joke = Joke.find(params[:id])
    @joke.when_submitted = Time.now

    respond_to do |format|
      if @joke.update_attributes(params[:joke])
        format.html { redirect_to @joke, notice: 'Joke was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @joke.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /jokes/1
  # DELETE /jokes/1.json
  def destroy
    @joke = Joke.find(params[:id])
    @joke.destroy
    @event = Event.new(:user_id => session[:user].id, :joke_id => @joke.id)
    @event.save
    
    respond_to do |format|
      format.html { redirect_to jokes_url }
      format.json { head :ok }
    end
  end
  
  # GET /jokes/header
  def header
    respond_to do |format|
      format.html 
      format.json { head :ok }
    end
  end
  
  # GET /jokes/data
  def data
    # Build a single JSON object representing all data that a client will be
    # interested in for displaying a single screen
    # This consists of: 
    #  - current user
    #  - displayed jokes
    #  - those jokes' users (creators)
    #  - the current user's votes
    #  - the most recent 50 events, or events more recent than timestamp param, if provided
    #  - all jokes relevant to those events
    #  - all users relevant to those events
    info = {:jokes => [], :users => [], :votes => [], :events => []}
    
    # Get current user, always the first user, could be nil
    info[:user_id] = session[:user] ? session[:user].id : nil;
    info[:users] << session[:user] unless !session[:user];
    
    # Get all displayed jokes
    info[:jokes] = Joke.jokes_by_what(params[:what], info[:user_id])

    # Get those jokes' creators
    info[:jokes].each do |j| 
      u = info[:users].find {|u| u.id == j.user_id}
      info[:users] << j.user unless u
    end

    # Get current user's votes
    info[:votes] = Vote.votes_by_user(info[:user_id]) if info[:user_id]
    
    # Get 50 most recent events
    info[:events] = Event.events_by_ts(params[:ts], 50)
    
    # Get associated jokes
    info[:events].each do |e| 
      if e.joke_id
        j = info[:jokes].find{|j| j.id == e.joke_id}
        info[:jokes] << e.joke unless (j || !e.joke)
      end
    end
    
    # Get associated users
    info[:events].each do |e|
      u = info[:users].find{|u| u.id == e.user_id}
      info[:users] << e.user unless (u || !e.user)
    end
    
    respond_to do | format|
      format.html
      format.json { render json: info }
    end
  end 
  
  # GET /jokes/top
  def top
    @jokes = Joke.jokes_by_what('top', session[:user] ? session[:user].id : nil)
    session[:what] = 'top'

    respond_to do |format|
      format.html { redirect_to jokes_path }
      format.json { render json: @jokes }
    end
  end
  
  # GET /jokes/mine
  def mine
    @jokes = Joke.jokes_by_what('mine', session[:user] ? session[:user].id : nil)
    session[:what] = 'mine'

    respond_to do |format|
      format.html { redirect_to jokes_path }
      format.json { render json: @jokes }
    end
  end
  
  # GET /jokes/recent
  def recent
    @jokes = Joke.jokes_by_what('recent', session[:user] ? session[:user].id : nil)
    session[:what] = 'recent'

    respond_to do |format|
      format.html { redirect_to jokes_path }
      format.json { render json: @jokes }
    end
  end
  
  
end


