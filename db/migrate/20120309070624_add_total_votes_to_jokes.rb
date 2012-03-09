class AddTotalVotesToJokes < ActiveRecord::Migration
  def change
    add_column :jokes, :total_votes, :integer, :default => 0
  end
end
