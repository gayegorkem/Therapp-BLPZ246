using Microsoft.EntityFrameworkCore;
using Therapp.Domain.Entities;

namespace Therapp.Infrastructure.Persistence.Seed;

public static class CategorySeeder
{
    private record Seed(string Slug, string Name, string Description, string Icon, string Color, int Order);

    private static readonly Seed[] Defaults =
    {
        new("anksiyete",  "Anksiyete",  "Endişe ve kaygıyla ilgili deneyimler",            "wind",       "#42DCA3", 1),
        new("depresyon",  "Depresyon",  "Çökkün ruh hali ve umut paylaşımları",            "cloud-rain", "#5DADE2", 2),
        new("panik-atak", "Panik Atak", "Panik atak deneyimleri ve baş etme yöntemleri",   "zap",        "#F5A524", 3),
        new("yalnizlik",  "Yalnızlık",  "Yalnız hissetme ve bağ kurma deneyimleri",        "user",       "#A78BFA", 4),
        new("stres",      "Stres",      "Günlük stresle baş etme paylaşımları",            "activity",   "#FF6B81", 5),
        new("iliskiler",  "İlişkiler",  "Aile, arkadaş ve ilişki paylaşımları",            "heart",      "#EC4899", 6),
        new("oz-bakim",   "Öz Bakım",   "Kendine iyi bakma rutinleri ve önerileri",        "leaf",       "#34D399", 7),
        new("uyku",       "Uyku",       "Uyku sorunları ve çözüm paylaşımları",            "moon",       "#818CF8", 8),
    };

    public static async Task SeedAsync(AppDbContext db, CancellationToken ct = default)
    {
        var existing = await db.Categories.Select(c => c.Slug).ToListAsync(ct);
        var missing = Defaults.Where(d => !existing.Contains(d.Slug)).ToList();
        if (missing.Count == 0) return;

        foreach (var s in missing)
        {
            db.Categories.Add(new Category
            {
                Slug = s.Slug,
                Name = s.Name,
                Description = s.Description,
                Icon = s.Icon,
                Color = s.Color,
                OrderIndex = s.Order,
                IsActive = true
            });
        }
        await db.SaveChangesAsync(ct);
    }
}
