from datetime import datetime
from django.contrib import admin
from django.contrib.auth.decorators import permission_required
from django.template.response import TemplateResponse
from django.urls import path
# from rest_framework import permissions
from . import dao
from .models import *
from django import forms
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from django.db.models import Count
from django.db.models.functions import TruncMonth, TruncQuarter, TruncYear


# from alumnisocial.models import FriendShip, Group, AlumniProfile
# from ckeditor.widgets import CKEditorWidget
# from rest_framework import serializers

class SocialNetworkAppAdminSite(admin.AdminSite):
    site_header = 'AlumniSocialNetwork'

    def get_urls(self):
        return [
            path('stats/', self.stats_view),
            # path('survey_stats/', self.survey_stats_view)
        ] + super().get_urls()

    def stats_view(self, request):
        # Tổng số bài đăng
        total_posts = Post.objects.count()

        # Tổng số bài khảo sát
        total_surveys = Survey.objects.count()

        # Tổng số người dùng
        total_users = User.objects.count()

        period = request.GET.get('period', 'month')
        date = request.GET.get('date')

        surveys = Survey.objects.all()
        if period == 'month' and date:
            year, month = map(int, date.split('-'))
            surveys = surveys.filter(created_date__year=year, created_date__month=month)
        elif period == 'quarter' and date:
            year, quarter = map(int, date.split('-Q'))
            surveys = surveys.filter(
                created_date__year=year,
                created_date__quarter=quarter
            )
        elif period == 'year' and date:
            year = int(date)
            surveys = surveys.filter(created_date__year=year)

        if period == 'month':
            survey_stats = surveys.annotate(period=TruncMonth('created_date')).values('period').annotate(
                count=Count('id')).order_by('period')
        elif period == 'quarter':
            survey_stats = surveys.annotate(period=TruncQuarter('created_date')).values('period').annotate(
                count=Count('id')).order_by('period')
        elif period == 'year':
            survey_stats = surveys.annotate(period=TruncYear('created_date')).values('period').annotate(
                count=Count('id')).order_by('period')

        context = {
            'total_posts': total_posts,
            'total_surveys': total_surveys,
            'total_users': total_users,
            'survey_stats': survey_stats,
            'period': period,
            'date': date,
            'no_data': not surveys.exists(),
        }

        return TemplateResponse(request, 'admin/stats.html', context)

    # def stats_view(self, request):
    #     survey_stats = Survey.objects.annotate(c=Count('questions')).values('id', 'title', 'c')
    #     type_statistic = request.GET.get('object')
    #     period = request.GET.get('period')
    #     year = request.GET.get('year')
    #     period = period if period is not None else 'year'
    #     if type_statistic == 'users':
    #         stats = dao.count_users_by_time_period(period, year)
    #     else:
    #         stats = dao.count_posts_by_time_period(period, year)
    #     return TemplateResponse(request, 'admin/stats.html', {'stats': stats,
    #                                                           'period': period,
    #                                                           "survey_stats": survey_stats
    #                                                           })

    def survey_stats_view(self, request):
        survey_id = request.POST.get('survey_id')
        statistic_data = dao.stats_survey(survey_id)

        return TemplateResponse(request, 'admin/survey_stats.html',
                                {'survey': statistic_data['survey'],
                                 'text_questions': statistic_data['text_questions'],
                                 'mcq_counts': statistic_data['multiple_choice_question_counts']})


admin.site = SocialNetworkAppAdminSite(name='mysocialmediaapp')


# def confirm_student(modeladmin, request, queryset):
#     for user in queryset:
#         user.is_active = True
#         user.save()
#
#
# def reset_password_change_time(modeladmin, request, queryset):
#     for user in queryset:
#         user.date_joined = datetime.now()
#         user.save()
#
#
# reset_password_change_time.short_description = "Reset Password Change Time"
# confirm_student.short_description = "Confirm student"


# class AlumniProfileInlineAdmin(admin.StackedInline):
#     model = AlumniProfile


class AlumniAdmin(admin.ModelAdmin):
    search_fields = ['student_id']


class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'username', 'email', 'role', 'is_active']
    search_fields = ['username']
    list_filter = ['role', 'username', 'first_name', ]
    # inlines = [AlumniProfileInlineAdmin, ]
    # actions = [reset_password_change_time, confirm_student]


class PostForm(forms.ModelForm):
    content = forms.CharField(widget=CKEditorUploadingWidget)

    class Meta:
        model = Post
        fields = '__all__'


class ImagesInlineAdmin(admin.StackedInline):
    model = Image


class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'created_date', 'active', 'content', 'user']
    inlines = [ImagesInlineAdmin, ]
    form = PostForm


class GroupAdmin(admin.ModelAdmin):
    list_display = ['name']


class ChoiceInlineAdmin(admin.StackedInline):
    model = Choice


class QuestionInline(admin.StackedInline):
    model = Question


class QuestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'type', 'title', 'survey_id', 'survey', ]
    inlines = [ChoiceInlineAdmin, ]

class SurveyAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'title']
    inlines = [QuestionInline, ]


class InvitationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'title', 'time', 'place']


class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'post', 'comment', 'created_date', 'active']


admin.site.register(User, UserAdmin)
admin.site.register(AlumniProfile, AlumniAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Survey, SurveyAdmin)
admin.site.register(Question, QuestionAdmin)
admin.site.register(Invitation, InvitationAdmin)
admin.site.register(Group, GroupAdmin)
admin.site.register(Comment, CommentAdmin)
