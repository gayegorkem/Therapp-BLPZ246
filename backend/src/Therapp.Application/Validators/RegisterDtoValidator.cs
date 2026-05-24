using FluentValidation;
using Therapp.Application.Auth.Dtos;

namespace Therapp.Application.Validators;

public class RegisterDtoValidator : AbstractValidator<RegisterDto>
{
    public RegisterDtoValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Kullanıcı adı zorunlu.")
            .Length(3, 32).WithMessage("Kullanıcı adı 3-32 karakter olmalı.")
            .Matches(@"^[a-zA-Z0-9_]+$").WithMessage("Kullanıcı adı yalnızca harf, rakam ve _ içerebilir.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-posta zorunlu.")
            .EmailAddress().WithMessage("Geçerli bir e-posta girin.")
            .MaximumLength(255);

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Şifre zorunlu.")
            .MinimumLength(8).WithMessage("Şifre en az 8 karakter olmalı.")
            .MaximumLength(128);

        RuleFor(x => x.DisplayName)
            .NotEmpty().WithMessage("Görünen ad zorunlu.")
            .Length(2, 64);
    }
}
