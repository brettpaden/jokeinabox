class CreateEvents < ActiveRecord::Migration
  def change
    create_table :events do |t|
      t.references :user
      t.references :joke
      t.boolean :yesno
      t.boolean :withdraw

      t.timestamps
    end
    add_index :events, :user_id
    add_index :events, :joke_id
  end
end
