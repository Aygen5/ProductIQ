namespace ProductIQ.Application.Interfaces;

using ProductIQ.Domain.Entities;

public interface IJwtTokenGenerator
{
    (string Token, DateTime ExpiresAt) GenerateToken(User user);
}
