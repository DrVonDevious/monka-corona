class CreateSimulations < ActiveRecord::Migration[6.0]
  def change
    create_table :simulations do |t|
      t.string :name
      t.integer :time_running
      t.boolean :is_running
      t.integer :initial_infected

      t.timestamps
    end
  end
end
