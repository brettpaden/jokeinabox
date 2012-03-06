class CreateVotes < ActiveRecord::Migration
  def change
    create_table :votes do |t|
      t.references :joke
      t.references :user
			t.boolean :yesno
	  
      t.timestamps
    end
    add_index :votes, :joke_id
    add_index :votes, :user_id
  end
end
