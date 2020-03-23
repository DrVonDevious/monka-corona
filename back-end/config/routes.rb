Rails.application.routes.draw do

  resources :maps
  resources :simulations, only: [:index, :new]
  root 'static#home'

end
