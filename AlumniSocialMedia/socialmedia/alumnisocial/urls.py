from django.contrib import admin
from django.urls import path, re_path, include
from rest_framework import routers
from . import views

r = routers.DefaultRouter()
# r.register('alumni', views.AlumniViewSet, 'alumni')
r.register('users', views.UserViewSet, 'users')
r.register('posts', views.PostViewSet, basename='posts')
r.register('comments', views.CommentViewSet, basename='comments')
r.register('friendship', views.FriendShipViewSet, basename='friendship')
r.register('groups', views.GroupViewSet, basename='groups')
r.register('surveys', views.SurveyViewSet, basename='surveys')
r.register('invitations', views.InvitationViewSet, basename='invitations')
r.register('notifications', views.NotificationViewSet, basename='notifications')
r.register('messages', views.MessageViewSet, basename='messages')

urlpatterns = [
    path('', include(r.urls)),
    path('login/', views.LoginView.as_view(), name='login'),

]
