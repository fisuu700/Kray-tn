<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    private ?string $email = null;

    #[ORM\Column(type: 'json')]
    private array $roles = [];

    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column(length: 255)]
    private ?string $fullName = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $avatar = null;

    #[ORM\Column]
    private ?bool $isVerified = false;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $phone = null;

    #[ORM\Column(length: 6, nullable: true)]
    private ?string $otpCode = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $otpExpiry = null;

    #[ORM\OneToMany(mappedBy: 'owner', targetEntity: Post::class, orphanRemoval: true)]
    private Collection $posts;

    public function __construct() {
        $this->posts = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getEmail(): ?string { return $this->email; }
    public function setEmail(string $email): static { $this->email = $email; return $this; }

    public function getUserIdentifier(): string { return (string) $this->email; }

    public function getRoles(): array {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }
    public function setRoles(array $roles): static { $this->roles = $roles; return $this; }

    public function getPassword(): string { return $this->password; }
    public function setPassword(string $password): static { $this->password = $password; return $this; }

    public function eraseCredentials(): void { }

    public function getFullName(): ?string { return $this->fullName; }
    public function setFullName(string $fullName): static { $this->fullName = $fullName; return $this; }

    public function getAvatar(): ?string { return $this->avatar; }
    public function setAvatar(?string $avatar): static { $this->avatar = $avatar; return $this; }

    public function getIsVerified(): ?bool { return $this->isVerified; }
    public function setIsVerified(bool $isVerified): static { $this->isVerified = $isVerified; return $this; }

    public function getPhone(): ?string { return $this->phone; }
    public function setPhone(?string $phone): static { $this->phone = $phone; return $this; }

    public function getOtpCode(): ?string { return $this->otpCode; }
    public function setOtpCode(?string $otpCode): static { $this->otpCode = $otpCode; return $this; }

    public function getOtpExpiry(): ?\DateTimeImmutable { return $this->otpExpiry; }
    public function setOtpExpiry(?\DateTimeImmutable $otpExpiry): static { $this->otpExpiry = $otpExpiry; return $this; }

    public function getPosts(): Collection { return $this->posts; }
    public function addPost(Post $post): static {
        if (!$this->posts->contains($post)) {
            $this->posts->add($post);
            $post->setOwner($this);
        }
        return $this;
    }
    public function removePost(Post $post): static {
        if ($this->posts->removeElement($post)) {
            if ($post->getOwner() === $this) {
                $post->setOwner(null);
            }
        }
        return $this;
    }
}
