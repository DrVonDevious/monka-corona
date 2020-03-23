require 'test_helper'

class MapsControllerTest < ActionDispatch::IntegrationTest
  test "should get play" do
    get maps_play_url
    assert_response :success
  end

end
