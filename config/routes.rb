Rails.application.routes.draw do

  resources :simulations, only: [:index, :new, :show]
  root 'static#home'

end
