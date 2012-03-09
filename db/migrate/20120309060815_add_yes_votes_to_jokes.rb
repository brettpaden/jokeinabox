class AddYesVotesToJokes < ActiveRecord::Migration
  def change
    add_column :jokes, :yes_votes, :integer, :default => 0
    add_column :jokes, :no_votes, :integer, :default => 0
  end
end
