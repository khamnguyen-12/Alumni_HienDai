from urllib import request

from django.utils.decorators import method_decorator
from django.views.decorators.debug import sensitive_post_parameters
from oauth2_provider.views import TokenView
from rest_framework import generics, viewsets, parsers, permissions, generics, status
from .models import *
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from rest_framework.generics import get_object_or_404
from django.core.mail import send_mail
import datetime
import json
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model

from . import serializers, perms, paginators, mixins, dao
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .serializers import CoverImageUpdateSerializer


# chỉnh thành ModelViewset
class UserViewSet(viewsets.ViewSet,
                  generics.CreateAPIView,
                  generics.UpdateAPIView,
                  generics.DestroyAPIView,
                  generics.RetrieveAPIView,
                  mixins.FriendRequestMixin):
    queryset = User.objects.filter(is_active=True).all()
    serializer_class = serializers.UserDetailSerializer
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]
    permission_classes = [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.action == 'create':
            return serializers.UserDetailSerializer
        return self.serializer_class

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        if instance is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):
        return Response(self.get_serializer(self.get_object()).data, status=status.HTTP_200_OK)

    def get_permissions(self):
        if self.action in ['get_list_posts', 'list_posts', 'update_cover_image']:
            return [permissions.IsAuthenticated()]
        if self.action in ['destroy', "add_posts"]:
            return [perms.IsOwner()]
        if self.action in ['add_surveys', 'destroy']:
            return [permissions.IsAdminUser()]
        return self.permission_classes

    @action(detail=False, methods=['patch'], url_path='current-user')
    def update_cover_image(self, request, *args, **kwargs):
        user = request.user  # Lấy thông tin người dùng hiện tại
        serializer = CoverImageUpdateSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()  # Lưu ảnh bìa mới
            return Response({"detail": "Ảnh bìa đã được cập nhật thành công."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['get'], url_path='current_user', url_name='current_user', detail=False)
    def current_user(self, request):
        return Response(self.get_serializer(request.user).data, status=status.HTTP_200_OK)

    # API lấy profile của cựu sv
    @action(methods=['get'], detail=True, url_path='profile')
    def profile(self, request, pk=None):
        user = self.get_object()
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # hàm update mk
    @action(methods=['post'], url_path='change_password', detail=True)
    def change_password(self, request, pk):
        password_serializer = serializers.PasswordSerializer(data=request.data)
        if password_serializer.is_valid():
            if not request.user.check_password(password_serializer.old_password):
                return Response({'message': 'Incorrect old password'}, status=status.HTTP_400_BAD_REQUEST)
            # set new password
            request.user.set_password(password_serializer.new_password)
            request.user.save()
        return Response(status=status.HTTP_200_OK)

    @action(methods=['post'], detail=False, url_path='create_posts')
    def create_posts(self, request):
        post = Post.objects.create(user=request.user, content=request.data.get('content'))
        for image in request.data.getlist('images'):
            Image.objects.create(post=post, image=image)

        return Response(serializers.PostSerializer(post).data, status=status.HTTP_201_CREATED)

    # lấy tất cả bài đăng từ users được gui thông qua {id}
    # chỉnh detail = True khi muoon nhập {id}
    @action(methods=['get'], detail=False, url_path='list_posts')
    def user_list_posts(self, request):
        user = request.user
        posts = Post.objects.filter(user=user).order_by('id')
        serializer = serializers.PostSerializer(posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=False, url_path='surveys')
    def add_surveys(self, request):
        data = request.data
        survey = Survey.objects.create(title=data.get('title'), user=request.user)
        questions = data.get('questions')
        for question in questions:
            q = Question.objects.create(type=question.get('type'), title=question.get('title'), survey=survey)
            if question.get('type') == 2:
                for item in question.get('choices'):
                    choice = Choice.objects.create(content=item, question=q)
        return Response(serializers.SurveySerializer(survey).data, status=status.HTTP_201_CREATED)

    @action(methods=['post'], detail=False, url_path='invitations')
    def add_invitations(self, request):
        data = request.data
        invitation_data = {
            'title': data.get('title'),
            'content': data.get('content'),
            'time': data.get('time'),
            'place': data.get('place')
        }
        invitation = Invitation.objects.create(**invitation_data, user=request.user)

        for userId in data.get('recipients_users'):
            user = User.objects.get(id=userId)
            invitation.recipients_users.add(user)
        for groupId in data.get('recipients_groups'):
            group = Group.objects.get(id=groupId)
            invitation.recipients_groups.add(group)

        return Response(serializers.InvitationSerializer(invitation).data, status=status.HTTP_201_CREATED)

    @action(methods=['GET'], detail=False, url_path='search')
    def search(self, request):
        users = dao.search_people(params=request.GET)

        return Response(serializers.UserInteractionSerializer(users, many=True).data,
                        status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=False, url_path='forget_password')
    def forget_password(self, request):
        serializer = serializers.ForgetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.data.get('email')
            user = get_object_or_404(User, email=email)
            password = mixins.ForgetPasswordMixin().change_random_password(email=email, instance=user)
            send_mail(
                'CẤP MẬT KHẨU MỚI',
                f'Mật khẩu mới của bạn là {password}. \n\n Vui lòng thay đổi mật khẩu. ',
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PostViewSet(viewsets.ViewSet,
                  generics.ListAPIView,
                  generics.UpdateAPIView,
                  generics.RetrieveAPIView,
                  generics.DestroyAPIView):
    queryset = Post.objects.filter(active=True).all()
    serializer_class = serializers.PostDetailSerializer
    permission_classes = [permissions.AllowAny()]
    pagination_class = paginators.PostPaginator

    def get_permissions(self):
        # if self.action in ['update', 'block_comments_post']:
        #     return [perms.IsOwner()]
        if self.action.__eq__('destroy'):
            return [perms.PostOwner() or permissions.IsAdminUser()]
        if self.action in ['add_comments', 'react_posts']:
            return [permissions.IsAuthenticated()]
        if self.action.__eq__('partial_update'):
            return [perms.PostOwner()]
        return self.permission_classes

    # tạo hàm để lấy toàn bộ bài viết( đc set active = true) của user đó theo thứ tự ngày đăng bào giảm dần
    def get_queryset(self):
        queries = self.queryset
        q = self.request.query_params.get("userId")
        if q:
            user = User.objects.get(pk=q)
            if user:
                queries = user.post_set.filter(active=True).order_by('-created_date').all()
        return queries

    # lấy bài viết ngẫu nhiên khi vừa mở MXH
    @action(methods=['get'], detail=False, url_path="list-random-posts")
    def list_random_posts(self, request):
        posts = self.queryset.order_by('-created_date').all()
        result_page = self.paginate_queryset(posts)
        serializer = self.serializer_class(result_page, many=True, context={'request': request})
        response = self.get_paginated_response(serializer.data)

        return response

    @action(methods=['post'], detail=True, url_path='comments')
    def add_comments(self, request, pk):
        # comment từ phương thức post sẽ đc gán cho truong comment của model Comment
        c = Comment.objects.create(user=request.user, post=self.get_object(), comment=request.data.get('comment'))
        return Response(serializers.CommentSerializer(c).data, status=status.HTTP_201_CREATED)

    # thả react cho bài viết, nhập type = 1/2/3 để thả
    @action(methods=['post'], detail=True, url_path='reacts')
    def react_posts(self, request, pk):
        type = int(request.data.get('type'))
        reaction, created = Reaction.objects.get_or_create(user=request.user, post=self.get_object(),
                                                           type=type)
        # Kiểm tra xem type có hợp lệ không
        if type not in [reaction_type.value for reaction_type in Reaction.ReactionTypes]:
            return Response({"detail": "Invalid reaction type."}, status=status.HTTP_400_BAD_REQUEST)

        if not created:
            reaction.active = not reaction.active
            reaction.save()
        post_detail_serializer = self.get_serializer(self.get_object(), context={'request': request})
        return Response(post_detail_serializer.data, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], url_path='like')
    def like(self, request, pk=None):
        try:
            post = self.get_object()  # Lấy bài viết theo PK
            user = request.user  # Lấy người dùng hiện tại

            # Kiểm tra xem người dùng đã like bài viết này chưa
            reaction, created = Reaction.objects.get_or_create(user=user, post=post, type=Reaction.ReactionTypes.LIKE)

            if not created:
                # Nếu đã like thì hủy like
                reaction.active = not reaction.active
                reaction.save()

            return Response({'status': 'success', 'active': reaction.active}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # mở danh sách comment của bài viết
    @action(methods=['get'], detail=True)
    def list_comments(self, request, pk):
        comments = Comment.objects.filter(post=pk)
        paginator = paginators.CommentPaginator()
        page = paginator.paginate_queryset(comments, request)
        if page is not None:
            serializer = serializers.CommentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.CommentSerializer(comments, many=True).data)


class CommentViewSet(viewsets.ViewSet,
                     generics.ListAPIView,
                     generics.CreateAPIView,
                     generics.UpdateAPIView,
                     generics.DestroyAPIView):
    queryset = Comment.objects.filter(active=True).all()
    serializer_class = serializers.CommentSerializer
    permission_classes = [permissions.AllowAny()]

    # permission_classes = [perms.IsOwner]

    def get_permissions(self):
        if self.action.__eq__('destroy'):
            return [perms.IsCommentAuthorOrPostAuthor()]
        return self.permission_classes


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = serializers.GroupSerializer

    def get_permissions(self):
        if self.action.__eq__('create'):
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    # tạo group mới, đặt username cho các members của nhoms
    def create(self, request, *args, **kwargs):
        group_name = request.data.get('group_name')
        users_data = request.data.get('members', [])

        # Tạo nhóm mới
        group = Group.objects.create(name=group_name)

        # Thêm các thành viên vào nhóm
        for user_data in users_data:
            try:
                user = User.objects.get(username=user_data['username'])
                group.members.add(user)
            except User.DoesNotExist:
                return Response({"error": f"User with username {user_data['username']} does not exist."}, status=400)

        # Tuần tự hóa và trả về dữ liệu nhóm
        serializer = self.get_serializer(group)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, instance, validated_data):
        members_data = validated_data.pop('members', None)
        instance.name = validated_data.get('name', instance.name)
        instance.save()

        if members_data is not None:
            for member_data in members_data:
                user = User.objects.get(id=member_data['id'])
                user.username = member_data['username']
                user.save()

        return instance

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    # def perform_update(self, serializer):
    #     serializer.save()

    # def update(self, request, *args, **kwargs):
    #     instance = self.get_object()
    #     users_data = request.data.get('members', [])
    #
    #     instance.users.clear()
    #
    #     for user_data in users_data:
    #         user = User.objects.get(members=user_data['members'])
    #         instance.members.add(user)
    #
    #     serializer = self.get_serializer(instance)
    #     return Response(serializer.data)
    #
    # def partial_update(self, request, *args, **kwargs):
    #     instance = self.get_object()
    #     serializer = self.get_serializer(instance, data=request.data, partial=True)
    #     serializer.is_valid(raise_exception=True)
    #     self.perform_update(serializer)
    #
    #     return Response(serializer.data)

    # def destroy(self, request, *args, **kwargs):
    #     instance = self.get_object()
    #     instance.delete()
    #     return Response(status=status.HTTP_204_NO_CONTENT)

    # @action(detail=True, methods=['get'])
    # def members(self, request, pk=None):
    #     group = self.get_object()
    #     # group.members lấy tất cả thành viên trong group
    #     serializer = serializers.UserSerializer(group.members.all(), many=True)
    #     return Response(serializer.data)


