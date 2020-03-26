class Simulation < ApplicationRecord
  has_one :map
  has_many :nodes, through: :map
end
