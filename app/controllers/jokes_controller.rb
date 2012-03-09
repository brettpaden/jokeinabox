class JokesController < ApplicationController
  before_filter :authenticate

  # GET /jokes	
  # GET /jokes.json
  def index
    order = 'total_votes DESC, when_submitted DESC'
    conditions = ''
    if !params[:what] then params[:what] = session[:what] or 'top' end
    if params[:what] == 'recent' then order = 'when_submitted DESC, total_votes DESC' end
    if params[:what] == 'mine' then conditions = "user_id = #{session[:user].id}" end
    session[:what] = params[:what]

    @jokes = Joke.find(:all, :order => order, :conditions => conditions)

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

    respond_to do |format|
      format.html { redirect_to jokes_url }
      format.json { head :ok }
    end
  end
end