class SurveyViewSet(viewsets.ViewSet,
                    generics.ListAPIView,
                    generics.CreateAPIView,
                    generics.UpdateAPIView,
                    generics.RetrieveAPIView):
    queryset = Survey.objects.filter(active=True).all()
    serializer_class = serializers.SurveySerializer
    permission_classes = [permissions.AllowAny]
    #     permission_classes = [permissions.IsAuthenticated]
    pagination_class = paginators.PostPaginator

    # def list(self, request, *args, **kwargs):
    #     surveys = self.queryset.order_by('-created_date').all()
    #     return Response(self.get_serializer(surveys, many=True).data, status=status.HTTP_200_OK)
    #
    # def create(self, request, *args, **kwargs):
    #     data = request.data
    #     title = data.get('title')
    #     questions_data = data.get('questions', [])
    #
    #     if not title or not questions_data:
    #         return Response({'detail': 'Title and questions are required.'}, status=status.HTTP_400_BAD_REQUEST)
    #
    #     # Tạo một khảo sát mới
    #     survey = Survey.objects.create(title=title, user=request.user)
    #
    #     for question_data in questions_data:
    #         question_type = question_data.get('type')
    #         question_title = question_data.get('title')
    #         choices_data = question_data.get('choices', [])
    #
    #         if question_type not in [1, 2]:  # 1 for TEXT, 2 for MCQ
    #             return Response({'detail': 'Invalid question type.'}, status=status.HTTP_400_BAD_REQUEST)
    #
    #         # Tạo câu hỏi mới
    #         question = Question.objects.create(
    #             type=question_type,
    #             title=question_title,
    #             survey=survey
    #         )
    #
    #         if question_type == 2:
    #             if not choices_data:
    #                 return Response({'detail': 'MCQ questions must have choices.'}, status=status.HTTP_400_BAD_REQUEST)
    #
    #             # Tạo các phương án lựa chọn cho câu hỏi MCQ
    #             for choice_content in choices_data:
    #                 if not choice_content:
    #                     return Response({'detail': 'Each choice must have content.'},
    #                                     status=status.HTTP_400_BAD_REQUEST)
    #
    #                 Choice.objects.create(question=question, content=choice_content)
    #
    #     # Sử dụng serializer để trả về phản hồi JSON của khảo sát mới tạo
    #     serializer = self.get_serializer(survey)
    #     return Response(serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        survey = get_object_or_404(Survey, pk=pk)
        data = request.data

        # Cập nhật thông tin khảo sát nếu có
        title = data.get("title")
        if title:
            survey.title = title
            survey.save()

        # Cập nhật các câu hỏi nếu có
        questions_data = data.get("questions", [])
        for question_data in questions_data:
            question_id = question_data.get("id")
            question = get_object_or_404(Question, id=question_id)

            # Cập nhật nội dung câu hỏi
            question_title = question_data.get("title")
            if question_title:
                question.title = question_title

            question_type = question_data.get("type")
            if question_type:
                question.type = question_type

            question.save()

            # Cập nhật các lựa chọn cho câu hỏi MCQ nếu có
            if question.type == Question.Type.MULTICHOICE:
                choices_data = question_data.get("choices", [])
                for choice_data in choices_data:
                    choice_id = choice_data.get("id")
                    content = choice_data.get("content")
                    if choice_id:
                        choice = get_object_or_404(Choice, id=choice_id)
                        if content:
                            choice.content = content
                            choice.save()
                    else:
                        Choice.objects.create(content=content, question=question)

        return Response(self.get_serializer(survey).data, status=status.HTTP_200_OK)

    @action(methods=['POST'], detail=True, url_path='response')
    def response_surveys(self, request, pk):
        data = request.data
        survey_response = SurveyResponse.objects.create(user=request.user, survey=self.get_object())
        question_responses = data.get('question_responses')
        for item in question_responses:
            question = Question.objects.get(id=item.get('questionId'))
            QuestionResponse.objects.create(
                question=question,
                survey_response=survey_response,
                response=item.get('response')
            )
        return Response(serializers.SurveyResponseSerializer(survey_response).data, status=status.HTTP_201_CREATED)


class InvitationViewSet(viewsets.ViewSet,
                        generics.ListAPIView,
                        generics.RetrieveUpdateDestroyAPIView):
    queryset = Invitation.objects.filter(active=True).all()
    serializer_class = serializers.InvitationSerializer
    permission_classes = [permissions.IsAdminUser]


class NotificationViewSet(viewsets.ViewSet,
                          generics.ListAPIView):
    queryset = Notification.objects.all()
    serializer_class = serializers.NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queries = self.queryset

        q = self.request.query_params.get("userId")

        if q:
            user = User.objects.get(pk=q)
            if user:
                queries = user.notifications.order_by('-created_at')[:10]

        return queries

    @action(methods=['patch'], detail=True)
    def mark_notification_as_read(self, request, pk):
        notification = self.get_object()
        notification.is_read = True
        notification.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


class MessageViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

