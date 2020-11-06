from rest_framework.permissions import BasePermission
from user_account.models import CustomUser


class IsSystemAdmin(BasePermission):
    message = "You must be a System Admin to do this operation"

    def has_permission(self, request, view):
        """
        Overriding default has_permission method in order to add Custom permissions to our views
        This can be used either inside the permission_class directly or you can call it
        from other permission files
        :param request:
        :param view:
        :return: True/False : Whether the user is a SysAdmin or Not
        """
        user = CustomUser.objects.get(user_name=request.user)
        return user.role == 'SA'

def get_self_org(user, request):
    return str(user.organization_id) == request.parser_context['kwargs']['pk'] and request.path.\
        startswith('/organization')


class IsInventoryManager(BasePermission):
    message = "You must be an Inventory Manager to do this operation"

    def has_permission(self, request, view):
        """
        Overriding default has_permission method in order to add Custom permissions to our views
        This can be used either inside the permission_class directly or you can call it
        from other permission files
        :param request:
        :param view:
        :return: True/False : Whether the user is a Inventory Manager or Not
        """
        user = CustomUser.objects.get(user_name=request.user)

        if view.action in ['list']:
            return user.role == 'IM' and str(user.organization_id) == request.GET.\
                get("organization", '')

        if user.role == 'IM':
            if request.data.get('role', '') != 'SA' and \
                    (str(user.organization_id) == request.data.get('organization', '') or
                     get_self_org(user, request)):
                return True
        return False


class IsCurrentUserTargetUser(BasePermission):
    message = "You must be the login user to modify your own account"

    def has_permission(self, request, view):
        """
        Overriding default has_permission method in order to add Custom permissions to our views
        This can be used either inside the permission_class directly or you can call it
        from other permission files
        :param request: Getting the user that is doing the request
        :param view: Getting the targeted pk passed in the URL
        :return: True/False : Whether the user is a Inventory Manager or Not
        """
        current_user = request.user
        target_user = CustomUser.objects.get(id=view.kwargs['pk'])

        return current_user == target_user
