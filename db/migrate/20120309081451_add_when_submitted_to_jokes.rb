class AddWhenSubmittedToJokes < ActiveRecord::Migration
  def change
    add_column :jokes, :when_submitted, :timestamp
  end
end
