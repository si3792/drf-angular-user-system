from django.conf.urls import url, include
from usersystem import views

urlpatterns = [
    url(r'^account/password/', views.AccountPasswordView.as_view()),
    url(r'^account/social/', views.AccountSocialView.as_view()),
    url(r'^account/', views.AccountView.as_view()),
    url(r'^register/check-email/', views.RegisterCheckEmailView.as_view()),
    url(r'^register/check-username/', views.RegisterCheckUsernameView.as_view()),
    url(r'^register/', views.RegisterView.as_view()),
    url(r'^social-auth/google-auth-code/', views.GoogleAuthCodeView.as_view()),
    url(r'^social-auth/', include('rest_framework_social_oauth2.urls')),
    url(r'^oauth2/', include('oauth2_provider.urls', namespace='oauth2_provider')),
]
