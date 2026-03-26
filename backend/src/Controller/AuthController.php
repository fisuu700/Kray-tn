<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[Route('/api/auth', name: 'api_auth_')]
class AuthController extends AbstractController
{
    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $fullName = $data['fullName'] ?? null;
        $password = $data['password'] ?? null;

        if (!$fullName || !$password) {
            return $this->json(['message' => 'Full Name and Password are required'], JsonResponse::HTTP_BAD_REQUEST);
        }

        // Check if user already exists
        $existingUser = $em->getRepository(User::class)->findOneBy(['fullName' => $fullName]);
        if ($existingUser) {
            return $this->json(['message' => 'User with this name already exists'], JsonResponse::HTTP_CONFLICT);
        }

        $user = new User();
        $user->setFullName($fullName);

        // Hash password
        $hashedPassword = $passwordHasher->hashPassword($user, $password);
        $user->setPassword($hashedPassword);

        $em->persist($user);
        $em->flush();

        return $this->json([
            'step' => 'success',
            'user' => [
                'id' => $user->getId(),
                'fullName' => $user->getFullName(),
                'avatar' => $user->getAvatar(),
            ]
        ]);
    }

    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $passwordHasher): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $fullName = $data['fullName'] ?? null;
        $password = $data['password'] ?? null;

        if (!$fullName || !$password) {
            return $this->json(['message' => 'Full Name and Password are required'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $user = $em->getRepository(User::class)->findOneBy(['fullName' => $fullName]);

        if (!$user) {
            return $this->json(['message' => 'Invalid credentials'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        if (!$passwordHasher->isPasswordValid($user, $password)) {
            return $this->json(['message' => 'Invalid credentials'], JsonResponse::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'step' => 'success',
            'user' => [
                'id' => $user->getId(),
                'fullName' => $user->getFullName(),
                'avatar' => $user->getAvatar(),
            ]
        ]);
    }
}
