class Map < ApplicationRecord
  belongs_to: :simulation
  has_many: :nodes
end
