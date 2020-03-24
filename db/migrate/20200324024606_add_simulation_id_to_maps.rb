class AddSimulationIdToMaps < ActiveRecord::Migration[6.0]
  def change
    add_column :maps, :simulation_id, :integer
  end
end
