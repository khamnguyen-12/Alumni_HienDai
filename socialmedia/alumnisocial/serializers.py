# import pdb

from rest_framework import serializers

from .models import *


class UserSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        req = super().to_representation(instance)
        # Nếu ảnh khác null mới làm
        if instance.avatar:
            req['avatar'] = instance.avatar.url
        return req

    #đã khóa trường avatar
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'password', 'email', 'avatar']
        # # chỉ cho phép tao, ko cần phải hiện mk đã băm
        extra_kwargs = {
            'password': {
                'write_only': True
            },
        }

    # hàm tạo tk đã băm mk
    def create(self, validated_data):
        #băm password
        data = validated_data.copy()
        user = User(**data)
        user.set_password(user.password)
        user.save()
        return user


class AlumniProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlumniProfile
        fields = ['student_id']


# đã khóa hàm tạo tk, và ẩn password ở UserSerializer
class UserDetailSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField()
    cover_image = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'avatar', 'cover_image', 'username', 'role', 'password',
                  'alumni_id']
        extra_kwargs = {
            'password': {
                'write_only': True
            },
        }

    # hàm tạo tk đã băm mk
    def create(self, validated_data):
        #băm password
        data = validated_data.copy()
        user = User(**data)
        user.set_password(user.password)
        user.save()
        return user


class UserInteractionSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField()

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'avatar']


class CoverImageUpdateSerializer(serializers.ModelSerializer):
    cover_image = serializers.ImageField(required=True)

    class Meta:
        model = User
        fields = ['cover_image']


class ImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()

    class Meta:
        model = Image
        fields = ['image']


class PostSerializer(serializers.ModelSerializer):
    user = UserInteractionSerializer()
    images = ImageSerializer(many=True, required=False)

    class Meta:
        model = Post
        fields = ['id', 'content', 'images', 'comment_blocked', 'created_date', 'updated_date', 'user']


# thiếu fields 'shared_post'
class PostDetailSerializer(PostSerializer):
    reacted = serializers.SerializerMethodField()

    def get_reacted(self, post):
        request = self.context.get('request')
        if request.user.is_authenticated:
            return post.reaction_set.filter(active=True).exists()

    class Meta:
        model = PostSerializer.Meta.model
        fields = PostSerializer.Meta.fields + ['reacted']


class CommentSerializer(serializers.ModelSerializer):
    user = UserInteractionSerializer()

    class Meta:
        model = Comment
        fields = '__all__'


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'content']


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True)

    class Meta:
        model = Question
        fields = ['id', 'type', 'title', 'choices']


class SurveySerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)

    # user = UserInteractionSerializer()

    class Meta:
        model = Survey
        fields = ['id', 'title', 'questions']


class QuestionResponseSerializer(serializers.ModelSerializer):
    question = QuestionSerializer()

    class Meta:
        model = QuestionResponse
        fields = ['id', 'question', 'response']


class SurveyResponseSerializer(serializers.ModelSerializer):
    question_responses = QuestionResponseSerializer(many=True, source='questionresponse_set')

    class Meta:
        model = SurveyResponse
        fields = ['id', 'user', 'survey', 'question_responses', 'response_date']


class GroupSerializer(serializers.ModelSerializer):
    members = UserInteractionSerializer(many=True, read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'members']


class InvitationSerializer(serializers.ModelSerializer):
    user = UserInteractionSerializer()

    class Meta:
        model = Invitation
        fields = ['user', 'title', 'content', 'time', 'place', 'recipients_users', 'recipients_groups']


class ReactionSerializer(serializers.ModelSerializer):
    user = UserInteractionSerializer()

    class Meta:
        model = Reaction
        fields = '__all__'


class PasswordSerializer(serializers.ModelSerializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    class Meta:
        fields = '__all__'


class ForgetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    class Meta:
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'content', 'created_at', 'is_read']
