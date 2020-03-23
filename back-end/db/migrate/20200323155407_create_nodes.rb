class CreateNodes < ActiveRecord::Migration[6.0]
  def change
    create_table :nodes do |t|
      t.string :name
      t.integer :age
      t.string :state
      t.integer :xpos
      t.integer :ypos

      t.timestamps
    end
  end
end
