from django.conf.urls import url
from usersystem import views

urlpatterns = [
    url(r'^account/password/', views.AccountPasswordView.as_view()),
    url(r'^account/', views.AccountView.as_view()),
    url(r'^register/check-email/', views.RegisterCheckEmailView.as_view()),
    url(r'^register/check-username/', views.RegisterCheckUsernameView.as_view()),
    url(r'^register/', views.RegisterView.as_view()),
]
