class AddInitialPopulationToSimulations < ActiveRecord::Migration[6.0]
  def change
    add_column :simulations, :initial_population, :integer
  end
end
