from django.conf.urls import url
from usersystem import views

urlpatterns = [
    url(r'^account/', views.AccountView.as_view()),
]
