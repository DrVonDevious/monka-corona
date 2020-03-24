Rails.application.routes.draw do

  root 'corona#app'

  resources :maps
  resources :simulations
  resources :nodes

end
