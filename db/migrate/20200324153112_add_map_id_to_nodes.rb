class AddMapIdToNodes < ActiveRecord::Migration[6.0]
  def change
    add_column :nodes, :map_id, :integer
  end
end
