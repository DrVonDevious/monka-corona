class NodesController < ApplicationController

  skip_before_action :verify_authenticity_token

  def index
    nodes = Node.all
    render json: nodes
  end

  def create
    node = Node.create!(strong_params)
    render json: node
  end

  private

  def strong_params
    params.permit(:name, :age, :state, :xpos, :ypos, :map_id)
  end

  def node
    @node ||= Node.find(params[:id])
  end

end
