class CreateMaps < ActiveRecord::Migration[6.0]
  def change
    create_table :maps do |t|
      t.integer :width
      t.integer :height

      t.timestamps
    end
  end
end
