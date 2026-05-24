using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Therapp.Domain.Entities;

namespace Therapp.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> b)
    {
        b.ToTable("users");
        b.HasKey(x => x.Id);
        b.Property(x => x.Id).HasColumnName("id").HasDefaultValueSql("gen_random_uuid()");

        b.Property(x => x.Username).HasColumnName("username").HasMaxLength(32).IsRequired();
        b.Property(x => x.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
        b.Property(x => x.PasswordHash).HasColumnName("password_hash").HasMaxLength(255).IsRequired();
        b.Property(x => x.DisplayName).HasColumnName("display_name").HasMaxLength(64).IsRequired();
        b.Property(x => x.AvatarUrl).HasColumnName("avatar_url").HasMaxLength(500);
        b.Property(x => x.Bio).HasColumnName("bio").HasMaxLength(280);
        b.Property(x => x.Role).HasColumnName("role").HasConversion<short>().HasDefaultValue(Therapp.Domain.Enums.UserRole.User);
        b.Property(x => x.IsBanned).HasColumnName("is_banned").HasDefaultValue(false);
        b.Property(x => x.AcceptedDisclaimerAt).HasColumnName("accepted_disclaimer_at");
        b.Property(x => x.CreatedAt).HasColumnName("created_at");
        b.Property(x => x.UpdatedAt).HasColumnName("updated_at");
        b.Property(x => x.DeletedAt).HasColumnName("deleted_at");

        b.HasIndex(x => x.Username).IsUnique().HasDatabaseName("ux_users_username");
        b.HasIndex(x => x.Email).IsUnique().HasDatabaseName("ux_users_email");

        b.HasQueryFilter(x => x.DeletedAt == null);
    }
}
