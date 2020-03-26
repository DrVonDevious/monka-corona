class SimulationsController < ApplicationController

  skip_before_action :verify_authenticity_token

  def index
    simulations = Simulation.all
    render json: simulations, except: [:updated_at, :created_at]
  end

  def show
    simulation = Simulation.find(params[:id])
    render json: simulation
  end

  def create
    simulation = Simulation.create!(strong_params)
    render json: simulation
  end

  def destroy
    simulation = Simulation.find(params[:id])
    render json: simulation
  end

  private

  def strong_params
    params.permit(:name, :initial_infected, :is_running, :time_running,:initial_population)
  end

  def simulation
    @simulation ||= Simulation.find(params[:id])
  end

end
