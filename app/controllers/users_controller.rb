class UsersController < ApplicationController
        before_filter :authenticate
        
  # GET /users	
  # GET /users.json
  def index
    @users = User.all
            
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @users }
    end
  end
        
  # GET /users/1
  # GET /users/1.json
  def show
    @user = User.find(params[:id])
            
    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @user }
    end
  end
        
  # GET /users/new
  # GET /users/new.json
  def new
    @user = User.new
    
    respond_to do |format|
        format.html # new.html.erb
        format.json { render json: @user }
    end
  end
        
  # GET /users/1/edit
  def edit
    @user = User.find(params[:id])
  end
        
  # POST /users
  # POST /users.json
  def create
    @user = User.new(params[:user])
    respond_to do |format|
      if @user.password != params[:confirm] then
        @user.errors.add :password, 'password confirmation doesn\'t match.'
        format.html { render action: "new" }
        format.json { render json: @user.errors }
      elsif @user.save
        @event = Event.new(:user_id => @user.id)
        @event.save
        format.html { redirect_to ''}
        format.json { render json: @user.id }
        session[:user] = @user
      else
        format.html { render action: "new" }
        format.json { render json: @user.errors }
      end
    end
  end
        
  # PUT /users/1
  # PUT /users/1.json
  def update
    @user = User.find(params[:id])
            
    respond_to do |format|
      if @user.update_attributes(params[:user])
        format.html { redirect_to @user, notice: 'user was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end
        
  # DELETE /users/1
  # DELETE /users/1.json
  def destroy
    @user = User.find(params[:id])
    if session[:user] && params[:id].to_i == session[:user].id then
      session[:user] = nil
    end
    @user.destroy
    
    respond_to do |format|
      format.html { redirect_to users_url }
      format.json { head :ok }
    end
  end
  
  # logout
  def logout
    do_logout
    respond_to do |format|
      format.html { redirect_to '', notice: 'user logged out.' }
      format.json { render json: 1 }
    end
  end

  # do logout
  def do_logout
    session[:user] = nil
    session[:what] = nil
  end
  
  # login
  def login
    @user = User.new(params[:user])
    respond_to do |format|
      format.html # login.html.erb
      format.json { render json: @user }
    end
  end
  
  # do_login
  def do_login
    @user = User.where(:name => params[:user]['name']).first
    respond_to do |format|
      if !@user then
        @user = User.new(params[:user])
        @user.errors.add :name, 'is not a valid user.'
        format.html {render action: 'login' }
        format.json {render json: @user.errors }
      elsif @user.password != params[:user]['password'] then
        tmp = @user
        @user = User.new(params[:user]) # Make sure we don't have an existing user
        @user.errors.add :password, 'is incorrect.'
        format.html {render action: 'login' }
        format.json {render json: @user.errors }
      else
        session[:user] = @user
        format.html { redirect_to '' }
        format.json { render json: @user.id}
      end
    end
  end
end
