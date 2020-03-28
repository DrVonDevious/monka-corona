class AddInfectionRateToSimulations < ActiveRecord::Migration[6.0]
  def change
    add_column :simulations, :infection_rate, :integer
  end
end
