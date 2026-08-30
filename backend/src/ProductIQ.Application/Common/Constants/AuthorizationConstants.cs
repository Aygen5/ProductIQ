namespace ProductIQ.Application.Common.Constants;

public static class AuthorizationConstants
{
    public static class Policies
    {
        public const string AuthenticatedUser = "AuthenticatedUser";
        public const string AdminOnly = "AdminOnly";
    }

    public static class Roles
    {
        public const string Admin = "Admin";
        public const string User = "User";
    }
}
