class MapsController < ApplicationController

  skip_before_action :verify_authenticity_token

  def index
    maps = Map.all
    render json: maps
  end

  def show
  end

  def create
    map = Map.create!(strong_params)
    render json: map
  end

  private

  def strong_params
    params.permit(:width, :height, :simulation_id)
  end

  def map
    @map ||= Map.find(params[:id])
  end

end
