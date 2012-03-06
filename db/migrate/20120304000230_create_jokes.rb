class CreateJokes < ActiveRecord::Migration
  def change
    create_table :jokes do |t|
    t.text :content
	  t.references :user
	  
    t.timestamps
    end
    add_index :jokes, :user_id
  end
end
