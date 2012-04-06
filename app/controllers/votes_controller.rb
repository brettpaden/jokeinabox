class VotesController < ApplicationController
  before_filter :authenticate 
 
  # GET /votes 
  # GET /votes.json 
  def index 
    @votes = Vote.all 
 
    respond_to do |format| 
      format.html # index.html.erb 
      format.json { render json: @votes } 
    end 
  end 
 
  # GET /votes/1 
  # GET /votes/1.json 
  def show 
    @vote = Vote.find(params[:id]) 
 
    respond_to do |format| 
      format.html # show.html.erb 
      format.json { render json: @vote } 
    end 
  end 
 
  # GET /votes/new 
  # GET /votes/new.json 
  def new 
    @voke = Vote.new 
 
    respond_to do |format| 
      format.html # new.html.erb 
      format.json { render json: @vote } 
    end 
  end 

  # GET /votes/1/edit 
  def edit 
    @vote = Vote.find(params[:id]) 
  end 
 
  # POST /votes 
  # POST /votes.json 
  def create
    @vote = Vote.new(params[:vote])
    @vote.user_id = session[:user].id 
    if @vote.yesno then @vote.joke.yes_votes += 1 end
    if !@vote.yesno then @vote.joke.no_votes += 1 end
    @vote.joke.total_votes = @vote.joke.yes_votes - @vote.joke.no_votes

    respond_to do |format| 
      if @vote.save 
        @event = Event.new(:user_id => session[:user].id, :joke_id => @vote.joke_id, :yesno => @vote.yesno)
        @event.save
        format.html { redirect_to jokes_path } 
        format.json { render json: @vote, status: :created, location: @vote } 
      else
        format.html { render action: "new" } 
        format.json { render json: @vote.errors, status: :unprocessable_entity } 
      end 
    end 
  end 
 
  # PUT /votes/1 
  # PUT /votes/1.json 
  def update
    @vote = Vote.find(params[:id])
    if @vote.yesno && (params[:vote]['yesno'] == 'false' || params[:vote]['yesno'] == false) then 
      @vote.joke.yes_votes -= 1;
      @vote.joke.no_votes += 1;
    elsif !@vote.yesno && (params[:vote]['yesno'] == 'true' || params[:vote]['yesno'] == true) then
      @vote.joke.yes_votes += 1;
      @vote.joke.no_votes -= 1;
    end
    @vote.joke.total_votes = @vote.joke.yes_votes - @vote.joke.no_votes
    respond_to do |format| 
      if @vote.update_attributes(params[:vote])
        @event = Event.new(:user_id => session[:user].id, :joke_id => @vote.joke_id, :yesno => @vote.yesno)
        @event.save
        format.html { redirect_to jokes_path } 
        format.json { head :ok } 
      else 
        format.html { render action: "edit" } 
        format.json { render json: @vote.errors, status: :unprocessable_entity } 
      end 
    end 
  end 
 
  # DELETE /votes/1 
  # DELETE /votes/1.json 
  def destroy 
    @vote = Vote.find(params[:id]) 
    if @vote.yesno then
      @vote.joke.yes_votes -= 1;
    elsif !@vote.yesno then
      @vote.joke.no_votes -= 1;
    end
    @vote.joke.total_votes = @vote.joke.yes_votes - @vote.joke.no_votes

    (@vote.joke.save and @vote.destroy) or throw "unable to delete vote"
    @event = Event.new(:user_id => session[:user].id, :joke_id => @vote.joke_id, :withdraw => true)
    @event.save
    
    respond_to do |format| 
      format.html { redirect_to jokes_path } 
      format.json { head :ok } 
    end 
  end
end
